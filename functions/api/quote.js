// School quote form → email to info@praisemore.com.hk via Resend.
// Needs Cloudflare Pages environment variable RESEND_API_KEY (secret).
// Optional: QUOTE_TO (default info@praisemore.com.hk), QUOTE_FROM (default Praise More 網站 <noreply@praisemore.com.hk>).
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
const clean = (v, max = 200) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function onRequestPost({ request, env }) {
  let d;
  try {
    const ct = request.headers.get('content-type') || '';
    d = ct.includes('application/json') ? await request.json() : Object.fromEntries(await request.formData());
  } catch { return json({ ok: false, error: 'bad_request' }, 400); }

  // Spam guards: hidden field must stay empty; form must be open for at least 3 seconds.
  if (d.website) return json({ ok: true });
  const t = Number(d.t);
  if (t && Date.now() - t < 3000) return json({ ok: true });

  const f = {
    school: clean(d.school, 120), schoolType: clean(d.schoolType, 20), name: clean(d.name, 80),
    phone: clean(d.phone, 30), email: clean(d.email, 120), students: clean(d.students, 40),
    schedule: clean(d.schedule, 80), message: clean(String(d.message ?? '').replace(/\r?\n/g, ' / '), 2000),
    services: (Array.isArray(d.services) ? d.services : d.services ? [d.services] : []).map(x => clean(x, 40)).slice(0, 20)
  };
  if (!f.school || !f.schoolType || !f.name || !f.phone || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) {
    return json({ ok: false, error: 'missing_fields' }, 422);
  }
  if (!env.RESEND_API_KEY) return json({ ok: false, error: 'not_configured' }, 500);

  const rows = [
    ['學校名稱', f.school], ['學校類別', f.schoolType], ['聯絡人', f.name], ['電話', f.phone], ['電郵', f.email],
    ['查詢服務', f.services.join('、') || '—'], ['學生人數', f.students || '—'], ['上課日子／時段', f.schedule || '—'], ['其他要求', f.message || '—']
  ];
  const html = `<h2 style="font-family:sans-serif">新的學校報價查詢</h2><table cellpadding="8" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${rows.map(([k, v]) => `<tr><th align="left" style="background:#f4f7ef;border:1px solid #ddd">${k}</th><td style="border:1px solid #ddd">${esc(v)}</td></tr>`).join('')}</table><p style="font-family:sans-serif;color:#666;font-size:12px">來自 www.praisemore.com.hk 學校報價表格。直接回覆此電郵即可聯絡對方。</p>`;
  const text = rows.map(([k, v]) => `${k}：${v}`).join('\n');

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.QUOTE_FROM || 'Praise More 網站 <noreply@praisemore.com.hk>',
      to: [env.QUOTE_TO || 'info@praisemore.com.hk'],
      reply_to: f.email,
      subject: `【學校報價】${f.school}（${f.schoolType}）— ${f.services.join('、') || '一般查詢'}`,
      html, text
    })
  });
  if (!r.ok) {
    console.log('resend_error', r.status, await r.text());
    return json({ ok: false, error: 'send_failed' }, 502);
  }
  return json({ ok: true });
}

export const onRequest = () => json({ ok: false, error: 'method_not_allowed' }, 405);
