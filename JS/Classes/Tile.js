import { Fisica } from "./Fisica.js";
export class Tile extends Fisica{
  constructor(x, y, scaleX = 1, scaleY = 1) {
    super(x,y,scaleX,scaleY)
    this.cor = this.gerarCorRGBAleatoria();
  }
  gerarCorRGBAleatoria() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  }
}
