// Companion decoder for public/404.html: rewrites the /?/<path> query that the
// static host produces back into a real path, before the router boots.

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
