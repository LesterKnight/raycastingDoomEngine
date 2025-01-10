import { GameObject } from "./GameObject.js";
import { Posicao } from "./Posicao.js";

export class Player extends GameObject {
  constructor(x, y, angle) {
    super(x, y);
    this.angle = angle
  }
}
