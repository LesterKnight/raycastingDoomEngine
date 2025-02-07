import { ALT_TILE, LARG_TILE } from "../config.js";

export class GameMap {
  static gameMapCollection = new Map();
  constructor(largura, comprimento, distanciaTeto, distanciaPiso, mapName) {
    this.largura = largura,
    this.comprimento = comprimento,

    //this.tiles = new Map(),
    this.tiles = new Array(),
    this.tileLookupTable = new Array(comprimento*ALT_TILE).fill(-1).map(() => new Array(largura*LARG_TILE).fill(-1));

    
    this.ground = new Array(),
    this.groundLookupTable = new Array(comprimento*ALT_TILE).fill(-1).map(() => new Array(largura*LARG_TILE).fill(-1));

    this.gameObjects = new Map();
    GameMap.gameMapCollection.set(mapName, this);
  }

  findTileById(id) {
    if(id>-1)
      return this.tiles[id]
  }
  findGroundById(id) {
    if(id>-1)
      return this.ground[id]
  }
  checkTileCollision(pos) {
    let x = parseInt(pos.x)
    let y = parseInt(pos.y)
    if(x>=0 && y>=0 &&this.tileLookupTable[y][x] >=0)
      return this.findTileById(this.tileLookupTable[y][x])
  }
  checkGroundCollision(pos) {
    let x = parseInt(pos.x)
    let y = parseInt(pos.y)
    if(x>=0 && y>=0 &&this.groundLookupTable[y][x] >=0){
      let id =  this.groundLookupTable[y][x]
      return this.ground[id]
    }
  }
    //array[y][x]
  addTile(tile) {
    this.tiles[tile.id] = tile
    for(let y=tile.pos.y;y<tile.pos.y+ALT_TILE;y++){
      for(let x = tile.pos.x;x<tile.pos.x+LARG_TILE;x++){
        this.tileLookupTable[y][x] = tile.id
      }
    }
  }

  addGround(tile) {
    this.ground[tile.id] = tile
    for(let y=tile.pos.y;y<tile.pos.y+ALT_TILE;y++){
      for(let x = tile.pos.x;x<tile.pos.x+LARG_TILE;x++){
        this.groundLookupTable[y][x] = tile.id
      }
    }
  }

  checkTwoTileVertexCollision(pos) {
    let count = 0
    for (let [tilePos, tile] of this.tiles) {
      if (tile.verificarVertices(pos)){
        count++
        if(count>1)
          return true;
      }  
    }
  }

  existingTilePosCheck(pos) {
    let x = parseInt(pos.x)
    let y = parseInt(pos.y)
    return this.tileLookupTable[y][x]>=0
}


}