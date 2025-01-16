import { ALT_TILE, LARG_TILE } from "../config.js";

import { Posicao } from "./Posicao.js";
export class Fisica {
    constructor(x, y, scaleX, scaleY) {
        this.altura = ALT_TILE * scaleY;
        this.largura = LARG_TILE * scaleX;
        this.pos = new Posicao(x, y);
        this.collisionFlags = { p0: false, p1: false, p2: false, p3: false }
        this.pos1 = new Posicao(x + this.largura, y);
        this.pos2 = new Posicao(x, this.altura + y);
        this.pos3 = new Posicao(x + this.largura, this.altura + y);
    }
    verificarColisaoEsquerda(pos) {
        return this.pos.x === pos.x
    }
    verificarColisaoDireita(pos) {
        return this.pos.x + this.largura == pos.x
    }
    verificarColisaoAcima(pos) {
        return this.pos.x <= pos.x &&
            this.pos.x + this.largura >= pos.x &&
            this.pos.y == pos.y
    }
    verificarColisaoAbaixo(pos) {
        return this.pos.x <= pos.x &&
            this.pos.x + this.largura >= pos.x &&
            this.pos.y + this.altura == pos.y
    }
    verificarColisaoInterna(pos) {
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
    atualizarFlagColisao(ray) {
        if (this.pos.x == parseInt(ray.x) && this.pos.y == parseInt(ray.y))
            this.collisionFlags.p0 = true
        else if (this.pos1.x == parseInt(ray.x) && this.pos1.y == parseInt(ray.y))
            this.collisionFlags.p1 = true
        else if (this.pos2.x == parseInt(ray.x) && this.pos2.y == parseInt(ray.y))
            this.collisionFlags.p2 = true
        else if (this.pos3.x == parseInt(ray.x) && this.pos3.y == parseInt(ray.y))
            this.collisionFlags.p3 = true
    }
    allFlags(){
        return this.collisionFlags.p0 && this.collisionFlags.p1 && this.collisionFlags.p2 && this.collisionFlags.p3
    }
    resetAllFlags(){
        this.collisionFlags.p0 = false
        this.collisionFlags.p1 = false
        this.collisionFlags.p2 = false
        this.collisionFlags.p3 = false
    }
}