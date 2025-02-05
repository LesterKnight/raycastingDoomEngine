import { ALT_TILE, CANVAS2D, CTX_2D, CTX_3D, LARG_SALA, LARG_TILE,COMP_SALA} from "./config.js";
import { calculateRaycastingPOV } from "./rayCasting.js";
import { renderMap2D, renderTiles, renderGround, renderPlayer2D,screenBlanking2D} from "./Render/render2d.js";
import {renderGun} from "./Render/render3d.js"
import { Tile } from "./Classes/Tile.js";
import{screenBlanking3D} from"./Render/render3d.js"



function renderInfo(player) {
  CTX_2D.font = "1px Arial";
  CTX_2D.fillStyle = "black";
  const texto = `X:${Math.round(player.pos.x)} Y:${Math.round(
    player.pos.y
  )} angle: ${player.angle}`;
  const x = 2; // Posição horizontal
  const y = 41; // Posição vertical
  CTX_2D.fillText(texto, x, y);
}

export function initMap(gameMap) {
for(let i=0; i<10; i++){
  gameMap.addTile(new Tile(i*LARG_TILE, 0, )); //coluna
  gameMap.addTile(new Tile(i*LARG_TILE, 36)); //coluna
}
for(let i=1; i<9; i++){
  gameMap.addTile(new Tile(0, i*ALT_TILE));//linha
  gameMap.addTile(new Tile(36, i*ALT_TILE))//linha
}
gameMap.addTile(new Tile(8, 8))//linha
gameMap.addTile(new Tile(28, 28))//linha
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
  renderTiles(gameMap);//2d

  screenBlanking3D()
  calculateRaycastingPOV(player, gameMap);
  renderGun()
}
