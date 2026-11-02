import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { type Choices, MAZE, canMove, dirKeys, pick, triviaFor } from "@/lib/codeplay";

const W = 480, H = 300, S = 28;
type P = { x: number; y: number };
const hit = (a: P, b: P, k = 0.8) => Math.abs(a.x - b.x) < S * k && Math.abs(a.y - b.y) < S * k;
const pos = (p: P) => ({ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` });

/* ---------- motor compartido ---------- */
function useInput(box: RefObject<HTMLElement | null>) {
  const keys = useRef(new Set<string>());
  const taps = useRef<Record<string, number>>({});
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((k.startsWith("arrow") || k === " ") && document.activeElement === box.current) e.preventDefault();
      if (!e.repeat) taps.current[k] = (taps.current[k] ?? 0) + 1;
      keys.current.add(k);
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [box]);
  return {
    held: (k: string) => keys.current.has(k.toLowerCase()),
    tap: (k: string) => { const key = k.toLowerCase(); const n = taps.current[key] ?? 0; taps.current[key] = 0; return n; },
  };
}
function useLoop(fn: () => void) {
  const f = useRef(fn);
  f.current = fn;
  const [, tick] = useState(0);
  useEffect(() => {
    let raf = 0;
    const loop = () => { f.current(); tick((t) => t + 1); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
}

function Frame({ boxRef, cls, hud, log, overlay, onRetry, children }: {
  boxRef: RefObject<HTMLDivElement | null>; cls?: string; hud: ReactNode; log: string; overlay?: string | null; onRetry: () => void; children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 font-display text-lg">{hud}</div>
      <div ref={boxRef} tabIndex={0} aria-label="Vista previa del juego"
        className={`${cls ?? ""} relative aspect-[8/5] w-full overflow-hidden rounded-2xl border-4 border-foreground/80 outline-none focus:ring-4 focus:ring-ring`}>
        {children}
        {overlay && (
          <div className="absolute inset-0 grid place-items-center bg-foreground/60 p-4 text-center">
            <div className="space-y-3">
              <p className="font-display text-2xl font-bold text-primary-foreground">{overlay}</p>
              <button onClick={() => { onRetry(); boxRef.current?.focus(); }} className="btn-3d shade-primary rounded-2xl bg-primary px-6 py-3 font-display text-xl text-primary-foreground">Jugar otra vez</button>
            </div>
          </div>
        )}
      </div>
      <p className="rounded-xl bg-code px-4 py-2 font-mono text-sm text-code-string">{log}</p>
    </div>
  );
}
const Sprite = ({ p, e, size = "text-2xl", dim }: { p: P; e: string; size?: string; dim?: boolean }) =>
  <span className={`absolute leading-none ${size} ${dim ? "opacity-50" : ""}`} style={pos(p)}>{e}</span>;

export function GamePreview({ c }: { c: Choices }) {
  const k = JSON.stringify(c);
  switch (c.category) {
    case "plataformas": return <Platform key={k} c={c} />;
    case "laberinto": return <Maze key={k} c={c} />;
    case "espacial": return <Space key={k} c={c} />;
    case "carreras": return <Race key={k} c={c} />;
    case "trivia": return <Trivia key={k} c={c} />;
    default: return null;
  }
}

/* ---------- Plataformas (Mario Bros) ---------- */
const GROUND = 264;
const PLATS = [{ x: 110, y: 205, w: 90 }, { x: 230, y: 155, w: 100 }, { x: 370, y: 205, w: 80 }];
const coins0 = () => [{ x: 140, y: 172 }, { x: 266, y: 122 }, { x: 396, y: 172 }, { x: 60, y: 232 }, { x: 300, y: 232 }];
function Platform({ c }: { c: Choices }) {
  const box = useRef<HTMLDivElement>(null);
  const inp = useInput(box);
  const init = () => ({ p: { x: 16, y: GROUND - S, vy: 0, ground: true }, e: { x: 320, y: GROUND - S, dir: -1, alive: true, back: 0 }, coins: coins0(), pts: 0, lives: 3, inv: 0, end: null as string | null });
  const st = useRef(init());
  const [log, setLog] = useState("Haz clic en el juego. Salta con ↑ / espacio.");
  const [u, , l, r] = dirKeys(c.movement);
  const sc = pick(c, "score");
  const rule = c.collision;
  useLoop(() => {
    const s = st.current, p = s.p, e = s.e;
    const jump = inp.tap(u) + inp.tap(" ") > 0 || ((inp.held(u) || inp.held(" ")) && p.ground);
    if (s.end) return;
    if (inp.held(l)) p.x -= 3;
    if (inp.held(r)) p.x += 3;
    if (jump && p.ground) { p.vy = -9.5; p.ground = false; }
    const prevBottom = p.y + S;
    p.vy += 0.5; p.y += p.vy; p.ground = false;
    for (const f of [{ x: -50, y: GROUND, w: W + 100 }, ...PLATS]) {
      if (p.vy >= 0 && prevBottom <= f.y + 1 && p.y + S >= f.y && p.x + S > f.x && p.x < f.x + f.w) { p.y = f.y - S; p.vy = 0; p.ground = true; }
    }
    p.x = Math.max(0, Math.min(W - S, p.x));
    if (e.alive) { e.x += e.dir * 1.3; if (e.x < 150 || e.x > 400) e.dir *= -1; }
    else if (--e.back <= 0) { e.alive = true; e.x = 400; }
    s.coins = s.coins.filter((co) => {
      if (!hit(p, co)) return true;
      s.pts += sc?.value ?? 10; setLog(`if (toca(jugador, ${sc?.id})) → puntos += ${sc?.value} ✅`); return false;
    });
    if (s.inv > 0) s.inv--;
    if (e.alive && hit(p, e)) {
      if (p.vy > 0 && prevBottom <= e.y + 10) { e.alive = false; e.back = 200; p.vy = -7; s.pts += 50; setLog("if (saltaEncima(enemigo)) → ¡aplastado! puntos += 50 🥾"); }
      else if (s.inv === 0) {
        s.inv = 60;
        if (rule === "vida") { s.lives--; setLog("if (toca(jugador, enemigo)) → vidas -= 1 💔"); if (s.lives <= 0) s.end = "Game Over 💀"; }
        else if (rule === "puntos") { s.pts -= 20; setLog("if (toca(jugador, enemigo)) → puntos -= 20 ➖"); }
        else { st.current = init(); setLog("if (toca(jugador, enemigo)) → reiniciarJuego() 🔄"); }
      }
    }
    if (p.x >= 440) s.end = `🚩 ¡Nivel completado! ${s.pts} puntos`;
  });
  const s = st.current;
  return (
    <Frame boxRef={box} cls={pick(c, "scene")?.cls} log={log} overlay={s.end} onRetry={() => { st.current = init(); setLog("¡A jugar otra vez!"); }}
      hud={<><span>⭐ {s.pts} puntos</span>{rule === "vida" && <span>{"❤️".repeat(Math.max(0, s.lives))}</span>}</>}>
      <div className="absolute inset-x-0 bottom-0 border-t-4 border-accent-shade bg-accent" style={{ top: `${(GROUND / H) * 100}%` }} />
      {PLATS.map((f, i) => <div key={i} className="absolute h-3 rounded-sm border-2 border-accent-shade bg-accent" style={{ ...pos(f), width: `${(f.w / W) * 100}%` }} />)}
      <Sprite p={{ x: 444, y: GROUND - 44 }} e="🚩" size="text-4xl" />
      {s.coins.map((co, i) => <Sprite key={i} p={co} e={sc?.emoji ?? "🪙"} />)}
      {s.e.alive && <Sprite p={s.e} e={pick(c, "enemy")?.emoji ?? "🍄"} size="text-3xl" />}
      <Sprite p={s.p} e={pick(c, "hero")?.emoji ?? "🧑‍🔧"} size="text-3xl" dim={s.inv > 0} />
    </Frame>
  );
}

/* ---------- Laberinto (Pac-Man) ---------- */
const COLS = MAZE[0].length, ROWS = MAZE.length;
const findCell = (ch: string) => { for (let y = 0; y < ROWS; y++) { const x = MAZE[y].indexOf(ch); if (x >= 0) return { x, y }; } return { x: 1, y: 1 }; };
const wallCls: Record<string, string> = { neon: "border-2 border-secondary bg-secondary/20", setos: "bg-primary-shade rounded-sm", cueva: "bg-foreground/70 rounded" };
function Maze({ c }: { c: Choices }) {
  const box = useRef<HTMLDivElement>(null);
  const inp = useInput(box);
  const limit = pick(c, "time")?.value ?? 40, dotPts = pick(c, "dots")?.value ?? 0;
  const dots0 = () => { const d = new Set<string>(); if (dotPts) MAZE.forEach((row, y) => [...row].forEach((ch, x) => ch === "." && d.add(`${x},${y}`))); return d; };
  const init = () => ({ p: findCell("S"), dots: dots0(), pts: 0, start: 0, left: limit, cool: 0, end: null as string | null });
  const st = useRef(init());
  const [log, setLog] = useState("Haz clic en el juego. ¡El reloj empieza al moverte!");
  const [u, d, l, r] = dirKeys(c.movement);
  const goal = findCell("G");
  useLoop(() => {
    const s = st.current;
    const taps = [inp.tap(u), inp.tap(d), inp.tap(l), inp.tap(r)];
    if (s.end) return;
    if (s.start) { s.left = Math.max(0, limit - (performance.now() - s.start) / 1000); if (s.left === 0) { s.end = "⏰ ¡Se acabó el tiempo!"; setLog("if (tiempo === 0) → pierdes ⏰"); return; } }
    if (s.cool > 0) s.cool--;
    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    let i = taps.findIndex((t) => t > 0);
    if (i < 0 && s.cool === 0) i = [u, d, l, r].findIndex((k) => inp.held(k));
    if (i < 0) return;
    if (!s.start) s.start = performance.now();
    s.cool = 8;
    const nx = s.p.x + dirs[i][0], ny = s.p.y + dirs[i][1];
    if (!canMove(nx, ny)) { setLog('if (mapa[fila][col] === "#") → ¡pared! no te mueves 🧱'); return; }
    s.p = { x: nx, y: ny };
    const key = `${nx},${ny}`;
    if (s.dots.delete(key)) { s.pts += dotPts; setLog(`if (hayPuntito) → puntos += ${dotPts}`); }
    if (nx === goal.x && ny === goal.y) { s.end = `🏆 ¡Llegaste en ${(limit - s.left).toFixed(1)} s!`; setLog("if (toca(jugador, meta)) → ¡Ganaste! 🏆"); }
  });
  const s = st.current, scene = c.scene ?? "neon";
  const cell = (x: number, y: number) => ({ left: `${(x / COLS) * 100}%`, top: `${(y / ROWS) * 100}%`, width: `${100 / COLS}%`, height: `${100 / ROWS}%` });
  return (
    <Frame boxRef={box} cls={pick(c, "scene")?.cls} log={log} overlay={s.end} onRetry={() => { st.current = init(); setLog("¡Otra vez!"); }}
      hud={<><span>⏱️ {Math.ceil(s.left)} s</span>{dotPts > 0 && <span>⭐ {s.pts}</span>}</>}>
      {MAZE.flatMap((row, y) => [...row].map((ch, x) =>
        ch === "#" ? <div key={`${x}-${y}`} className={`absolute ${wallCls[scene] ?? wallCls.neon}`} style={cell(x, y)} />
        : s.dots.has(`${x},${y}`) ? <div key={`${x}-${y}`} className="absolute grid place-items-center" style={cell(x, y)}><span className="size-1.5 rounded-full bg-accent" /></div> : null))}
      <div className="absolute grid place-items-center text-2xl" style={cell(goal.x, goal.y)}>{pick(c, "goal")?.emoji ?? "🏁"}</div>
      <div className="absolute grid place-items-center text-2xl transition-all duration-100" style={cell(s.p.x, s.p.y)}>{pick(c, "hero")?.emoji ?? "😮"}</div>
    </Frame>
  );
}

/* ---------- Espacial (Space Invaders) ---------- */
const wave0 = () => Array.from({ length: 18 }, (_, i) => ({ x: 50 + (i % 6) * 55, y: 20 + Math.floor(i / 6) * 34 }));
function Space({ c }: { c: Choices }) {
  const box = useRef<HTMLDivElement>(null);
  const inp = useInput(box);
  const init = () => ({ x: 226, aliens: wave0(), dir: 1, wave: 1, bullets: [] as P[], bombs: [] as P[], pts: 0, lives: 3, inv: 0, end: null as string | null });
  const st = useRef(init());
  const [log, setLog] = useState("Haz clic en el juego. Muévete y dispara con espacio.");
  const [u, , l, r] = dirKeys(c.movement);
  const shots = pick(c, "shot")?.value ?? 1, rule = c.collision;
  useLoop(() => {
    const s = st.current;
    const fire = inp.tap(" ") + inp.tap(u);
    if (s.end) return;
    if (inp.held(l)) s.x -= 4;
    if (inp.held(r)) s.x += 4;
    s.x = Math.max(0, Math.min(W - S, s.x));
    if (fire && s.bullets.length < shots * 2) {
      if (shots === 2) s.bullets.push({ x: s.x - 6, y: 250 }, { x: s.x + 6, y: 250 }); else s.bullets.push({ x: s.x, y: 250 });
    }
    s.bullets.forEach((b) => (b.y -= 7));
    s.bullets = s.bullets.filter((b) => b.y > -20);
    const sp = 0.5 + s.wave * 0.25;
    s.aliens.forEach((a) => (a.x += s.dir * sp));
    if (s.aliens.some((a) => a.x < 0 || a.x > W - S)) { s.dir *= -1; s.aliens.forEach((a) => (a.y += 12)); }
    for (const b of [...s.bullets]) {
      const a = s.aliens.find((al) => hit(al, b, 0.7));
      if (a) { s.aliens = s.aliens.filter((x) => x !== a); s.bullets = s.bullets.filter((x) => x !== b); s.pts += 10; setLog("if (toca(bala, alien)) → eliminar(alien); puntos += 10 💥"); }
    }
    if (s.aliens.length && Math.random() < 0.012 + s.wave * 0.004) { const a = s.aliens[Math.floor(Math.random() * s.aliens.length)]; s.bombs.push({ x: a.x, y: a.y + 20 }); }
    s.bombs.forEach((b) => (b.y += 3));
    s.bombs = s.bombs.filter((b) => b.y < H);
    if (s.inv > 0) s.inv--;
    const me = { x: s.x, y: 262 };
    if (s.inv === 0 && s.bombs.some((b) => hit(b, me, 0.6))) {
      s.inv = 60; s.bombs = [];
      if (rule === "vida") { s.lives--; setLog("if (toca(nave, disparoAlien)) → vidas -= 1 💔"); if (s.lives <= 0) s.end = `💀 Game Over · ${s.pts} puntos`; }
      else if (rule === "puntos") { s.pts -= 20; setLog("if (toca(nave, disparoAlien)) → puntos -= 20 ➖"); }
      else { st.current = init(); setLog("if (toca(nave, disparoAlien)) → reiniciarJuego() 🔄"); return; }
    }
    if (s.aliens.some((a) => a.y > 230)) s.end = "👾 ¡Los invasores aterrizaron!";
    if (!s.aliens.length) { s.wave++; s.aliens = wave0(); setLog(`if (aliens.length === 0) → oleada ${s.wave} 🌊`); }
  });
  const s = st.current;
  return (
    <Frame boxRef={box} cls={pick(c, "scene")?.cls} log={log} overlay={s.end} onRetry={() => { st.current = init(); setLog("¡Nueva partida!"); }}
      hud={<><span>⭐ {s.pts} · Oleada {s.wave}</span>{rule === "vida" && <span>{"❤️".repeat(Math.max(0, s.lives))}</span>}</>}>
      {s.aliens.map((a, i) => <Sprite key={i} p={a} e={pick(c, "enemy")?.emoji ?? "👾"} />)}
      {s.bullets.map((b, i) => <span key={i} className="absolute h-3 w-1 rounded bg-accent" style={pos({ x: b.x + S / 2, y: b.y })} />)}
      {s.bombs.map((b, i) => <span key={i} className="absolute size-2 rounded-full bg-destructive" style={pos({ x: b.x + S / 2, y: b.y })} />)}
      <Sprite p={{ x: s.x, y: 262 }} e={pick(c, "hero")?.emoji ?? "🚀"} size="text-3xl" dim={s.inv > 0} />
    </Frame>
  );
}

/* ---------- Carreras (Gran Turismo) ---------- */
const ROAD = { x: 120, w: 240 };
const RIVAL_CARS = ["🚗", "🚕", "🚙"];
function Race({ c }: { c: Choices }) {
  const box = useRef<HTMLDivElement>(null);
  const inp = useInput(box);
  const n = pick(c, "rivals")?.value ?? 2, goalD = pick(c, "length")?.value ?? 3000;
  const lanes = [140, 200, 260, 320];
  const init = () => ({
    me: { x: lanes[0], d: 0, v: 0 }, count: 180, bump: 0, finished: [] as number[], end: null as string | null,
    rivals: Array.from({ length: n }, (_, i) => ({ x: lanes[i + 1], tx: lanes[i + 1], d: 0, v: 0, top: 4.6 + Math.random() * 1.6 })),
  });
  const st = useRef(init());
  const [log, setLog] = useState("Haz clic en el juego. ↑ acelera, ↓ frena.");
  const [u, d, l, r] = dirKeys(c.movement);
  useLoop(() => {
    const s = st.current, me = s.me;
    if (s.end) return;
    if (s.count > 0) { s.count--; return; }
    if (inp.held(u)) me.v = Math.min(7, me.v + 0.12); else me.v = Math.max(0, me.v - 0.04);
    if (inp.held(d)) me.v = Math.max(0, me.v - 0.25);
    if (inp.held(l)) me.x -= 3;
    if (inp.held(r)) me.x += 3;
    me.x = Math.max(ROAD.x, Math.min(ROAD.x + ROAD.w - S, me.x));
    me.d += me.v;
    s.rivals.forEach((rv) => {
      rv.v = Math.min(rv.top, rv.v + 0.07);
      rv.d += rv.v;
      if (Math.random() < 0.006) rv.tx = lanes[Math.floor(Math.random() * lanes.length)];
      rv.x += Math.sign(rv.tx - rv.x) * Math.min(1.5, Math.abs(rv.tx - rv.x));
    });
    if (s.bump > 0) s.bump--;
    if (s.bump === 0 && s.rivals.some((rv) => Math.abs(rv.x - me.x) < S * 0.8 && Math.abs(rv.d - me.d) < S)) {
      s.bump = 40; me.v /= 2; setLog("if (toca(piloto, rival)) → velocidad = velocidad / 2 💥");
    }
    s.rivals.forEach((rv, i) => { if (rv.d >= goalD && !s.finished.includes(i)) s.finished.push(i); });
    if (me.d >= goalD) {
      const place = s.finished.length + 1;
      s.end = place === 1 ? "🏆 ¡Primer lugar! Ganaste la carrera" : `🏁 Llegaste en lugar ${place} de ${n + 1}`;
      setLog(`if (distancia >= pista.largo) → lugar = ${place}`);
    }
  });
  const s = st.current, me = s.me;
  const place = 1 + s.rivals.filter((rv) => rv.d > me.d).length;
  return (
    <Frame boxRef={box} cls={pick(c, "scene")?.cls} log={log} overlay={s.end} onRetry={() => { st.current = init(); setLog("¡Nueva carrera!"); }}
      hud={<><span>🏁 Lugar {place}/{n + 1}</span><span>{Math.round(me.v * 30)} km/h</span></>}>
      <div className="road absolute inset-y-0" style={{ left: `${(ROAD.x / W) * 100}%`, width: `${(ROAD.w / W) * 100}%`, backgroundPositionY: `${me.d % 40}px, 0` }} />
      {goalD - me.d < 260 && <div className="absolute h-3 bg-[repeating-linear-gradient(90deg,var(--foreground)_0_8px,var(--card)_8px_16px)]" style={{ left: `${(ROAD.x / W) * 100}%`, width: `${(ROAD.w / W) * 100}%`, top: `${((230 - (goalD - me.d)) / H) * 100}%` }} />}
      {s.rivals.map((rv, i) => { const y = 230 - (rv.d - me.d); return y > -S && y < H ? <Sprite key={i} p={{ x: rv.x, y }} e={RIVAL_CARS[i]} size="text-3xl" /> : null; })}
      <Sprite p={{ x: me.x, y: 230 }} e={pick(c, "hero")?.emoji ?? "🏎️"} size="text-3xl" dim={s.bump > 0} />
      <div className="absolute inset-x-2 top-2 h-2 rounded-full bg-card/60"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (me.d / goalD) * 100)}%` }} /></div>
      {s.count > 0 && <div className="absolute inset-0 grid place-items-center font-display text-7xl font-bold text-accent">{Math.ceil(s.count / 60)}</div>}
    </Frame>
  );
}

