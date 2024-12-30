import { 
    COMP_SALA, 
    LARG_SALA, 
    DIST_TETO, 
    DIST_PISO,
    ALT_TILE,
    LARG_TILE 
} from './config.js';
import { Player } from './Classes/Player.js';
import { Tile } from './Classes/Tile.js';
import { GameMap } from './Classes/GameMap.js';
import { calculateRaycastingPOV } from './rayCasting.js';
import { renderGame } from './functions.js';

const gameMap = new GameMap(LARG_SALA,COMP_SALA,DIST_TETO,DIST_PISO, 'mapainicial')
console.log(GameMap.gameMapCollection)
const player = new Player(132,286)
gameMap.addTile(new Tile(0,0))
gameMap.addTile(new Tile(0,96,2,2))
gameMap.addTile(new Tile(0,160))
gameMap.addTile(new Tile(256,96,2,2))
gameMap.addTile(new Tile(96,32))
gameMap.addTile(new Tile(96,0))
gameMap.addTile(new Tile(288,192))
gameMap.addTile(new Tile(288,0))
gameMap.addTile(new Tile(0,288,4,1))
/*
for(let i=0;i<LARG_SALA*LARG_TILE;i+=LARG_TILE)
    for(let j=0;j<COMP_SALA*ALT_TILE;j+=ALT_TILE){
        let tile = new Tile(i,j)
        tile.cor = "rgba(177, 224, 171, 0.71)"
        gameMap.addGround(tile)
    }
*/
       
let tile = new Tile(128,64)
tile.cor = "rgba(177, 224, 171, 0.71)"
gameMap.addGround(tile)








function f()
{
    gameMap.checkTileCollision(player.posicao)
    renderGame(player,gameMap)
    requestAnimationFrame(f);
}
document.addEventListener('keydown', (event) => {
    const key = event.key;

    switch(key){
        case "ArrowUp":
            event.preventDefault()
            player.moverFrente();
            break;
        case "ArrowDown":
            event.preventDefault()
            player.moverTras();
            break;
        case "ArrowLeft":
            event.preventDefault()
            player.girarEsquerda()
            break;
        case "ArrowRight":
            event.preventDefault()
            player.girarDireita()
            break;
        case "Control":
            
        calculateRaycastingPOV(player,gameMap)
                break;
        default:
            break;
    }
});


f()

