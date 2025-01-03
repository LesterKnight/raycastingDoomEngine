import { Posicao } from "./Classes/Posicao.js";
import {
  calcularIntersecaoLateral,
  calcIntersecaoVertical,
  normalizarAngulo,
  rayCasting,
} from "./calculos.js";
import { renderColisao, renderRay, renderDot2D } from "./Render/render2d.js";
import { renderRay3D, renderDot3D } from "./Render/render3d.js";
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

function calcColisaoPrecisa(
  player,
  angle,
  ray,
  tileColidido,
  wallCollisionList
) {
  let colisao;
  /*
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
    else{ 
    */
  //calcular colisao nas laterais dos blocos

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
//calcula o loop para cada angulo adjacente desde o ponto zero ate N
function calcRaycastingLoop(player, gameMap) {
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
//calcula reta projetada de acordo com o angulo do jogador
export function calcularRetaParede3D(player, colisao, angle, index) {
  function calcDistanciaReal(ponto1, ponto2) {
    const deltaX = ponto2.x - ponto1.x; // Diferença em x
    const deltaY = ponto2.y - ponto1.y; // Diferença em y
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY); // Fórmula da distância
  }
  function calcDistanciaProjetada(distanciaReal, anguloRaio, anguloCentral) {
    const anguloRelativo = (anguloRaio - anguloCentral) * (Math.PI / 180); // Convertendo para radianos
    const distanciaProjetada = distanciaReal * Math.cos(anguloRelativo);
    return distanciaProjetada;
  }

  let distanciaReal = calcDistanciaReal(player.posicao, colisao);
  let distanciaProjetada = calcDistanciaProjetada(
    distanciaReal,
    angle,
    player.angle
  );
  let posX, posYtop, posYinf;
  let comprimentoVertical = (ALT_TILE * DIST_FOCAL) / distanciaProjetada;
  posX = (index / RAYCASTING_RES) * LARG_CANVAS;
  posYtop = ALT_CANVAS / 2 - comprimentoVertical;
  posYinf = ALT_CANVAS / 2 + comprimentoVertical;
  return {
    superior: { x: posX, y: posYtop },
    inferior: { x: posX, y: posYinf },
  };
}
//calcula o loop de raios de raycasting 2D, calcula as retas projetadas em 3D, usa as retas para formar retangulos em 3D na tela
export function calculateRaycastingPOV(player, gameMap) {
  let index = 0;
  //calcula o loop de raios de raycasting 2D
  const wallCollisionList = calcRaycastingLoop(player, gameMap);

  calcGrid(wallCollisionList);

  const wallRectangles = new Map();

  //calcula as retas projetadas em 3D
  for (const [angle, collisionData] of wallCollisionList.entries()) {
    renderRay(player.posicao, collisionData.colisao);
    renderColisao(collisionData.colisao);
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

  //renderiza os trapezios, SEPARAR NO FUTURO
  for (const [tile, trapezios] of wallRectangles.entries()) {
    Object.keys(trapezios).forEach((lado) => {
      const trapezio = trapezios[lado];
      let size = trapezio.length;
      if (size > 0) {
        renderRay3D(trapezio[0].superior, trapezio[size - 1].superior);
        renderRay3D(trapezio[0].inferior, trapezio[size - 1].inferior);
        //coluna vertical
        renderRay3D(trapezio[size - 1].superior, trapezio[size - 1].inferior);
        //CRIA UM X NAS CAIXAS
        if (tile.altura == ALT_TILE && tile.largura == LARG_TILE) {
          renderRay3D(trapezio[0].superior, trapezio[size - 1].inferior);
          renderRay3D(trapezio[0].inferior, trapezio[size - 1].superior);
        }
      }
    });
  }
}

export function calcGrid(wallCollisionList) {

  let c0,c1
  let hLines = []

  for (const [angle, collisionData] of wallCollisionList.entries()) {
    if (
      hLines.length == 0 ||
      hLines[hLines.length - 1].tileColidido != collisionData.tileColidido
    ) {
      hLines.push({ tileColidido: collisionData.tileColidido, c0, c1 });
      
    if (collisionData.orientacao.esquerda)
      hLines[hLines.length - 1].c0 = collisionData.colisao;
    }
    else{
      if (collisionData.orientacao.esquerda) 
        hLines[hLines.length - 1].c1 = collisionData.colisao;
    }
  }

  for(let i=0;i<hLines.length;i++){
    if(hLines[i].c0 && hLines[i].c1)
      {
        for(let j=parseInt(hLines[i].c0.y); j< parseInt(hLines[i].c1.y);j++){
          if(j%ALT_TILE==0){
            renderDot2D({x: hLines[i].c0.x, y: j})
          }
        }
        
      }
    

  
    
  }
}

export default { rayCasting, calculateRaycastingPOV };
