import { describe, expect, it } from "vitest";
import { buildCode, canMove, crearCuenta, iniciarSesion, validateLogin } from "@/lib/codeplay";

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

describe("Cuentas", () => {
  it("crea una cuenta y deja entrar con ella", () => {
    expect(crearCuenta("Xochitl", "1234", "1234")).toBeNull();
    expect(iniciarSesion("xochitl", "1234")).toBeNull();
  });
  it("rechaza un usuario que ya existe", () => {
    crearCuenta("kevin", "1234", "1234");
    expect(crearCuenta("kevin", "1234", "1234")).not.toBeNull();
  });
  it("rechaza contraseñas que no coinciden", () =>
    expect(crearCuenta("ana", "1234", "9999")).not.toBeNull());
  it("avisa cuando el usuario no está registrado", () =>
    expect(iniciarSesion("fantasma", "1234")).not.toBeNull());
  it("rechaza la contraseña equivocada", () => {
    crearCuenta("luis", "1234", "1234");
    expect(iniciarSesion("luis", "9999")).not.toBeNull();
  });
  it("deja entrar al usuario demo solo con su contraseña", () => {
    expect(iniciarSesion("demo", "1234")).toBeNull();
    expect(iniciarSesion("demo", "0000")).not.toBeNull();
  });
});

import { snippetFor as _snip, withDefaults as _wd } from "@/lib/codeplay";
describe("opciones como código", () => {
  it("las teclas WASD se muestran como un array de teclas", () => {
    expect(_snip("movement", { id: "wasd", name: "W A S D", emoji: "⌨️" }).code).toContain('["w", "s", "a", "d"]');
  });
  it("la vista previa usa la primera opción si falta elegir", () => {
    expect(_wd({ category: "laberinto" }).time).toBe("t60");
  });
});
