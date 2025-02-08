import { Posicao } from "./Classes/Posicao.js";
import {
  normalizarAngulo,
  rayCasting,
  calcDistanciaReal,
  calcDistanciaProjetada,
  calcColisaoPrecisa,
} from "./calculos.js";
import {

} from "./Render/render2d.js";
import {
  renderRay3D,
  renderDot3D,
  desenharRetangulosParede3D,
  desenharCeu3D,
  desenharChao3D,
  renderPixel3D
} from "./Render/render3d.js";
import {
  ALT_TILE,
  LARG_TILE,
  COMP_SALA,
  LARG_SALA,
  FOV_IN_RADIANS,
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
  DEBUG_RAYCASTING_POS_2D,
} from "./config.js";
import { Tile } from "./Classes/Tile.js";

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
    ray = rayCasting(player.pos.x, player.pos.y, angle, rayCastingSize);
    let tile = gameMap.checkTileCollision(ray);
    if (tile) {
      let colisao = calcColisaoPrecisa(player, angle, ray, tile, wallCollisionList)
      if (colisao) { 
   
        calcularGroundCasting(player, angle,colisao, rayCastingSize, ray,i,gameMap)
        //ground casting pode ser calculado em paralelo!!!!!!!!!!!!!!!!!!!!!
        break 
      }
    }
    if (rayCastingSize < MAX_RAYCASTING_SIZE) {
      rayCastingSize += RAYCASTING_STEP_SIZE;
      continue;
    }
    break;
  }
}
  return [wallCollisionList];
}

function calcularGroundCasting(player, angle,colisao, rayCastingSize, ray,i,gameMap){
  //let pos = calcularRetaParede3D(player,colisao,angle,i);
  let groundCasting = {
    lastGround:null,
    firstPos:null,
    lastPos:null
  } 
  

for(let j=rayCastingSize+1;j>0;j-=2){
 let g = rayCasting(player.pos.x, player.pos.y, angle, j,true);
 let ground =  gameMap.checkGroundCollision(g)

 if(ground){
    if(groundCasting.lastGround && groundCasting.lastGround!=ground){//calcula first last e renderiza
      
    //ajustar somente o first pos GERA BURACO 3D, ALTERAR SOMENTE O LAST POS GERA RELEVO!!!!!!!!!!!!!!!!!!!

      let firstPos= calcularRetaParede3D(player,groundCasting.firstPos,angle,i);
      //GERA ALTERACAO DE RELEVO INTERESSANTE
      let firstPosCorrigido = firstPos.inferior.y + (ALT_TILE*DIST_FOCAL)/rayCastingSize
      //firstPos.inferior.y = firstPosCorrigido
      let lastPos= calcularRetaParede3D(player,groundCasting.lastPos,angle,i);
      //corrige a perspectiva do last position em relação a tamanho perspectivo
      let lastPosCorrigido = lastPos.inferior.y + (ALT_TILE*DIST_FOCAL)/rayCastingSize
      //lastPos.inferior.y = lastPosCorrigido
      //lastPos.inferior.y +=5

      renderRay3D(firstPos.inferior,lastPos.inferior,groundCasting.lastGround.cor,3)//render ground
  


      groundCasting.lastGround = ground
      groundCasting.firstPos = g
      groundCasting.lastPos = g
      }
      else if(groundCasting.lastGround && groundCasting.lastGround==ground){//atualiza o last
       groundCasting.lastPos = g
      }
      else{
        groundCasting.lastGround = ground
        groundCasting.firstPos = g
        groundCasting.lastPos = g
      }
    }
}






















}


export function calcularRetaParede3D(player, colisao, angle, index) {
  //calcula reta projetada de acordo com o angulo do jogador
  let distanciaReal = calcDistanciaReal(player.pos, colisao);
  let distanciaProjetada = calcDistanciaProjetada(
    distanciaReal,
    angle,
    player.angle
  );
  let posX, posYtop, posYinf;
  let comprimentoVertical = (ALT_TILE * DIST_FOCAL) / distanciaProjetada;
  posX = (index / RAYCASTING_RES) * LARG_CANVAS; //entender melhor
  posYtop = ALT_CANVAS / 2 - comprimentoVertical;
  posYinf = ALT_CANVAS / 2 + comprimentoVertical;
  return {
    superior: { x: posX, y: posYtop },
    inferior: { x: posX, y: posYinf },
  };
}



