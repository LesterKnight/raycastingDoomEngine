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
import { renderColisao, renderRay2D, renderDot2D, renderGround,renderTileGround } from "./Render/render2d.js";
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

function calcRaycastingLoop(player, gameMap) {//calcula o loop para cada angulo adjacente desde o ponto zero ate N e retorna PONTOS COLIDIDOS PLANO 2D
  let wallCollisionList = new Map();
  let groundCollisionList = new Map()
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

      let tile = gameMap.checkTileCollision(ray);

      if(parseInt(ray.x) % 32 ==0 && parseInt(ray.y)%32==0 ){
        /*
        let ground = gameMap.checkGroundCollision(ray)
        if (ground && !groundCollisionList.has(ground.pos) && !tile) {
          groundCollisionList.set(ground.pos, ground)
        }

        for (const [pos, tile] of groundCollisionList.entries()) {
          tile.atualizarFlagColisao(ray)
          if(tile.allFlags())
            renderTileGround(pos,tile)
        }
*/
renderDot2D(ray, "green")

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
  /*
  for (const [pos, tile] of groundCollisionList.entries()) {
    if (!tile.allFlags()) {
      tile.resetAllFlags()
      groundCollisionList.delete(tile.pos)
    }
  }
  */
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

    renderRay2D(player.pos, collisionData.colisao);
    renderColisao(collisionData.colisao, "blue");
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

function calcularReta3DPiso(player, ponto) {
  //----------------------------------------------------------------------
  renderDot2D(ponto.pos);
  let angle = calcularAnguloAB(player, ponto.pos)
  let angle2 = normalizarAngulo(player.angle + angle)

  let index = calcularIndexEAngulo(player, angle2)
  let pos = calcularRetaParede3D(
    player,
    ponto.pos,
    angle2,
    index
  );
  //let r = rayCasting(player.pos.x, player.pos.y, angle2 , 50)
  //renderRay2D(player.pos, r,"blue");//RENDER A PAREDE
  renderDot3D(pos.inferior, "blue")
  return pos.inferior
}

function checkTileCornerCollision(i) {
  if (parseInt(i) % LARG_TILE == 0)
    return true
  else return false
}
function calcularPontosIniciaisPiso2D(wallCollisionList, player) {//calcula retas para o piso 2D

  let color = "rgba(255,0,0,0.5"
  const tileRects = new Map();
  let vet = {
    esquerdo: [],
    direito: [],
    cima: [],
    baixo: []
  }


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
          renderDot2D(pos, color)
          let data = {
            pos,
            tile,
            rects
          }
          vet.esquerdo.push(data)
        }
      }
    }
    if (rects.direito.length > 0) {
      let posInicial = rects.direito[0].collisionData.colisao
      let posFinal = rects.direito[rects.direito.length - 1].collisionData.colisao
      for (let i = posFinal.y; i < posInicial.y; i++) {
        if (checkTileCornerCollision(i)) {
          let pos = new Posicao(parseInt(posInicial.x), parseInt(i))
          renderDot2D(pos, color)
          let data = {
            pos,
            tile,
            rects
          }
          vet.direito.push(data)
        }
      }
    }

    if (rects.cima.length > 0) {
      let posInicial = rects.cima[0].collisionData.colisao
      let posFinal = rects.cima[rects.cima.length - 1].collisionData.colisao
      for (let i = posFinal.x; i < posInicial.x; i++) {
        if (checkTileCornerCollision(i)) {
          let pos = new Posicao(parseInt(i), parseInt(posInicial.y))
          renderDot2D(pos, color)
          let data = {
            pos,
            tile,
            rects
          }
          vet.cima.push(data)
        }
      }
    }

    if (rects.baixo.length > 0) {
      let posInicial = rects.baixo[0].collisionData.colisao
      let posFinal = rects.baixo[rects.baixo.length - 1].collisionData.colisao
      for (let i = posInicial.x; i < posFinal.x; i++) {
        if (checkTileCornerCollision(i)) {
          let pos = new Posicao(parseInt(i), parseInt(posInicial.y))
          renderDot2D(pos, color)
          let data = {
            pos,
            tile,
            rects
          }
          vet.baixo.push(data)
        }
      }
    }
  }
  return vet
}


function renderTile(player, tile) {
  let p0, p1, p2, p3
  p0 = { pos: new Posicao(tile.pos.x, tile.pos.y) }
  p1 = { pos: new Posicao(tile.pos.x + 32, tile.pos.y) }
  p2 = { pos: new Posicao(tile.pos.x, tile.pos.y + 32) }
  p3 = { pos: new Posicao(tile.pos.x + 32, tile.pos.y + 32) }

  p0 = calcularReta3DPiso(player, p0)
  p1 = calcularReta3DPiso(player, p1)
  p2 = calcularReta3DPiso(player, p2)
  p3 = calcularReta3DPiso(player, p3)
  // criar um raycasting do primeiro e do ultimo raio que disparem ate o objeto, caso algum dos lados do objeto esteja fora do raycasting, sera ajustado
  renderRay3D(p0, p3)
  renderRay3D(p1, p2)
}

export function calculateRaycastingPOV(player, gameMap) {//calcula o loop de raios de raycasting 2D, calcula as retas projetadas em 3D, usa as retas para formar retangulos em 3D na tela
  let wallCollisionList = calcRaycastingLoop(player, gameMap);//{}
  let wallRectangles = calcularRetangulosParede3D(wallCollisionList, player)
  desenharRetangulosParede3D(wallRectangles)//REMOVER

  let pontos = calcularPontosIniciaisPiso2D(wallCollisionList, player)//FINALIZAR E SIMPLIFICAR
  pontos.esquerdo.forEach(ponto => {
    let tile = ponto.tile

    if (tile.verificarColisaoEsquerda(ponto.pos)) {
      //let distancia = parseInt((tile.pos.x - player.pos.x)/LARG_TILE)  -1
      let a1 = calcularReta3DPiso(player, ponto)
    }
  });

  //let t = new Tile(224,224,1,1)
  //renderTile(player,t)











}

export default { rayCasting, calculateRaycastingPOV };
