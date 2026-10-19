/* ── language ── */
function applyLang() {
  document.documentElement.lang = store.lang;
  $$("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  $$("[data-i18n-ph]").forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  $$("[data-lang]").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === store.lang));
  renderHome(); renderGames(); renderProfile();
  if (current && !$("#overlay").hidden) fillSheet();
}

/* ── routing ── */
function go(v, opts = {}) {
  if (!["home", "games", "profile"].includes(v)) v = "home";
  const changed = v !== view;
  view = v;
  $$(".view").forEach(el => { el.hidden = el.id !== "view-" + v; });
  $$("[data-nav]").forEach(b => b.dataset.nav === v ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"));
  if (v === "profile") renderProfile();
  moveTab(!changed);
  try { history.replaceState(null, "", "#" + v); } catch (e) {}
  if (changed || opts.animate) {
    window.scrollTo(0, 0);
    playEnter($("#view-" + v));
  }
}
function playEnter(el) {
  requestAnimationFrame(() => armReveal(el));
  el.classList.remove("enter"); void el.offsetWidth; el.classList.add("enter");
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("enter"), 1800);
}

/* ── notched tab bar ── */
const tabbar = $("#tabbar"), tbPath = $("#tb-path"), tbBubble = $("#tb-bubble"), tbIco = $("#tb-ico");
let notchX = null, notchAnim;
function notchPath(cx) {
  const W = tabbar.clientWidth, H = tabbar.clientHeight, r = 24, R = 34, S = 14;
  const c = .906, sn = .423; // cos/sin 25°: where the shoulder curve meets the notch arc
  const p1x = cx - R * c, p2x = cx + R * c, py = R * sn;
  return `M0 ${r} Q0 0 ${r} 0 H${cx - R - S}
    C${cx - R - S * .35} 0 ${p1x - 3.4} ${py - 7.2} ${p1x} ${py}
    A${R} ${R} 0 0 0 ${p2x} ${py}
    C${p2x + 3.4} ${py - 7.2} ${cx + R + S * .35} 0 ${cx + R + S} 0
    H${W - r} Q${W} 0 ${W} ${r} V${H - r} Q${W} ${H} ${W - r} ${H} H${r} Q0 ${H} 0 ${H - r} Z`;
}
function moveTab(instant) {
  const btn = tabbar.querySelector('[aria-current="page"]');
  if (!btn || !tabbar.clientWidth) return;
  const target = btn.offsetLeft + btn.offsetWidth / 2;
  tbIco.innerHTML = btn.querySelector("svg").outerHTML;
  tbIco.classList.remove("pop"); void tbIco.offsetWidth; tbIco.classList.add("pop");
  if (notchX === null) { tbBubble.style.transition = "none"; void tbBubble.offsetWidth; }
  tbBubble.style.transform = `translateX(${target}px)`;
  if (notchX === null) { void tbBubble.offsetWidth; tbBubble.style.transition = ""; }
  cancelAnimationFrame(notchAnim);
  if (instant || notchX === null || reduceMotion.matches) { notchX = target; tbPath.setAttribute("d", notchPath(target)); return; }
  const from = notchX, t0 = performance.now(), dur = 450;
  const step = now => {
    const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    notchX = from + (target - from) * e;
    tbPath.setAttribute("d", notchPath(notchX));
    if (k < 1) notchAnim = requestAnimationFrame(step);
  };
  notchAnim = requestAnimationFrame(step);
}
addEventListener("resize", () => { notchX = null; moveTab(true); });

/* ── toast ── */
let toastTimer;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

/* ── game sheet ── */
function fillSheet() {
  $("#m-img").src = current.img;
  $("#m-title").textContent = current.name[store.lang];
  $("#m-sub").textContent = `${catName(current.cat)} · ${fmt(current.players)} ${t("playing")}`;
  $("#m-desc").textContent = current.desc[store.lang];
  const fav = store.favs.includes(current.id);
  $("#m-fav").setAttribute("aria-pressed", fav);
  $("#m-fav").setAttribute("aria-label", t(fav ? "favRemove" : "favAdd"));
}
function openGame(id) {
  current = byId(id); if (!current) return;
  fillSheet();
  const ov = $("#overlay"); ov.hidden = false;
  requestAnimationFrame(() => ov.classList.add("show"));
  $("#m-play").focus();
}
function closeGame() {
  const ov = $("#overlay"); ov.classList.remove("show");
  setTimeout(() => { ov.hidden = true; }, 250);
}

/* ── wooden loader driver (splash + launcher) ── */
function runBar(fill, knob, pct, ms, onDone, gate = () => true) {
  const start = performance.now(); let shown = 0, skip = false;
  function frame(now) {
    const p = Math.min(1, (now - start) / ms);
    shown += (p - shown) * .2;
    if (skip || (p >= 1 && gate())) shown = 1;
    const v = Math.min(100, Math.round(shown * 100));
    fill.style.width = v + "%"; knob.style.left = v + "%"; pct.textContent = v + "%";
    if (v >= 100) return onDone();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return () => { if (gate()) skip = true; };
}

let launchToken = 0, pendingReward = null;
function launch(g) {
  closeGame();
  const lvlBefore = levelOf(store.plays);
  store.plays++;
  pendingReward = { lvl: levelOf(store.plays) > lvlBefore ? levelOf(store.plays) : 0 };
  store.recent = [g.id, ...store.recent.filter(id => id !== g.id)].slice(0, 8);
  save();
  const L = $("#launcher"), token = ++launchToken;
  L.style.backgroundImage = `url('${g.img}')`;
  $("#l-title").textContent = g.name[store.lang];
  $("#l-loader").hidden = false; $("#l-done").hidden = true;
  L.hidden = false; requestAnimationFrame(() => L.classList.add("show"));
  runBar($("#l-fill"), $("#l-knob .sprout"), $("#l-pct"), 1800, () => {
    if (token !== launchToken) return;
    $("#l-loader").hidden = true; $("#l-done").hidden = false; $("#l-back").focus(); confetti();
  });
}
function closeLauncher() {
  launchToken++;
  const L = $("#launcher"); L.classList.remove("show");
  setTimeout(() => { L.hidden = true; }, 500);
  if (view === "profile") renderProfile();
  renderEvent();
  if (pendingReward) {
    const r = pendingReward; pendingReward = null;
    setTimeout(() => {
      if (r.lvl) showLevelUp(r.lvl);
    }, 450);
  }
}

/* ── events ── */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-lang],[data-homecat],[data-gamescat],[data-sort],[data-game],[data-nav]");
  if (!el) { if (e.target.id === "overlay") closeGame(); return; }
  const d = el.dataset;
  if (d.lang) { store.lang = d.lang; save(); applyLang(); }
  else if (d.homecat) { homeCat = d.homecat; renderHome(); }
  else if (d.gamescat) { gamesCat = d.gamescat; $$("[data-gamescat]").forEach(b => b.setAttribute("aria-pressed", b.dataset.gamescat === gamesCat)); renderList(); }
  else if (d.sort) { sort = d.sort; renderList(); }
  else if (d.game) openGame(d.game);
  else if (d.nav) go(d.nav);
});
$("#see-all").addEventListener("click", () => {
  gamesCat = homeCat; renderGames(); go("games");
});
/* ── trending deck ── */
let deckActive = 0, deckTop = [];
const deck = $("#deck");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
function renderDeck() {
  deckTop = [...GAMES].sort((a, b) => b.players - a.players).slice(0, 7);
  deck.innerHTML = deckTop.map((g, i) => `
    <button type="button" class="dcard" data-deck="${i}" aria-label="${g.name[store.lang]}, ${catName(g.cat)}">
      <img src="${g.img}" alt="" draggable="false">
      <span class="rank${i < 3 ? " gold" : ""}" aria-hidden="true">#${i + 1}</span>
      <span class="dlabel" aria-hidden="true"><b>${g.name[store.lang]}</b><small>${catName(g.cat)}</small></span>
    </button>`).join("");
  layoutDeck(0);
}
function layoutDeck(frac) {
  const n = deckTop.length;
  deck.querySelectorAll(".dcard").forEach((c, i) => {
    let d = i - deckActive;
    if (d > n / 2) d -= n; if (d < -n / 2) d += n;
    d -= frac;
    const ad = Math.abs(d);
    // points on a gentle arc: drop grows with d², tilt follows the slope
    const x = d * 80, y = d * d * 11, rot = d * 9, sc = 1 - Math.min(ad, 2) * .13;
    c.style.transform = `translateX(${x}%) translateY(${y}px) rotate(${rot}deg) scale(${sc})`;
    c.style.zIndex = 100 - Math.round(ad * 10);
    c.style.opacity = ad > 2.3 ? 0 : 1;
    c.style.pointerEvents = ad > 2.3 ? "none" : "";
    c.classList.toggle("on", frac === 0 && i === deckActive);
    c.tabIndex = i === deckActive ? 0 : -1;
  });
}
function stepDeck(by) { const n = deckTop.length; deckActive = (deckActive + by + n) % n; layoutDeck(0); }

