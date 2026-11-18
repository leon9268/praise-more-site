// Send the old pages.dev address and the bare domain to the main site, so Google indexes one address only.
// Preview deployments (<hash>.praise-more-site.pages.dev) are left alone.
const MAIN = 'www.praisemore.com.hk';
const REDIRECT_HOSTS = new Set(['praise-more-site.pages.dev', 'praisemore.com.hk']);

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (REDIRECT_HOSTS.has(url.hostname)) {
    url.hostname = MAIN;
    url.protocol = 'https:';
    url.port = '';
    return Response.redirect(url.toString(), 301);
  }
  return next();
}
