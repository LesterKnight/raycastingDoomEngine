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
const player = new Player(67, 84, 318);
initMap(gameMap);
player.setGameMap(gameMap);

let frameCount = 0;
let lastTime = Date.now();
let fps = 0;

function gameLoop() {
  const currentTime = Date.now();
  const deltaTime = currentTime - lastTime;

  // Atualiza o contador de frames
  frameCount++;

  // Atualiza o FPS a cada segundo (1000 ms)
  if (deltaTime >= 1000) {
    fps = frameCount;
    frameCount = 0;  // Reseta o contador de frames
    lastTime = currentTime;  // Atualiza o tempo da última animação
  }

  document.title = `FPS: ${fps}`;
  renderGame(player, gameMap);

}

// Chama gameLoop a cada 16 ms (~60 FPS)
setInterval(gameLoop, 16);
