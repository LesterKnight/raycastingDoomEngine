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
import { renderColisao, renderRay2D, renderDot2D, renderGround, renderTileGround } from "./Render/render2d.js";
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
  DEBUG_GROUND_POS_2D,
  DEBUG_GROUND_POS_3D,
  DEBUG_RAYCASTING_POS_3D,
  DEBUG_RAYCASTING_POS_2D
} from "./config.js";
import { Tile } from "./Classes/Tile.js";

function calcRaycastingLoop(player, gameMap) {//calcula o loop para cada angulo adjacente desde o ponto zero ate N e retorna PONTOS COLIDIDOS PLANO 2D
  let wallCollisionList = new Map();
  let groundCollisionList = new Map()
  let groundCollisionListTemp = new Map()
  let angle = player.angle;
  let ray;

  for (let i = 0; i < RAYCASTING_RES; i++) {

    let rayCastingSize = 0;
    angle = normalizarAngulo(
      player.angle - RAYCASTING_POV / 2 + (RAYCASTING_POV / RAYCASTING_RES) * i
    );

    while (rayCastingSize < MAX_RAYCASTING_SIZE) {
      ray = rayCasting(
        player.pos.x,
        player.pos.y,
        angle,
        rayCastingSize
      );

      if(DEBUG_RAYCASTING_POS_2D)
        renderRay2D(player.pos,ray, "rgba(0,0,0,0.01)")

      let tile = gameMap.checkTileCollision(ray);

      if (parseInt(ray.x) % 32 == 0 && parseInt(ray.y) % 32 == 0) {
        groundCollisionListTemp.set(`${parseInt(ray.x)},${parseInt(ray.y)}`, ray)
      }

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

  for (const [pos, ray] of groundCollisionListTemp.entries()) {
    for (const [pos, tile] of gameMap.ground.entries()) {
      tile.atualizarFlagColisao(ray)
    }
  }



  //WIP
  for (const [pos, tile] of gameMap.ground.entries()) {
    if (tile.allFlags()) {
      renderTileGround(tile.pos, tile, "black")
      renderTile(player, tile)
      tile.resetAllFlags()
      //groundCollisionList.set(tile.pos,tile)
    }
    else if (tile.someFlags()) {
      renderTileGround(tile.pos, tile, "rgba(0,255,0,0.3")
      tile.resetAllFlags()
    }
  }
  return [wallCollisionList, groundCollisionList];
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

    let pos = calcularRetaParede3D(
      player,
      collisionData.colisao,
      angle,
      index++
    );

    if(DEBUG_RAYCASTING_POS_3D)
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

      const tileCopy = new Tile(collisionData.tile.pos.x, collisionData.tile.pos.y)
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
function calcularReta3DPiso(player, posicao) {
  let angle = calcularAnguloAB(player, posicao)
  let angle2 = normalizarAngulo(player.angle + angle)
  let index = calcularIndexEAngulo(player, angle2)
  let pos = calcularRetaParede3D(
    player,
    posicao,
    angle2,
    index
  );

  if (DEBUG_GROUND_POS_2D)
    renderDot2D(posicao, "blue");
  if (DEBUG_GROUND_POS_3D)
    renderDot3D(pos.inferior, "blue")

  return pos.inferior
}

function renderTile(player, tile) {
  //TILE JA POSSUI MEDIDAS
  let p0, p1, p2, p3
  p0 = tile.collisionFlags.p0
  p1 = tile.collisionFlags.p1
  p2 = tile.collisionFlags.p2
  p3 = tile.collisionFlags.p3
  //CONSERTAR E REMOVER OBJ
  p0 = calcularReta3DPiso(player, p0)
  p1 = calcularReta3DPiso(player, p1)
  p2 = calcularReta3DPiso(player, p2)
  p3 = calcularReta3DPiso(player, p3)
  // criar um raycasting do primeiro e do ultimo raio que disparem ate o objeto, caso algum dos lados do objeto esteja fora do raycasting, sera ajustado
  renderRay3D(p0, p1)
  renderRay3D(p0, p2)
  renderRay3D(p2, p3)
  renderRay3D(p3, p1)

}
export function calculateRaycastingPOV(player, gameMap) {//calcula o loop de raios de raycasting 2D, calcula as retas projetadas em 3D, usa as retas para formar retangulos em 3D na tela
  let [wallCollisionList, groundCollisionList] = calcRaycastingLoop(player, gameMap);//{}
  let wallRectangles = calcularRetangulosParede3D(wallCollisionList, player)
  desenharRetangulosParede3D(wallRectangles)//REMOVER
  //let t = new Tile(224,224,1,1)
}
