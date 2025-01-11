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
  calcularAnguloAB
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
    //player angle -30(meio pov) + step * i

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
          calcColisaoPrecisa(//AQUI TA ERRADO
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

function calcularRetangulosParede3D(wallCollisionList, player) {//calcula os retangulos usando as retas geradas acima  //calcula as retas projetadas em 3D

  let index = 0
  const wallRectangles = new Map();
  const replica = []//cada vez que ele ja estiver inserido mas nao for o ultimo, cria uma nova replca
  let lastElement = null
  for (const [angle, collisions] of wallCollisionList.entries()) {

    let collisionData = collisions

    renderRay2D(player.posicao, collisionData.colisao);
    renderColisao(collisionData.colisao);
    let pos = calcularRetaParede3D(
      player,
      collisionData.colisao,
      angle,
      index++
    );

    //renderRay3D(pos.superior, pos.inferior, collisionData.tileColidido.cor);
    const lastPosicao = replica.length > 0 && replica[replica.length - 1].posicao == collisionData.tileColidido.posicao

    //SE FOR A PRIMEIRA ITERAÇÃO DO OBJETO, INICIALIZA OS VETORES DE RETANGULOS
    if (!wallRectangles.get(collisionData.tileColidido)) {
      wallRectangles.set(collisionData.tileColidido, {
        esquerdo: [],
        direito: [],
        cima: [],
        baixo: [],
      });
    }
    else if (wallRectangles.get(collisionData.tileColidido) &&
      collisionData.tileColidido != lastElement &&
      !lastPosicao) {

      //const tileCopy = Object.assign({}, collisionData.tileColidido);
      const tileCopy = new Tile(0,0)
      tileCopy.altura = collisionData.tileColidido.altura
      tileCopy.largura = collisionData.tileColidido.altura
      tileCopy.posicao = collisionData.tileColidido.altura
      tileCopy.cor = collisionData.tileColidido.altura

      replica.push(tileCopy)
      collisionData.tileColidido = tileCopy//
      wallRectangles.set(collisionData.tileColidido, {
        esquerdo: [],
        direito: [],
        cima: [],
        baixo: [],
      });
    }
    else if (wallRectangles.get(collisionData.tileColidido) && collisionData.tileColidido != lastElement) {
      if (replica.length > 0 && replica[replica.length - 1].posicao == collisionData.tileColidido.posicao) {
        collisionData.tileColidido = replica[replica.length - 1]
      }
    }

    lastElement = collisions.tileColidido

    if (collisionData.tileColidido.posicao.x == collisionData.colisao.x) {
      wallRectangles.get(collisionData.tileColidido).esquerdo.push(pos);
    }
    if (
      collisionData.tileColidido.posicao.x +
      collisionData.tileColidido.largura ==
      collisionData.colisao.x
    ) {
      wallRectangles.get(collisionData.tileColidido).direito.push(pos);
    }
    if (
      collisionData.tileColidido.posicao.x <= collisionData.colisao.x &&
      collisionData.tileColidido.posicao.x +
      collisionData.tileColidido.largura >=
      collisionData.colisao.x &&
      collisionData.tileColidido.posicao.y +
      collisionData.tileColidido.altura ==
      collisionData.colisao.y
    ) {
      wallRectangles.get(collisionData.tileColidido).baixo.push(pos);
    }
    if (
      collisionData.tileColidido.posicao.x <= collisionData.colisao.x &&
      collisionData.tileColidido.posicao.x +
      collisionData.tileColidido.largura >=
      collisionData.colisao.x &&
      collisionData.tileColidido.posicao.y == collisionData.colisao.y
    ) {
      wallRectangles.get(collisionData.tileColidido).cima.push(pos);
    }
  }

  return wallRectangles
}

function calcularCustom3D(player, ponto){
  if(ponto.posicao){
    renderDot2D( ponto.posicao);
    //CALCULA ANGULO ABSOLUTO
    let angle = calcularAnguloAB(player,ponto.posicao)
  //CALCULA ANGULO RELATIVO
    let angle2 = normalizarAngulo(player.angle + angle)
    //let agle3 = anguloRelativo(angle,player.angle)?????????????????????????????
    let r = rayCasting(player.posicao.x, player.posicao.y, angle2 , 50)
    renderRay2D(player.posicao, r,"blue");
    let index = calcularIndexEAngulo(player,angle2)


    let pos = calcularRetaParede3D(
      player,
      ponto.posicao,
      angle2,
      index
    );
    renderRay3D(pos.inferior,pos.superior,"blue")
    
  }
}

export function calcularIndexEAngulo(player,relativeAngle) {
  // 3. Calcular o índice no FOV
  let fovStart = normalizarAngulo(player.angle - RAYCASTING_POV / 2);
  let index = ((relativeAngle - fovStart + 360) % 360) / (RAYCASTING_POV / RAYCASTING_RES);
  return index
    //index: Math.floor(index)  // Arredondando para o índice mais próximo
}

function checkTileCornerCollision(i) {
  if (parseInt(i) % LARG_TILE == 0)
    return true
  else return false
}
function calcularPontosIniciaisPiso2D(wallCollisionList, player) {//calcula retas para o piso 2D
console.log(wallCollisionList)

  const tileRects = new Map();
  let vet = []
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
    try{
      collisionData.tileColidido.verificarColisaoEsquerda()
    }catch(ex){
      console.log(collisionData.tileColidido)
      debugger
    }
    

    if (collisionData.tileColidido.posicao.x == collisionData.colisao.x)
      tileRects.get(collisionData.tileColidido).esquerdo.push({ angle, collisionData });
    if (
      collisionData.tileColidido.posicao.x +
      collisionData.tileColidido.largura ==
      collisionData.colisao.x
    )
      tileRects.get(collisionData.tileColidido).direito.push({ angle, collisionData });
    if (
      collisionData.tileColidido.posicao.x <= collisionData.colisao.x &&
      collisionData.tileColidido.posicao.x +
      collisionData.tileColidido.largura >=
      collisionData.colisao.x &&
      collisionData.tileColidido.posicao.y +
      collisionData.tileColidido.altura ==
      collisionData.colisao.y
    )
      tileRects.get(collisionData.tileColidido).baixo.push({ angle, collisionData });
    if (
      collisionData.tileColidido.posicao.x <= collisionData.colisao.x &&
      collisionData.tileColidido.posicao.x +
      collisionData.tileColidido.largura >=
      collisionData.colisao.x &&
      collisionData.tileColidido.posicao.y == collisionData.colisao.y
    )
      tileRects.get(collisionData.tileColidido).cima.push({ angle, collisionData });
  }
  for (const [tile, rects] of tileRects.entries()) {
    if (rects.esquerdo.length > 0) {
      let posInicial = rects.esquerdo[0].collisionData.colisao
      let posFinal = rects.esquerdo[rects.esquerdo.length - 1].collisionData.colisao
      for (let i = posInicial.y; i < posFinal.y; i++) {
        if (checkTileCornerCollision(i)) {
          let posicao = new Posicao(parseInt(posInicial.x), parseInt(i))
          renderDot2D(posicao)
          let data = {
          posicao,
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
          let posicao = new Posicao(parseInt(posInicial.x), parseInt(i))
          renderDot2D(posicao)
          let data = {
          posicao,
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
          let posicao = new Posicao(parseInt(i), parseInt(posInicial.y))
          renderDot2D(posicao)
          let data = {
          posicao,
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
          let posicao = new Posicao(parseInt(i), parseInt(posInicial.y))
          renderDot2D(posicao)
          let data = {
          posicao,
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
