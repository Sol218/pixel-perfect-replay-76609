export type Option = { id: string; name: string; emoji: string; desc?: string; cls?: string; value?: number };
export type Choices = {
  category?: string; hero?: string; enemy?: string; goal?: string; scene?: string; movement?: string; score?: string;
  collision?: string; time?: string; dots?: string; shot?: string; rivals?: string; length?: string; topic?: string; points?: string;
};
export const choiceOf = (c: Choices, key: string) => (c as Record<string, string | undefined>)[key];
export type Question = { key: string; title: string; options: Option[] };
export type Stage = { label: string; title: string; sub: string; tip: string; questions: Question[] };
export type GameDef = Option & { inspired: string; stages: Stage[] };

export const find = <T extends Option>(list: T[], id?: string) => list.find((o) => o.id === id);

export function validateLogin(user: string, pass: string): string | null {
  if (user.trim().length < 3) return "El usuario debe tener al menos 3 letras.";
  if (pass.length < 4) return "La contraseña debe tener al menos 4 caracteres.";
  return null;
}

/* ---------- Opciones compartidas ---------- */
const movement: Question = {
  key: "movement", title: "¿Con qué teclas juegas?",
  options: [
    { id: "flechas", name: "Flechas del teclado", emoji: "⬅️", desc: "ArrowUp, ArrowLeft…" },
    { id: "wasd", name: "Teclas W A S D", emoji: "⌨️", desc: "Como los gamers" },
  ],
};
const collision = (title: string): Question => ({
  key: "collision", title,
  options: [
    { id: "vida", name: "Perder una vida", emoji: "💔", desc: "Tienes 3 vidas" },
    { id: "puntos", name: "Restar 20 puntos", emoji: "➖", desc: "Sin game over" },
    { id: "reinicio", name: "Reiniciar el juego", emoji: "🔄", desc: "¡Modo difícil!" },
  ],
});

/* ---------- Laberinto ---------- */
export const MAZE = [
  "###############",
  "#S....#.......#",
  "#.###.#.#####.#",
  "#.#.....#...#.#",
  "#.#.#####.#.#.#",
  "#...#.....#...#",
  "###.#.#######.#",
  "#.....#......G#",
  "###############",
];
export const canMove = (x: number, y: number) => MAZE[y]?.[x] !== undefined && MAZE[y][x] !== "#";

/* ---------- Trivia ---------- */
export type TriviaQ = { q: string; a: [string, string, string, string] }; // a[0] es la correcta
export const triviaBank: Record<string, TriviaQ[]> = {
  ciencia: [
    { q: "¿Qué planeta es conocido como el planeta rojo?", a: ["Marte", "Venus", "Júpiter", "Saturno"] },
    { q: "¿Qué gas respiramos para vivir?", a: ["Oxígeno", "Helio", "Humo", "Dióxido de carbono"] },
    { q: "¿Cuántas patas tiene una araña?", a: ["8", "6", "10", "4"] },
    { q: "¿A cuántos grados hierve el agua?", a: ["100 °C", "50 °C", "0 °C", "200 °C"] },
  ],
  historia: [
    { q: "¿Quién llegó a América en 1492?", a: ["Cristóbal Colón", "Hernán Cortés", "Napoleón", "Marco Polo"] },
    { q: "¿Qué civilización construyó Chichén Itzá?", a: ["Maya", "Romana", "Egipcia", "Vikinga"] },
    { q: "¿En qué país están las pirámides de Giza?", a: ["Egipto", "México", "Perú", "China"] },
    { q: "¿En qué año empezó la Independencia de México?", a: ["1810", "1910", "1492", "1999"] },
  ],
  geografia: [
    { q: "¿Cuál es la capital de México?", a: ["Ciudad de México", "Guadalajara", "Monterrey", "Cancún"] },
    { q: "¿Cuál es el océano más grande?", a: ["Pacífico", "Atlántico", "Índico", "Ártico"] },
    { q: "¿En qué continente está Brasil?", a: ["América", "Europa", "África", "Asia"] },
    { q: "¿Cuál es el país más grande del mundo?", a: ["Rusia", "China", "Canadá", "Brasil"] },
  ],
  deportes: [
    { q: "¿Cuántos jugadores tiene un equipo de fútbol en la cancha?", a: ["11", "9", "7", "5"] },
    { q: "¿Qué deporte jugaba Michael Jordan?", a: ["Básquetbol", "Tenis", "Béisbol", "Golf"] },
    { q: "¿Cada cuántos años hay Juegos Olímpicos de verano?", a: ["4", "2", "3", "5"] },
    { q: "¿En qué deporte se usa raqueta y pelota amarilla?", a: ["Tenis", "Golf", "Fútbol", "Natación"] },
  ],
  arte: [
    { q: "¿Quién pintó la Mona Lisa?", a: ["Leonardo da Vinci", "Picasso", "Frida Kahlo", "Van Gogh"] },
    { q: "¿Qué color sale al mezclar azul y amarillo?", a: ["Verde", "Morado", "Naranja", "Rojo"] },
    { q: "¿Qué pintora mexicana es famosa por sus autorretratos?", a: ["Frida Kahlo", "María Félix", "Lola Beltrán", "Selena"] },
    { q: "¿Cuántas cuerdas tiene una guitarra común?", a: ["6", "4", "5", "8"] },
  ],
};
export const triviaFor = (topic?: string): TriviaQ[] =>
  topic && triviaBank[topic] ? triviaBank[topic] : Object.values(triviaBank).flat();

