import { 
    CANVAS2D, 
    CTX_2D,
    CTX_3D 
} from './config.js';
import { calculateRaycastingPOV } from './rayCasting.js';
import {renderMap2D, renderTiles, renderPlayer2D} from './Render/render2d.js'
import {renderPlayer3D} from './Render/render3d.js'
export function renderGame(player,gameMap){
    CTX_2D.clearRect(0,0,CANVAS2D.width,CANVAS2D.height)
    CTX_3D.clearRect(0,0,CANVAS2D.width,CANVAS2D.height)

    renderMap2D()
    CTX_2D.font = '20px Arial';
    CTX_2D.fillStyle = 'black';
    const texto = `player x:${Math.round(player.posicao.x)} player y:${Math.round(player.posicao.y)} angle: ${player.angle} `
    const x = 0; // Posição horizontal
    const y = 350; // Posição vertical
    CTX_2D.fillText(texto, x, y);

    renderTiles(gameMap)
    calculateRaycastingPOV(player,gameMap)
    renderPlayer2D(player)
    renderPlayer3D()
    
}