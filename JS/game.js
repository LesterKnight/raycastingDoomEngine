import { COMP_SALA, LARG_SALA, DIST_TETO, DIST_PISO } from "./config.js";
import { Player } from "./Classes/Player.js";
import { GameMap } from "./Classes/GameMap.js";
import { calculateRaycastingPOV } from "./rayCasting.js";
import { renderGame, initMap } from "./functions.js";

const gameMap = new GameMap(
  LARG_SALA,
  COMP_SALA,
  DIST_TETO,
  DIST_PISO,
  "mapa_inicial"
);
const player = new Player(157.79552919493148, 213.60094950233187, 18);
initMap(gameMap);

let frameCount = 0;
let lastTime = 0;
let fps = 0;

function gameLoop(currentTime) {
  if (lastTime) {
    const deltaTime = currentTime - lastTime;

    // Atualiza o contador de frames
    frameCount++;

    // Atualiza o FPS a cada segundo (1000 ms)
    if (deltaTime >= 1000) {
      fps = frameCount;
      frameCount = 0;  // Reseta o contador de frames
      lastTime = currentTime;  // Atualiza o tempo da última animação
    }
  } else {
    lastTime = currentTime;
  }
  document.title = `FPS: ${fps}`;
  renderGame(player, gameMap);
  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (event) => {
  const key = event.key;

  switch (key) {
    case "ArrowUp":
      event.preventDefault();
      player.moverFrente();
      break;
    case "ArrowDown":
      event.preventDefault();
      player.moverTras();
      break;
    case "ArrowLeft":
      event.preventDefault();
      player.girarEsquerda();
      break;
    case "ArrowRight":
      event.preventDefault();
      player.girarDireita();
      break;
    case "Control":
      calculateRaycastingPOV(player, gameMap);
      break;
    default:
      break;
  }
});

requestAnimationFrame(gameLoop);