import { rayCasting, movimentoValido } from '../functions.js';
import { Posicao } from './Posicao.js';

export class  GameObject{
    constructor(x,y){
        this.posicao = new Posicao(x,y)
        this.angle=0
        this.speed = 15
        this.turnSpeed = 5
    }
    normalizarAngulo = angulo => (angulo % 360 + 360) % 360;

    girarDireita(){
        let newAngle = this.normalizarAngulo(this.angle+this.turnSpeed)
        this.angle=newAngle
    }
    moverFrente(){
        let stroke = rayCasting(
            this.posicao.x,
            this.posicao.y,
            this.angle,
            this.speed
            )
        if(movimentoValido(stroke)){
            this.posicao.x = stroke.x
            this.posicao.y = stroke.y
        } 
    }
    girarEsquerda(){
        let newAngle = this.normalizarAngulo(this.angle-this.turnSpeed)
        this.angle=newAngle
    }
    moverTras(){
        let stroke = rayCasting(
            this.posicao.x,
            this.posicao.y,
            this.angle+180,
            this.speed
            )
            
            if(movimentoValido(stroke)){
                this.posicao.x = stroke.x
                this.posicao.y = stroke.y
            }     
    } 
}