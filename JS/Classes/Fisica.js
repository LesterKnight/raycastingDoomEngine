import { ALT_TILE, LARG_TILE } from "../config.js";

import { Posicao } from "./Posicao.js";
export class Fisica {
    constructor(x, y) {
        this.altura = ALT_TILE;
        this.largura = LARG_TILE;
        this.pos = new Posicao(x, y);
        this.mov = { frente: false, tras: false, esquerda: false, direita: false }
    }
    colisaoVerticeEsquerdo(pos) {
        return this.pos.x === pos.x
    }
    colisaoVerticeDireito(pos) {
        return this.pos.x + this.largura == pos.x
    }
    colisaoVerticeSuperior(pos) {
        return this.pos.x <= pos.x &&
            this.pos.x + this.largura >= pos.x &&
            this.pos.y == pos.y
    }
    colisaoVerticeInferior(pos) {
        return this.pos.x <= pos.x &&
            this.pos.x + this.largura >= pos.x &&
            this.pos.y + this.altura == pos.y
    }
    verificarColisao(pos) {
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