import {
  COMP_SALA,
  LARG_SALA,
  ALT_TILE,
  LARG_TILE,
  CTX_2D,
} from "../config.js";
import { rayCasting } from "../calculos.js";

export function renderMap2D() {
  for (let i = 0; i <= COMP_SALA * ALT_TILE; i += ALT_TILE) {
    CTX_2D.strokeStyle = "black";
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

export function renderPlayer2D(player) {
  let radius = 15;
  CTX_2D.lineWidth = 3;

  CTX_2D.strokeStyle = "red";
  CTX_2D.beginPath();
  CTX_2D.arc(player.posicao.x, player.posicao.y, radius, 0, 2 * Math.PI, false);
  CTX_2D.stroke(); //fill
  CTX_2D.closePath();

  CTX_2D.fillStyle = "blue";
  CTX_2D.beginPath();
  CTX_2D.arc(
    player.posicao.x,
    player.posicao.y,
    radius / 2,
    0,
    2 * Math.PI,
    false
  );
  CTX_2D.fill();
  CTX_2D.closePath();

  let stroke = rayCasting(
    player.posicao.x,
    player.posicao.y,
    player.angle,
    radius * 2
  );

  CTX_2D.strokeStyle = "rgb(0, 255, 0)";
  CTX_2D.beginPath();
  CTX_2D.moveTo(player.posicao.x, player.posicao.y);
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

export function renderRay(a, b, color = "rgb(255, 123, 0)") {
  CTX_2D.strokeStyle = color;
  CTX_2D.beginPath();
  CTX_2D.moveTo(a.x, a.y);
  CTX_2D.lineTo(b.x, b.y);
  CTX_2D.stroke();
  CTX_2D.closePath();
}

export default {
  renderMap2D,
  renderTiles,
  renderPlayer2D,
  renderColisao,
  renderRay,
};
