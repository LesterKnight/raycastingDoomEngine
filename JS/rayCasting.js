import { Posicao } from "./Classes/Posicao.js";
import {
  calcularIntersecaoLateral,
  calcIntersecaoVertical,
  normalizarAngulo,
  rayCasting,
  calcDistanciaReal,
  calcDistanciaProjetada,
  anguloRelativo,
  calcularIndex,
  calcularAngle
} from "./calculos.js";
import { renderColisao, renderRay2D, renderDot2D } from "./Render/render2d.js";
import { renderRay3D, renderDot3D ,desenharRetangulosParede3D} from "./Render/render3d.js";
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
  RAYCASTING_RES,
  RAYCASTING_POV,
  RAYCASTING_STEP_SIZE,
  MAX_RAYCASTING_SIZE,
} from "./config.js";

function calcColisaoPrecisa(//NOTA: ORIENTACAO É REFERENTE AO PLAYER
  player,
  angle,
  ray,
  tileColidido,
  wallCollisionList
) {

  let colisao;
  let orientacao = {
    esquerda: false,
    direita: false,
    cima: false,
    baixo: false,
  };

  if (player.posicao.y < tileColidido.posicao.y) orientacao.cima = true;

  if (player.posicao.y > tileColidido.posicao.y + tileColidido.altura)
    orientacao.baixo = true;

  if (player.posicao.x < tileColidido.posicao.x) orientacao.esquerda = true;

  if (player.posicao.x > tileColidido.posicao.x + tileColidido.largura)
    orientacao.direita = true;

  if (orientacao.esquerda || orientacao.direita) {
    colisao = calcularIntersecaoLateral(
      tileColidido,
      ray,
      angle,
      orientacao.esquerda
    );
    wallCollisionList.set(angle, { colisao, tileColidido, orientacao });
  }
  if (!colisao && (orientacao.cima || orientacao.baixo)) {
    colisao = calcIntersecaoVertical(tileColidido, ray, angle, orientacao.cima);
    wallCollisionList.set(angle, { colisao, tileColidido, orientacao });
  }
  if (!colisao) return false;
  return true;
}

function calcRaycastingLoopWall(player, gameMap) {//calcula o loop para cada angulo adjacente desde o ponto zero ate N e retorna PONTOS COLIDIDOS PLANO 2D
  let wallCollisionList = new Map();
  let angle = player.angle;
  let ray;

  for (let i = 0; i < RAYCASTING_RES; i++) {
    let rayCastingSize = 0;
    angle = normalizarAngulo(
      player.angle - RAYCASTING_POV / 2 + (RAYCASTING_POV / RAYCASTING_RES) * i
    );

    while (rayCastingSize < MAX_RAYCASTING_SIZE) {
      ray = rayCasting(
        player.posicao.x,
        player.posicao.y,
        angle,
        rayCastingSize
      );
      let tileColidido = gameMap.checkTileCollision(ray);
      if (tileColidido) {
        if (
          calcColisaoPrecisa(
            player,
            angle,
            ray,
            tileColidido,
            wallCollisionList
          )
        )
          break;
      }
      if (rayCastingSize < MAX_RAYCASTING_SIZE) {
        rayCastingSize += RAYCASTING_STEP_SIZE;
        continue;
      }
      break;
    }
  }

  return wallCollisionList;
}

export function calcularRetaParede3D(player, colisao, angle, index) {//calcula reta projetada de acordo com o angulo do jogador
  let distanciaReal = calcDistanciaReal(player.posicao, colisao);
  let distanciaProjetada = calcDistanciaProjetada(
    distanciaReal,
    angle,
    player.angle
  );
  let posX, posYtop, posYinf;
  let comprimentoVertical = (ALT_TILE * DIST_FOCAL) / distanciaProjetada;
  posX = (index / RAYCASTING_RES) * LARG_CANVAS;//entender melhor
  posYtop = ALT_CANVAS / 2 - comprimentoVertical;
  posYinf = ALT_CANVAS / 2 + comprimentoVertical;
  return {
    superior: { x: posX, y: posYtop },
    inferior: { x: posX, y: posYinf },
  };
}

