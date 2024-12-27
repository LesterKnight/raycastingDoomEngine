export class  GameMap {
    constructor(largura, comprimento, distanciaTeto, distanciaPiso){
        this.largura = largura,
        this.comprimento = comprimento,
        this.distanciaTeto = distanciaTeto,
        this.distanciaPiso = distanciaPiso,
        this.tiles = new Map(),
        this.gameObjects = new Map()
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
            ){//aqui sabemos que o ponto esta dentro do tile,
            // //retornamos a posição para um calculo mais preciso
                tile.cor = "red"
                
                return tile
            }
            else{
                tile.cor = "pink"
            }
        }
    }
    checkPreciseTileCollision(posicaoFinal, posicaoOrigem, posicao){

    }
    addTile(tile){
        this.tiles.set(tile.posicao,tile)
    }
}