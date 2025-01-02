export class  GameMap {
    static gameMapCollection = new Map()
    constructor(largura, comprimento, distanciaTeto, distanciaPiso,mapName){
        this.largura = largura,
        this.comprimento = comprimento,
        this.distanciaTeto = distanciaTeto,
        this.distanciaPiso = distanciaPiso,
        this.tiles = new Map(),
        this.gameObjects = new Map()
        GameMap.gameMapCollection.set(mapName,this)
    }
    checkTileCollision(posicao){
        for ( let [tilePos, tile] of this.tiles) {
            let xInicial = tilePos.x
            let xFinal   = tilePos.x + tile.largura
            let yInicial = tilePos.y
            let yFinal   = tilePos.y + tile.altura
            if(
                posicao.x >= xInicial &&
                posicao.x <= xFinal   &&
                posicao.y >= yInicial &&
                posicao.y <= yFinal
            ){
                return tile
            }
        }
    }
    
   
    
    addTile(tile){
        this.tiles.set(tile.posicao,tile)
    }
    
}