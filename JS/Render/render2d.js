import {
  COMP_SALA,
  LARG_SALA,
  ALT_TILE,
  LARG_TILE,
  CTX_2D,
  CANVAS2D
} from "../config.js";
import { rayCasting } from "../calculos.js";

export function renderMap2D() {
  for (let i = 0; i <= COMP_SALA * ALT_TILE; i += ALT_TILE) {
    CTX_2D.strokeStyle = "black";
    CTX_2D.lineWidth = 0.1;
    CTX_2D.beginPath();
    CTX_2D.moveTo(0, i);
    CTX_2D.lineTo(LARG_SALA * LARG_TILE, i);
    CTX_2D.stroke();
    CTX_2D.closePath();
  }

  for (let i = 0; i <= LARG_SALA * LARG_TILE; i += LARG_TILE) {
    CTX_2D.strokeStyle = "black";
    CTX_2D.beginPath();
    CTX_2D.moveTo(i, 0);
    CTX_2D.lineTo(i, COMP_SALA * ALT_TILE);
    CTX_2D.stroke();
    CTX_2D.closePath();
  }
}
export function renderTiles(gameMap) {
  for (let [pos, tile] of gameMap.tiles) {
    CTX_2D.fillStyle = tile.cor;
    CTX_2D.fillRect(pos.x, pos.y, tile.largura, tile.altura);
  }
}
export function renderGround(groundCollisionList) {
  for (let [pos, tile] of groundCollisionList) {
    CTX_2D.fillStyle = "rgba(0,0,0,1)";
    CTX_2D.fillRect(pos.x, pos.y, tile.largura, tile.altura);
  }
}
export function renderTileGround(pos,tile,lines = false, color="rgb(255, 123, 0)") {
  if(!lines){
    CTX_2D.fillStyle = color
    CTX_2D.fillRect(pos.x, pos.y, tile.largura, tile.altura);
  }
  else{
    CTX_2D.beginPath();
    CTX_2D.rect(pos.x, pos.y, tile.largura, tile.altura);
    //CTX_2D.fillStyle = color;
    //CTX_2D.fill();
    CTX_2D.lineWidth = 1;
    let oldStroke = CTX_2D.strokeStyle
    CTX_2D.strokeStyle = color
    CTX_2D.stroke();
    CTX_2D.strokeStyle = oldStroke
  }
    
}
export function renderPlayer2D(player) {
  let radius = 2;
  CTX_2D.lineWidth = 0.5;
  CTX_2D.strokeStyle = "red";
  CTX_2D.beginPath();
  CTX_2D.arc(player.pos.x, player.pos.y, radius, 0, 2 * Math.PI, false);
  CTX_2D.stroke(); //fill
  CTX_2D.closePath();
  CTX_2D.fillStyle = "blue";
  CTX_2D.beginPath();
  CTX_2D.arc(
    player.pos.x,
    player.pos.y,
    radius / 2,
    0,
    2 * Math.PI,
    false
  );
  CTX_2D.fill();
  CTX_2D.closePath();

  let stroke = rayCasting(
    player.pos.x,
    player.pos.y,
    player.angle,
    radius * 2
  );
  CTX_2D.strokeStyle = "rgb(0, 255, 0)";
  CTX_2D.beginPath();
  CTX_2D.moveTo(player.pos.x, player.pos.y);
  CTX_2D.lineTo(stroke.x, stroke.y);
  CTX_2D.stroke();
  CTX_2D.closePath();
  CTX_2D.lineWidth = 1;
}
export function renderColisao(colisao, color = "rgba(218, 28, 7, 2)") {
  CTX_2D.fillStyle = color;
  CTX_2D.beginPath();
  CTX_2D.arc(colisao.x, colisao.y, 1, 0, 2 * Math.PI, false);
  CTX_2D.fill();
  CTX_2D.closePath();
}
export function renderRay2D(a, b, color = "rgba(255, 123, 0, 0.3)") {
  CTX_2D.strokeStyle = color;
  CTX_2D.lineWidth = 0.1;
  CTX_2D.beginPath();
  CTX_2D.moveTo(a.x, a.y);
  CTX_2D.lineTo(b.x, b.y);
  CTX_2D.stroke();
  CTX_2D.closePath();
}
export function renderDot2D(a,color="red") {
  CTX_2D.fillStyle = color;
  CTX_2D.beginPath();
  CTX_2D.arc(
    a.x,
    a.y,
    2,
    0,
    2 * Math.PI,
    false
  )
  CTX_2D.fill();
  CTX_2D.closePath();
}
export function screenBlanking2D() {
  CTX_2D.clearRect(0, 0, CANVAS2D.width, CANVAS2D.height);
}
