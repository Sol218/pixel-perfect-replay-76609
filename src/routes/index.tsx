import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  type Choices, type Option, buildCode, categories, collisions, enemies, find, heroes,
  movements, scenes, scoring, validateLogin,
} from "@/lib/codeplay";
import { CodePanel } from "@/components/codeplay/CodePanel";
import { GamePreview } from "@/components/codeplay/GamePreview";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CodePlay Studio — Crea tu videojuego y aprende a programar" },
      { name: "description", content: "Diseña tu propio videojuego paso a paso y aprende variables, objetos, eventos y condicionales." },
      { property: "og:title", content: "CodePlay Studio" },
      { property: "og:description", content: "Crea tu videojuego paso a paso mientras aprendes a programar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

const steps = ["Categoría", "Personajes", "Escena", "Acciones", "¡Prueba!"];
const tips = [
  "Una variable es como una caja con etiqueta: guarda un dato para usarlo después.",
  "Un objeto agrupa varios datos sobre una misma cosa, como tu héroe: nombre, posición, vidas…",
  "Tu escena también es un objeto con propiedades: su mundo y su tamaño.",
  "Los eventos escuchan al teclado o al ratón. Los condicionales (if) deciden qué pasa: SI toca algo → ENTONCES…",
];

function App() {
  const [user, setUser] = useState<string | null>(null);
  return user ? <Studio user={user} onLogout={() => setUser(null)} /> : <Login onLogin={setUser} />;
}

function Login({ onLogin }: { onLogin: (u: string) => void }) {
  const [u, setU] = useState(""), [p, setP] = useState(""), [err, setErr] = useState<string | null>(null);
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form
        onSubmit={(e) => { e.preventDefault(); const v = validateLogin(u, p); setErr(v); if (!v) onLogin(u.trim()); }}
        className="w-full max-w-sm space-y-5 rounded-3xl border-2 bg-card p-8 btn-3d shade-border"
      >
        <div className="text-center">
          <div className="text-6xl">🎮</div>
          <h1 className="mt-2 text-4xl font-bold text-primary">CodePlay Studio</h1>
          <p className="text-muted-foreground">Crea tu juego. Aprende a programar.</p>
        </div>
        <Field label="Usuario" value={u} onChange={setU} />
        <Field label="Contraseña" type="password" value={p} onChange={setP} />
        {err && <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{err}</p>}
        <BigButton type="submit" className="w-full">¡Entrar a crear!</BigButton>
      </form>
    </main>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block space-y-1">
      <span className="font-display font-semibold">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border-2 bg-muted px-4 py-3 text-lg outline-none focus:border-secondary" />
    </label>
  );
}

function BigButton({ variant = "primary", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  const v = variant === "primary"
    ? "bg-primary text-primary-foreground shade-primary disabled:opacity-40"
    : "bg-card border-2 text-foreground shade-border";
  return <button {...props} className={`btn-3d rounded-2xl px-6 py-3 font-display text-lg font-semibold uppercase tracking-wide ${v} ${className}`} />;
}

function Cards<T extends Option>({ items, value, onPick, renderBg }: { items: T[]; value?: string | undefined; onPick: (id: string) => void; renderBg?: (o: T) => string }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((o) => {
        const on = value === o.id;
        return (
          <button key={o.id} onClick={() => onPick(o.id)} aria-pressed={on}
            className={`btn-3d flex flex-col items-center gap-1 rounded-2xl border-2 p-4 text-center transition-colors ${on ? "border-secondary bg-secondary/10 shade-secondary" : "bg-card shade-border hover:bg-muted"}`}>
            <span className={`grid size-16 place-items-center rounded-xl text-4xl ${renderBg ? renderBg(o) : ""}`}>{o.emoji}</span>
            <span className="font-display font-semibold leading-tight">{o.name}</span>
            {o.desc && <span className="text-xs text-muted-foreground">{o.desc}</span>}
          </button>
        );
      })}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-3"><h3 className="text-xl font-semibold">{title}</h3>{children}</section>;
}

