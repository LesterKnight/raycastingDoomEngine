export class JoyController {
  constructor(player) {
      this.player = player;
      this.gamepadIndex = null;

      window.addEventListener('gamepadconnected', (e) => this.connectHandler(e));
      window.addEventListener('gamepaddisconnected', (e) => this.disconnectHandler(e));
  }

  connectHandler(event) {
      this.gamepadIndex = event.gamepad.index;
      console.log(`Gamepad connected at index ${this.gamepadIndex}: ${event.gamepad.id}`);
      this.updateLoop();
  }

  disconnectHandler(event) {
      console.log(`Gamepad disconnected from index ${event.gamepad.index}: ${event.gamepad.id}`);
      if (this.gamepadIndex === event.gamepad.index) {
          this.gamepadIndex = null;
      }
  }

  updateLoop() {
      if (this.gamepadIndex !== null) {
          const gamepad = navigator.getGamepads()[this.gamepadIndex];
          if (gamepad) {
              this.updateMovement(gamepad);
          }
      }
      requestAnimationFrame(() => this.updateLoop());
  }

  updateMovement(gamepad) {
      const threshold = 0.9; // Sensibilidade do joystick
      const up = gamepad.axes[1] < -threshold;
      const down = gamepad.axes[1] > threshold;
      const left = gamepad.axes[0] < -threshold;
      const right = gamepad.axes[0] > threshold;

      this.player.mov.frente = up;
      this.player.mov.tras = down;
      this.player.mov.esquerda = left;
      this.player.mov.direita = right;
  }
}
