function highlight(line: string) {
  if (line.trim().startsWith("//")) return <span className="text-code-comment">{line}</span>;
  const parts = line.split(/("[^"]*"|\b(?:let|const|if|document|e)\b|\b\d+\b)/g);
  return parts.map((p, i) =>
    p.startsWith('"') ? <span key={i} className="text-code-string">{p}</span>
    : /^(let|const|if)$/.test(p) ? <span key={i} className="text-code-keyword">{p}</span>
    : /^\d+$/.test(p) ? <span key={i} className="text-code-number">{p}</span>
    : <span key={i}>{p}</span>,
  );
}

export function CodePanel({ code, tip }: { code: string; tip?: string | undefined }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-code text-code-foreground">
      <div className="flex items-center gap-2 border-b border-code-foreground/10 px-4 py-3">
        <span className="size-3 rounded-full bg-destructive" />
        <span className="size-3 rounded-full bg-accent" />
        <span className="size-3 rounded-full bg-primary" />
        <span className="ml-2 font-mono text-xs text-code-comment">mi-juego.js</span>
      </div>
      {tip && <p className="border-b border-code-foreground/10 px-4 py-3 text-sm">💡 {tip}</p>}
      <pre className="flex-1 overflow-auto p-4 font-mono text-[13px] leading-6">
        {code ? code.split("\n").map((l, i) => (
          <div key={i}><span className="mr-3 inline-block w-5 text-right text-code-comment/60">{i + 1}</span>{highlight(l)}</div>
        )) : <span className="text-code-comment">// Elige algo y verás el código aquí ✨</span>}
      </pre>
    </div>
  );
}
