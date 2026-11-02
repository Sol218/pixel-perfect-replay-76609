import { useEffect, useRef, useState } from "react";
import { type Choices, enemies, find, heroes, scenes, scoring } from "@/lib/codeplay";

const W = 480, H = 300, S = 32;
type P = { x: number; y: number };
const rnd = (): P => ({ x: Math.random() * (W - S), y: Math.random() * (H - S) });
const hit = (a: P, b: P) => Math.abs(a.x - b.x) < S * 0.8 && Math.abs(a.y - b.y) < S * 0.8;

export function GamePreview({ c }: { c: Choices }) {
  const hero = find(heroes, c.hero)!;
  const enemy = find(enemies, c.enemy)!;
  const scene = find(scenes, c.scene)!;
  const sc = find(scoring, c.score)!;
  const boxRef = useRef<HTMLDivElement>(null);
  const keys = useRef<Set<string>>(new Set());
  const st = useRef({ p: { x: 40, y: 130 }, e: { x: 400, y: 40 }, ev: { x: 2, y: 1.6 }, item: rnd(), pts: 0, lives: 3, over: false, inv: 0 });
  const [, tick] = useState(0);
  const [log, setLog] = useState("¡Haz clic en el juego y muévete!");

  const reset = () => {
    st.current = { p: { x: 40, y: 130 }, e: { x: 400, y: 40 }, ev: { x: 2, y: 1.6 }, item: rnd(), pts: 0, lives: 3, over: false, inv: 0 };
    setLog("Juego reiniciado 🔄");
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) && document.activeElement === boxRef.current) e.preventDefault();
      keys.current.add(e.key.toLowerCase());
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    let raf = 0;
    const loop = () => {
      const s = st.current;
      if (!s.over) {
        const k = keys.current, v = 4;
        const map: [string, string, string, string] = c.movement === "wasd" ? ["w", "s", "a", "d"] : ["arrowup", "arrowdown", "arrowleft", "arrowright"];
        if (c.movement !== "raton") {
          if (k.has(map[0])) s.p.y -= v;
          if (k.has(map[1])) s.p.y += v;
          if (k.has(map[2])) s.p.x -= v;
          if (k.has(map[3])) s.p.x += v;
        }
        s.p.x = Math.max(0, Math.min(W - S, s.p.x));
        s.p.y = Math.max(0, Math.min(H - S, s.p.y));
        s.e.x += s.ev.x; s.e.y += s.ev.y;
        if (s.e.x < 0 || s.e.x > W - S) s.ev.x *= -1;
        if (s.e.y < 0 || s.e.y > H - S) s.ev.y *= -1;
        if (s.inv > 0) s.inv--;
        if (hit(s.p, s.item)) {
          s.pts += sc.points; s.item = rnd();
          setLog(`if (toca(${sc.item})) → puntos += ${sc.points} ✅`);
        }
        if (s.inv === 0 && hit(s.p, s.e)) {
          s.inv = 60;
          if (c.collision === "vida") {
            s.lives--;
            setLog("if (toca(enemigo)) → vidas -= 1 💔");
            if (s.lives <= 0) { s.over = true; setLog("vidas === 0 → Game Over 💀"); }
          } else if (c.collision === "puntos") {
            s.pts -= 20; setLog("if (toca(enemigo)) → puntos -= 20 ➖");
          } else {
            reset(); setLog("if (toca(enemigo)) → reiniciarJuego() 🔄");
          }
        }
        tick((t) => t + 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [c.movement, c.collision, sc.points, sc.item]);

  const s = st.current;
  const onMouse = (e: React.MouseEvent) => {
    if (c.movement !== "raton") return;
    const r = e.currentTarget.getBoundingClientRect();
    s.p.x = ((e.clientX - r.left) / r.width) * W - S / 2;
    s.p.y = ((e.clientY - r.top) / r.height) * H - S / 2;
  };
  const pos = (p: P) => ({ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between font-display text-lg">
        <span>⭐ {s.pts} puntos</span>
        {c.collision === "vida" && <span>{"❤️".repeat(Math.max(0, s.lives))}</span>}
      </div>
      <div
        ref={boxRef}
        tabIndex={0}
        onMouseMove={onMouse}
        className={`${scene.cls} relative aspect-[8/5] w-full overflow-hidden rounded-2xl border-4 border-foreground/80 outline-none focus:ring-4 focus:ring-ring`}
        aria-label="Vista previa del juego"
      >
        <span className="absolute text-2xl" style={pos(s.item)}>{sc.emoji}</span>
        <span className="absolute text-3xl" style={pos(s.e)}>{enemy.emoji}</span>
        <span className={`absolute text-3xl ${s.inv > 0 ? "opacity-50" : ""}`} style={pos(s.p)}>{hero.emoji}</span>
        {s.over && (
          <div className="absolute inset-0 grid place-items-center bg-foreground/60">
            <button onClick={reset} className="btn-3d shade-primary rounded-2xl bg-primary px-6 py-3 font-display text-xl text-primary-foreground">
              Game Over · Jugar otra vez
            </button>
          </div>
        )}
      </div>
      <p className="rounded-xl bg-code px-4 py-2 font-mono text-sm text-code-string">{log}</p>
    </div>
  );
}