/* ---------- Definición de cada juego ---------- */
export const games: GameDef[] = [
  {
    id: "plataformas", name: "Plataformas", emoji: "🍄", desc: "Salta como en Mario Bros", inspired: "Mario Bros",
    stages: [
      { label: "Personajes", title: "Elige a tus personajes", sub: "Tu héroe salta; el enemigo camina por el suelo.",
        tip: "Una variable guarda un dato. Un objeto agrupa datos de tu héroe: posición, velocidad, vidas…",
        questions: [
          { key: "hero", title: "Protagonista", options: [
            { id: "plomero", name: "Plomero", emoji: "🧑‍🔧" }, { id: "dino", name: "Dino", emoji: "🦖" },
            { id: "gato", name: "Gato Ninja", emoji: "🐱" }, { id: "robot", name: "Robot", emoji: "🤖" } ] },
          { key: "enemy", title: "Enemigo que camina", options: [
            { id: "hongo", name: "Hongo gruñón", emoji: "🍄" }, { id: "tortuga", name: "Tortuga", emoji: "🐢" },
            { id: "cangrejo", name: "Cangrejo", emoji: "🦀" } ] },
        ] },
      { label: "Escena", title: "¿Dónde está tu nivel?", sub: "El mundo tiene suelo, plataformas y una bandera de meta.",
        tip: "La escena es un objeto, y las plataformas son una lista (array) de rectángulos.",
        questions: [{ key: "scene", title: "Mundo", options: [
          { id: "pradera", name: "Pradera", emoji: "🌤️", cls: "scene-pradera" },
          { id: "subterraneo", name: "Subterráneo", emoji: "🧱", cls: "scene-subterraneo" },
          { id: "castillo", name: "Castillo de lava", emoji: "🏰", cls: "scene-castillo" } ] }] },
      { label: "Reglas", title: "Reglas del juego", sub: "Gravedad, saltos y condicionales.",
        tip: "La gravedad suma velocidad hacia abajo en cada cuadro. SI saltas encima del enemigo → lo aplastas.",
        questions: [movement,
          { key: "score", title: "¿Qué recoges?", options: [
            { id: "moneda", name: "Monedas", emoji: "🪙", value: 10 }, { id: "estrella", name: "Estrellas", emoji: "⭐", value: 25 } ] },
          collision("¿Qué pasa si el enemigo te toca de lado?")] },
    ],
  },
  {
    id: "laberinto", name: "Laberinto", emoji: "🌀", desc: "Llega a la meta como en Pac-Man", inspired: "Pac-Man",
    stages: [
      { label: "Personajes", title: "¿Quién recorre el laberinto?", sub: "Aquí no hay enemigos: tu rival es el reloj.",
        tip: "Tu jugador es un objeto con su fila y columna dentro del laberinto.",
        questions: [
          { key: "hero", title: "Jugador", options: [
            { id: "comecocos", name: "Come-cocos", emoji: "😮" }, { id: "raton", name: "Ratón", emoji: "🐭" },
            { id: "robot", name: "Robot", emoji: "🤖" } ] },
          { key: "goal", title: "Meta", options: [
            { id: "bandera", name: "Bandera", emoji: "🏁" }, { id: "queso", name: "Queso", emoji: "🧀" },
            { id: "tesoro", name: "Tesoro", emoji: "💎" } ] },
        ] },
      { label: "Escena", title: "¿Cómo se ve el laberinto?", sub: "Las paredes no se pueden atravesar.",
        tip: "El laberinto es una lista de filas: # es pared y . es camino.",
        questions: [{ key: "scene", title: "Estilo", options: [
          { id: "neon", name: "Arcade neón", emoji: "🕹️", cls: "scene-neon" },
          { id: "setos", name: "Jardín de setos", emoji: "🌳", cls: "scene-setos" },
          { id: "cueva", name: "Cueva", emoji: "🪨", cls: "scene-cueva" } ] }] },
      { label: "Reglas", title: "Reglas del juego", sub: "Llega a la meta antes de que se acabe el tiempo.",
        tip: "SI la casilla siguiente es pared → no te mueves. SI el tiempo llega a 0 → pierdes.",
        questions: [movement,
          { key: "time", title: "Tiempo límite", options: [
            { id: "t60", name: "60 segundos", emoji: "🐢", value: 60 }, { id: "t40", name: "40 segundos", emoji: "🐇", value: 40 },
            { id: "t25", name: "25 segundos", emoji: "⚡", value: 25 } ] },
          { key: "dots", title: "¿Hay puntitos en el camino?", options: [
            { id: "si", name: "Sí, comer puntitos", emoji: "•", desc: "+10 cada uno", value: 10 },
            { id: "no", name: "No, solo llegar", emoji: "🏃", value: 0 } ] }] },
    ],
  },
  {
    id: "espacial", name: "Aventura Espacial", emoji: "🚀", desc: "Dispara a los invasores", inspired: "Space Invaders",
    stages: [
      { label: "Personajes", title: "Tu nave y los invasores", sub: "Los aliens bajan en filas; ¡dispárales!",
        tip: "Los invasores se guardan en una lista (array) de objetos.",
        questions: [
          { key: "hero", title: "Tu nave", options: [
            { id: "cohete", name: "Cohete", emoji: "🚀" }, { id: "ovni", name: "Platillo", emoji: "🛸" },
            { id: "avion", name: "Jet", emoji: "✈️" } ] },
          { key: "enemy", title: "Invasores", options: [
            { id: "pixel", name: "Pixel alien", emoji: "👾" }, { id: "marciano", name: "Marciano", emoji: "👽" },
            { id: "pulpo", name: "Pulpo espacial", emoji: "🐙" } ] },
        ] },
      { label: "Escena", title: "¿En qué parte del espacio?", sub: "Elige tu galaxia.",
        tip: "La escena es un objeto con su ancho y alto.",
        questions: [{ key: "scene", title: "Galaxia", options: [
          { id: "espacio", name: "Espacio profundo", emoji: "🌌", cls: "scene-espacio" },
          { id: "nebulosa", name: "Nebulosa", emoji: "🌠", cls: "scene-nebulosa" },
          { id: "planeta", name: "Órbita de Saturno", emoji: "🪐", cls: "scene-planeta" } ] }] },
      { label: "Reglas", title: "Reglas del juego", sub: "Eventos para disparar y condicionales para los choques.",
        tip: "Evento: al presionar espacio se crea una bala. SI la bala toca un alien → desaparece.",
        questions: [movement,
          { key: "shot", title: "Tipo de disparo", options: [
            { id: "laser", name: "Láser sencillo", emoji: "🔫", value: 1 }, { id: "doble", name: "Doble láser", emoji: "⚡", value: 2 } ] },
          collision("¿Qué pasa si te cae un disparo alien?")] },
    ],
  },
  {
    id: "carreras", name: "Carreras", emoji: "🏎️", desc: "Gana la carrera", inspired: "Gran Turismo",
    stages: [
      { label: "Pilotos", title: "Tu auto y tus rivales", sub: "Los rivales no son enemigos: corren igual que tú.",
        tip: "Cada piloto es un objeto con posición y velocidad. Los rivales van en una lista.",
        questions: [
          { key: "hero", title: "Tu vehículo", options: [
            { id: "deportivo", name: "Deportivo", emoji: "🏎️" }, { id: "clasico", name: "Clásico", emoji: "🚗" },
            { id: "todoterreno", name: "Todoterreno", emoji: "🚙" }, { id: "moto", name: "Moto", emoji: "🏍️" } ] },
          { key: "rivals", title: "¿Contra cuántos pilotos?", options: [
            { id: "r1", name: "1 rival", emoji: "1️⃣", value: 1 }, { id: "r2", name: "2 rivales", emoji: "2️⃣", value: 2 },
            { id: "r3", name: "3 rivales", emoji: "3️⃣", value: 3 } ] },
        ] },
      { label: "Pista", title: "¿Dónde es la carrera?", sub: "Elige el circuito.",
        tip: "La pista es un objeto: su largo decide cuándo llegas a la meta.",
        questions: [{ key: "scene", title: "Circuito", options: [
          { id: "circuito", name: "Autódromo", emoji: "🏁", cls: "scene-circuito" },
          { id: "desierto", name: "Desierto", emoji: "🏜️", cls: "scene-desierto" },
          { id: "nieve", name: "Montaña nevada", emoji: "🏔️", cls: "scene-nieve" },
          { id: "noche", name: "Ciudad de noche", emoji: "🌃", cls: "scene-noche" } ] }] },
      { label: "Reglas", title: "Reglas de la carrera", sub: "Acelera, esquiva y llega primero.",
        tip: "Evento: ↑ acelera. SI chocas con un rival → pierdes velocidad. SI cruzas la meta → se guarda tu lugar.",
        questions: [movement,
          { key: "length", title: "Largo de la carrera", options: [
            { id: "corta", name: "Sprint corto", emoji: "⏱️", value: 3000 }, { id: "larga", name: "Gran premio", emoji: "🏆", value: 6000 } ] }] },
    ],
  },
  {
    id: "trivia", name: "Trivia", emoji: "❓", desc: "Preguntas contra el reloj", inspired: "Preguntados",
    stages: [
      { label: "Jugador", title: "Tu avatar y el tema", sub: "No hay enemigos: el reto es responder antes del tiempo.",
        tip: "Las preguntas se guardan en una lista de objetos con su texto y sus respuestas.",
        questions: [
          { key: "hero", title: "Avatar", options: [
            { id: "buho", name: "Búho sabio", emoji: "🦉" }, { id: "genio", name: "Genio", emoji: "🤓" },
            { id: "perrito", name: "Perrito", emoji: "🐶" } ] },
          { key: "topic", title: "Tema de preguntas", options: [
            { id: "ciencia", name: "Ciencia", emoji: "🧪" }, { id: "historia", name: "Historia", emoji: "🏛️" },
            { id: "geografia", name: "Geografía", emoji: "🌍" }, { id: "deportes", name: "Deportes", emoji: "⚽" },
            { id: "arte", name: "Arte", emoji: "🎨" }, { id: "mezcla", name: "¡De todo!", emoji: "🎡" } ] },
        ] },
      { label: "Escena", title: "¿Dónde se juega?", sub: "Elige el escenario del concurso.",
        tip: "La escena es un objeto con su nombre y colores.",
        questions: [{ key: "scene", title: "Escenario", options: [
          { id: "show", name: "Show de TV", emoji: "🎤", cls: "scene-show" },
          { id: "aula", name: "Salón de clases", emoji: "🏫", cls: "scene-aula" },
          { id: "ruleta", name: "Ruleta de colores", emoji: "🎡", cls: "scene-ruleta" } ] }] },
      { label: "Reglas", title: "Reglas del juego", sub: "Un reloj para cada pregunta.",
        tip: "SI eliges la respuesta correcta → sumas puntos. SI el reloj llega a 0 → pasas a la siguiente.",
        questions: [
          { key: "time", title: "Tiempo por pregunta", options: [
            { id: "t20", name: "20 segundos", emoji: "🐢", value: 20 }, { id: "t15", name: "15 segundos", emoji: "🐇", value: 15 },
            { id: "t10", name: "10 segundos", emoji: "⚡", value: 10 } ] },
          { key: "points", title: "Puntos por acierto", options: [
            { id: "p10", name: "10 puntos", emoji: "🥉", value: 10 }, { id: "p50", name: "50 puntos", emoji: "🥈", value: 50 },
            { id: "p100", name: "100 puntos", emoji: "🥇", value: 100 } ] }] },
    ],
  },
];

