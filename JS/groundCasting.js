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

  for (let j = rayCastingSize + RAYCASTING_STEP_SIZE; j > 0; j = j-RAYCASTING_STEP_SIZE) {
 
    let g = rayCasting(player.pos.x, player.pos.y, angle, j);//raio vai em direção ao player raio 2D
    let ground = gameMap.checkGroundCollision(g);
    if (ground) {
      if (groundCasting.lastGround && groundCasting.lastGround != ground /*&& groundCasting.lastGround.id == 76*/) {//renderiza o traço durante a mudança de traço
          
        let rotatedTempCanvasCoordenadas =  drawImageWithTransformations(groundCasting.lastGroundFirstPos, groundCasting.LastGroundLastPos)

          let firstPos = calcularRetaParede3D( player, groundCasting.lastGroundFirstPos, angle, i );
          let lastPos = calcularRetaParede3D( player, groundCasting.LastGroundLastPos, angle, i   );
          
          CTX_3D.drawImage(
          CANVASTEMP,//source image
          rotatedTempCanvasCoordenadas.a.x,//x source
          rotatedTempCanvasCoordenadas.a.y,//y source
          CANVASTEMP.width/RAYCASTING_RES,//largura origem
          rotatedTempCanvasCoordenadas.b.y - rotatedTempCanvasCoordenadas.a.y, // altura origem
          firstPos.inferior.x,//x destino
          firstPos.inferior.y, // Posição correta da fatia no canvas (altura da projeção 3D)
          LARG_CANVAS/RAYCASTING_RES,// OK largura destino
          lastPos.inferior.y - firstPos.inferior.y // Altura destino
        );
/*
        renderRay3D(
          firstPos.inferior,
          lastPos.inferior,
          groundCasting.lastGround.cor,
          1
        ); //render ground
*/
        //renderDot3D(firstPos.inferior)
        //renderDot3D(lastPos.inferior)

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