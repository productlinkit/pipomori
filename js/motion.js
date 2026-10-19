/* ── tilt: cards lean toward the pointer ── */
function tiltMove(e) {
  const el = e.target.closest(".tilt"); if (!el || calm()) return;
  const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
  el.classList.add("tilting");
  el.style.setProperty("--ry", `${(px - .5) * 14}deg`); el.style.setProperty("--rx", `${(.5 - py) * 12}deg`);
  el.style.setProperty("--gx", `${px * 100}%`); el.style.setProperty("--gy", `${py * 100}%`);
}
function tiltEnd(e) {
  const el = e.target.closest && e.target.closest(".tilt"); if (!el) return;
  el.classList.remove("tilting"); el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg");
}
document.addEventListener("pointermove", tiltMove);
document.addEventListener("pointerdown", tiltMove);
document.addEventListener("pointerout", tiltEnd);
document.addEventListener("pointerup", e => { if (e.pointerType !== "mouse") tiltEnd(e); });

/* ── hero parallax + scroll reveal ── */
let scrollTick = false;
addEventListener("scroll", () => {
  if (scrollTick || calm()) return; scrollTick = true;
  requestAnimationFrame(() => {
    scrollTick = false;
    const y = scrollY, hero = $(`#view-${view} .hero`); if (!hero) return;
    const k = Math.min(1, y / 300);
    hero.style.backgroundPositionY = view === "home" ? `calc(78% + ${y * .25}px)` : `calc(35% + ${y * .25}px)`;
    const g = hero.querySelector(".greet"); if (g) { g.style.opacity = 1 - k * .9; g.style.transform = `translateY(${y * .35}px)`; }
  });
}, { passive: true });
const revealIO = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target; el.classList.add("reveal-in"); el.classList.remove("reveal-pre"); revealIO.unobserve(el);
  });
}, { rootMargin: "0px 0px -8% 0px" }) : null;
function armReveal(scope) {
  if (!revealIO || calm()) return;
  scope.querySelectorAll("section.block").forEach(sec => {
    if (sec.getBoundingClientRect().top < innerHeight) return;   // already on screen: leave it visible
    sec.classList.remove("reveal-in"); sec.classList.add("reveal-pre"); revealIO.observe(sec);
  });
}

