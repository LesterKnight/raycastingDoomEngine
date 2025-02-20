import { COMP_SALA, LARG_SALA,  } from "./config.js";
import { Player } from "./Classes/Player.js";
import { GameMap } from "./Classes/GameMap.js";
import { renderGame, initMap } from "./functions.js";

const gameMap = new GameMap(
  LARG_SALA,
  COMP_SALA,
  "mapa_inicial"
);
const player = new Player(201, 207, 139);
initMap(gameMap);
player.setGameMap(gameMap);

let frameCount = 0;
let lastTime = performance.now();
let fps = 0;

function gameLoop(currentTime) {
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

  // Chama o próximo frame
  requestAnimationFrame(gameLoop);
}

// Inicia o loop de animação
requestAnimationFrame(gameLoop);
