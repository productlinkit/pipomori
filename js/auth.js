/* ── login / logout ── */
function renderLoginAvatars() {
  $("#lg-avatars").innerHTML = AVATARS.map((a, i) => `<button type="button" role="radio" aria-checked="${i === pickAvatar}" aria-label="${a.name}" data-pick="${i}"
    style="background-image:url('${a.img}');background-position:${a.pos}"></button>`).join("");
}
// phone numbers are kept as the national part without the leading 0, e.g. "81234567890"
const normPhone = v => { const d = v.replace(/\D/g, ""); return d.startsWith("62") ? d.slice(2) : d.startsWith("0") ? d.slice(1) : d; };
const validPhone = p => /^8[1-9]\d{7,10}$/.test(p);
const showPhone = p => `+62 ${p.slice(0, 3)}-${p.slice(3, 7)}-${p.slice(7)}`;
const maskPhone = p => `+62 ${p.slice(0, 3)}-••••-${p.slice(-4)}`;
const OPERATORS = [
  ["Telkomsel", ["811", "812", "813", "821", "822", "823", "851", "852", "853"]],
  ["Indosat", ["814", "815", "816", "855", "856", "857", "858"]],
  ["XL", ["817", "818", "819", "859", "877", "878"]],
  ["AXIS", ["831", "832", "833", "838"]],
  ["Tri", ["895", "896", "897", "898", "899"]],
  ["Smartfren", ["881", "882", "883", "884", "885", "886", "887", "888", "889"]]
];
const operatorOf = p => (OPERATORS.find(([, pre]) => pre.includes(p.slice(0, 3))) || [t("opOther")])[0];
const SUB_SC = "99876", SUB_REG = "REG PIPO", SUB_UNREG = "UNREG PIPO";

let pickAvatar = 0, otp = { phone: "", code: "", until: 0 }, resendTimer = 0;
function loginStep(step) {
  ["phone", "otp", "form"].forEach(s => { $(s === "form" ? "#lg-form" : `#lg-${s}-form`).hidden = s !== step; });
  $$("#login .lg-err").forEach(e => { e.hidden = true; });
  const focus = { phone: "#lg-phone", otp: "#lg-otp", form: "#lg-name" }[step];
  setTimeout(() => $(focus).focus(), 60);
}
function showLogin() {
  pickAvatar = store.avatar || 0;
  renderLoginAvatars();
  $("#lg-phone").value = store.phone || "";
  $("#lg-name").value = store.name && store.name !== t("guestName") ? store.name : "";
  loginStep("phone");
  const L = $("#login"); L.classList.remove("out"); L.hidden = false;
}
function lgError(id, msg) { const er = $(id); er.textContent = msg; er.hidden = false; }
function sendOtp(phone) {
  otp = { phone, code: String(Math.floor(1000 + Math.random() * 9000)), until: Date.now() + 30000 };
  $("#lg-otp-sub").innerHTML = t("otpSub", { p: `<b>${showPhone(phone)}</b>` });
  $("#lg-demo").innerHTML = `${t("otpDemo")} <b>${otp.code}</b>`;
  $("#lg-otp").value = "";
  tickResend();
}
function tickResend() {
  clearTimeout(resendTimer);
  const s = Math.ceil((otp.until - Date.now()) / 1000), b = $("#lg-resend");
  b.disabled = s > 0;
  b.textContent = s > 0 ? t("resendIn", { s }) : t("resend");
  if (s > 0) resendTimer = setTimeout(tickResend, 1000);
}
$("#lg-phone-form").addEventListener("submit", e => {
  e.preventDefault();
  const p = normPhone($("#lg-phone").value);
  if (!validPhone(p)) { lgError("#lg-phone-err", t("phoneBad")); $("#lg-phone").focus(); return; }
  sendOtp(p); loginStep("otp");
});
$("#lg-otp").addEventListener("input", e => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
  $("#lg-otp-err").hidden = true;
  if (e.target.value.length === 4) $("#lg-otp-form").requestSubmit();
});
$("#lg-otp-form").addEventListener("submit", e => {
  e.preventDefault();
  if ($("#lg-otp").value !== otp.code) { lgError("#lg-otp-err", t("otpBad")); $("#lg-otp").select(); return; }
  clearTimeout(resendTimer);
  // a returning number keeps its explorer name; a new one gets a fresh profile step
  if (store.phone !== otp.phone) { store.name = ""; $("#lg-name").value = ""; }
  store.phone = otp.phone; save();
  loginStep("form");
});
$("#lg-change").addEventListener("click", () => { clearTimeout(resendTimer); loginStep("phone"); });
$("#lg-resend").addEventListener("click", () => { sendOtp(otp.phone); toast(t("otpSent")); $("#lg-otp").focus(); });
function finishLogin(name) {
  store.name = name; store.avatar = pickAvatar; store.loggedIn = true; save();
  const L = $("#login"); L.classList.add("out");
  setTimeout(() => { L.hidden = true; }, 550);
  applyLang(); go("home", { animate: true });
  confetti(); toast(t("hello", { n: name }));
}
$("#lg-avatars").addEventListener("click", e => {
  const b = e.target.closest("[data-pick]"); if (!b) return;
  pickAvatar = +b.dataset.pick; renderLoginAvatars();
});
$("#lg-form").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("#lg-name").value.trim();
  if (!name) { lgError("#lg-err", t("nameMissing")); $("#lg-name").focus(); return; }
  finishLogin(name);
});
$("#lg-guest").addEventListener("click", () => { store.phone = ""; finishLogin(t("guestName")); });

