import { ALT_TILE,LARG_TILE } from "../config.js";

import { Posicao } from "./Posicao.js";
export class Fisica
{
    constructor(x,y,scaleX,scaleY){
        this.altura = ALT_TILE * scaleY;
        this.largura = LARG_TILE * scaleX;
        this.pos = new Posicao(x, y);
    }
    verificarColisaoEsquerda(pos){
        return this.pos.x === pos.x
    }
    verificarColisaoDireita(pos){
        return this.pos.x + this.largura == pos.x
    }
    verificarColisaoAcima(pos){
        return  this.pos.x <= pos.x &&
        this.pos.x + this.largura >= pos.x &&
        this.pos.y == pos.y
    }
    verificarColisaoAbaixo(pos){
       return  this.pos.x <= pos.x &&
        this.pos.x + this.largura >= pos.x &&
        this.pos.y + this.altura == pos.y
    }
    verificarColisaoInterna(pos){
        let xInicial = this.pos.x;
        let xFinal = this.pos.x + this.largura;
        let yInicial = this.pos.y;
        let yFinal = this.pos.y + this.altura;
        return (
          pos.x >= xInicial &&
          pos.x <= xFinal &&
          pos.y >= yInicial &&
          pos.y <= yFinal
        )
    }
}