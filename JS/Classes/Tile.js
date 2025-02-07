import { Fisica } from "./Fisica.js";
export class Tile extends Fisica{
  constructor(x, y, ground = false) {
    super(x,y)
    this.id = Tile.lastId++,
    this.ground = ground
    this.cor = ground ? this.gerarCorRGBAleatoriaChao() : this.gerarCorRGBAleatoria()
  }
  static lastId = 1
  gerarCorRGBAleatoria() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  }
  gerarCorRGBAleatoriaChao() {
    const r = Math.floor(Math.random() * 128 + 128);
    const g = Math.floor(Math.random() * 128 + 128);
    const b = Math.floor(Math.random() * 128 + 128);
    return `rgba(${r}, ${g}, ${b},1)`;
  }
}
