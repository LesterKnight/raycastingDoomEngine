import { ALT_TILE, CANVAS2D, CTX_2D, CTX_3D, LARG_SALA, LARG_TILE,COMP_SALA} from "./config.js";
import { calculateRaycastingPOV } from "./rayCasting.js";
import { renderMap2D, renderTiles, renderGround, renderPlayer2D,screenBlanking2D} from "./Render/render2d.js";
import {screenBlanking3D} from "./Render/render3d.js"
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
  gameMap.addTile(new Tile(0, 288, 20, 1)); //coluna
  gameMap.addTile(new Tile(0, 0, 20, 1)); //coluna



  
  gameMap.addTile(new Tile(0, 32, 1, 16));
  gameMap.addTile(new Tile(288, 32, 1, 16));
  gameMap.addTile(new Tile(64, 96, 4, 2));
  gameMap.addTile(new Tile(256, 96, 2, 2));
  
  
  let mapAmmount = 0
  for (let i = 0; i < LARG_TILE*LARG_SALA; i += LARG_TILE) {
    for (let j = 0; j < ALT_TILE*COMP_SALA; j += ALT_TILE) {

      let t = new Tile(i, j)
      if(!gameMap.existingTilePosCheck(t.pos)){
        gameMap.addGround(new Tile(i, j))
        mapAmmount++
      }
    }
  }
}

export function renderGame(player, gameMap) {
  player.update()
  screenBlanking2D();


  renderInfo(player);
  renderMap2D();
  renderPlayer2D(player);

  screenBlanking3D();


  renderTiles(gameMap);
  calculateRaycastingPOV(player, gameMap);

}
