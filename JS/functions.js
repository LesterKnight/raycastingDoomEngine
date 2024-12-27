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
    CTX_3D 
} from './config.js';
import { Posicao } from './Classes/Posicao.js';

export function rayCasting(x0, y0, anguloEmGraus, raio) {
    const anguloEmRadianos = anguloEmGraus * (Math.PI / 180);
    const x = x0 + raio * Math.cos(anguloEmRadianos);
    const y = y0 + raio * Math.sin(anguloEmRadianos);
    return { x, y };
}

export function renderMap2D(){  

    for(let i=0;i<=COMP_SALA*ALT_TILE;i+=ALT_TILE){
        CTX_2D.strokeStyle = "black";
        CTX_2D.beginPath();
        CTX_2D.moveTo(0, i);
        CTX_2D.lineTo(LARG_SALA*LARG_TILE, i);
        CTX_2D.stroke();
        CTX_2D.closePath()
    }

    for(let i=0;i<=LARG_SALA*LARG_TILE;i+=LARG_TILE){
        CTX_2D.strokeStyle = "black";
        CTX_2D.beginPath();
        CTX_2D.moveTo(i, 0);
        CTX_2D.lineTo(i, COMP_SALA*ALT_TILE);
        CTX_2D.stroke();
        CTX_2D.closePath()
    }
}

export function renderTiles(gameMap){
    for ( let [pos, tile] of gameMap.tiles) {
        CTX_2D.fillStyle = tile.cor;
        CTX_2D.fillRect(pos.x, pos.y, tile.largura,tile.altura);
    }
}

export function renderPlayer2D(player){
    let  radius = 15
    CTX_2D.lineWidth = 3

    CTX_2D.strokeStyle = "red";
    CTX_2D.beginPath();
    CTX_2D.arc(player.posicao.x, player.posicao.y, radius, 0, 2 * Math.PI, false);
    CTX_2D.stroke();//fill
    CTX_2D.closePath()

    CTX_2D.fillStyle = "blue";
    CTX_2D.beginPath();
    CTX_2D.arc(player.posicao.x, player.posicao.y, radius/2, 0, 2 * Math.PI, false);
    CTX_2D.fill();
    CTX_2D.closePath()
    
    let stroke = rayCasting(player.posicao.x,player.posicao.y,player.angle, radius*2)

    
    CTX_2D.strokeStyle = "rgb(0, 255, 0)"
    CTX_2D.beginPath();
    CTX_2D.moveTo(player.posicao.x, player.posicao.y);
    CTX_2D.lineTo(stroke.x, stroke.y);
    CTX_2D.stroke();
    CTX_2D.closePath()
    
    CTX_2D.lineWidth = 1
}
    
export function calculateRaycasting(player,gameMap){  
   
    const rayCastStep = 1
    const maxRayCastingSize = player.maxRayCastingSize

    //const rayCastPov = 60
    const rayCastingAmmount = 60

    const collisionList = new Map()

    let stroke

    //criar a logica que ira disparar N raios, adiciona-los a coleçao e renderiza-los no fim
    function renderColisao(colisao){
        CTX_2D.fillStyle = "rgba(218, 28, 7, 2)";
        CTX_2D.beginPath();
        CTX_2D.arc(colisao.x, colisao.y, 1, 0, 2 * Math.PI, false);
        CTX_2D.fill();
        CTX_2D.closePath()
    }

    function renderRay(a,b){
        CTX_2D.strokeStyle = "rgb(255, 123, 0)"
        CTX_2D.beginPath();
        CTX_2D.moveTo(a.x, a.y);
        CTX_2D.lineTo(b.x, b.y);
        CTX_2D.stroke();
        CTX_2D.closePath()
    }
    
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
    const normalizarAngulo = angulo => (angulo % 360 + 360) % 360;

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
            renderRay(player.posicao,collision)
            renderColisao(collision)
        }  
}

export function renderGame(player,gameMap){
    CTX_2D.clearRect(0,0,CANVAS2D.width,CANVAS2D.height)
    renderMap2D()
    CTX_2D.font = '20px Arial';
    CTX_2D.fillStyle = 'black';
    const texto = `player x:${Math.round(player.posicao.x)} player y:${Math.round(player.posicao.y)} angle: ${player.angle} `
    const x = 0; // Posição horizontal
    const y = 350; // Posição vertical
    CTX_2D.fillText(texto, x, y);

    renderTiles(gameMap)
    
    calculateRaycasting(player,gameMap)
    renderPlayer2D(player)
    
}

export function movimentoValido(stroke){
    return stroke.x>0 && stroke.x< LARG_TILE*LARG_SALA &&
                    stroke.y>0 && stroke.y< ALT_TILE*COMP_SALA
}