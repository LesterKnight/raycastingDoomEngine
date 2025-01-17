import { ALT_TILE, LARG_TILE } from "../config.js";

export class GameMap {
  static gameMapCollection = new Map();
  constructor(largura, comprimento, distanciaTeto, distanciaPiso, mapName) {
    this.largura = largura,
    this.comprimento = comprimento,
    this.tiles = new Map(),
    this.ground = new Map(),
    this.gameObjects = new Map();
    GameMap.gameMapCollection.set(mapName, this);
  }
  checkTileCollision(pos) {
    for (let [tilePos, tile] of this.tiles) {
      if (tile.verificarColisaoInterna(pos))
        return tile;
    }
  }
  checkGroundCollision(pos) {
    for (let [tilePos, tile] of this.ground) {
      if (tile.verificarColisaoInterna(pos))
        return tile;
    }
  }
  existingTilePosCheck(pos) {
    for (let [tilePos, tile] of this.tiles) {
        for (let i = tilePos.y; i < tilePos.y + tile.altura; i += ALT_TILE) {
            for (let j = tilePos.x; j < tilePos.x + tile.largura; j += LARG_TILE) {
                if (pos.x == j && pos.y == i) {
                    return true;
                }
            }
        }
    }
    return false; // Adicionei um retorno falso caso a posição não seja encontrada
}

  addTile(tile) {
    this.tiles.set(tile.pos, tile);
  }
  addGround(tile) {
    this.ground.set(tile.pos, tile);
  }
}