//ATENCAO
export function calcularRetaPiso3D(player, colisao, angle, index) {//calcula reta projetada de acordo com o angulo do jogador
  let distanciaReal = calcDistanciaReal(player.posicao, colisao);
  let distanciaProjetada = calcDistanciaProjetada(
    distanciaReal,
    angle,
    player.angle
  );
  let posX, posYtop, posYinf;
  let comprimentoVertical = (ALT_TILE * DIST_FOCAL) / distanciaProjetada;
  posX = (index / RAYCASTING_RES) * LARG_CANVAS;//entender melhor
  posYtop = ALT_CANVAS / 2 - comprimentoVertical;
  posYinf = ALT_CANVAS / 2 + comprimentoVertical;
  return {
    superior: { x: posX, y: posYtop },
    inferior: { x: posX, y: posYinf },
  };
}

function calcularRetangulosParede3D(wallCollisionList,player){//calcula os retangulos usando as retas geradas acima  //calcula as retas projetadas em 3D

let index = 0
  const wallRectangles = new Map();
  for (const [angle, collisionData] of wallCollisionList.entries()) {
    renderRay2D(player.posicao, collisionData.colisao);
    renderColisao(collisionData.colisao);
    //debugger
    let pos = calcularRetaParede3D(
      player,
      collisionData.colisao,
      angle,
      index++
    );
    renderRay3D(pos.superior, pos.inferior, collisionData.tileColidido.cor);


    //SE FOR A PRIMEIRA ITERAÇÃO DO OBJETO, INICIALIZA OS VETORES DE RETANGULOS
    if (!wallRectangles.get(collisionData.tileColidido)) {
      wallRectangles.set(collisionData.tileColidido, {
        esquerdo: [],
        direito: [],
        cima: [],
        baixo: [],
      });
    }
    //CALCULA TRAPEZIO ESQUERDO
    if (collisionData.tileColidido.posicao.x == collisionData.colisao.x)
      wallRectangles.get(collisionData.tileColidido).esquerdo.push(pos);
    //CALCULA TRAPEZIO DIREITO
    if (
      collisionData.tileColidido.posicao.x +
        collisionData.tileColidido.largura ==
      collisionData.colisao.x
    )
      wallRectangles.get(collisionData.tileColidido).direito.push(pos);
    //CALCULA TRAPEZIO EMBAIXO
    if (
      collisionData.tileColidido.posicao.x <= collisionData.colisao.x &&
      collisionData.tileColidido.posicao.x +
        collisionData.tileColidido.largura >=
        collisionData.colisao.x &&
      collisionData.tileColidido.posicao.y +
        collisionData.tileColidido.altura ==
        collisionData.colisao.y
    )
      wallRectangles.get(collisionData.tileColidido).baixo.push(pos);
    //CALCULA TRAPEZIO ENCIMA
    if (
      collisionData.tileColidido.posicao.x <= collisionData.colisao.x &&
      collisionData.tileColidido.posicao.x +
        collisionData.tileColidido.largura >=
        collisionData.colisao.x &&
      collisionData.tileColidido.posicao.y == collisionData.colisao.y
    )
      wallRectangles.get(collisionData.tileColidido).cima.push(pos);
  }
  return wallRectangles
}
function checkTileCornerCollision(i){
  if (Math.round(i)%LARG_TILE==0)
    return true
  else return false
}

