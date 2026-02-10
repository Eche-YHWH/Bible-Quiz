export function createConfetti(container) {
  return function pop(reduceMotion = false) {
    if (reduceMotion) return;
    if (!container) return;
    container.innerHTML = "";
    container.classList.remove("hidden");

    const colors = ["#22c55e", "#60a5fa", "#f472b6", "#fbbf24", "#a78bfa", "#34d399"];
    const count = 80;

    for (let i = 0; i < count; i++) {
      const piece = document.createElement("i");
      const left = Math.random() * 100;
      const delay = Math.random() * 120;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const w = 6 + Math.random() * 8;
      const h = 10 + Math.random() * 14;

      piece.style.left = left + "vw";
      piece.style.top = "-20px";
      piece.style.background = color;
      piece.style.width = w + "px";
      piece.style.height = h + "px";
      piece.style.animationDelay = delay + "ms";
      piece.style.transform = `translateY(-20px) rotate(${Math.random() * 360}deg)`;

      container.appendChild(piece);
    }

    setTimeout(() => container.classList.add("hidden"), 1200);
  };
}
