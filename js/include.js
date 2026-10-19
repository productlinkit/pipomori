// Swaps each [data-include] placeholder for its HTML file, then loads the app scripts in order.
// Partials are fetched, so the page has to be served over HTTP (see README).
(async () => {
  const slots = [...document.querySelectorAll("[data-include]")];
  const html = await Promise.all(slots.map(el => fetch(el.dataset.include).then(r => {
    if (!r.ok) throw new Error(`${el.dataset.include}: ${r.status}`);
    return r.text();
  })));
  slots.forEach((el, i) => el.replaceWith(document.createRange().createContextualFragment(html[i])));
  for (const name of ["i18n", "data", "state", "views", "ui", "auth", "motion", "app"]) {
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `js/${name}.js`;
      s.onload = resolve; s.onerror = reject;
      document.body.append(s);
    });
  }
})();
