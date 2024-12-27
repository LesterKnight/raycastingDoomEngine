
import { Posicao } from './Classes/Posicao.js';
import { renderColisao,renderRay } from './Render/render2d.js';

export function rayCasting(x0, y0, anguloEmGraus, raio) {
    const anguloEmRadianos = anguloEmGraus * (Math.PI / 180);
    const x = x0 + raio * Math.cos(anguloEmRadianos);
    const y = y0 + raio * Math.sin(anguloEmRadianos);
    return { x, y };
}

export function calculateRaycastingPOV(player,gameMap){  
    const rayCastStep = 1
    const maxRayCastingSize = player.maxRayCastingSize
    const rayCastingAmmount = 60
    const collisionList = new Map()
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

    function calcularLoopdeRaios(player,rayCastingSizeLimit,rayCastingAmmount){
        let rayCastingSize = 0
        let angle = player.angle

        for(let i=0;i<rayCastingAmmount;i++){
            rayCastingSize = 0
            angle = normalizarAngulo(player.angle-(rayCastingAmmount/2)+i)
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
                            collisionList.set(player.angle, new Posicao(tileColidido.posicao.x, player.posicao.y))
                            break
                        }
                        else if(angle == 90)
                        {
                            collisionList.set(player.angle, new Posicao(player.posicao.x, tileColidido.posicao.y))
                            break
                        }
                        else if(angle == 180){
                            collisionList.set(player.angle, new Posicao(tileColidido.posicao.x + tileColidido.largura , player.posicao.y))
                            break
                        }
                        else if(angle == 270){
                            collisionList.set(player.angle,  new Posicao(player.posicao.x, tileColidido.posicao.y+ tileColidido.altura))
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
                        collisionList.set(angle, colisao)
                        }
                    if(!colisao && (cima||baixo)){
                        colisao =   calcularIntersecaoVertical(tileColidido, stroke, angle, cima)
                        collisionList.set(angle, colisao)
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

    calcularLoopdeRaios(player,maxRayCastingSize,rayCastingAmmount)
        for ( const [angle, collision] of collisionList.entries()) {
            //REMOVER
            renderRay(player.posicao,collision)
            renderColisao(collision)
        }  
}

export default {rayCasting, calculateRaycastingPOV}