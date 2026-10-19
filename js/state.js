/* ── state ── */
const store = { lang: "id", favs: [], recent: [], plays: 0, sound: true, notif: true, avatar: 0 };
try { Object.assign(store, JSON.parse(localStorage.getItem("pipomori") || "{}")); } catch (e) {}
if (!T[store.lang]) store.lang = "id";
const save = () => { try { localStorage.setItem("pipomori", JSON.stringify(store)); } catch (e) {} };
let homeCat = "all", gamesCat = "all", sort = "popular", query = "", view = "home", current = null;

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const t = (k, vars) => { let s = T[store.lang][k]; if (vars) for (const v in vars) s = s.replace("{" + v + "}", vars[v]); return s; };
const catName = c => T[store.lang].cats[c];
const nf = () => new Intl.NumberFormat(store.lang === "id" ? "id-ID" : "en-US");
const fmt = n => new Intl.NumberFormat(store.lang === "id" ? "id-ID" : "en-US", { notation: n >= 1000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n);
const byId = id => GAMES.find(g => g.id === id);
const badge = g => g.tag ? `<span class="badge ${g.tag}">${g.tag === "new" ? t("isNew") : t("hot")}</span>` : "";

