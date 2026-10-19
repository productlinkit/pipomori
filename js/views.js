/* ── home ── */
function renderHome() {
  const h = new Date().getHours();
  $("#greet-title").textContent = t(h < 11 ? "greetMorning" : h < 18 ? "greetDay" : "greetEvening", { n: playerName() });
  $("#cats").innerHTML = CATS.map((c, i) => `
    <button type="button" class="cat" style="--i:${i}" data-homecat="${c.id}" aria-pressed="${c.id === homeCat}">
      <span class="disc" style="background-image:url('${c.img}')"></span>
      <span>${catName(c.id)}</span>
    </button>`).join("");
  renderDeck();
  renderHomeGrid();
  renderEvent();
}
// tile rhythm for the bento: tall | short+short, then a wide band, then mirrored
const SHAPES = ["t", "s", "s alt", "w", "s alt", "t alt", "s"];
function renderHomeGrid() {
  const list = homeCat === "all" ? GAMES.slice().sort((a, b) => b.added - a.added).slice(0, 8) : GAMES.filter(g => g.cat === homeCat);
  $("#grid-title").textContent = homeCat === "all" ? t("recommended") : catName(homeCat);
  const [first, ...rest] = list;
  $("#feature").innerHTML = first ? `
    <button type="button" class="feature tilt" data-game="${first.id}"><span class="sparkles" aria-hidden="true"><i style="--x:12%;--y:18%;--d:0s;--s:14px"><svg viewBox="0 0 24 24"><path d="M12 2c.6 4.6 2.9 7.4 7.5 8-4.6.6-6.9 3.4-7.5 8-.6-4.6-2.9-7.4-7.5-8 4.6-.6 6.9-3.4 7.5-8Z" fill="currentColor"/></svg></i><i style="--x:78%;--y:12%;--d:0.7s;--s:18px"><svg viewBox="0 0 24 24"><path d="M12 2c.6 4.6 2.9 7.4 7.5 8-4.6.6-6.9 3.4-7.5 8-.6-4.6-2.9-7.4-7.5-8 4.6-.6 6.9-3.4 7.5-8Z" fill="currentColor"/></svg></i><i style="--x:88%;--y:52%;--d:1.4s;--s:12px"><svg viewBox="0 0 24 24"><path d="M12 2c.6 4.6 2.9 7.4 7.5 8-4.6.6-6.9 3.4-7.5 8-.6-4.6-2.9-7.4-7.5-8 4.6-.6 6.9-3.4 7.5-8Z" fill="currentColor"/></svg></i><i style="--x:24%;--y:64%;--d:2.1s;--s:10px"><svg viewBox="0 0 24 24"><path d="M12 2c.6 4.6 2.9 7.4 7.5 8-4.6.6-6.9 3.4-7.5 8-.6-4.6-2.9-7.4-7.5-8 4.6-.6 6.9-3.4 7.5-8Z" fill="currentColor"/></svg></i><i style="--x:56%;--y:30%;--d:1.1s;--s:9px"><svg viewBox="0 0 24 24"><path d="M12 2c.6 4.6 2.9 7.4 7.5 8-4.6.6-6.9 3.4-7.5 8-.6-4.6-2.9-7.4-7.5-8 4.6-.6 6.9-3.4 7.5-8Z" fill="currentColor"/></svg></i></span><span class="glare"></span>
      <img src="${first.img}" alt="">${badge(first)}
      <span class="f-info"><span><b>${first.name[store.lang]}</b><small>${catName(first.cat)} · ${fmt(first.players)} ${t("playing")}</small></span>
        <span class="f-play shine"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>${t("play")}</span></span>
    </button>` : `<p class="empty">${t("empty")}</p>`;
  $("#grid").innerHTML = rest.map((g, i) => `
    <button type="button" class="gcard tilt ${SHAPES[i % SHAPES.length]}" style="--i:${i}" data-game="${g.id}"><span class="glare"></span>
      <img src="${g.img}" alt="" loading="lazy">${badge(g)}<span class="sticker" style="background-image:url('${CATS.find(c => c.id === g.cat).img}')" aria-hidden="true"></span>
      <span class="meta"><span><b>${g.name[store.lang]}</b><small>${catName(g.cat)}</small></span>
        <span class="play" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg></span></span>
    </button>`).join("");
  $("#grid").hidden = !rest.length;
}