/* ── operator subscription ── */
const isSubbed = () => !!(store.phone && store.sub && store.sub.phone === store.phone);
const fmtDay = (d, opts = { day: "numeric", month: "short", year: "numeric" }) => new Date(d).toLocaleDateString(store.lang === "id" ? "id-ID" : "en-US", opts);
function renderSub() {
  const card = $("#sub-card"), on = isSubbed();
  card.classList.toggle("on", on);
  const head = `<div class="sub-top"><span><b>${t("subPlan")}</b><small>${t("subPrice")}</small></span><span class="sub-pill">${t(on ? "subOn" : "subOff")}</span></div>
    <ul class="sub-perks"><li>${t("perk1")}</li><li>${t("perk2")}</li><li>${t("perk3")}</li></ul>`;
  if (!store.phone) {
    card.innerHTML = `${head}<p class="sub-meta">${t("subGuest")}</p><button type="button" class="btn leaf shine" id="sub-login">${t("loginPhone")}</button>`;
  } else if (on) {
    const next = new Date(); next.setDate(next.getDate() + 1);
    card.innerHTML = `${head}<p class="sub-meta">${t("subVia", { o: operatorOf(store.phone), p: maskPhone(store.phone) })}<br>${t("subSince", { d: fmtDay(store.sub.since), n: fmtDay(next, { day: "numeric", month: "short" }) })}</p>
      <button type="button" class="btn ghost warn" id="sub-off">${t("unsubscribe")}</button>`;
  } else {
    card.innerHTML = `${head}<p class="sub-meta">${t("subVia", { o: operatorOf(store.phone), p: maskPhone(store.phone) })}</p>
      <button type="button" class="btn leaf shine" id="sub-on">${t("subscribe")}</button>`;
  }
}
$("#sub-card").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.id === "sub-login") { store.loggedIn = false; save(); showLogin(); }
  if (b.id === "sub-on") confirmSub();
  if (b.id === "sub-off") confirmUnsub();
});
function confirmSub() {
  const o = operatorOf(store.phone), p = maskPhone(store.phone), pn = `<span class="nw">${p}</span>`;
  dialog(`<div class="dlg-ico leaf"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/></svg></div>
    <h3>${t("subQ")}</h3>
    <div class="sub-sum"><b>${t("subPlan")}</b> · ${t("subPrice")}<br>${t("subQText", { o, p: pn, price: t("subPrice") })}</div>
    <p class="fine">${t("subSms", { k: `<b>${SUB_REG}</b>`, sc: `<b>${SUB_SC}</b>` })}</p>
    <div class="dlg-actions"><button type="button" class="btn ghost" id="dlg-no">${t("cancel")}</button><button type="button" class="btn leaf" id="dlg-yes">${t("subYes")}</button></div>`, close => {
    $("#dlg-yes").focus();
    $("#dlg-no").addEventListener("click", close);
    $("#dlg-yes").addEventListener("click", () => {
      close(); store.sub = { phone: store.phone, since: Date.now() }; save();
      renderProfile(); confetti(); toast(t("subDone", { p }));
    });
  });
}
function confirmUnsub() {
  dialog(`<div class="dlg-ico"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="m9.5 9.5 5 5M14.5 9.5l-5 5"/></svg></div>
    <h3>${t("unsubQ")}</h3><p>${t("unsubText")}</p>
    <p class="fine">${t("subSms", { k: `<b>${SUB_UNREG}</b>`, sc: `<b>${SUB_SC}</b>` })}</p>
    <div class="dlg-actions"><button type="button" class="btn ghost" id="dlg-no">${t("cancel")}</button><button type="button" class="btn danger" id="dlg-yes">${t("unsubYes")}</button></div>`, close => {
    $("#dlg-no").focus();
    $("#dlg-no").addEventListener("click", close);
    $("#dlg-yes").addEventListener("click", () => { close(); store.sub = null; save(); renderProfile(); toast(t("unsubDone")); });
  });
}
$("#logout-btn").addEventListener("click", () => {
  dialog(`<div class="dlg-ico"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5M5 12h11"/></svg></div>
    <h3>${t("logoutQ")}</h3><p>${t("logoutText")}</p>
    <div class="dlg-actions"><button type="button" class="btn ghost" id="dlg-no">${t("cancel")}</button><button type="button" class="btn danger" id="dlg-yes">${t("logout")}</button></div>`, close => {
    $("#dlg-no").focus();
    $("#dlg-no").addEventListener("click", close);
    $("#dlg-yes").addEventListener("click", () => { close(); store.loggedIn = false; save(); showLogin(); });
  });
});

