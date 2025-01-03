import { ALT_TILE, LARG_TILE } from "../config.js";
import { Posicao } from "./Posicao.js";
export class Tile {
  constructor(x, y, scaleX = 1, scaleY = 1) {
    this.altura = ALT_TILE * scaleY;
    this.largura = LARG_TILE * scaleX;
    this.posicao = new Posicao(x, y);
    this.cor = this.gerarCorRGBAleatoria();
  }

  gerarCorRGBAleatoria() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  }
}
