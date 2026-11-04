/* Praise More — interactions + WebGL hero */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- Nav ---------- */
const nav = $('.nav');
let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY;
  nav.classList.toggle('is-scrolled', y > 40);
  nav.classList.toggle('is-hidden', y > 400 && y > lastY && !document.body.classList.contains('menu-open'));
  lastY = y;
}, { passive: true });
$('.burger')?.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  $('.burger').setAttribute('aria-expanded', open);
});
$$('.has-mega > button').forEach(b => b.addEventListener('click', () => {
  const p = b.parentElement; const o = p.classList.toggle('open'); b.setAttribute('aria-expanded', o);
}));
document.addEventListener('click', e => { if (!e.target.closest('.has-mega')) $$('.has-mega.open').forEach(m => m.classList.remove('open')); });

/* ---------- Reveal ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15, rootMargin: '0px 0px -8% 0px' });
$$('[data-reveal]').forEach(el => io.observe(el));

/* ---------- Counters ---------- */
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; cio.unobserve(e.target);
  const el = e.target, end = +el.dataset.count, dur = 1800, t0 = performance.now();
  const fmt = n => n >= 1000 ? Math.round(n).toLocaleString('en') : Math.round(n);
  if (reduce) { el.textContent = fmt(end); return; }
  const tick = t => { const p = Math.min(1, (t - t0) / dur); el.textContent = fmt(end * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}), { threshold: .5 });
$$('[data-count]').forEach(el => cio.observe(el));

/* ---------- Scroll-lit statement ---------- */
const st = $('.statement');
if (st) {
  const words = $$('.w', st);
  const lit = () => {
    const r = st.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / (r.height + innerHeight * .35)));
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('on', i < n));
  };
  addEventListener('scroll', lit, { passive: true }); lit();
}

/* ---------- Horizontal process ---------- */
const proc = $('.process');
if (proc) {
  const track = $('.process__track', proc), prog = $('.process__prog', proc);
  const steps = $$('.step', proc).length;
  const size = () => { if (innerWidth > 820) proc.style.height = (track.scrollWidth - innerWidth + innerHeight * 1.2) + 'px'; else proc.style.height = ''; };
  const move = () => {
    if (innerWidth <= 820) return;
    const r = proc.getBoundingClientRect();
    const max = track.scrollWidth - innerWidth + parseFloat(getComputedStyle(track).paddingLeft);
    const p = Math.min(1, Math.max(0, -r.top / (proc.offsetHeight - innerHeight)));
    track.style.transform = `translate3d(${-p * max}px,0,0)`;
    if (prog) prog.textContent = String(Math.min(steps, Math.floor(p * steps) + 1)).padStart(2, '0') + ' / ' + String(steps).padStart(2, '0');
  };
  addEventListener('resize', () => { size(); move(); });
  addEventListener('scroll', move, { passive: true });
  addEventListener('load', () => { size(); move(); });
  size(); move();
}