function calcularPontosIniciaisPiso2D(wallCollisionList,player){//calcula retas para o piso 2D

    const tileRects = new Map();
    for (const [angle, collisionData] of wallCollisionList.entries()) {
            
      //SE FOR A PRIMEIRA ITERAÇÃO DO OBJETO, INICIALIZA OS VETORES DE RETANGULOS
      if (!tileRects.get(collisionData.tileColidido)) {
        tileRects.set(collisionData.tileColidido, {
          esquerdo: [],
          direito: [],
          cima: [],
          baixo: [],
        });
      }
      
      if (collisionData.tileColidido.posicao.x == collisionData.colisao.x)
        tileRects.get(collisionData.tileColidido).esquerdo.push({angle, collisionData});
      
      if (
        collisionData.tileColidido.posicao.x +
          collisionData.tileColidido.largura ==
        collisionData.colisao.x
      )
        tileRects.get(collisionData.tileColidido).direito.push({angle, collisionData});
      
      if (
        collisionData.tileColidido.posicao.x <= collisionData.colisao.x &&
        collisionData.tileColidido.posicao.x +
          collisionData.tileColidido.largura >=
          collisionData.colisao.x &&
        collisionData.tileColidido.posicao.y +
          collisionData.tileColidido.altura ==
          collisionData.colisao.y
      )
        tileRects.get(collisionData.tileColidido).baixo.push({angle, collisionData});
      
      if (
        collisionData.tileColidido.posicao.x <= collisionData.colisao.x &&
        collisionData.tileColidido.posicao.x +
          collisionData.tileColidido.largura >=
          collisionData.colisao.x &&
        collisionData.tileColidido.posicao.y == collisionData.colisao.y
      )
        tileRects.get(collisionData.tileColidido).cima.push({angle, collisionData});
    }

//-------------------------------------------------------------------------------------------------------PODE SER QUEBRADO


    //criou 4 vetores para cada objeto
    for (const [tile, rects] of tileRects.entries()){

      if(rects.esquerdo.length>0){
        let posInicial = rects.esquerdo[0].collisionData.colisao
        let posFinal = rects.esquerdo[rects.esquerdo.length-1].collisionData.colisao
        for(let i=posInicial.y;i<posFinal.y;i++){
          if(checkTileCornerCollision(i)){
            renderDot2D({x:posInicial.x, y:i})
           let posicao = {x:posInicial.x, y:i}
            //aqui vaiser criada a logica, o angulo desse ponto em relacao ao jogador,
            //o index desse ponto em relacao aos 60 graus

            
            let angle = calcularAngle(player,posicao)
            let index = calcularIndex(player,posicao)
            let retas = calcularRetaParede3D(player, posicao, angle, index)

            renderRay3D(retas.inferior,retas.superior, "blue")
            //renderDot3D(retas.inferior)



          }
        }
      }
      if(rects.direito.length>0){
        let posInicial = rects.direito[0].collisionData.colisao
        let posFinal = rects.direito[rects.direito.length-1].collisionData.colisao
        for(let i=posFinal.y;i<posInicial.y;i++){
          if(checkTileCornerCollision(i)){
            renderDot2D({x:posInicial.x, y:i})
          }
        }
      }

      if(rects.cima.length>0){
        let posInicial = rects.cima[0].collisionData.colisao
        let posFinal = rects.cima[rects.cima.length-1].collisionData.colisao
        for(let i=posFinal.x;i<posInicial.x;i++){
          if(checkTileCornerCollision(i)){
            renderDot2D({x:i, y:posInicial.y})
          }
        }
      }

      if(rects.baixo.length>0){
        let posInicial = rects.baixo[0].collisionData.colisao
        let posFinal = rects.baixo[rects.baixo.length-1].collisionData.colisao
        for(let i=posInicial.x;i<posFinal.x;i++){
          if(checkTileCornerCollision(i)){
            renderDot2D({x:i, y:posInicial.y})
          }
        }
      }
    }





    return tileRects
}















export function calculateRaycastingPOV(player, gameMap) {//calcula o loop de raios de raycasting 2D, calcula as retas projetadas em 3D, usa as retas para formar retangulos em 3D na tela
  //calcula o loop de raios de raycasting 2D
  let wallCollisionList = calcRaycastingLoopWall(player, gameMap);
  let wallRectangles = calcularRetangulosParede3D(wallCollisionList,player)
  desenharRetangulosParede3D(wallRectangles)//REMOVER



  
  let pontos = calcularPontosIniciaisPiso2D(wallCollisionList,player)



//criar raycasting para o piso somente para os pontos especificos
//
  //calcularRetaPiso3D(player, colisao, angle, index)

    //calcularRetaPiso3D(player, colisao, angle, index)
  
    

}



export default { rayCasting, calculateRaycastingPOV };
