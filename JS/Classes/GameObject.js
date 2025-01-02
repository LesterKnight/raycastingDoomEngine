import { 
    ALT_TILE, 
    LARG_TILE, 
    COMP_SALA, 
    LARG_SALA, 
} from '../config.js';
import { rayCasting } from '../rayCasting.js';
import { Posicao } from './Posicao.js';

export class  GameObject{
    constructor(x,y){
        this.posicao = new Posicao(x,y)
        this.angle=0
        this.speed = 5
        this.turnSpeed = 5
        this.altura = 1
    }
    normalizarAngulo = angulo => (angulo % 360 + 360) % 360;

    movimentoValido(stroke){
        return stroke.x>0 && stroke.x< LARG_TILE*LARG_SALA &&
                        stroke.y>0 && stroke.y< ALT_TILE*COMP_SALA
    }

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
        if(this.movimentoValido(stroke)){
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
            
            if(this.movimentoValido(stroke)){
                this.posicao.x = stroke.x
                this.posicao.y = stroke.y
            }     
    } 
}