import { describe, expect, it } from "vitest";
import { buildCode, validateLogin } from "@/lib/codeplay";

describe("CodePlay", () => {
  it("rejects short usernames", () => {
    expect(validateLogin("ab", "1234")).not.toBeNull();
  });
  it("accepts valid login", () => {
    expect(validateLogin("xochi", "1234")).toBeNull();
  });
  it("coin adds 10 points in generated code", () => {
    expect(buildCode({ score: "moneda" }, 4)).toContain("jugador.puntos += 10");
  });
  it("hero variable appears from step 2", () => {
    expect(buildCode({ hero: "astronauta" }, 2)).toContain('let heroe = "Astronauta"');
  });
});
