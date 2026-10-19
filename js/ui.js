/* ── gamification helpers ── */
const levelOf = plays => 7 + Math.floor((640 + plays * 40) / 1000);
const playerName = () => store.name || t("explorer");
const calm = () => reduceMotion.matches;

function confetti() {
  if (calm()) return;
  const cv = document.createElement("canvas"), dpr = Math.min(2, devicePixelRatio || 1);
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:150;pointer-events:none";
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; document.body.appendChild(cv);
  const ctx = cv.getContext("2d"); ctx.scale(dpr, dpr);
  const cols = ["#6cb33c", "#8fd05a", "#ffc93c", "#ef6b4a", "#7cc0f0", "#f1c98f"];
  const ps = Array.from({ length: 110 }, () => ({
    x: innerWidth / 2 + (Math.random() - .5) * 80, y: innerHeight * .35,
    vx: (Math.random() - .5) * 11, vy: -Math.random() * 11 - 4, r: Math.random() * 6 + 4,
    rot: Math.random() * 6, vr: (Math.random() - .5) * .3, c: cols[Math.random() * cols.length | 0], leaf: Math.random() < .4
  }));
  const t0 = performance.now();
  const step = now => {
    const el = now - t0; ctx.clearRect(0, 0, innerWidth, innerHeight);
    ps.forEach(p => {
      p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.max(0, 1 - el / 2200); ctx.fillStyle = p.c;
      if (p.leaf) { ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r / 2.2, 0, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(-p.r / 2, -p.r / 3, p.r, p.r / 1.5);
      ctx.restore();
    });
    if (el < 2200) requestAnimationFrame(step); else cv.remove();
  };
  requestAnimationFrame(step);
}
function dialog(html, onMount) {
  const root = $("#dlg-root");
  root.innerHTML = `<div class="dlg-wrap" id="dlg-wrap"><div class="dlg" role="dialog" aria-modal="true">${html}</div></div>`;
  const close = () => { root.innerHTML = ""; };
  $("#dlg-wrap").addEventListener("click", e => { if (e.target.id === "dlg-wrap") close(); });
  onMount(close);
}
function showLevelUp(lvl) {
  confetti();
  dialog(`<div class="lv"><span><small>LEVEL</small><b>${lvl}</b></span></div>
    <h3>${t("levelUp")}</h3><p>${t("levelUpSub", { n: lvl })}</p>
    <button type="button" class="cta shine" id="dlg-ok">${t("nice")}</button>`, close => {
    $("#dlg-ok").focus(); $("#dlg-ok").addEventListener("click", close);
  });
}


