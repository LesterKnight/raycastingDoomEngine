export class GameMap {
  static gameMapCollection = new Map();
  constructor(largura, comprimento, distanciaTeto, distanciaPiso, mapName) {
    (this.largura = largura),
      (this.comprimento = comprimento),
      (this.tiles = new Map()),
      (this.gameObjects = new Map());
    GameMap.gameMapCollection.set(mapName, this);
  }
  checkTileCollision(pos) {
    for (let [tilePos, tile] of this.tiles) {
      if (tile.verificarColisaoInterna(pos))
        return tile;
    }
  }
  addTile(tile) {
    this.tiles.set(tile.pos, tile);
  }
}