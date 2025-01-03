import { Posicao } from "./Classes/Posicao.js";
import {
  calcularIntersecaoLateral,
  calcIntersecaoVertical,
  normalizarAngulo,
  rayCasting,
  calcDistanciaReal,
  calcDistanciaProjetada,
  anguloRelativo,
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
//calcula o loop de raios de raycasting 2D, calcula as retas projetadas em 3D, usa as retas para formar retangulos em 3D na tela
export function calculateRaycastingPOV(player, gameMap) {
  let index = 0;
  //calcula o loop de raios de raycasting 2D
  const wallCollisionList = calcRaycastingLoop(player, gameMap);
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




  calcGrid(player,wallCollisionList, wallRectangles);
}














export function calcGrid(player,wallCollisionList, wallRectangles) {

  let retas = [];
  for (const  [angulo, collisionData] of wallCollisionList.entries()) {


    let diferente = false
    if(retas.length>0){
      diferente = retas[retas.length - 1].tileColidido != collisionData.tileColidido
    }
    
    //DETECCAO DOS PONTOS NO EIXO X
    if ( retas.length == 0 || diferente) {
      retas.push({ tileColidido: collisionData.tileColidido, colisaoInicial:collisionData.colisao, colisaoFinal:collisionData.colisao});
        
      if (collisionData.orientacao.baixo) {
        retas[retas.length - 1].colisaoInicial = collisionData.colisao;
      }
    }
    else {
      if (collisionData.orientacao.baixo) {
        retas[retas.length - 1].colisaoFinal = collisionData.colisao;
      }
    }
  }
//CALCULO E RENDERIZACAO CONTEXTO AINDA 2D

let colisoesNaReta=[]




function renderP(colisao,retas){
  //uma vez que temos a reta e temos o jogador, podemos efetuar um unico calculo de raycasting
   //rayCasting(player.posicao.x, player.posicao.y)

   renderRay(player.posicao,colisao, "blue")
   renderRay(player.posicao,colisao, "blue")
   renderRay(player.posicao,colisao, "blue")
   renderRay(player.posicao,colisao, "blue")



   let distanciaReal = calcDistanciaReal(player.posicao, colisao);
   //precisamos calcular o angulo em relacao ao jogador em vez de calcular altura ou largura pois o angulo seria fornecido pelo raycasting
   //para isso, iremos triangular o jogador com um ponto reto em direção ao eixo x tendo P0 colisao, p1 jogador na reta e p2 como jogador
   //let p1 = {x: player.posicao.x, y:colisao.distancia.y} funçao atan desprezou P1
   //agora que temos uma reta, precisamos calcular o angulo gerado 
   function tangenteReversa(pontoOrigem,pontoDestino){
     const deltaY = pontoDestino.y-pontoOrigem.y
     const deltaX = pontoDestino.x-pontoOrigem.x
     const angulo = Math.atan2(deltaY,deltaX)
     const anguloEmGraus = angulo * (180/Math.PI)
     return anguloEmGraus
   }//o calculo atan localiza o angulo, ao contrario da tangente que localiza o comprimento usando o angulo em RAD

let angle = tangenteReversa(player.posicao,colisao)
   let distanciaProjetada = calcDistanciaProjetada(
     distanciaReal,
     angle,
     player.angle
   );


 let a = {
   x0:retas[0].colisaoInicial.x,
   x1:retas[retas.length-1].colisaoFinal.x
 }

 let b = {
   x0:0,
   x1:LARG_CANVAS
 }


 function calcularPosicaoProporcional(ponto, retaA, retaB) {
   // Calcula a posição relativa do ponto na reta A
   const posicaoRelativa = (ponto.x - retaA.x0) / (retaA.x1 - retaA.x0);
   // Calcula o ponto correspondente na reta B
   const pontoCorrespondente = posicaoRelativa * (retaB.x1 - retaB.x0) + retaB.x0;
   return pontoCorrespondente;
}

let p = calcularPosicaoProporcional(colisao,a,b)

 let posX, posYtop, posYinf;
 let comprimentoVertical = (ALT_TILE * DIST_FOCAL) / distanciaProjetada;
 //posX = (index / RAYCASTING_RES) * LARG_CANVAS;//DIVIDE O CANVAS em 60 partes e determina o x usando um slice posX = (index / RAYCASTING_RES) * LARG_CANVAS;
 posYtop = ALT_CANVAS / 2 - comprimentoVertical;
 posYinf = ALT_CANVAS / 2 + comprimentoVertical;
renderDot3D({x:p,y:posYinf})

}
  
//-------------------------------------------------------------------------------------------------------------------------------------------
  for (let i = 0; i < retas.length; i++) {
    //if (retas[i].c0 && retas[i].c1) {
      for (
        let j = parseInt(retas[i].colisaoInicial.x);//ADICIONAR -1
        j < parseInt(retas[i].colisaoFinal.x);
        j++
      ) {
        if (j % LARG_TILE == 0) {
          //renderDot2D({ x: linhasVerticais[i].c0.x, y: j });//UTIL
          renderDot2D({ x: j, y: retas[i].colisaoInicial.y });
          colisoesNaReta.push({ x: j, y: retas[i].colisaoInicial.y })

        }
      }
    }


    colisoesNaReta.forEach((colisao, indice) => {
      renderP(colisao,retas,wallRectangles)
  });


console.log(wallRectangles)











}

export default { rayCasting, calculateRaycastingPOV };