let drag = null, dragMoved = false, deckHover = false;
deck.addEventListener("pointerdown", e => { drag = { x: e.clientX, id: e.pointerId }; dragMoved = false; });
deck.addEventListener("pointermove", e => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  if (!dragMoved && Math.abs(dx) > 8) { dragMoved = true; deck.classList.add("dragging"); try { deck.setPointerCapture(drag.id); } catch (err) {} }
  if (dragMoved) {
    const step = deck.querySelector(".dcard").offsetWidth * .80;
    layoutDeck(Math.max(-1.4, Math.min(1.4, -dx / step)));
  }
});
function endDrag(e) {
  if (!drag) return;
  if (dragMoved) {
    const step = deck.querySelector(".dcard").offsetWidth * .80;
    const by = Math.round(Math.max(-1.4, Math.min(1.4, -(e.clientX - drag.x) / step)));
    deck.classList.remove("dragging");
    stepDeck(by);
  }
  drag = null;
}
deck.addEventListener("pointerup", endDrag);
deck.addEventListener("pointercancel", endDrag);
deck.addEventListener("mouseenter", () => { deckHover = true; });
deck.addEventListener("mouseleave", () => { deckHover = false; });
deck.addEventListener("click", e => {
  const c = e.target.closest("[data-deck]");
  if (!c || dragMoved) return;
  const i = +c.dataset.deck;
  if (i !== deckActive) { deckActive = i; layoutDeck(0); return; }
  c.classList.remove("tap"); void c.offsetWidth; c.classList.add("tap");
  setTimeout(() => openGame(deckTop[i].id), reduceMotion.matches ? 0 : 260);
});
deck.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") { stepDeck(1); deck.querySelector(".dcard.on")?.focus(); }
  if (e.key === "ArrowLeft") { stepDeck(-1); deck.querySelector(".dcard.on")?.focus(); }
});
setInterval(() => {
  if (reduceMotion.matches || deckHover || drag || view !== "home" || !$("#overlay").hidden || document.hidden || deck.contains(document.activeElement)) return;
  stepDeck(1);
}, 2000);