function calcularRetangulosParede3D(wallCollisionList, player, gameMap) {
  let index = 0;
  const wallRectangles = new Map();
  for (const [angle, collisions] of wallCollisionList.entries()) {
    let collisionData = collisions;
        let pos = calcularRetaParede3D(//DESACOPLAR CALCULAR RETAS
      player,
      collisionData.colisao,
      angle,
      index++
    );
    
    if (DEBUG_RAYCASTING_POS_3D)
      renderRay3D(pos.superior, pos.inferior, collisionData.tile.cor);
    if (!wallRectangles.get(collisionData.tile)) {
      wallRectangles.set(collisionData.tile, {
        esquerdo: [],
        direito: [],
        cima: [],
        baixo: [],
      });
    } 


//VERIFICA SE HA TILE ACIMA
    let esquerda = new Posicao(collisionData.tile.pos.x - LARG_TILE / 2, collisionData.tile.pos.y + ALT_TILE / 2);
    let direita = new Posicao(collisionData.tile.pos.x + LARG_TILE + LARG_TILE / 2,collisionData.tile.pos.y + ALT_TILE / 2);
    let baixo = new Posicao(collisionData.tile.pos.x + LARG_TILE / 2, collisionData.tile.pos.y + ALT_TILE + ALT_TILE / 2);
    let cima = new Posicao(collisionData.tile.pos.x + LARG_TILE / 2,collisionData.tile.pos.y - ALT_TILE / 2);


    if (collisionData.tile.colisaoVerticeEsquerdo(collisionData.colisao)) {
      if (!gameMap.checkTileCollision(esquerda)) {
        wallRectangles.get(collisionData.tile).esquerdo.push(pos);
      }
      else{
        if(collisionData.colisao.y > collisionData.tile.pos.y + ALT_TILE/2){
          wallRectangles.get(collisionData.tile).baixo.push(pos);
        }else{
          wallRectangles.get(collisionData.tile).cima.push(pos);
        }
      }
    }

    if (collisionData.tile.colisaoVerticeDireito(collisionData.colisao)) {
      if (!gameMap.checkTileCollision(direita)) {
        wallRectangles.get(collisionData.tile).direito.push(pos);
      }
      else{
        if(collisionData.colisao.y > collisionData.tile.pos.y + ALT_TILE/2){
          wallRectangles.get(collisionData.tile).baixo.push(pos);
        }else{
          wallRectangles.get(collisionData.tile).cima.push(pos);
        }
      }
    }

    if (collisionData.tile.colisaoVerticeInferior(collisionData.colisao)) {
      if (!gameMap.checkTileCollision(baixo)) {
        wallRectangles.get(collisionData.tile).baixo.push(pos);
      }
      else{
        if(collisionData.colisao.x > collisionData.tile.pos.x + LARG_TILE/2){
          wallRectangles.get(collisionData.tile).direito.push(pos);
        }else{
          wallRectangles.get(collisionData.tile).esquerdo.push(pos);
        }
      }
    }

    if (collisionData.tile.colisaoVerticeSuperior(collisionData.colisao)) {
      if (!gameMap.checkTileCollision(cima)) {
        wallRectangles.get(collisionData.tile).cima.push(pos);
      }
      else{
        if(collisionData.colisao.x > collisionData.tile.pos.x + LARG_TILE/2){
          wallRectangles.get(collisionData.tile).direito.push(pos);
        }else{
          wallRectangles.get(collisionData.tile).esquerdo.push(pos);
        }
      }
    }
  }
  return wallRectangles;
}
function calcularCeuParcial(wallRectangle) {
  let inicial;
  let final;
  wallRectangle.forEach((rayCasting) => {
    if (rayCasting.superior.y > 0) {
      if (!inicial) {
        inicial = rayCasting;
      }
      final = rayCasting;
    }
  });
  if (inicial && final) return { inicial, final };
}

function calcularCeu(wallRectangles) {
  let ceu = [];
  for (const [tile, wallRectangle] of wallRectangles.entries()) {
    let baixo = calcularCeuParcial(wallRectangle.baixo);
    if (baixo) ceu.push(baixo);

    let cima = calcularCeuParcial(wallRectangle.cima);
    if (cima) ceu.push(cima);

    let esquerdo = calcularCeuParcial(wallRectangle.esquerdo);
    if (esquerdo) ceu.push(esquerdo);

    let direito = calcularCeuParcial(wallRectangle.direito);
    if (direito) ceu.push(direito);
  }
  return ceu;
}

export function calculateRaycastingPOV(player, gameMap) {
  let [wallCollisionList] = calcRaycastingLoop(
    player,
    gameMap
  );

  let wallRectangles = calcularRetangulosParede3D(wallCollisionList, player, gameMap);
  desenharRetangulosParede3D(wallRectangles); //REMOVER
  let ceu = calcularCeu(wallRectangles);
  desenharCeu3D(ceu);
}