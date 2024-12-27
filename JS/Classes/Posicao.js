import { 
    ALT_TILE, 
    LARG_TILE, 
} from '../config.js';

export class Posicao{
    constructor(x,y){
        this.x = x
        this.y = y
        this.previousPos = null
    }
}