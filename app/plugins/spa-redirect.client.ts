// Companion decoder for public/404.html.
//
// On GitHub Pages, requests for non-prerendered routes (e.g. /users/abc) fall
// through to 404.html, which redirects to /?/<original-path>. This plugin runs
// before the router and rewrites that query back into a real path so the SPA
// boots at the intended route.

export default defineNuxtPlugin({
  name: 'spa-redirect',
  enforce: 'pre',
  setup() {
    const search = window.location.search;
    if (!search.startsWith('?/')) return;

    const decoded = search
      .slice(2)
      .split('&')
      .map(part => part.replace(/~and~/g, '&'))
      .join('?');

    const newUrl
      = window.location.pathname.replace(/\/$/, '')
        + '/' + decoded
        + window.location.hash;

    window.history.replaceState(null, '', newUrl);
  },
});
