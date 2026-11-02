import { describe, expect, it } from "vitest";
import { buildCode, canMove, validateLogin } from "@/lib/codeplay";

describe("CodePlay", () => {
  it("rejects short usernames", () => expect(validateLogin("ab", "1234")).not.toBeNull());
  it("accepts valid login", () => expect(validateLogin("xochi", "1234")).toBeNull());
  it("platform coin adds 10 points", () =>
    expect(buildCode({ category: "plataformas", score: "moneda" }, 4)).toContain("jugador.puntos += 10"));
  it("trivia has a timer and no enemies", () => {
    const code = buildCode({ category: "trivia", time: "t10" }, 4);
    expect(code).toContain("let reloj = 10");
    expect(code).not.toContain("enemigo");
  });
  it("maze has a time limit and no enemies", () => {
    const code = buildCode({ category: "laberinto", time: "t25" }, 4);
    expect(code).toContain("let tiempo = 25");
    expect(code).not.toContain("enemigo");
  });
  it("racing has rivals, not enemies", () => {
    const code = buildCode({ category: "carreras", rivals: "r3" }, 4);
    expect(code).toContain("i < 3");
    expect(code).not.toContain("enemigo");
  });
  it("maze walls block movement", () => {
    expect(canMove(0, 0)).toBe(false);
    expect(canMove(2, 1)).toBe(true);
  });
});