/* ---------- Trivia (Preguntados) ---------- */
const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const answerCls = ["bg-destructive", "bg-secondary", "bg-primary", "bg-accent text-accent-foreground"];
function Trivia({ c }: { c: Choices }) {
  const box = useRef<HTMLDivElement>(null);
  const limit = pick(c, "time")?.value ?? 15, pts = pick(c, "points")?.value ?? 10;
  const make = () => shuffle(triviaFor(c.topic)).slice(0, 5).map((q) => ({ q: q.q, right: q.a[0], opts: shuffle(q.a) }));
  const [qs, setQs] = useState(make);
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(limit);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ pts: 0, ok: 0 });
  const [log, setLog] = useState("Elige la respuesta antes de que se acabe el reloj.");
  const done = i >= qs.length;
  const q = qs[i];
  useEffect(() => {
    if (done || picked) return;
    if (left <= 0) { setPicked("⏰"); setLog("if (reloj === 0) → siguientePregunta() ⏰"); return; }
    const t = setTimeout(() => setLeft((x) => +(x - 0.1).toFixed(1)), 100);
    return () => clearTimeout(t);
  }, [left, picked, done]);
  useEffect(() => {
    if (!picked) return;
    const t = setTimeout(() => { setI((x) => x + 1); setPicked(null); setLeft(limit); }, 1300);
    return () => clearTimeout(t);
  }, [picked, limit]);
  const answer = (o: string) => {
    if (picked) return;
    setPicked(o);
    if (o === q.right) { setScore((s) => ({ pts: s.pts + pts, ok: s.ok + 1 })); setLog(`if (respuesta === correcta) → puntos += ${pts} ✅`); }
    else setLog(`if (respuesta !== correcta) → era "${q.right}" ❌`);
  };
  const retry = () => { setQs(make()); setI(0); setLeft(limit); setPicked(null); setScore({ pts: 0, ok: 0 }); };
  return (
    <Frame boxRef={box} cls={pick(c, "scene")?.cls} log={log} overlay={done ? `${pick(c, "hero")?.emoji} ${score.ok}/${qs.length} correctas · ${score.pts} puntos` : null} onRetry={retry}
      hud={<><span>⭐ {score.pts} puntos</span><span>Pregunta {Math.min(i + 1, qs.length)}/{qs.length}</span></>}>
      {q && (
        <div className="absolute inset-0 flex flex-col gap-2 p-3">
          <div className="h-3 overflow-hidden rounded-full bg-card/50"><div className={`h-full ${left < 4 ? "bg-destructive" : "bg-accent"}`} style={{ width: `${(left / limit) * 100}%` }} /></div>
          <div className="flex items-center gap-3 rounded-2xl bg-card p-3 text-card-foreground">
            <span className="text-3xl">{pick(c, "hero")?.emoji}</span>
            <p className="font-display text-base font-semibold leading-tight sm:text-lg">{q.q}</p>
            <span className="ml-auto font-display text-xl">{Math.ceil(left)}s</span>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-2">
            {q.opts.map((o, j) => {
              const state = picked ? (o === q.right ? "ring-4 ring-card" : "opacity-40") : "";
              return <button key={o} onClick={() => answer(o)} className={`rounded-xl font-display text-sm font-semibold text-primary-foreground sm:text-base ${answerCls[j]} ${state}`}>{o}</button>;
            })}
          </div>
        </div>
      )}
    </Frame>
  );
}
