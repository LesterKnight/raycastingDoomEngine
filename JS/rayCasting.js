
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
//calcula de dentro do tile o ponto de colisão
//faz o render da colisão, nao deveria entao precisa ser realocado, calcula intersecção lateral e intersecçao vertical,
// ambos devem ser separados dessa funcao
export function calculateRaycastingPOV(player,gameMap){  
    const rayCastStep = 1
    const maxRayCastingSize = player.maxRayCastingSize
    const wallCollisionList = new Map()
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
            //renderColisao({x:posicaoInterseccaoX, y})
            return new Posicao(posicaoInterseccaoX, y )
        }
    }
        //CALCULA 60 RAIOS PARA PAREDE USANDO A COLECAO DE COLISOES DA PAREDE

    function calcularLoopdeRaiosParede(player,rayCastingSizeLimit){
        let rayCastingSize = 0
        let angle = player.angle

        for(let i=0;i<RAYCASTING_RES;i++){
            rayCastingSize = 0
            angle = normalizarAngulo(player.angle-(30)+i)
           
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
                            //wallCollisionList.set(player.angle, {colisao: new Posicao(tileColidido.posicao.x, player.posicao.y), tileColidido})
                            break
                        }
                        else if(angle == 90)
                        {
                           // wallCollisionList.set(player.angle, {colisao: new Posicao(player.posicao.x, tileColidido.posicao.y), tileColidido})
                            break
                        }
                        else if(angle == 180){
                           // wallCollisionList.set(player.angle, {colisao: new Posicao(tileColidido.posicao.x + tileColidido.largura , player.posicao.y), tileColidido})
                            break
                        }
                        else if(angle == 270){
                            //wallCollisionList.set(player.angle,  {colisao: new Posicao(player.posicao.x, tileColidido.posicao.y+ tileColidido.altura),tileColidido})
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
                        wallCollisionList.set(angle, {colisao,tileColidido})
                        }
                    if(!colisao && (cima||baixo)){
                        colisao =   calcularIntersecaoVertical(tileColidido, stroke, angle, cima)
                        wallCollisionList.set(angle, {colisao,tileColidido})
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

//--------------------------------------------------------------------------------------------
//APOS CALCULAR AS COLISOES, CALCULAR O LOOP DE 60 RAIOS DENTRO DO PONTO DE VISAO
//-------------------------------------------------------------------------------------------
    let index=0
    //inicio do desenvolvimento
    calcularLoopdeRaiosParede(player,maxRayCastingSize)

    let reta = new Map()

    
    //aqui irei traçar as retas do piso
        for ( const [angle, collisionData] of wallCollisionList.entries()) {
            renderRay(player.posicao,collisionData.colisao)
            //renderColisao(collisionData.colisao)

            let pos = calculatePOV3dPAREDE(player, collisionData.colisao, angle, index++) 
            renderRay3D(pos.superior, pos.inferior,collisionData.tileColidido.cor)

            let ladoEsquerdo = []
            let ladoDireito = []
            let ladoCima = []
            let ladoBaixo = []
            let obj
            //seta o objeto da reta
            if(!reta.get(collisionData.tileColidido)){
                reta.set(collisionData.tileColidido, {inicio:pos.inferior,fim:pos.inferior,lowest:pos.inferior, quadrado:{ladoEsquerdo}})
                
                if(!obj)
                    obj = collisionData.tileColidido
            }
                
            else{
                reta.get(collisionData.tileColidido).fim = pos.inferior
                if((pos.inferior.y > reta.get(collisionData.tileColidido).lowest.y)){
                    //tileAnterior = reta.get(collisionData.tileColidido).lowest
                    reta.get(collisionData.tileColidido).lowest = pos.inferior
                }



            //collisionData.colisao AQUI é a COLISAO
            //aqui é o OBJETO tilecolidido
            //console.log({tile:collisionData.tileColidido,colisao:collisionData.colisao}) 

                if(collisionData.tileColidido.posicao.x==collisionData.colisao.x){
                    //console.log("esquerdo")
                    reta.get(collisionData.tileColidido).quadrado.ladoEsquerdo.push(pos)
                    console.log(reta.get(collisionData.tileColidido).quadrado)
                    
                    let esq = reta.get(collisionData.tileColidido).quadrado.ladoEsquerdo
                    if(esq.length>0)
                    renderRay3D(esq[0].superior,esq[esq.length-1].superior)
                }
                else if (collisionData.tileColidido.posicao.x + collisionData.tileColidido.largura ==collisionData.colisao.x){
                    //console.log("direito")
                }
                
                
                    
            }
           
        } 



        for ( const [a, b] of reta.entries()) {
            {

              if(b.lowest.y>b.inicio.y || b.lowest.y > b.fim.y){
                renderRay3D(b.inicio,b.lowest)
                renderRay3D(b.lowest,b.fim)
              }else
                renderRay3D(b.inicio,b.fim)
            }

            
        }

}



//PAREDES SOMENTE, RETORNA A RETA REFERENTE A RETA EM 3 DIMENSOES DA PAREDE
export function calculatePOV3dPAREDE(player, colisao, angle, index){
    function calcularDistanciaReal(ponto1, ponto2) {
        const deltaX = ponto2.x - ponto1.x; // Diferença em x
        const deltaY = ponto2.y - ponto1.y; // Diferença em y
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY); // Fórmula da distância
    }
    function calcularDistanciaProjetadaParede( distanciaReal, anguloRaio, anguloCentral) {
    const anguloRelativo = (anguloRaio - anguloCentral) * (Math.PI / 180); // Convertendo para radianos
        const distanciaProjetada = distanciaReal * Math.cos(anguloRelativo);
        return distanciaProjetada;
    }

    let distanciaReal = calcularDistanciaReal(player.posicao,colisao)

    //PAREDE SOMENTE
    let distanciaProjetada = calcularDistanciaProjetadaParede(distanciaReal,angle,player.angle)
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