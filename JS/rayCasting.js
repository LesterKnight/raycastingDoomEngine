import { Posicao } from "./Classes/Posicao.js";
import {
  calcularIntersecaoLateral,
  calcIntersecaoVertical,
  normalizarAngulo,
  rayCasting,
  calcDistanciaReal,
  calcDistanciaProjetada,
  calcularAnguloAB,
  calcColisaoPrecisa,
  calcularIndexEAngulo
} from "./calculos.js";
import { renderColisao, renderRay2D, renderDot2D } from "./Render/render2d.js";
import { renderRay3D, renderDot3D, desenharRetangulosParede3D } from "./Render/render3d.js";
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
import { Tile } from "./Classes/Tile.js";

function calcRaycastingLoopWall(player, gameMap) {//calcula o loop para cada angulo adjacente desde o ponto zero ate N e retorna PONTOS COLIDIDOS PLANO 2D
  let wallCollisionList = new Map();
  let angle = player.angle;
  let ray;

  for (let i = 0; i < RAYCASTING_RES; i++) {
    let rayCastingSize = 0;
    angle = normalizarAngulo(
      player.angle - RAYCASTING_POV / 2 + (RAYCASTING_POV / RAYCASTING_RES) * i
    );
    //player angle -30(meio pov) + step * i

    while (rayCastingSize < MAX_RAYCASTING_SIZE) {
      ray = rayCasting(
        player.pos.x,
        player.pos.y,
        angle,
        rayCastingSize
      );
      let tile = gameMap.checkTileCollision(ray);
      if (tile) {
        if (
          calcColisaoPrecisa(//AQUI TA ERRADO
            player,
            angle,
            ray,
            tile,
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
  let distanciaReal = calcDistanciaReal(player.pos, colisao);
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
function calcularRetangulosParede3D(wallCollisionList, player) {//calcula os retangulos usando as retas geradas acima  //calcula as retas projetadas em 3D

  let index = 0
  const wallRectangles = new Map();
  const replica = []//cada vez que ele ja estiver inserido mas nao for o ultimo, cria uma nova replca
  let lastElement = null
  for (const [angle, collisions] of wallCollisionList.entries()) {

    let collisionData = collisions

    //renderRay2D(player.pos, collisionData.colisao);
    //renderColisao(collisionData.colisao);
    let pos = calcularRetaParede3D(
      player,
      collisionData.colisao,
      angle,
      index++
    );

    renderRay3D(pos.superior, pos.inferior, collisionData.tile.cor);
    const lastPosicao = replica.length > 0 && replica[replica.length - 1].pos == collisionData.tile.pos

    //SE FOR A PRIMEIRA ITERAÇÃO DO OBJETO, INICIALIZA OS VETORES DE RETANGULOS
    if (!wallRectangles.get(collisionData.tile)) {
      wallRectangles.set(collisionData.tile, {
        esquerdo: [],
        direito: [],
        cima: [],
        baixo: [],
      });
    }
    else if (wallRectangles.get(collisionData.tile) &&
      collisionData.tile != lastElement &&
      !lastPosicao) {

      //const tileCopy = Object.assign({}, collisionData.tile);
      const tileCopy = new Tile(collisionData.tile.pos.x,collisionData.tile.pos.y)
      tileCopy.altura = collisionData.tile.altura
      tileCopy.largura = collisionData.tile.largura
      tileCopy.pos = collisionData.tile.pos
      tileCopy.cor = collisionData.tile.cor

      replica.push(tileCopy)
      collisionData.tile = tileCopy//
      wallRectangles.set(collisionData.tile, {
        esquerdo: [],
        direito: [],
        cima: [],
        baixo: [],
      });
    }
    else if (wallRectangles.get(collisionData.tile) && collisionData.tile != lastElement) {
      if (replica.length > 0 && replica[replica.length - 1].pos == collisionData.tile.pos) {
        collisionData.tile = replica[replica.length - 1]
      }
    }

    lastElement = collisions.tile

    if (collisionData.tile.verificarColisaoEsquerda(collisionData.colisao))
      wallRectangles.get(collisionData.tile).esquerdo.push(pos);
    if (collisionData.tile.verificarColisaoDireita(collisionData.colisao))
      wallRectangles.get(collisionData.tile).direito.push(pos);
    if (collisionData.tile.verificarColisaoAbaixo(collisionData.colisao))
      wallRectangles.get(collisionData.tile).baixo.push(pos);
    if (collisionData.tile.verificarColisaoAcima(collisionData.colisao))
      wallRectangles.get(collisionData.tile).cima.push(pos);
  }

  return wallRectangles
}
function calcularCustom3D(player, ponto){
  let pos
  if(ponto.pos){
    renderDot2D( ponto.pos);
    //CALCULA ANGULO ABSOLUTO
    let angle = calcularAnguloAB(player,ponto.pos)
  //CALCULA ANGULO RELATIVO
    let angle2 = normalizarAngulo(player.angle + angle)
    //let agle3 = anguloRelativo(angle,player.angle)?????????????????????????????
    let r = rayCasting(player.pos.x, player.pos.y, angle2 , 50)
    renderRay2D(player.pos, r,"blue");
    let index = calcularIndexEAngulo(player,angle2)



    pos = calcularRetaParede3D(
      player,
      ponto.pos,
      angle2,
      index
    );

    renderRay3D(pos.inferior,pos.superior,"blue")

    if(ponto.tile.pos.x == ponto.pos.x ){
      let tile = ponto.tile
      let posicao = ponto.pos
      let lado = "esquerdo"
      let anguloRelativo = angle2
  

      //2d
      let a,b,c,d
      
      //superior DIREITO pois o retangulo vai ser desenhado para tras 
      b = ponto.pos
      a = new Posicao(ponto.pos.x- LARG_TILE ,ponto.pos.y)

      function projetarPiso(player, colisao, alturaHorizonte) {
        
        let distanciaReal = calcDistanciaReal(player.pos, colisao);
        let distanciaProjetada = calcDistanciaProjetada(
          distanciaReal,
          angle,
          player.angle
        );

        let posX, posYtop, posYinf;
        let comprimentoVertical = (ALT_TILE * DIST_FOCAL) / distanciaProjetada;
        posX = (index / RAYCASTING_RES) * LARG_CANVAS;
        posYtop = alturaHorizonte.y;
        posYinf = ALT_CANVAS / 2 + comprimentoVertical;
        
         let superior= { x: posX, y: posYtop }
         let inferior= { x: posX, y: posYinf }
         return {superior,inferior}
         
      }
      //renderRay3D(inferior,superior,"red")                          
      let a_ = projetarPiso(player, a, pos.inferior)//pos inferior é o ponto base do raycasting
      renderRay3D(a_.superior, a_.inferior)


    }


 

  }
}
function checkTileCornerCollision(i) {
  if (parseInt(i) % LARG_TILE == 0)
    return true
  else return false
}
function calcularPontosIniciaisPiso2D(wallCollisionList, player) {//calcula retas para o piso 2D

  const tileRects = new Map();
  let vet = []
  for (const [angle, collisionData] of wallCollisionList.entries()) {
    //SE FOR A PRIMEIRA ITERAÇÃO DO OBJETO, INICIALIZA OS VETORES DE RETANGULOS
    if (!tileRects.get(collisionData.tile)) {
      tileRects.set(collisionData.tile, {
        esquerdo: [],
        direito: [],
        cima: [],
        baixo: [],
      });
    }

    if (collisionData.tile.verificarColisaoEsquerda(collisionData.colisao))
      tileRects.get(collisionData.tile).esquerdo.push({ angle, collisionData });
    if (collisionData.tile.verificarColisaoDireita(collisionData.colisao))
      tileRects.get(collisionData.tile).direito.push({ angle, collisionData });
    if (collisionData.tile.verificarColisaoAbaixo(collisionData.colisao))
      tileRects.get(collisionData.tile).baixo.push({ angle, collisionData });
    if (collisionData.tile.verificarColisaoAcima(collisionData.colisao))
      tileRects.get(collisionData.tile).cima.push({ angle, collisionData });

  }
  for (const [tile, rects] of tileRects.entries()) {
    if (rects.esquerdo.length > 0) {
      let posInicial = rects.esquerdo[0].collisionData.colisao
      let posFinal = rects.esquerdo[rects.esquerdo.length - 1].collisionData.colisao
      for (let i = posInicial.y; i < posFinal.y; i++) {
        if (checkTileCornerCollision(i)) {
          let pos = new Posicao(parseInt(posInicial.x), parseInt(i))
          renderDot2D(pos)
          let data = {
          pos,
          tile,
          rects
        }
          vet.push(data) 
        }
      }
    }
    if (rects.direito.length > 0) {
      let posInicial = rects.direito[0].collisionData.colisao
      let posFinal = rects.direito[rects.direito.length - 1].collisionData.colisao
      for (let i = posFinal.y; i < posInicial.y; i++) {
        if (checkTileCornerCollision(i)) {
          let pos = new Posicao(parseInt(posInicial.x), parseInt(i))
          renderDot2D(pos)
          let data = {
          pos,
          tile,
          rects
        }
          vet.push(data) 
        }
      }
    }

    if (rects.cima.length > 0) {
      let posInicial = rects.cima[0].collisionData.colisao
      let posFinal = rects.cima[rects.cima.length - 1].collisionData.colisao
      for (let i = posFinal.x; i < posInicial.x; i++) {
        if (checkTileCornerCollision(i)) {
          let pos = new Posicao(parseInt(i), parseInt(posInicial.y))
          renderDot2D(pos)
          let data = {
          pos,
          tile,
          rects
        }
          vet.push(data) 
        }
      }
    }

    if (rects.baixo.length > 0) {
      let posInicial = rects.baixo[0].collisionData.colisao
      let posFinal = rects.baixo[rects.baixo.length - 1].collisionData.colisao
      for (let i = posInicial.x; i < posFinal.x; i++) {
        if (checkTileCornerCollision(i)) {
          let pos = new Posicao(parseInt(i), parseInt(posInicial.y))
          renderDot2D(pos)
          let data = {
          pos,
          tile,
          rects
        }
          vet.push(data) 
        }
      }
    }
  }
  return vet
}
export function calculateRaycastingPOV(player, gameMap) {//calcula o loop de raios de raycasting 2D, calcula as retas projetadas em 3D, usa as retas para formar retangulos em 3D na tela
  let wallCollisionList = calcRaycastingLoopWall(player, gameMap);//{}
  let wallRectangles = calcularRetangulosParede3D(wallCollisionList, player)
  desenharRetangulosParede3D(wallRectangles)//REMOVER
  let pontos = calcularPontosIniciaisPiso2D(wallCollisionList, player)//FINALIZAR E SIMPLIFICAR
  if(pontos.length>0){
    pontos.forEach(ponto => {
      calcularCustom3D(player,ponto)
  });
  }
}

export default { rayCasting, calculateRaycastingPOV };
