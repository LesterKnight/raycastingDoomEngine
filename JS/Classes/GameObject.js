import { ALT_TILE, LARG_TILE, COMP_SALA, LARG_SALA } from "../config.js";
import { rayCasting, normalizarAngulo } from "../calculos.js";
import { Posicao } from "./Posicao.js";
import { Fisica } from "./Fisica.js";
import { GameMap } from "./GameMap.js";

export class GameObject extends Fisica{ 
  constructor(x, y) {
    super()
    this.pos = new Posicao(x, y);
    this.angle = 0;
    this.speed = 0.5 ;
    this.altura = 0.5;
    this.gameMap = null
  }
 setGameMap(gameMap){
  this.gameMap = gameMap
 }
  movimentoValido(stroke) {
    return (
      stroke.x > 0 &&
      stroke.x < LARG_TILE * LARG_SALA &&
      stroke.y > 0 &&
      stroke.y < ALT_TILE * COMP_SALA &&
      !this.gameMap.checkTileCollision(stroke)
    );
  }

  girarDireita() {
    let newAngle = normalizarAngulo(this.angle + 1.5 );
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
    let newAngle = normalizarAngulo(this.angle - 1.5 );
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
  update(){
    if(this.mov.frente){
      this.moverFrente()
    }else if(this.mov.tras){
      this.moverTras()
    }
    if(this.mov.esquerda){
      this.girarEsquerda()
    }else if(this.mov.direita){
      this.girarDireita()
    }
  }
}
