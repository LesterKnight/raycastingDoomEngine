import { ALT_TILE, LARG_TILE } from "../config.js";

import { Posicao } from "./Posicao.js";
export class Fisica {
    constructor(x, y, scaleX, scaleY) {
        this.altura = ALT_TILE * scaleY;
        this.largura = LARG_TILE * scaleX;
        this.pos = new Posicao(x, y);
        this.collisionFlags = { p0: false, p1: false, p2: false, p3: false, meio:false }
        this.pos1 = new Posicao(x + this.largura, y);
        this.pos2 = new Posicao(x, this.altura + y);
        this.pos3 = new Posicao(x + this.largura, this.altura + y);
        this.mov = { frente: false, tras: false, esquerda: false, direita: false }
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
    verificarVertices(pos) {
        let intPos = new Posicao(parseInt(pos.x),parseInt(pos.y))
        return (intPos.x == this.pos.x && intPos.y == this.pos.y) ||
        (intPos.x == this.pos1.x && intPos.y == this.pos1.y) ||
        (intPos.x == this.pos2.x && intPos.y == this.pos2.y) ||
        (intPos.x == this.pos3.x && intPos.y == this.pos3.y);
    }

    atualizarFlagColisao(ray) {
        if (this.pos.x == parseInt(ray.x) && this.pos.y == parseInt(ray.y))
            this.collisionFlags.p0 = ray
        else if (this.pos1.x == parseInt(ray.x) && this.pos1.y == parseInt(ray.y))
            this.collisionFlags.p1 = ray
        else if (this.pos2.x == parseInt(ray.x) && this.pos2.y == parseInt(ray.y))
            this.collisionFlags.p2 = ray
        else if (this.pos3.x == parseInt(ray.x) && this.pos3.y == parseInt(ray.y))
            this.collisionFlags.p3 = ray
        else if (this.pos.x +(LARG_TILE/2) == parseInt(ray.x) && this.pos.y +(ALT_TILE/2) == parseInt(ray.y))
            this.collisionFlags.meio = ray
    }
    allFlags(){
        return this.collisionFlags.p0 && this.collisionFlags.p1 && this.collisionFlags.p2 && this.collisionFlags.p3
    }
   someFlags(){
        return this.collisionFlags.p0 || this.collisionFlags.p1 || this.collisionFlags.p2 || this.collisionFlags.p3 || this.collisionFlags.meio
    }
    resetAllFlags(){
        this.collisionFlags.p0 = false
        this.collisionFlags.p1 = false
        this.collisionFlags.p2 = false
        this.collisionFlags.p3 = false
        this.collisionFlags.meio = false
    }
}