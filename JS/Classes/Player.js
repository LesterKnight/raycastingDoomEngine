import { GameObject } from './GameObject.js';

export class Player extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.maxRayCastingSize = 300;
    }
}