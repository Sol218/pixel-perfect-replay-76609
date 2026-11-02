export type Option = { id: string; name: string; emoji: string; desc?: string };

export const categories: Option[] = [
  { id: "plataformas", name: "Plataformas", emoji: "🍄", desc: "Salta y esquiva" },
  { id: "laberinto", name: "Laberinto", emoji: "🌀", desc: "Encuentra la salida" },
  { id: "espacial", name: "Aventura Espacial", emoji: "🚀", desc: "Explora galaxias" },
  { id: "carreras", name: "Carreras", emoji: "🏎️", desc: "¡Más rápido!" },
  { id: "trivia", name: "Trivia", emoji: "❓", desc: "Pon a prueba tu mente" },
];

export const heroes: Option[] = [
  { id: "astronauta", name: "Astronauta", emoji: "🧑‍🚀" },
  { id: "robot", name: "Robot", emoji: "🤖" },
  { id: "gato", name: "Gato Ninja", emoji: "🐱" },
  { id: "mago", name: "Mago", emoji: "🧙" },
  { id: "dino", name: "Dino", emoji: "🦖" },
];

export const enemies: Option[] = [
  { id: "meteoro", name: "Meteoro", emoji: "☄️" },
  { id: "fantasma", name: "Fantasma", emoji: "👻" },
  { id: "bomba", name: "Bomba", emoji: "💣" },
  { id: "alien", name: "Alien", emoji: "👾" },
];

export const scenes: (Option & { cls: string })[] = [
  { id: "bosque", name: "Bosque", emoji: "🌲", cls: "scene-bosque" },
  { id: "espacio", name: "Espacio", emoji: "🌌", cls: "scene-espacio" },
  { id: "ciudad", name: "Ciudad cibernética", emoji: "🌆", cls: "scene-ciber" },
  { id: "oceano", name: "Océano", emoji: "🌊", cls: "scene-oceano" },
  { id: "castillo", name: "Castillo", emoji: "🏰", cls: "scene-castillo" },
];

export const movements: Option[] = [
  { id: "flechas", name: "Flechas del teclado", emoji: "⬅️", desc: "ArrowUp, ArrowDown…" },
  { id: "wasd", name: "Teclas W A S D", emoji: "⌨️", desc: "Como los gamers" },
  { id: "raton", name: "Seguir el ratón", emoji: "🖱️", desc: "Evento mousemove" },
];

export const scoring: (Option & { points: number; item: string })[] = [
  { id: "moneda", name: "Tocar monedas", emoji: "🪙", points: 10, item: "moneda" },
  { id: "estrella", name: "Atrapar estrellas", emoji: "⭐", points: 25, item: "estrella" },
  { id: "fruta", name: "Comer frutas", emoji: "🍎", points: 5, item: "fruta" },
];

export const collisions: Option[] = [
  { id: "vida", name: "Perder una vida", emoji: "💔", desc: "Tienes 3 vidas" },
  { id: "puntos", name: "Restar 20 puntos", emoji: "➖", desc: "Sin game over" },
  { id: "reinicio", name: "Reiniciar el juego", emoji: "🔄", desc: "¡Modo difícil!" },
];

export type Choices = {
  category?: string;
  hero?: string;
  enemy?: string;
  scene?: string;
  movement?: string;
  score?: string;
  collision?: string;
};

export const find = <T extends Option>(list: T[], id?: string) => list.find((o) => o.id === id);

export function validateLogin(user: string, pass: string): string | null {
  if (user.trim().length < 3) return "El usuario debe tener al menos 3 letras.";
  if (pass.length < 4) return "La contraseña debe tener al menos 4 caracteres.";
  return null;
}

const keyMap: Record<string, string[]> = {
  flechas: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"],
  wasd: ["w", "s", "a", "d"],
};

export function buildCode(c: Choices, upTo: number): string {
  const lines: string[] = [];
  const cat = find(categories, c.category);
  const hero = find(heroes, c.hero);
  const enemy = find(enemies, c.enemy);
  const scene = find(scenes, c.scene);
  const mv = find(movements, c.movement);
  const sc = find(scoring, c.score);
  const col = find(collisions, c.collision);

  if (upTo >= 1) {
    lines.push("// 🎮 Tipo de juego (una variable de texto)");
    lines.push(`const categoria = "${cat?.name ?? "?"}";`, "");
  }
  if (upTo >= 2) {
    lines.push("// 🦸 Variables: guardan datos con un nombre");
    lines.push(`let heroe = "${hero?.name ?? "?"}";`);
    lines.push("", "// 📦 Objeto: agrupa varias propiedades");
    lines.push("let jugador = {");
    lines.push(`  nombre: heroe,`, `  icono: "${hero?.emoji ?? "?"}",`, "  x: 50,", "  y: 50,", "  vidas: 3,", "  puntos: 0", "};");
    lines.push("", `let enemigo = { tipo: "${enemy?.name ?? "?"}", velocidad: 2 };`, "");
  }
  if (upTo >= 3) {
    lines.push("// 🗺️ La escena también es un objeto");
    lines.push("let escena = {", `  mundo: "${scene?.name ?? "?"}",`, "  ancho: 480,", "  alto: 300", "};", "");
  }
  if (upTo >= 4) {
    lines.push("// ⌨️ Evento: el juego 'escucha' lo que haces");
    if (mv?.id === "raton") {
      lines.push('document.addEventListener("mousemove", (e) => {');
      lines.push("  jugador.x = e.offsetX;  // sigue al ratón", "  jugador.y = e.offsetY;", "});");
    } else if (mv) {
      const [u, d, l, r] = keyMap[mv.id] ?? [];
      lines.push('document.addEventListener("keydown", (e) => {');
      lines.push(`  if (e.key === "${u}") jugador.y -= 10;  // arriba`);
      lines.push(`  if (e.key === "${d}") jugador.y += 10;  // abajo`);
      lines.push(`  if (e.key === "${l}") jugador.x -= 10;  // izquierda`);
      lines.push(`  if (e.key === "${r}") jugador.x += 10;  // derecha`);
      lines.push("});");
    } else lines.push("// (elige cómo moverte)");
    lines.push("", "// ❓ Condicionales: SI pasa algo → ENTONCES haz algo");
    if (sc) {
      lines.push(`if (toca(jugador, ${sc.item})) {`, `  jugador.puntos += ${sc.points};  // ¡+${sc.points}!`, "}");
    }
    if (col) {
      lines.push("if (toca(jugador, enemigo)) {");
      if (col.id === "vida") {
        lines.push("  jugador.vidas -= 1;", "  if (jugador.vidas === 0) {", '    mostrar("Game Over");', "  }");
      } else if (col.id === "puntos") lines.push("  jugador.puntos -= 20;");
      else lines.push("  reiniciarJuego();  // ¡vuelta a empezar!");
      lines.push("}");
    }
  }
  return lines.join("\n");
}