/* ---------- Tilt + magnetic ---------- */
if (fine && !reduce) {
  $$('[data-tilt]').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(1100px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateZ(0)`;
    });
    el.addEventListener('pointerleave', () => el.style.transform = '');
  });
  $$('.btn--lime,.btn--ghost,.cat__go').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
    });
    el.addEventListener('pointerleave', () => el.style.transform = '');
  });
  const g = $('.glow');
  if (g) {
    document.body.classList.add('has-glow');
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() { gx += (tx - gx) * .12; gy += (ty - gy) * .12; g.style.transform = `translate(${gx - 210}px,${gy - 210}px)`; requestAnimationFrame(loop); })();
  }
}

/* ---------- WebGL hero ---------- */
const canvas = $('#gl');
if (canvas) initGL(canvas).catch(() => document.documentElement.classList.add('no-gl'));

async function initGL(canvas) {
  const test = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
  if (!test) throw new Error('no webgl');
  const THREE = await import('/assets/vendor/three.module.min.js');
  const variant = canvas.dataset.variant || 'home';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
  camera.position.set(0, 0, 9);

  const small = innerWidth < 700;
  const N = small ? 9000 : 22000;
  const pos = new Float32Array(N * 3), seed = new Float32Array(N), plane = new Float32Array(N * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
    pos.set([Math.cos(th) * r, y, Math.sin(th) * r], i * 3);
    const gx = (i % 150) / 150 - .5, gz = Math.floor(i / 150) / (N / 150) - .5;
    plane.set([gx * 16, 0, gz * 10], i * 3);
    seed[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aPlane', new THREE.BufferAttribute(plane, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

  const hues = { home: 0, family: 0, school: .25, environment: .6, about: .4, page: .15 };
  const uniforms = {
    uTime: { value: 0 }, uMorph: { value: 0 }, uMouse: { value: new THREE.Vector2() },
    uPix: { value: renderer.getPixelRatio() }, uHue: { value: hues[variant] ?? 0 },
    uC1: { value: new THREE.Color('#4F9A1C') }, uC2: { value: new THREE.Color('#8CC63F') }, uC3: { value: new THREE.Color('#eaffc9') }
  };
  const noise = `
  vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
  vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
  float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}`;
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: noise + `
      uniform float uTime,uMorph,uPix,uHue;uniform vec2 uMouse;
      attribute vec3 aPlane;attribute float aSeed;varying float vN;varying float vA;
      void main(){
        float t=uTime*.18;
        vec3 p=position;
        float n=snoise(p*1.4+vec3(t,t*.7,-t));
        float n2=snoise(p*3.2-vec3(t*1.3));
        vec3 sphere=p*(2.55+n*.55+n2*.12+uHue*.2);
        vec3 pl=aPlane;
        pl.y=snoise(vec3(pl.x*.22+t,pl.z*.3,t))*1.1+sin(pl.x*.6+uTime*.6)*.25-1.6;
        vec3 q=mix(sphere,pl,smoothstep(0.,1.,uMorph));
        q.xy+=uMouse*(1.-uMorph)*.35*(.5+n*.5);
        vec4 mv=modelViewMatrix*vec4(q,1.);
        gl_Position=projectionMatrix*mv;
        gl_PointSize=(1.4+aSeed*2.4+max(n,0.)*2.)*uPix*(9./-mv.z);
        vN=n;vA=.35+aSeed*.65;
      }`,
    fragmentShader: `
      uniform vec3 uC1,uC2,uC3;varying float vN;varying float vA;
      void main(){
        vec2 c=gl_PointCoord-.5;float d=length(c);if(d>.5)discard;
        float a=smoothstep(.5,0.,d);
        vec3 col=mix(uC1,uC2,smoothstep(-.4,.4,vN));col=mix(col,uC3,smoothstep(.45,.9,vN));
        gl_FragColor=vec4(col,a*vA*.85);
      }`
  });
  const pts = new THREE.Points(geo, mat);
  const group = new THREE.Group(); group.add(pts); scene.add(group);
  const offX = variant === 'home' ? 1.6 : 2.4;
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    group.position.x = w > 900 ? offX : 0; group.position.y = w > 900 ? 0 : .6;
    group.scale.setScalar(w > 900 ? 1 : .82);
  };
  resize(); addEventListener('resize', resize);
  let mx = 0, my = 0;
  addEventListener('pointermove', e => { mx = (e.clientX / innerWidth - .5) * 2; my = -(e.clientY / innerHeight - .5) * 2; }, { passive: true });
  let visible = true;
  new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(canvas);
  const clock = new THREE.Clock();
  const hero = canvas.closest('.hero');
  const frame = () => {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(clock.getDelta(), .05);
    uniforms.uTime.value += reduce ? dt * .15 : dt;
    const sp = Math.min(1, scrollY / (hero.offsetHeight * .9));
    uniforms.uMorph.value += (sp - uniforms.uMorph.value) * .08;
    uniforms.uMouse.value.x += (mx - uniforms.uMouse.value.x) * .05;
    uniforms.uMouse.value.y += (my - uniforms.uMouse.value.y) * .05;
    group.rotation.y += dt * .06;
    group.rotation.x = uniforms.uMouse.value.y * .15 + uniforms.uMorph.value * .35;
    renderer.render(scene, camera);
  };
  frame();
  canvas.style.opacity = 0; canvas.style.transition = 'opacity 1.6s ease';
  requestAnimationFrame(() => canvas.style.opacity = 1);
}