$("#q").addEventListener("input", e => { query = e.target.value; renderList(); });
$("#m-play").addEventListener("click", () => launch(current));
$("#m-fav").addEventListener("click", () => {
  const on = !store.favs.includes(current.id);
  store.favs = on ? [current.id, ...store.favs] : store.favs.filter(id => id !== current.id);
  save(); fillSheet(); renderProfile();
  toast(t(on ? "favAdded" : "favRemoved"));
});
$("#event-btn").addEventListener("click", () => { store.joined = !store.joined; save(); renderEvent(); toast(t(store.joined ? "eventJoined" : "eventLeft")); });
$("#l-close").addEventListener("click", closeLauncher);
$("#l-back").addEventListener("click", closeLauncher);
$("#avatar-edit").addEventListener("click", () => {
  store.avatar = (store.avatar + 1) % AVATARS.length; save(); renderProfile();
  const av = $("#avatar"); av.style.animation = "none"; void av.offsetWidth; av.style.animation = "bounce .45s cubic-bezier(.3,1.6,.5,1)";
  toast(t("avatarNow", { c: AVATARS[store.avatar].name }));
});
$("#sw-sound").addEventListener("click", () => { store.sound = !store.sound; save(); renderProfile(); toast(t(store.sound ? "soundOn" : "soundOff")); });
$("#sw-notif").addEventListener("click", () => { store.notif = !store.notif; save(); renderProfile(); toast(t(store.notif ? "notifOn" : "notifOff")); });
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if ($("#dlg-wrap")) $("#dlg-root").innerHTML = "";
  else if (!$("#launcher").hidden) closeLauncher();
  else if (!$("#overlay").hidden) closeGame();
});

/* ── boot ── */
$$(".wm").forEach(el => { el.innerHTML = WORDMARK; });
["#s-knob", "#l-knob", "#xp-knob"].forEach(s => { $(s).innerHTML = SPROUT; });
$("#s-knob .sprout").classList.add("live"); $("#l-knob .sprout").classList.add("live");
applyLang();
const startView = (location.hash || "").slice(1);
view = null; go(["home", "games", "profile"].includes(startView) ? startView : "home");
$$(".view").forEach(v => v.classList.remove("enter"));

(function splash() {
  const sp = $("#splash"), tip = $("#s-tip");
  const srcs = [...new Set([...GAMES.map(g => g.img), "assets/splash.jpg"])];
  let loaded = 0, ti = 0;
  srcs.forEach(s => { const i = new Image(); i.onload = i.onerror = () => loaded++; i.src = s; });
  tip.textContent = T[store.lang].tips[0];
  const tipTimer = setInterval(() => { ti = (ti + 1) % T[store.lang].tips.length; tip.textContent = T[store.lang].tips[ti]; }, 700);
  const skip = runBar($("#s-fill"), $("#s-knob .sprout"), $("#s-pct"), 2600, () => {
    clearInterval(tipTimer);
    setTimeout(() => {
      const app = $("#app");
      app.classList.add("boot");
      if (store.loggedIn !== true) showLogin(); else playEnter($("#view-" + view));
      sp.classList.add("out");
      setTimeout(() => { sp.remove(); app.classList.remove("boot"); }, 1300);
    }, 250);
  }, () => loaded >= srcs.length);
  sp.addEventListener("click", skip);
})();
