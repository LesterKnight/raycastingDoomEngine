import { GameObject } from "./GameObject.js";
import { JoyController } from "./JoyController.js";
import{PlayerController} from "./PlayerController.js"
export class Player extends GameObject {
  constructor(x, y, angle) {
    super(x, y);
    this.angle = angle
    this.controller = new PlayerController(this)
  }
}