import { useEffect, useRef } from "react";

/**
 * Fondo procedural dibujado con Canvas 2D para cada escenario.
 * Se redibuja con requestAnimationFrame (~60 FPS) para animar
 * partículas (nieve), luces parpadeantes (antorchas) y parallax (dunas).
 */
const W = 480, H = 300;

type Ctx = CanvasRenderingContext2D;

/** Oscurece las esquinas para dar profundidad (viñeteado). */
function vignette(ctx: Ctx) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 0.95);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

export function SceneCanvas({ scene }: { scene?: string | undefined }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    let raf = 0;

    // Partículas y detalles pre-generados (posiciones fijas, se animan con el tiempo t)
    const flakes = Array.from({ length: 80 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 2.2, v: 0.4 + Math.random() * 1.1, drift: Math.random() * Math.PI * 2 }));
    const stars = Array.from({ length: 60 }, (_, i) => ({ x: (i * 83) % W, y: (i * 47) % H, p: (i % 7) * 0.5 }));
    const grain = Array.from({ length: 260 }, () => ({ x: Math.random() * W, y: Math.random() * H, a: 0.03 + Math.random() * 0.06 }));
    const windows = Array.from({ length: 40 }, (_, i) => ({ x: (i * 37) % W, y: 150 + ((i * 29) % 120), on: i % 3 !== 0 }));

    const sky = (top: string, bottom: string) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, top);
      g.addColorStop(1, bottom);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    };

    /** Una capa de dunas/colinas con curva senoidal; `off` la desplaza para el parallax. */
    const dune = (base: number, amp: number, color: string, off: number) => {
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 8) ctx.lineTo(x, base + Math.sin((x + off) / 90) * amp);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    const draw = (t: number) => {
      switch (scene) {
        case "castillo": {
          sky("#3a2b20", "#14100c");
          // Muro de piedra biselada: ladrillos alternados con juntas oscuras y brillo superior
          for (let y = 0, row = 0; y < H - 60; y += 26, row++)
            for (let x = -26; x < W + 26; x += 52) {
              const bx = x + (row % 2) * 26;
              ctx.fillStyle = "#4a3a2c";
              ctx.fillRect(bx + 2, y + 2, 48, 22);
              ctx.fillStyle = "rgba(255,255,255,0.06)";
              ctx.fillRect(bx + 2, y + 2, 48, 4);
              ctx.strokeStyle = "rgba(0,0,0,0.5)";
              ctx.strokeRect(bx + 2, y + 2, 48, 22);
            }
          // Suelo de adoquín
          ctx.fillStyle = "#2c231a";
          ctx.fillRect(0, H - 60, W, 60);
          for (let y = H - 60; y < H; y += 15)
            for (let x = 0; x < W; x += 24) {
              ctx.fillStyle = "rgba(255,255,255,0.04)";
              ctx.beginPath();
              ctx.ellipse(x + 12, y + 7, 10, 6, 0, 0, Math.PI * 2);
              ctx.fill();
            }
          // Antorchas con luz cálida parpadeante (shadowBlur + gradiente radial)
          for (const tx of [70, 410]) {
            const fl = 1 + Math.sin(t * 9 + tx) * 0.15 + Math.sin(t * 23 + tx) * 0.08;
            const g = ctx.createRadialGradient(tx, 80, 4, tx, 80, 90 * fl);
            g.addColorStop(0, "rgba(255,190,80,0.85)");
            g.addColorStop(0.4, "rgba(255,140,40,0.35)");
            g.addColorStop(1, "rgba(255,120,20,0)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
            ctx.save();
            ctx.shadowColor = "#ffb84d";
            ctx.shadowBlur = 18 * fl;
            ctx.fillStyle = "#ffcf6e";
            ctx.beginPath();
            ctx.ellipse(tx, 78, 6 * fl, 10 * fl, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            ctx.fillStyle = "#5a3a1a";
            ctx.fillRect(tx - 3, 86, 6, 18);
          }
          vignette(ctx);
          break;
        }
        case "desierto": {
          sky("#ffe3a3", "#f7a94e");
          // Sol con resplandor
          const sg = ctx.createRadialGradient(400, 50, 5, 400, 50, 70);
          sg.addColorStop(0, "rgba(255,250,220,1)");
          sg.addColorStop(1, "rgba(255,250,220,0)");
          ctx.fillStyle = sg;
          ctx.fillRect(320, 0, 160, 130);
          // Dunas en capas con parallax: la lejana se mueve más lento
          dune(150, 18, "#f0b968", t * 6);
          dune(200, 24, "#e09a4a", t * 14);
          dune(255, 20, "#c97f36", t * 26);
          // Textura granulada de arena
          ctx.fillStyle = "#7a4d1c";
          for (const g of grain) {
            ctx.globalAlpha = g.a;
            ctx.fillRect(g.x, g.y, 2, 2);
          }
          ctx.globalAlpha = 1;
          vignette(ctx);
          break;
        }
        case "nieve": {
          sky("#bcd6ee", "#7fa8cf");
          // Neblina atmosférica fría: bandas translúcidas que se desplazan
          for (let i = 0; i < 3; i++) {
            const y = 90 + i * 60;
            const off = ((t * 12 + i * 160) % (W + 200)) - 100;
            const g = ctx.createLinearGradient(off - 100, 0, off + 100, 0);
            g.addColorStop(0, "rgba(255,255,255,0)");
            g.addColorStop(0.5, "rgba(255,255,255,0.18)");
            g.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = g;
            ctx.fillRect(off - 100, y, 200, 26);
          }
          // Hielo con reflejos especulares
          const ice = ctx.createLinearGradient(0, H - 50, 0, H);
          ice.addColorStop(0, "#dcecfb");
          ice.addColorStop(1, "#a9cbe8");
          ctx.fillStyle = ice;
          ctx.fillRect(0, H - 50, W, 50);
          ctx.strokeStyle = "rgba(255,255,255,0.7)";
          for (let i = 0; i < 5; i++) {
            const x = (i * 113 + t * 20) % W;
            ctx.beginPath();
            ctx.moveTo(x, H - 40 + (i % 3) * 10);
            ctx.lineTo(x + 40, H - 44 + (i % 3) * 10);
            ctx.stroke();
          }
          // Copos de nieve continuos
          ctx.fillStyle = "#ffffff";
          for (const f of flakes) {
            f.y += f.v;
            f.x += Math.sin(t + f.drift) * 0.4;
            if (f.y > H) { f.y = -4; f.x = Math.random() * W; }
            ctx.globalAlpha = 0.5 + f.r / 4;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          // Bordes escarchados
          const frost = ctx.createLinearGradient(0, 0, 0, 26);
          frost.addColorStop(0, "rgba(255,255,255,0.8)");
          frost.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = frost;
          ctx.fillRect(0, 0, W, 26);
          vignette(ctx);
          break;
        }
        case "pradera": {
          sky("#8ec9f5", "#d8f0ff");
          dune(200, 20, "#7cc46a", 0);
          dune(240, 16, "#5aa848", 60);
          break;
        }
        case "subterraneo": {
          sky("#1c2030", "#0c0e16");
          for (const s of stars) {
            ctx.globalAlpha = 0.2 + 0.2 * Math.sin(t * 2 + s.p);
            ctx.fillStyle = "#9fb4ff";
            ctx.fillRect(s.x, s.y % 120, 2, 2);
          }
          ctx.globalAlpha = 1;
          vignette(ctx);
          break;
        }
        case "espacio":
        case "nebulosa":
        case "planeta": {
          sky("#0a0a1e", "#161030");
          if (scene === "nebulosa") {
            const g = ctx.createRadialGradient(330, 90, 10, 330, 90, 160);
            g.addColorStop(0, "rgba(220,80,180,0.5)");
            g.addColorStop(1, "rgba(220,80,180,0)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
          }
          if (scene === "planeta") {
            ctx.save();
            ctx.shadowColor = "#ffcf6e";
            ctx.shadowBlur = 30;
            ctx.fillStyle = "#e8a54d";
            ctx.beginPath();
            ctx.arc(410, 45, 34, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            ctx.strokeStyle = "rgba(255,255,255,0.5)";
            ctx.beginPath();
            ctx.ellipse(410, 45, 52, 12, -0.3, 0, Math.PI * 2);
            ctx.stroke();
          }
          for (const s of stars) {
            ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(t * 1.5 + s.p));
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(s.x, s.y, 2, 2);
          }
          ctx.globalAlpha = 1;
          break;
        }
        case "noche": {
          sky("#0d1030", "#241a3e");
          for (let i = 0; i < 10; i++) {
            const bw = 40 + (i % 3) * 14;
            const bh = 90 + ((i * 53) % 90);
            ctx.fillStyle = "#1a1430";
            ctx.fillRect(i * 50 - 10, H - bh, bw, bh);
          }
          for (const w of windows) {
            ctx.fillStyle = w.on && Math.sin(t * 0.5 + w.x) > -0.8 ? "#ffd76e" : "#2a2444";
            ctx.fillRect(w.x, w.y, 5, 7);
          }
          break;
        }
        case "neon": {
          sky("#0b0b18", "#141428");
          ctx.strokeStyle = "rgba(90,120,255,0.25)";
          for (let y = 40; y < H; y += 34) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
          }
          for (let x = 0; x < W; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 40);
            ctx.lineTo(x, H);
            ctx.stroke();
          }
          break;
        }
        case "setos": {
          sky("#bfe6a8", "#7fb35e");
          ctx.fillStyle = "#2e5c1e";
          for (const g of grain) {
            ctx.globalAlpha = g.a * 2;
            ctx.fillRect(g.x, g.y, 3, 3);
          }
          ctx.globalAlpha = 1;
          break;
        }
        case "cueva": {
          sky("#4a3a28", "#241c10");
          ctx.fillStyle = "#33281a";
          for (let i = 0; i < 8; i++) {
            const x = i * 62 + 10;
            const len = 20 + ((i * 37) % 30);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + 14, 0);
            ctx.lineTo(x + 7, len);
            ctx.closePath();
            ctx.fill();
          }
          vignette(ctx);
          break;
        }
        case "circuito": {
          sky("#79b657", "#4c8a38");
          ctx.fillStyle = "#2e5c1e";
          for (const g of grain) {
            ctx.globalAlpha = g.a;
            ctx.fillRect(g.x, g.y, 3, 3);
          }
          ctx.globalAlpha = 1;
          break;
        }
        case "show": {
          sky("#3b1a4a", "#1c0e26");
          // Conos de luz de escenario que se mecen
          for (const lx of [120, 360]) {
            const sw = Math.sin(t * 0.8 + lx) * 60;
            const g = ctx.createLinearGradient(lx, 0, lx + sw, H);
            g.addColorStop(0, "rgba(255,230,150,0.35)");
            g.addColorStop(1, "rgba(255,230,150,0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(lx - 8, 0);
            ctx.lineTo(lx + 8, 0);
            ctx.lineTo(lx + sw + 60, H);
            ctx.lineTo(lx + sw - 60, H);
            ctx.closePath();
            ctx.fill();
          }
          break;
        }
        case "aula": {
          sky("#2e5b4c", "#234a3d");
          ctx.fillStyle = "#cfe8d8";
          for (const g of grain) {
            ctx.globalAlpha = g.a;
            ctx.fillRect(g.x, g.y, 2, 2);
          }
          ctx.globalAlpha = 1;
          break;
        }
        default:
          // "ruleta" y cualquier otro conservan su fondo CSS
          break;
      }
    };

    // Bucle de animación: dibuja un cuadro y agenda el siguiente (~60 FPS)
    const loop = (ms: number) => {
      draw(ms / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [scene]);

  return <canvas ref={ref} width={W} height={H} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
