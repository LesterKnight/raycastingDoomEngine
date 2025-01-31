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
  calcularIndexEAngulo,
  calcularIndex,
} from "./calculos.js";
import {
  renderColisao,
  renderRay2D,
  renderDot2D,
  renderGround,
  renderTileGround,
} from "./Render/render2d.js";
import {
  renderRay3D,
  renderDot3D,
  desenharRetangulosParede3D,
  desenharCeu3D,
  desenharChao3D
} from "./Render/render3d.js";
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
  DEBUG_RAYCASTING_POS_2D,
} from "./config.js";
import { Tile } from "./Classes/Tile.js";

function calcRaycastingLoop(player, gameMap) {
  //calcula o loop para cada angulo adjacente desde o ponto zero ate N e retorna PONTOS COLIDIDOS PLANO 2D
  let wallCollisionList = new Map();
  let groundCollisionList = new Map();
  let groundCollisionListTemp = new Map();
  let angle = player.angle;
  let ray;







//----------------------------------------------
       
        const halfvres = CANVAS3D.height / 2; // Metade da altura do canvas
        const FOV = RAYCASTING_POV * (Math.PI / 180); // Convertendo para radianos
        let rotation = player.angle * Math.PI / 180;
        let nerfFactor = 0.2; // Fator de redução (ajuste conforme necessário)
        let posx = player.pos.x * nerfFactor; // Posição X do jogador nerfada
        let posy = player.pos.y * nerfFactor; // Posição Y do jogador nerfada
//----------------------------------------------
  

  for (let i = 0; i < RAYCASTING_RES; i++) {
    let rayCastingSize = 0;
    angle = normalizarAngulo(
      player.angle - RAYCASTING_POV / 2 + (RAYCASTING_POV / RAYCASTING_RES) * i
    );

    


    



//----------------------------------------------
let angleFloor = rotation + ((i / RAYCASTING_RES - 0.5) * FOV);
let sin = Math.sin(angleFloor);
let cos = Math.cos(angleFloor);
let cos2 = Math.cos((i / RAYCASTING_RES - 0.5) * FOV); // Corrige fisheye
//----------------------------------------------





    while (rayCastingSize < MAX_RAYCASTING_SIZE) {
      ray = rayCasting(player.pos.x, player.pos.y, angle, rayCastingSize);
      
      let tile = gameMap.checkTileCollision(ray);
/*
      let tileCorner = false
      if(parseInt(ray.x) % LARG_TILE == 0 && parseInt(ray.y) % ALT_TILE == 0){
        tileCorner = true
        groundCollisionListTemp.set(`${parseInt(ray.x)},${parseInt(ray.y)}`, ray);
      }
      else if((parseInt(ray.x) % LARG_TILE == LARG_TILE / 2 && parseInt(ray.y) % ALT_TILE == ALT_TILE / 2))
        groundCollisionListTemp.set(`${parseInt(ray.x)},${parseInt(ray.y)}`, ray);
   */     
      if (tile) {
        let colisao = calcColisaoPrecisa(player,angle,ray,tile,wallCollisionList)

        if (colisao){
        //----------------------------------------------
        let test = calcularRetaParede3D(player,colisao,angle,i)
        test.superior.y//
  
          // Desenhando os raios no chão, -20 corta o horizonte
          for (let j = 0; j < test.superior.y; j+=3) {
              let distance = halfvres / (halfvres - j) / cos2;
              let x = posx + cos * distance;
              let y = posy + sin * distance;

              let color = (Math.floor(x) % 2 === Math.floor(y) % 2) ? "black" : "green";
              CTX_3D.fillStyle = color;//250 no eixo y

                      // Desmembrando o fillRect em variáveis
              let rectX = i * (LARG_CANVAS / RAYCASTING_RES); // Posição X do retângulo

              let rectY = ALT_CANVAS - (halfvres + j) + halfvres; // Posição Y do retângulo

              let rectWidth = LARG_CANVAS / RAYCASTING_RES; // Largura do retângulo
              let rectHeight = 1; // Altura do retângulo
              CTX_3D.fillRect(rectX, rectY, rectWidth*3, rectHeight*3);

          }


        //----------------------------------------------

        }
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
  for (const [pos, ray] of groundCollisionListTemp.entries()) {
    for (const [pos, tile] of gameMap.ground.entries()) {
      tile.atualizarFlagColisao(ray);
    }
  }

  let vetParcial = [];
  //WIP
  for (const [pos, tile] of gameMap.ground.entries()) {
    if (tile.allFlags()) {
      renderTileGround(tile.pos, tile, true);
      renderTile(player, tile);
      tile.resetAllFlags();
      //groundCollisionList.set(tile.pos,tile) FINAL
    } else if (tile.someFlags()) {
      renderTileGround(tile.pos, tile, false, "rgba(0,0,255,0.3");
      vetParcial.push(tile);
    }
  }

  vetParcial.sort((a, b) => {
    const distanciaA = calcDistanciaReal(player.pos, a.pos);
    const distanciaB = calcDistanciaReal(player.pos, b.pos);
    return distanciaB - distanciaA;
  });

  calcularTilesParciais(vetParcial, wallCollisionList, gameMap, player);
  








*/
  return [wallCollisionList, groundCollisionList];
}


function calcularTilesParciais(vetParcial, wallCollisionList, gameMap, player) {

  vetParcial.forEach(tile => {
      






    let lados = {
      esquerda: [],
      direita: [],
      cima: [],
      baixo: [],
    };
    function classificarColisao(tile, lados, colisao, angle) {
      if (tile.verificarColisao(colisao)) {
        if (tile.verificarColisaoAcima(colisao))
          lados.cima.push({ posicao: colisao, angle, inicial: true });
        else if (tile.verificarColisaoAbaixo(colisao))
          lados.baixo.push({ posicao: colisao, angle, inicial: true });
        else if (tile.verificarColisaoDireita(colisao))
          lados.direita.push({ posicao: colisao, angle, inicial: true });
        else if (tile.verificarColisaoEsquerda(colisao))
          lados.esquerda.push({ posicao: colisao, angle, inicial: true });
      }
    }

    function calcGroundRaycasting(element) {
      //renderDot2D(element.posicao, "blue");

      let rayCastingSize = 0;
      let previousPos;
      const diagonal = Math.ceil(Math.sqrt(2 * Math.pow(ALT_TILE, 2)));
      while (rayCastingSize < diagonal) {
        //limita raycasting ao quadrado
        let ray = rayCasting(
          element.posicao.x,
          element.posicao.y,
          element.angle + 180,
          rayCastingSize++,
          true
        );
        if (tile.verificarColisao(ray)) {
          previousPos = ray;
        } else break;
      }
      //renderDot2D(previousPos, "pink");
      return previousPos;
    }

    for (const [angle, collisions] of wallCollisionList.entries()) {
      classificarColisao(tile, lados, collisions.colisao, angle);
    }

    lados.esquerda.forEach((element) => {
      if (element.inicial) {
        let previousPos = calcGroundRaycasting(element);
        classificarColisao(tile, lados, previousPos, element.angle);
      }
    });

    lados.direita.forEach((element) => {
      if (element.inicial) {
        let previousPos = calcGroundRaycasting(element);
        classificarColisao(tile, lados, previousPos, element.angle);
      }
    });

    lados.cima.forEach((element) => {
      if (element.inicial) {
        let previousPos = calcGroundRaycasting(element);
        classificarColisao(tile, lados, previousPos, element.angle);
      }
    });

    lados.baixo.forEach((element) => {
      if (element.inicial) {
        let previousPos = calcGroundRaycasting(element);
        classificarColisao(tile, lados, previousPos, element.angle);
      }
    });

    lados.esquerda.sort((a, b) => a.posicao.y - b.posicao.y);
    lados.direita.sort((a, b) => a.posicao.y - b.posicao.y);
    lados.cima.sort((a, b) => a.posicao.x - b.posicao.x);
    lados.baixo.sort((a, b) => a.posicao.x - b.posicao.x);

    let tamanhoEsquerda = lados.esquerda.length
    let tamanhoDireita = lados.direita.length
    let tamanhoCima = lados.cima.length
    let tamanhoBaixo = lados.baixo.length
    
    let pontos = [];
    if (tamanhoEsquerda > 0) {
      pontos.push(lados.esquerda[tamanhoEsquerda-1])
      pontos.push(lados.esquerda[0])
    }

    if (tamanhoCima > 0) {
      pontos.push(lados.cima[0])
      pontos.push(lados.cima[tamanhoCima-1])
    }



    if (tamanhoDireita > 0) {
      pontos.push(lados.direita[0])
      pontos.push(lados.direita[tamanhoDireita-1])
    }

    if (tamanhoBaixo > 0) {
      pontos.push(lados.baixo[0])
      pontos.push(lados.baixo[tamanhoBaixo-1])
    }


    if (tamanhoEsquerda > 0) {
      let zero = calcularReta3DPiso(player, lados.esquerda[0].posicao);
      renderDot2D(lados.esquerda[0].posicao, "green");
      let final = calcularReta3DPiso(player, lados.esquerda[tamanhoEsquerda - 1].posicao);
      renderDot2D(lados.esquerda[tamanhoEsquerda - 1].posicao, "green");
      renderRay3D(zero, final, "green", 3);
  }
  
  if (tamanhoDireita > 0) {
      let zero = calcularReta3DPiso(player, lados.direita[0].posicao);
      renderDot2D(lados.direita[0].posicao, "blue");
      let final = calcularReta3DPiso(player, lados.direita[tamanhoDireita - 1].posicao);
      renderDot2D(lados.direita[tamanhoDireita - 1].posicao, "blue");
      renderRay3D(zero, final, "blue", 3);
  }
  
  if (tamanhoCima > 0) {
      let zero = calcularReta3DPiso(player, lados.cima[0].posicao);
      renderDot2D(lados.cima[0].posicao, "purple");
      let final = calcularReta3DPiso(player, lados.cima[tamanhoCima - 1].posicao);
      renderDot2D(lados.cima[tamanhoCima - 1].posicao, "purple");
      renderRay3D(zero, final, "purple" ,3);
  }
  
  if (tamanhoBaixo > 0) {
      let zero = calcularReta3DPiso(player, lados.baixo[0].posicao);
      renderDot2D(lados.baixo[0].posicao, "yellow");
      let final = calcularReta3DPiso(player, lados.baixo[tamanhoBaixo - 1].posicao);
      renderDot2D(lados.baixo[tamanhoBaixo - 1].posicao, "yellow");
      renderRay3D(zero, final, "yellow",3);
  }
  
})







  vetParcial.forEach((tile) => {
    tile.resetAllFlags();
  });

    


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
function calcularRetangulosParede3D(wallCollisionList, player) {
  //calcula os retangulos usando as retas geradas acima  //calcula as retas projetadas em 3D

  let index = 0;
  const wallRectangles = new Map();
  const replica = []; //cada vez que ele ja estiver inserido mas nao for o ultimo, cria uma nova replca
  let lastElement = null;
  for (const [angle, collisions] of wallCollisionList.entries()) {
    let collisionData = collisions;

    let pos = calcularRetaParede3D(
      player,
      collisionData.colisao,
      angle,
      index++
    );

    if (DEBUG_RAYCASTING_POS_3D)
      renderRay3D(pos.superior, pos.inferior, collisionData.tile.cor);

    const lastPosicao =
      replica.length > 0 &&
      replica[replica.length - 1].pos == collisionData.tile.pos;

    //SE FOR A PRIMEIRA ITERAÇÃO DO OBJETO, INICIALIZA OS VETORES DE RETANGULOS
    if (!wallRectangles.get(collisionData.tile)) {
      wallRectangles.set(collisionData.tile, {
        esquerdo: [],
        direito: [],
        cima: [],
        baixo: [],
      });
    } else if (
      wallRectangles.get(collisionData.tile) &&
      collisionData.tile != lastElement &&
      !lastPosicao
    ) {
      const tileCopy = new Tile(
        collisionData.tile.pos.x,
        collisionData.tile.pos.y
      );
      tileCopy.altura = collisionData.tile.altura;
      tileCopy.largura = collisionData.tile.largura;
      tileCopy.pos = collisionData.tile.pos;
      tileCopy.cor = collisionData.tile.cor;

      replica.push(tileCopy);
      collisionData.tile = tileCopy; //
      wallRectangles.set(collisionData.tile, {
        esquerdo: [],
        direito: [],
        cima: [],
        baixo: [],
      });
    } else if (
      wallRectangles.get(collisionData.tile) &&
      collisionData.tile != lastElement
    ) {
      if (
        replica.length > 0 &&
        replica[replica.length - 1].pos == collisionData.tile.pos
      ) {
        collisionData.tile = replica[replica.length - 1];
      }
    }

    lastElement = collisions.tile;

    if (collisionData.tile.verificarColisaoEsquerda(collisionData.colisao))
      wallRectangles.get(collisionData.tile).esquerdo.push(pos);
    if (collisionData.tile.verificarColisaoDireita(collisionData.colisao))
      wallRectangles.get(collisionData.tile).direito.push(pos);
    if (collisionData.tile.verificarColisaoAbaixo(collisionData.colisao))
      wallRectangles.get(collisionData.tile).baixo.push(pos);
    if (collisionData.tile.verificarColisaoAcima(collisionData.colisao))
      wallRectangles.get(collisionData.tile).cima.push(pos);
  }

wallRectangles.forEach((element,tile) => {

  let tamanhoDireito = element.direito.length
  let tamanhoCima = element.cima.length
  let tamanhoEsquerdo = element.esquerdo.length
  let tamanhoBaixo = element.baixo.length

  
function fecharLados(ladoA,ladoB){
  let tamanhoA = ladoA.length
  let tamanhoB = ladoB.length
  if(tamanhoA>0 && tamanhoB>0){
      let lastA = ladoA[tamanhoA-1]
      let firstB= ladoB[0]
    
      let superior = new Posicao(
        (lastA.superior.x + firstB.superior.x)/2,
        (lastA.superior.y + firstB.superior.y)/2
      )
  
      let inferior = new Posicao(
        (lastA.inferior.x + firstB.inferior.x)/2,
        (lastA.inferior.y + firstB.inferior.y)/2
      )
      return {inferior,superior} 
  }
}

if(tamanhoEsquerdo>10 && tamanhoBaixo>10){
  let media = fecharLados(element.esquerdo , element.baixo)
  element.esquerdo[tamanhoEsquerdo-1] = media
  element.baixo[0] = media
}

if(tamanhoBaixo>10 && tamanhoDireito>10){
  let media = fecharLados(element.baixo , element.direito)
  element.baixo[tamanhoBaixo-1] = media
  element.direito[0] = media
}

if(tamanhoDireito>10 && tamanhoCima>10){
  let media = fecharLados(element.direito , element.cima)
  element.direito[tamanhoDireito-1] = media
  element.cima[0] = media
}

if(tamanhoCima>10 && tamanhoEsquerdo>10){
  let media = fecharLados(element.cima , element.esquerdo)
  element.cima[tamanhoCima-1] = media
  element.esquerdo[0] = media
}
  
});

  return wallRectangles;

}
function calcularReta3DPiso(player, posicao) {
  let angle = calcularAnguloAB(player, posicao);
  let angle2 = normalizarAngulo(player.angle + angle);
  let index = calcularIndexEAngulo(player, angle2); //?????????????????????????????????w
  let pos = calcularRetaParede3D(player, posicao, angle2, index);

  if (DEBUG_GROUND_POS_2D) renderDot2D(posicao, "blue");
  if (DEBUG_GROUND_POS_3D) renderDot3D(pos.inferior, "blue");

  return pos.inferior;
}

function renderTile(player, tile) {
  //TILE JA POSSUI MEDIDAS
  let p0, p1, p2, p3;
  p0 = tile.collisionFlags.p0;
  p1 = tile.collisionFlags.p1;
  p2 = tile.collisionFlags.p2;
  p3 = tile.collisionFlags.p3;
  //CONSERTAR E REMOVER OBJ
  p0 = calcularReta3DPiso(player, p0);
  p1 = calcularReta3DPiso(player, p1);
  p2 = calcularReta3DPiso(player, p2);
  p3 = calcularReta3DPiso(player, p3);
  // criar um raycasting do primeiro e do ultimo raio que disparem ate o objeto, caso algum dos lados do objeto esteja fora do raycasting, sera ajustado
  renderRay3D(p0, p1);
  renderRay3D(p0, p2);
  renderRay3D(p2, p3);
  renderRay3D(p3, p1);
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

function calcularChao(wallRectangles) {
  let chao = [];
  for (const [tile, wallRectangle] of wallRectangles.entries()) {
    let baixo = calcularCeuParcial(wallRectangle.baixo);
    if (baixo) chao.push(baixo);

    let cima = calcularCeuParcial(wallRectangle.cima);
    if (cima) chao.push(cima);

    let esquerdo = calcularCeuParcial(wallRectangle.esquerdo);
    if (esquerdo) chao.push(esquerdo);

    let direito = calcularCeuParcial(wallRectangle.direito);
    if (direito) chao.push(direito);
  }
  return chao;
}


export function calculateRaycastingPOV(player, gameMap) {
  //calcula o loop de raios de raycasting 2D, calcula as retas projetadas em 3D, usa as retas para formar retangulos em 3D na tela
  let [wallCollisionList, groundCollisionList] = calcRaycastingLoop(
    player,
    gameMap
  );

  let wallRectangles = calcularRetangulosParede3D(wallCollisionList, player);
  desenharRetangulosParede3D(wallRectangles); //REMOVER
  let ceu = calcularCeu(wallRectangles);
  desenharCeu3D(ceu);
  //let chao = calcularChao(wallRectangles);
  //desenharChao3D(ceu);
}