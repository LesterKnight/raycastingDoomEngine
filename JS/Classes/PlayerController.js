export class PlayerController {
    constructor(player) {
      this.player = player;
      this.keysPressed = {};
  
      window.addEventListener('keydown', (e) => this.handleKeyDown(e));
      window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    handleKeyDown(event) {
      const key = event.key;
      this.keysPressed[key] = true;
      this.updateMovementKeyDown();
    }
    handleKeyUp(event) {
      const key = event.key;
      delete this.keysPressed[key];
      this.updateMovementKeyUp()
    }
    updateMovementKeyDown() {
      if (this.keysPressed["ArrowUp"]) {
        this.player.mov.tras=false;
        this.player.mov.frente=true;
      }
      if (this.keysPressed["ArrowDown"]) {
        this.player.mov.frente=false;
        this.player.mov.tras=true;
      }
      if (this.keysPressed["ArrowLeft"]) {
            this.player.mov.direita=false;
            this.player.mov.esquerda=true;
      }
      if (this.keysPressed["ArrowRight"]) {
            this.player.mov.esquerda=false;
            this.player.mov.direita=true;
      }
    }
    updateMovementKeyUp() {
        if (!this.keysPressed["ArrowUp"]) {
          this.player.mov.frente=false;
        }
        if (!this.keysPressed["ArrowDown"]) {
          this.player.mov.tras=false;
        }
        if (!this.keysPressed["ArrowLeft"]) {
              this.player.mov.esquerda=false;
        }
        if (!this.keysPressed["ArrowRight"]) {
              this.player.mov.direita=false;
        }
      }
  }