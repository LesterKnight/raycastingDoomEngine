import { ALT_TILE, LARG_TILE, COMP_SALA, LARG_SALA } from "../config.js";
import { rayCasting, normalizarAngulo } from "../calculos.js";
import { Posicao } from "./Posicao.js";
import { Fisica } from "./Fisica.js";

export class GameObject extends Fisica{ 
  constructor(x, y) {
    super()
    this.pos = new Posicao(x, y);
    this.angle = 0;
    this.speed = 5;
    this.turnSpeed = 3;
    this.altura = 1;
  }
  movimentoValido(stroke) {
    return (
      stroke.x > 0 &&
      stroke.x < LARG_TILE * LARG_SALA &&
      stroke.y > 0 &&
      stroke.y < ALT_TILE * COMP_SALA
    );
  }

  girarDireita() {
    let newAngle = normalizarAngulo(this.angle + this.turnSpeed);
    this.angle = newAngle;
  }

  moverFrente() {
    let stroke = rayCasting(
      this.pos.x,
      this.pos.y,
      this.angle,
      this.speed
    );
    if (this.movimentoValido(stroke)) {
      this.pos.x = stroke.x;
      this.pos.y = stroke.y;
    }
  }
  girarEsquerda() {
    let newAngle = normalizarAngulo(this.angle - this.turnSpeed);
    this.angle = newAngle;
  }
  moverTras() {
    let stroke = rayCasting(
      this.pos.x,
      this.pos.y,
      this.angle + 180,
      this.speed
    );

    if (this.movimentoValido(stroke)) {
      this.pos.x = stroke.x;
      this.pos.y = stroke.y;
    }
  }

 
}