export const gameOf = (c: Choices) => find(games, c.category);

/** Busca la opción elegida para una pregunta (por su key) del juego actual. */
export function pick(c: Choices, key: string): Option | undefined {
  const g = gameOf(c);
  for (const st of g?.stages ?? []) for (const q of st.questions) if (q.key === key) return find(q.options, choiceOf(c, key));
  return undefined;
}

const keyMap: Record<string, [string, string, string, string]> = {
  flechas: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"],
  wasd: ["w", "s", "a", "d"],
};
export const dirKeys = (m?: string) => keyMap[m ?? ""] ?? (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"] as [string, string, string, string]);

/* ---------- Código generado ---------- */
export function buildCode(c: Choices, upTo: number): string {
  const g = gameOf(c);
  if (!g || upTo < 1) return "";
  const L: string[] = ["// 🎮 Tipo de juego (una variable de texto)", `const categoria = "${g.name}";  // inspirado en ${g.inspired}`, ""];
  const n = (k: string) => pick(c, k)?.name ?? "?";
  const e = (k: string) => pick(c, k)?.emoji ?? "?";
  const v = (k: string) => pick(c, k)?.value ?? 0;
  const [u, d, l, r] = dirKeys(c.movement);
  const col = pick(c, "collision");
  const hitRule = (who: string) => {
    if (!col) return [];
    const out = [`if (toca(jugador, ${who})) {`];
    if (col.id === "vida") out.push("  jugador.vidas -= 1;", "  if (jugador.vidas === 0) mostrar(\"Game Over\");");
    else if (col.id === "puntos") out.push("  jugador.puntos -= 20;");
    else out.push("  reiniciarJuego();");
    out.push("}");
    return out;
  };

  if (g.id === "plataformas") {
    if (upTo >= 2) L.push("// 📦 Objeto jugador", "let jugador = {", `  nombre: "${n("hero")}",`, `  icono: "${e("hero")}",`, "  x: 20, y: 236,", "  velY: 0,          // velocidad vertical", "  enSuelo: true,", "  vidas: 3,", "  puntos: 0", "};", "", `let enemigo = { tipo: "${n("enemy")}", x: 300, direccion: -1 };`, "");
    if (upTo >= 3) L.push("// 🗺️ Escena y plataformas (array)", `let escena = { mundo: "${n("scene")}", ancho: 480, alto: 300 };`, "const gravedad = 0.5;", "let plataformas = [", "  { x: 110, y: 205, ancho: 90 },", "  { x: 230, y: 155, ancho: 100 },", "  { x: 370, y: 205, ancho: 80 }", "];", "");
    if (upTo >= 4) L.push("// ⌨️ Eventos del teclado", `if (presionada("${l}")) jugador.x -= 3;`, `if (presionada("${r}")) jugador.x += 3;`, `if (presionada("${u}") && jugador.enSuelo) {`, "  jugador.velY = -9.5;  // ¡salto!", "}", "", "// 🌍 La gravedad jala hacia abajo", "jugador.velY += gravedad;", "jugador.y += jugador.velY;", "", "// ❓ Condicionales", `if (toca(jugador, ${pick(c, "score")?.id ?? "?"})) {`, `  jugador.puntos += ${v("score")};`, "}", "if (saltaEncima(jugador, enemigo)) {", "  enemigo.vivo = false;  // ¡aplastado!", "  jugador.puntos += 50;", "} else", ...hitRule("enemigo"), "if (toca(jugador, bandera)) mostrar(\"¡Nivel completado!\");");
  } else if (g.id === "laberinto") {
    if (upTo >= 2) L.push("// 📦 Jugador: fila y columna", "let jugador = {", `  icono: "${e("hero")}",`, "  columna: 1,", "  fila: 1,", "  puntos: 0", "};", `let meta = { icono: "${e("goal")}", columna: 13, fila: 7 };`, "// (aquí no hay enemigos: ¡compites contra el reloj!)", "");
    if (upTo >= 3) L.push("// 🗺️ Laberinto: # = pared, . = camino", `let estilo = "${n("scene")}";`, "let mapa = [", ...MAZE.map((row) => `  "${row}",`), "];", "");
    if (upTo >= 4) L.push(`let tiempo = ${v("time")};  // segundos`, "", "// ⌨️ Evento: moverse una casilla", `if (tecla === "${r}") siguiente = { col: jugador.columna + 1, fila: jugador.fila };`, `// (igual con "${l}", "${u}" y "${d}")`, "", "// ❓ Condicionales", "if (mapa[siguiente.fila][siguiente.col] !== \"#\") {", "  jugador.columna = siguiente.col;  // solo si NO es pared", "  jugador.fila = siguiente.fila;", "}", ...(v("dots") ? ["if (hayPuntito(jugador)) {", `  jugador.puntos += ${v("dots")};`, "}"] : []), "if (toca(jugador, meta)) mostrar(\"¡Ganaste!\");", "if (tiempo === 0) mostrar(\"Se acabó el tiempo ⏰\");");
  } else if (g.id === "espacial") {
    if (upTo >= 2) L.push("// 📦 Tu nave", `let nave = { icono: "${e("hero")}", x: 226, vidas: 3, puntos: 0 };`, "", "// 👾 Invasores: una lista (array) de objetos", "let aliens = [];", "for (let fila = 0; fila < 3; fila++) {", "  for (let col = 0; col < 6; col++) {", `    aliens.push({ icono: "${e("enemy")}", x: col * 50, y: fila * 36 });`, "  }", "}", "");
    if (upTo >= 3) L.push(`let escena = { galaxia: "${n("scene")}", ancho: 480, alto: 300 };`, "");
    if (upTo >= 4) L.push("// ⌨️ Eventos", `if (presionada("${l}")) nave.x -= 4;`, `if (presionada("${r}")) nave.x += 4;`, "if (tecla === \" \") {", `  disparar(${v("shot")});  // ${n("shot")}`, "}", "", "// ❓ Condicionales", "if (toca(bala, alien)) {", "  eliminar(alien);", "  nave.puntos += 10;", "}", "if (aliens.length === 0) nuevaOleada();  // ¡más rápido!", ...hitRule("disparoAlien").map((x) => x.replace("jugador", "nave")).map((x) => x.replace("jugador.", "nave.")));
  } else if (g.id === "carreras") {
    if (upTo >= 2) L.push("// 📦 Tu auto", `let piloto = { icono: "${e("hero")}", x: 225, distancia: 0, velocidad: 0 };`, "", "// 🏁 Rivales: corren con las MISMAS reglas que tú", "let rivales = [];", `for (let i = 0; i < ${v("rivals")}; i++) {`, "  rivales.push({ distancia: 0, velocidadMax: 4 + Math.random() * 1.5 });", "}", "");
    if (upTo >= 3) L.push(`let pista = { lugar: "${n("scene")}", largo: ${v("length") || "?"} };`, "");
    if (upTo >= 4) L.push("// ⌨️ Eventos", `if (presionada("${u}")) piloto.velocidad += 0.12;  // acelerar`, `if (presionada("${d}")) piloto.velocidad -= 0.25;  // frenar`, `if (presionada("${l}")) piloto.x -= 3;`, `if (presionada("${r}")) piloto.x += 3;`, "piloto.distancia += piloto.velocidad;", "", "// ❓ Condicionales", "if (toca(piloto, rival)) {", "  piloto.velocidad = piloto.velocidad / 2;  // ¡choque!", "}", "if (piloto.distancia >= pista.largo) {", "  mostrar(\"Llegaste en lugar \" + lugar);", "}");
  } else if (g.id === "trivia") {
    if (upTo >= 2) L.push("// 📦 Jugador", `let jugador = { avatar: "${e("hero")}", puntos: 0, aciertos: 0 };`, `let tema = "${n("topic")}";`, "", "// 📚 Una pregunta es un objeto", "let pregunta = {", "  texto: \"¿Qué planeta es el planeta rojo?\",", "  opciones: [\"Marte\", \"Venus\", \"Júpiter\", \"Saturno\"],", "  correcta: \"Marte\"", "};", "");
    if (upTo >= 3) L.push(`let escena = { lugar: "${n("scene")}" };`, "");
    if (upTo >= 4) L.push(`let reloj = ${v("time")};  // segundos por pregunta`, "", "// ⏰ Cada segundo baja el reloj", "setInterval(() => { reloj -= 1; }, 1000);", "", "// 🖱️ Evento: clic en una respuesta", "boton.addEventListener(\"click\", () => {", "  if (respuesta === pregunta.correcta) {", `    jugador.puntos += ${v("points")};`, "    jugador.aciertos += 1;", "  }", "  siguientePregunta();", "});", "", "if (reloj === 0) siguientePregunta();  // ¡muy lento!");
  }
  return L.join("\n");
}
