import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { type Choices, type Option, buildCode, choiceOf, crearCuenta, games, gameOf, iniciarSesion, pick, validateLogin } from "@/lib/codeplay";
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
  const g = gameOf(c);
  const steps = ["Juego", ...(g?.stages.map((s) => s.label) ?? ["Personajes", "Escena", "Reglas"]), "¡Prueba!"];
  const stage = step > 0 && step < 4 ? g?.stages[step - 1] : undefined;
  const ready = step === 0 ? !!g : stage ? stage.questions.every((q) => !!choiceOf(c, q.key)) : true;
  const code = buildCode(c, step === 4 ? 4 : step + 1);
  const tip = step === 0 ? "Una variable es como una caja con etiqueta: guarda un dato para usarlo después." : stage?.tip;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6 flex items-center gap-4">
        <span className="font-display text-2xl font-bold text-primary">🎮 CodePlay</span>
        <div className="flex flex-1 gap-2">
          {steps.map((s, i) => (
            <div key={i} className="flex-1">
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
            {step === 0 ? <>
              <Head n={1} title="¿Qué tipo de juego quieres crear?" sub="Cada género tiene sus propias reglas, como los juegos famosos." />
              <Cards items={games.map((x) => ({ ...x, desc: `Como ${x.inspired}` }))} value={c.category} onPick={(id) => setC({ category: id })} />
            </> : stage && <>
              <Head n={step + 1} title={stage.title} sub={stage.sub} />
              {stage.questions.map((q) => (
                <Section key={q.key} title={q.title}>
                  <Cards items={q.options} value={choiceOf(c, q.key)} onPick={(id) => setC((x) => ({ ...x, [q.key]: id }))} renderBg={(o) => o.cls ?? ""} />
                </Section>
              ))}
            </>}
            <Nav step={step} setStep={setStep} ready={ready} />
          </div>
          <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-6rem)]"><CodePanel code={code} tip={tip} /></div>
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

const howTo: Record<string, string> = {
  plataformas: "Haz clic en el juego. Camina con ← → y salta con ↑ o espacio. ¡Llega a la bandera!",
  laberinto: "Haz clic en el juego y muévete casilla por casilla hasta la meta antes de que acabe el tiempo.",
  espacial: "Haz clic en el juego. Muévete con ← → y dispara con espacio.",
  carreras: "Haz clic en el juego. ↑ acelera, ↓ frena, ← → cambia de carril. ¡Llega primero!",
  trivia: "Haz clic en la respuesta correcta antes de que el reloj llegue a 0.",
};

function Final({ c, code, onBack, onRestart }: { c: Choices; code: string; onBack: () => void; onRestart: () => void }) {
  const g = gameOf(c);
  const qs = g?.stages.flatMap((s) => s.questions) ?? [];
  const wasd = c.movement === "wasd" ? " (usa W A S D en vez de flechas)" : "";
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold">🎉 ¡Tu juego está listo!</h2>
        <p className="text-muted-foreground">{g?.emoji} {g?.name}, inspirado en {g?.inspired}. Cada cosa que pasa es una línea de tu código.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {qs.map((q) => { const o = pick(c, q.key); return <span key={q.key} className="rounded-full border-2 bg-card px-4 py-2 text-sm"><b>{q.title}:</b> {o?.emoji} {o?.name}</span>; })}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border-2 bg-card p-5">
          <h3 className="mb-1 text-xl font-semibold">Vista previa</h3>
          <p className="mb-3 text-sm text-muted-foreground">{(c.category && howTo[c.category]) ?? ""}{c.category !== "trivia" ? wasd : ""}</p>
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