/* ── event ticket ── */
const EVENT_START = new Date(2026, 9, 20), EVENT_END = new Date(2026, 9, 27);
function renderEvent() {
  const now = new Date();
  const [target, key] = now < EVENT_START ? [EVENT_START, "startsIn"] : now < EVENT_END ? [EVENT_END, "endsIn"] : [null, "ended"];
  $("#cd-label").textContent = t(key);
  $("#cd").hidden = !target;
  if (target) {
    const mins = Math.max(0, Math.floor((target - now) / 60000));
    $("#cd-d").textContent = Math.floor(mins / 1440);
    $("#cd-h").textContent = Math.floor(mins / 60) % 24;
    $("#cd-m").textContent = mins % 60;
  }
  const joined = !!store.joined;
  $("#event-btn").setAttribute("aria-pressed", joined);
  $("#event-btn").textContent = t(joined ? "joinedEvent" : "joinEvent");
  $("#live-count").textContent = fmt(GAMES.reduce((n, g) => n + g.players, 0) / 2.2);
  $(".live-pill").setAttribute("aria-label", `${$("#live-count").textContent} ${t("online")}`);
}
setInterval(() => { if (view === "home") renderEvent(); }, 30000);

/* ── games ── */
function renderGames() {
  $("#games-sub").textContent = t("gamesSub", { n: GAMES.length });
  $("#chips").innerHTML = CATS.map((c, i) => `<button type="button" style="--i:${i}" data-gamescat="${c.id}" aria-pressed="${c.id === gamesCat}"><span class="ci" style="background-image:url('${c.img}')"></span>${catName(c.id)}</button>`).join("");
  renderList();
}
function renderList() {
  const q = query.trim().toLowerCase();
  let list = GAMES.filter(g => (gamesCat === "all" || g.cat === gamesCat) &&
    (!q || g.name.id.toLowerCase().includes(q) || g.name.en.toLowerCase().includes(q)));
  list.sort(sort === "popular" ? (a, b) => b.players - a.players
    : sort === "new" ? (a, b) => b.added - a.added
    : (a, b) => a.name[store.lang].localeCompare(b.name[store.lang]));
  $$("#sort button").forEach(b => b.setAttribute("aria-pressed", b.dataset.sort === sort));
  $("#result-count").textContent = t("results", { n: list.length });
  $("#list").innerHTML = list.length ? list.map((g, i) => `
    <button type="button" class="lrow" style="--i:${i}" data-game="${g.id}">
      <span class="thumb"><img src="${g.img}" alt="" loading="lazy">${badge(g)}</span>
      <span class="txt"><b>${g.name[store.lang]}</b><small>${catName(g.cat)} · ${fmt(g.players)} ${t("playing")}</small><p>${g.desc[store.lang]}</p></span>
      <span class="play" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg></span>
    </button>`).join("") : `<p class="empty">${q ? t("noResult") : t("empty")}</p>`;
}

/* ── profile ── */
function renderProfile() {
  const a = AVATARS[store.avatar % AVATARS.length];
  const av = $("#avatar");
  av.style.backgroundImage = `url('${a.img}')`; av.style.backgroundPosition = a.pos;
  av.setAttribute("aria-label", a.name);
  const totalXp = 640 + store.plays * 40;
  const lvl = levelOf(store.plays), xp = totalXp % 1000;
  $("#p-level").textContent = t("level", { n: lvl });
  $("#p-vip").hidden = !isSubbed(); $("#p-vip").textContent = t("subscriber");
  renderSub();
  $("#xp-label").textContent = t("xp", { a: nf().format(xp) });
  const pct = Math.max(4, xp / 10);
  requestAnimationFrame(() => { $("#xp-fill").style.width = pct + "%"; $("#xp-knob .sprout").style.left = pct + "%"; });
  $("#st-played").textContent = nf().format(24 + store.plays);
  $(".p-name").textContent = playerName();
  $("#st-badges").textContent = nf().format(6 + Math.floor(store.plays / 3));
  const mini = (ids, emptyKey) => ids.length ? ids.map(byId).filter(Boolean).map(g => `
    <button type="button" data-game="${g.id}"><img src="${g.img}" alt=""><b>${g.name[store.lang]}</b></button>`).join("")
    : `<p class="empty">${t(emptyKey)}</p>`;
  $("#fav-list").innerHTML = mini(store.favs, "favEmpty");
  $("#recent-list").innerHTML = mini(store.recent, "recentEmpty");
  $("#sw-sound").setAttribute("aria-checked", store.sound);
  $("#sw-notif").setAttribute("aria-checked", store.notif);
}