function Studio({ user, onLogout }: { user: string; onLogout: () => void }) {
  const [step, setStep] = useState(0);
  const [c, setC] = useState<Choices>({});
  const set = (k: keyof Choices) => (id: string) => setC((x) => ({ ...x, [k]: id }));
  const ready = [
    !!c.category, !!c.hero && !!c.enemy, !!c.scene, !!c.movement && !!c.score && !!c.collision, true,
  ][step];
  const code = buildCode(c, step === 4 ? 4 : step + 1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6 flex items-center gap-4">
        <span className="font-display text-2xl font-bold text-primary">🎮 CodePlay</span>
        <div className="flex flex-1 gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-4 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
              <span className={`hidden text-xs font-bold sm:block ${i === step ? "text-primary" : "text-muted-foreground"}`}>{i + 1}. {s}</span>
            </div>
          ))}
        </div>
        <button onClick={onLogout} className="text-sm font-semibold text-muted-foreground hover:text-foreground">Hola, {user} · Salir</button>
      </header>

      {step < 4 ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6 rounded-3xl border-2 bg-card p-6">
            {step === 0 && <>
              <Head n={1} title="¿Qué tipo de juego quieres crear?" sub="Elige un género para empezar." />
              <Cards items={categories} value={c.category} onPick={set("category")} />
            </>}
            {step === 1 && <>
              <Head n={2} title="Elige a tus personajes" sub="Tu héroe y su rival se guardarán en variables y objetos." />
              <Section title="Protagonista"><Cards items={heroes} value={c.hero} onPick={set("hero")} /></Section>
              <Section title="Enemigo u obstáculo"><Cards items={enemies} value={c.enemy} onPick={set("enemy")} /></Section>
            </>}
            {step === 2 && <>
              <Head n={3} title="¿Dónde ocurre la aventura?" sub="Escoge el mundo de tu juego." />
              <Cards items={scenes} value={c.scene} onPick={set("scene")} renderBg={(o) => o.cls} />
            </>}
            {step === 3 && <>
              <Head n={4} title="Reglas del juego" sub="Aquí aprendes eventos y condicionales." />
              <Section title="¿Cómo se mueve tu héroe?"><Cards items={movements} value={c.movement} onPick={set("movement")} /></Section>
              <Section title="¿Cómo gana puntos?"><Cards items={scoring} value={c.score} onPick={set("score")} /></Section>
              <Section title="¿Qué pasa al chocar con el enemigo?"><Cards items={collisions} value={c.collision} onPick={set("collision")} /></Section>
            </>}
            <Nav step={step} setStep={setStep} ready={!!ready} />
          </div>
          <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-6rem)]"><CodePanel code={code} tip={tips[step]} /></div>
        </div>
      ) : (
        <Final c={c} code={code} onBack={() => setStep(3)} onRestart={() => { setC({}); setStep(0); }} />
      )}
    </div>
  );
}

function Head({ n, title, sub }: { n: number; title: string; sub: string }) {
  return (
    <div>
      <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase text-accent-foreground">Paso {n}</span>
      <h2 className="mt-2 text-3xl font-bold">{title}</h2>
      <p className="text-muted-foreground">{sub}</p>
    </div>
  );
}

function Nav({ step, setStep, ready }: { step: number; setStep: (n: number) => void; ready: boolean }) {
  return (
    <div className="flex justify-between border-t-2 pt-5">
      <BigButton variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 0} className="disabled:invisible">Atrás</BigButton>
      <BigButton onClick={() => setStep(step + 1)} disabled={!ready}>{step === 3 ? "¡Probar mi juego!" : "Continuar"}</BigButton>
    </div>
  );
}

function Final({ c, code, onBack, onRestart }: { c: Choices; code: string; onBack: () => void; onRestart: () => void }) {
  const summary = [
    ["Juego", find(categories, c.category)], ["Héroe", find(heroes, c.hero)], ["Enemigo", find(enemies, c.enemy)],
    ["Mundo", find(scenes, c.scene)], ["Movimiento", find(movements, c.movement)], ["Puntos", find(scoring, c.score)],
    ["Al chocar", find(collisions, c.collision)],
  ] as const;
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold">🎉 ¡Tu juego está listo!</h2>
        <p className="text-muted-foreground">Pruébalo: cada cosa que pasa es una línea de tu código.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {summary.map(([k, o]) => (
          <span key={k} className="rounded-full border-2 bg-card px-4 py-2 text-sm"><b>{k}:</b> {o?.emoji} {o?.name}</span>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border-2 bg-card p-5">
          <h3 className="mb-1 text-xl font-semibold">Vista previa</h3>
          <p className="mb-3 text-sm text-muted-foreground">
            {c.movement === "raton" ? "Mueve el ratón sobre el juego." : "Haz clic en el juego y usa " + (c.movement === "wasd" ? "W A S D." : "las flechas.")}
          </p>
          <GamePreview c={c} />
        </div>
        <div className="h-[560px]"><CodePanel code={code} tip="Este es el código completo de tu juego, con comentarios." /></div>
      </div>
      <div className="flex justify-center gap-3">
        <BigButton variant="ghost" onClick={onBack}>Cambiar reglas</BigButton>
        <BigButton onClick={onRestart}>Crear otro juego</BigButton>
      </div>
    </div>
  );
}
