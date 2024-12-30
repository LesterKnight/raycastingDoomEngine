
import { Posicao } from './Classes/Posicao.js';
import { renderColisao,renderRay } from './Render/render2d.js';
import { renderRay3D } from './Render/render3d.js';
import { 
    ALT_TILE,
    LARG_TILE,
    COMP_SALA,
    LARG_SALA,
    DIST_TETO,
    DIST_PISO,
    CANVAS2D,
    CTX_2D,
    CANVAS3D,
    CTX_3D,
    ALT_CANVAS,
    LARG_CANVAS,
    DIST_FOCAL,
    RAYCASTING_RES
}from './config.js';

export function rayCasting(x0, y0, anguloEmGraus, raio) {
    const anguloEmRadianos = anguloEmGraus * (Math.PI / 180);
    const x = x0 + raio * Math.cos(anguloEmRadianos);
    const y = y0 + raio * Math.sin(anguloEmRadianos);
    return { x, y };
}
export function calculateRaycastingPOV(player,gameMap){  
    const rayCastStep = 1
    const maxRayCastingSize = player.maxRayCastingSize
    const wallCollisionList = new Map()
    const GroundCollisionList = new Map()
    let stroke

    //criar a logica que ira disparar N raios, adiciona-los a coleçao e renderiza-los no fim
    const normalizarAngulo = angulo => (angulo % 360 + 360) % 360;

    function calcularIntersecaoLateral(tile, pontoColidido, angle, ladoEsquerdo) {
        const anguloRaioEmRadianos = angle * (Math.PI / 180);
        let posicaoInterseccaoY

        if(ladoEsquerdo)
            posicaoInterseccaoY = pontoColidido.y + (tile.posicao.x - pontoColidido.x) * Math.tan(anguloRaioEmRadianos);
        else
            posicaoInterseccaoY = pontoColidido.y + ((tile.posicao.x+tile.largura) - pontoColidido.x) * Math.tan(anguloRaioEmRadianos);

        if (posicaoInterseccaoY >= tile.posicao.y && posicaoInterseccaoY <= tile.posicao.y + tile.altura) {
            let x = ladoEsquerdo ? tile.posicao.x : tile.posicao.x + tile.largura
            renderColisao({ x, y: posicaoInterseccaoY })
            return new Posicao( x, posicaoInterseccaoY )
        }
    }

    function calcularIntersecaoVertical(tile, pontoColidido, angle, cima) {
        const anguloRaioEmRadianos = angle * (Math.PI / 180);
        let posicaoInterseccaoX

        //consiste sempre em desenhar uma reta, com um angulo fornecido calcular a distancia da reta ate o ponto b
        if(cima)
            posicaoInterseccaoX = pontoColidido.x + (tile.posicao.y - pontoColidido.y) / Math.tan(anguloRaioEmRadianos);
        else
            posicaoInterseccaoX = pontoColidido.x + (tile.posicao.y + tile.altura - pontoColidido.y) / Math.tan(anguloRaioEmRadianos);

        if (posicaoInterseccaoX >= tile.posicao.x && posicaoInterseccaoX <= tile.posicao.x + tile.largura) {
            let y = cima ? tile.posicao.y : tile.posicao.y + tile.altura
            renderColisao({x:posicaoInterseccaoX, y})
            return new Posicao(posicaoInterseccaoX, y )
        }
    }

    function calcularLoopdeRaiosParede(player,rayCastingSizeLimit){
        let rayCastingSize = 0
        let angle = player.angle

        for(let i=0;i<RAYCASTING_RES;i++){
            rayCastingSize = 0
            angle = normalizarAngulo(player.angle-(RAYCASTING_RES/2)+i)
            while(rayCastingSize<rayCastingSizeLimit){
                //lança o primeiro raio
                stroke = rayCasting
                (
                    player.posicao.x,
                    player.posicao.y,
                    angle,
                    rayCastingSize
                )
                //verifica se houve colisao
                let tileColidido = gameMap.checkTileCollision(stroke)
                //se houve colisao obtem a colisao precisa
    
                if(tileColidido){
                    if(angle % 90 == 0){
                        if(angle==0)//o ponto é a direita
                        {
                            wallCollisionList.set(player.angle, new Posicao(tileColidido.posicao.x, player.posicao.y))
                            break
                        }
                        else if(angle == 90)
                        {
                            wallCollisionList.set(player.angle, new Posicao(player.posicao.x, tileColidido.posicao.y))
                            break
                        }
                        else if(angle == 180){
                            wallCollisionList.set(player.angle, new Posicao(tileColidido.posicao.x + tileColidido.largura , player.posicao.y))
                            break
                        }
                        else if(angle == 270){
                            wallCollisionList.set(player.angle,  new Posicao(player.posicao.x, tileColidido.posicao.y+ tileColidido.altura))
                            break
                        }
                        break
                    }
                    else{ //calcular colisao nas laterais dos blocos
    
                        let esquerda = false, direita = false, cima = false, baixo = false
                        if(player.posicao.y < tileColidido.posicao.y )
                            cima = true
                        
                        if(player.posicao.y > tileColidido.posicao.y+tileColidido.altura)
                            baixo = true
    
                        if(player.posicao.x < tileColidido.posicao.x)
                            esquerda = true
    
                        if(player.posicao.x > tileColidido.posicao.x +tileColidido.largura )
                            direita = true
                        
                        let colisao
                    if(esquerda||direita){
                        colisao = calcularIntersecaoLateral(tileColidido, stroke, angle, esquerda)
                        wallCollisionList.set(angle, colisao)
                        }
                    if(!colisao && (cima||baixo)){
                        colisao =   calcularIntersecaoVertical(tileColidido, stroke, angle, cima)
                        wallCollisionList.set(angle, colisao)
                        }
                        break
                    }
                }
    
                else{//se o raio nao colidiu, continuar o loop
    
                    if(rayCastingSize < rayCastingSizeLimit){
                        rayCastingSize+=rayCastStep
                        continue
                    }
                    else break
                }
            }
        }
    }

   function calcularLoopdeRaiosPiso(player,rayCastingSizeLimit){
        let rayCastingSize = 0
        let angle = player.angle

        for(let i=0;i<RAYCASTING_RES;i++){
            rayCastingSize = 0
            angle = normalizarAngulo(player.angle-(RAYCASTING_RES/2)+i)
            while(rayCastingSize<rayCastingSizeLimit){
                //lança o primeiro raio
                stroke = rayCasting
                (
                    player.posicao.x,
                    player.posicao.y,
                    angle,
                    rayCastingSize
                )
                //verifica se houve colisao
                let tileColidido = gameMap.checkGroundCollision(stroke)
                //se houve colisao obtem a colisao precisa
    
                if(tileColidido){
                    if(angle % 90 == 0){
                        if(angle==0)//o ponto é a direita
                        {
                            wallCollisionList.set(player.angle, new Posicao(tileColidido.posicao.x, player.posicao.y))
                            break
                        }
                        else if(angle == 90)
                        {
                            wallCollisionList.set(player.angle, new Posicao(player.posicao.x, tileColidido.posicao.y))
                            break
                        }
                        else if(angle == 180){
                            wallCollisionList.set(player.angle, new Posicao(tileColidido.posicao.x + tileColidido.largura , player.posicao.y))
                            break
                        }
                        else if(angle == 270){
                            wallCollisionList.set(player.angle,  new Posicao(player.posicao.x, tileColidido.posicao.y+ tileColidido.altura))
                            break
                        }
                        break
                    }
                    else{ //calcular colisao nas laterais dos blocos
    
                        let esquerda = false, direita = false, cima = false, baixo = false
                        if(player.posicao.y < tileColidido.posicao.y )
                            cima = true
                        
                        if(player.posicao.y > tileColidido.posicao.y+tileColidido.altura)
                            baixo = true
    
                        if(player.posicao.x < tileColidido.posicao.x)
                            esquerda = true
    
                        if(player.posicao.x > tileColidido.posicao.x +tileColidido.largura )
                            direita = true
                        
                        let colisao
                    if(esquerda||direita){
                        colisao = calcularIntersecaoLateral(tileColidido, stroke, angle, esquerda)
                        wallCollisionList.set(angle, colisao)
                        }
                    if(!colisao && (cima||baixo)){
                        colisao =   calcularIntersecaoVertical(tileColidido, stroke, angle, cima)
                        wallCollisionList.set(angle, colisao)
                        }
                        break
                    }
                }
    
                else{//se o raio nao colidiu, continuar o loop
    
                    if(rayCastingSize < rayCastingSizeLimit){
                        rayCastingSize+=rayCastStep
                        continue
                    }
                    else break
                }
            }
        }
    }



    //inicio do desenvolvimento
    calcularLoopdeRaiosParede(player,maxRayCastingSize)
    let index = 0
        for ( const [angle, collision] of wallCollisionList.entries()) {

            //renderRay(player.posicao,collision)
            //renderColisao(collision)
            let pos = calculatePOV3d(player, collision, angle, index++)
            renderRay3D(pos.superior, pos.inferior,)
        } 

        calcularLoopdeRaiosPiso(player,maxRayCastingSize)
        index = 0
        for ( const [angle, collision] of GroundCollisionList.entries()) {
            renderRay(player.posicao,collision,"rgb(0, 255, 0)")//2D
            renderColisao(collision)
            //let pos = calculatePOV3d(player, collision, angle, index++)
            //renderRay3D(pos.superior, pos.inferior,)
        }  


    

}
export function calculatePOV3d(player, colisao, angle, index){
    function calcularDistanciaReal(ponto1, ponto2) {
        const deltaX = ponto2.x - ponto1.x; // Diferença em x
        const deltaY = ponto2.y - ponto1.y; // Diferença em y
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY); // Fórmula da distância
    }
    function calcularDistanciaProjetada( distanciaReal, anguloRaio, anguloCentral) {
    const anguloRelativo = (anguloRaio - anguloCentral) * (Math.PI / 180); // Convertendo para radianos
        const distanciaProjetada = distanciaReal * Math.cos(anguloRelativo);
        return distanciaProjetada;
    }

    let distanciaReal = calcularDistanciaReal(player.posicao,colisao)
    let distanciaProjetada = calcularDistanciaProjetada(distanciaReal,angle,player.angle)
    let RAIOposX, RAIOposYSup,RAIOposYinf
    //altura total do palito
    let alturaRenderizada = (ALT_TILE*DIST_FOCAL)/distanciaProjetada
    RAIOposX = (index/RAYCASTING_RES)*LARG_CANVAS
    RAIOposYSup = ALT_CANVAS/2 - alturaRenderizada
    RAIOposYinf = ALT_CANVAS/2 + alturaRenderizada

    return {
        superior: {x:RAIOposX, y: RAIOposYSup},
        inferior: {x:RAIOposX, y: RAIOposYinf}
    }
}

export default {rayCasting, calculateRaycastingPOV}