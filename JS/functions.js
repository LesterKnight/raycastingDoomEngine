import {
  ALT_TILE,
  CTX_2D,
  LARG_TILE,
} from "./config.js";
import { calculateRaycastingPOV } from "./rayCasting.js";
import {
  renderMap2D,
  renderTiles,
  renderTileGround,
  renderPlayer2D,
  screenBlanking2D,
} from "./Render/render2d.js";
import { renderGun } from "./Render/render3d.js";
import { Tile } from "./Classes/Tile.js";
import { screenBlanking3D } from "./Render/render3d.js";

function renderInfo(player) {
  CTX_2D.font = "10px Arial";
  CTX_2D.fillStyle = "black";
  const texto = `X:${Math.round(player.pos.x)} Y:${Math.round(
    player.pos.y
  )} angle: ${player.angle}`;
  const x = 100; // Posição horizontal
  const y = 330; // Posição vertical
  CTX_2D.fillText(texto, x, y);
}

export function initMap(gameMap) {
  // Adicionando as bordas verticais (duas colunas)
  for (let i = 0; i < 10; i++) {
    gameMap.addTile(new Tile(i * LARG_TILE, 0)); // Coluna superior
    gameMap.addTile(new Tile(i * LARG_TILE, LARG_TILE * 9)); // Coluna inferior
  }

  // Adicionando as bordas horizontais (duas linhas)
  for (let i = 1; i < 9; i++) {
    gameMap.addTile(new Tile(0, i * ALT_TILE)); // Linha esquerda
    gameMap.addTile(new Tile(288, i * ALT_TILE)); // Linha direita
  }

  // Adicionando o canto inferior direito
  gameMap.addTile(new Tile(5 * LARG_TILE, 5 * ALT_TILE));
  gameMap.addTile(new Tile(8 * LARG_TILE, 8 * ALT_TILE));

  // Preenchendo o restante do quadrado com tiles de chão
  for (let i = LARG_TILE; i < LARG_TILE * 9; i += LARG_TILE) {
    
    for (let j = ALT_TILE; j < ALT_TILE * 9; j += ALT_TILE) {
      let t = new Tile(i, j,true);
      if (!gameMap.existingTilePosCheck(t.pos)) {
        gameMap.addGround(t); // Adicionando tile de chão
      }
    }
    Tile.lastId++
  }
}

export function renderGame(player, gameMap) {
  player.update();
  screenBlanking2D();

  renderMap2D();

  renderTiles(gameMap); //2d
  renderTileGround(gameMap);

  renderPlayer2D(player);
  renderInfo(player);

  screenBlanking3D();
  calculateRaycastingPOV(player, gameMap);
  renderGun(player);
}
