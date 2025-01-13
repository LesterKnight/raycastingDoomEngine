import { CANVAS2D, CTX_2D, CTX_3D } from "./config.js";
import { calculateRaycastingPOV } from "./rayCasting.js";
import { renderMap2D, renderTiles, renderPlayer2D } from "./Render/render2d.js";
import { Tile } from "./Classes/Tile.js";
function renderInfo(player) {
  CTX_2D.font = "20px Arial";
  CTX_2D.fillStyle = "black";
  const texto = `X:${Math.round(player.pos.x)} Y:${Math.round(
    player.pos.y
  )} angle: ${player.angle}`;
  const x = 0; // Posição horizontal
  const y = 350; // Posição vertical
  CTX_2D.fillText(texto, x, y);
}
export function initMap(gameMap) {
  gameMap.addTile(new Tile(96, 32));
  gameMap.addTile(new Tile(32, 160));
  gameMap.addTile(new Tile(192, 32));
  gameMap.addTile(new Tile(0, 288, 10, 1)); //coluna
  gameMap.addTile(new Tile(0, 0, 10, 1)); //coluna
  gameMap.addTile(new Tile(0, 32, 1, 8));
  gameMap.addTile(new Tile(288, 32, 1, 8));
  gameMap.addTile(new Tile(64, 96, 4, 2));
  gameMap.addTile(new Tile(256, 96, 2, 2));
}

function clearScreen() {
  CTX_2D.clearRect(0, 0, CANVAS2D.width, CANVAS2D.height);
  CTX_3D.clearRect(0, 0, CANVAS2D.width, CANVAS2D.height);
}


export function renderGame(player, gameMap) {
  clearScreen();
  renderInfo(player);
  renderMap2D();
  renderTiles(gameMap);

  calculateRaycastingPOV(player, gameMap);
  renderPlayer2D(player);
}
