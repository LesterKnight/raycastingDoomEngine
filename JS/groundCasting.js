import { Posicao } from "./Classes/Posicao.js";
import {
  normalizarAngulo,
  rayCasting,
  calcDistanciaReal,
  calcDistanciaProjetada,
  calcColisaoPrecisa,
} from "./calculos.js";
import {} from "./Render/render2d.js";
import {
  renderRay3D,
  renderDot3D,
  desenharRetangulosParede3D,
  desenharCeu3D,
  renderIMG3D,
  renderPixel3D,
  drawImageWithTransformations
} from "./Render/render3d.js";
import {
  ALT_TILE,
  LARG_TILE,
  CTX_3D,
  ALT_CANVAS,
  LARG_CANVAS,
  DIST_FOCAL,
  RAYCASTING_RES,
  RAYCASTING_POV,
  RAYCASTING_STEP_SIZE,
  MAX_RAYCASTING_SIZE,
  CTX_TMP,
  DEBUG_RAYCASTING_POS_3D,
  CANVASTEMP

} from "./config.js";
import{calcularRetaParede3D} from "./rayCasting.js"



export function calcularGroundCasting( player, angle, rayCastingSize, i,  gameMap) {
  //let pos = calcularRetaParede3D(player,colisao,angle,i);
  let groundCasting = {
    lastGround: null,
    lastGroundFirstPos: null,
    LastGroundLastPos: null,
  };

  for (let j = rayCastingSize + RAYCASTING_STEP_SIZE; j > 0; j--) {
  
    let g = rayCasting(player.pos.x, player.pos.y, angle, j);//raio vai em direção ao player raio 2D

    let ground = gameMap.checkGroundCollision(g);

    if (ground) {
      if (groundCasting.lastGround && groundCasting.lastGround != ground) {//renderiza o traço durante a mudança de traço
//parametros 2D
        
        //renderizar no canvas3d
        //drawImageWithTransformations(groundCasting.lastGroundFirstPos, groundCasting.LastGroundLastPos)


        //calcula first last e renderiza

        //ajustar somente o first pos GERA BURACO 3D, ALTERAR SOMENTE O LAST POS GERA RELEVO!!!!!!!!!!!!!!!!!!!

        let firstPos = calcularRetaParede3D( //raycasting
          player,
          groundCasting.lastGroundFirstPos,
          angle,
          i
        );
        //GERA ALTERACAO DE RELEVO INTERESSANTE
        //let firstPosCorrigido = firstPos.inferior.y + (ALT_TILE * DIST_FOCAL) / rayCastingSize;
        //firstPos.inferior.y = firstPosCorrigido
        let lastPos = calcularRetaParede3D(
          player,
          groundCasting.LastGroundLastPos,
          angle,
          i
        );
        //corrige a perspectiva do last position em relação a tamanho perspectivo
        //let lastPosCorrigido = lastPos.inferior.y + (ALT_TILE * DIST_FOCAL) / rayCastingSize;
        //lastPos.inferior.y = lastPosCorrigido
        //lastPos.inferior.y += 2;

        /*
        renderRay3D(
          firstPos.inferior,
          lastPos.inferior,
          groundCasting.lastGround.cor,
          1
        ); //render ground
      */
  /*
        renderIMG3D(
          firstPos.inferior,
          lastPos.inferior,
          CANVASTEMP,
          2,//
          0,
          0//SHADOW
        );
*/
     
        CTX_TMP.beginPath();
        CTX_TMP.moveTo(firstPos.inferior.x, firstPos.inferior.y);
        CTX_TMP.lineTo(lastPos.inferior.x, lastPos.inferior.y);
        CTX_TMP.stroke();
        CTX_TMP.closePath();


        groundCasting.lastGround = ground;
        groundCasting.lastGroundFirstPos = g//groundCasting.LastGroundLastPos//era g mas mudei para se alinhar com o ultimo anterior, no gaps

        groundCasting.LastGroundLastPos = g;
      } else if (groundCasting.lastGround && groundCasting.lastGround == ground ) {
        //atualiza o last SE CONTINUA NO MESMO PISO
        groundCasting.LastGroundLastPos = g;
        if(j==1){//printa o ultimo elemento
          
          let firstPos = calcularRetaParede3D(
            player,
            groundCasting.lastGroundFirstPos,
            angle,
            i
          );

          let lastPos = calcularRetaParede3D(
            player,
            groundCasting.LastGroundLastPos,
            angle,
            i
          );

          renderRay3D(
            firstPos.inferior,
            lastPos.inferior,
            groundCasting.lastGround.cor,
            1
          ); //render ground
        }
      } else {//para o primeiro ground, nao existe lastGround ainda
        groundCasting.lastGround = ground;
        groundCasting.lastGroundFirstPos = g;
        groundCasting.LastGroundLastPos = g;
      }
    }
  }
}