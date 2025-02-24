import {
  LARG_TILE,
  CTX_3D,
  ALT_CANVAS,
  LARG_CANVAS,
  RAYCASTING_RES,
  GUN,
  WALL,
  DEBUG_FILL_WALL,
  DEBUG_WALL_RECTS,
  DEBUG_DIVIDE_WALL,
  ALT_TILE,
  GND,
  CTX_TMP
} from "../config.js";

import{calcularEscala,
  recalcularComZoom,
  calculateRotationAngle,
  rotacionarPontos

} from "../calculos.js"

export function renderRay3D(a, b, color = "rgb(255, 123, 0)", strokeSize = 1) {
  // Save the current context state
  //CTX_3D.save();

  // Set the stroke style and line width
  CTX_3D.strokeStyle = color;
  CTX_3D.lineWidth = strokeSize;

  // Draw the line
  CTX_3D.beginPath();
  CTX_3D.moveTo(a.x, a.y);
  CTX_3D.lineTo(b.x, b.y);
  CTX_3D.stroke();
  CTX_3D.closePath();

  // Restore the context to its original state
  //CTX_3D.restore();
}
export function renderIMG3D(a, b, image, size, part,shadow = 0) {

const partSize = (LARG_CANVAS / RAYCASTING_RES); // Largura da fatia no canvas
let partSizeExtra = 0

const sliceHeight = image.height; // Altura total da textura

const sx = (part * image.height); // Posição X da fatia na textura
const sy = 0; // Sempre do topo da textura

CTX_3D.drawImage(
  image,
  sx,
  sy,
  size,
  sliceHeight, // Fatia original da textura
  a.x,
  a.y, // Posição correta da fatia no canvas (altura da projeção 3D)
  partSize+partSizeExtra,
  b.y - a.y // Altura total da fatia no plano 3D
);
if(shadow>0){
  CTX_3D.fillStyle = `rgba(0, 0, 0, ${shadow})`;
  CTX_3D.fillRect(a.x, a.y, partSize, b.y - a.y); // (x, y, largura, altura)
}

/*
CTX_3D.drawImage(
  image,    // 1º: Imagem fonte
  sx,       // 2º: Posição X na imagem original (de onde cortar)
  sy,       // 3º: Posição Y na imagem original (de onde cortar)
  sWidth,   // 4º: Largura da fatia na imagem original
  sHeight,  // 5º: Altura da fatia na imagem original
  dx,       // 6º: Posição X no canvas (onde desenhar)
  dy,       // 7º: Posição Y no canvas (onde desenhar)
  dWidth,   // 8º: Largura da fatia no canvas
  dHeight   // 9º: Altura da fatia no canvas
);
*/
}
export function desenharRetangulosParede3D(wallRectangles) {

  //renderiza os trapezios, SEPARAR NO FUTURO
  for (const [tile, trapezios] of wallRectangles.entries()) {
    
    Object.keys(trapezios).forEach((lado) => {
      const trapezio = trapezios[lado];
      let size = trapezio.length; //quantidade de itens em cada trapezio
      
      //identificar a parte nao usada do objeto na matriz
      if (size > 0) {
        if (DEBUG_DIVIDE_WALL) {
          
          for (let i = 0; i < size; i++){
            let pontoAnterior = i==0 ? 0 : trapezio[i-1].percent
            let ponto = trapezio[i].percent
            if(ponto == 0)
              ponto = 0.05
            if(ponto == 1)
              ponto = 0.95
            //console.log(`%c ${ponto}`, `color: ${tile.cor}`);
            let diff = (ponto-pontoAnterior)/LARG_TILE
            //renderDot3D(trapezio[i].inferior,tile.cor,5)
            
            
            
           //console.log(trapezio[i].closeAngle)
           
            renderIMG3D(
              trapezio[i].superior,
              trapezio[i].inferior,
              WALL,
              diff,
              ponto,
              trapezio[i].shadow
            );
          }
        }

        if (DEBUG_FILL_WALL) {

          CTX_3D.beginPath();
          // Define os pontos do quadrado
          CTX_3D.moveTo(trapezio[0].superior.x, trapezio[0].superior.y); // Ponto inicial

          CTX_3D.lineTo(
            trapezio[size - 1].superior.x,
            trapezio[size - 1].superior.y
          );
          CTX_3D.lineTo(
            trapezio[size - 1].inferior.x,
            trapezio[size - 1].inferior.y
          );
          CTX_3D.lineTo(trapezio[0].inferior.x, trapezio[0].inferior.y);
          CTX_3D.lineTo(trapezio[0].superior.x, trapezio[0].superior.y);
          CTX_3D.closePath(); // Fecha o caminho (volta ao ponto inicial)
          // Preenche o quadrado com a cor especificada
          CTX_3D.fillStyle = tile.cor;
          CTX_3D.fill();
        }
        if (DEBUG_WALL_RECTS) {
          let lineWidth = 1
          let color = tile.cor;
          //COLUNAS HORIZONTAIS
          renderRay3D(
            trapezio[0].superior,
            trapezio[size - 1].superior,
            color,
            lineWidth
          );
          renderRay3D(
            trapezio[0].inferior,
            trapezio[size - 1].inferior,
            color,
            lineWidth
          );
          //COLUNAS VERTICAIS
          renderRay3D(
            trapezio[0].superior,
            trapezio[0].inferior,
            color,
            lineWidth
          );
          renderRay3D(
            trapezio[size - 1].superior,
            trapezio[size - 1].inferior,
            color,
            lineWidth
          );
        }

      }
    });
  }
}
export function renderDot3D(a, color = "red", size = 2) {
  CTX_3D.fillStyle = color;
  CTX_3D.beginPath();
  CTX_3D.arc(a.x, a.y, size, 0, 2 * Math.PI, false);
  CTX_3D.fill();
  CTX_3D.closePath();
}
export function renderPixel3D(a, color = "red", size_x = 1, size_y = 1) {
  CTX_3D.fillStyle = color;
  CTX_3D.fillRect(a.x, a.y, size_x, size_y);
}
export function screenBlanking3D() {
  CTX_3D.fillStyle = "white";
  CTX_3D.fillRect(0, 0, LARG_CANVAS, ALT_CANVAS);
}
export function desenharCeu3D(ceu) {
  if (ceu.length > 0) {
    // Ordenar ceu por x
    ceu.sort((a, b) => a.inicial.superior.x - b.inicial.superior.x);

    CTX_3D.beginPath();
    CTX_3D.moveTo(ceu[0].inicial.superior.x, ceu[0].inicial.superior.y);

    ceu.forEach((ceuParcial) => {
      CTX_3D.lineTo(
        ceuParcial.inicial.superior.x,
        ceuParcial.inicial.superior.y
      );
      CTX_3D.lineTo(ceuParcial.final.superior.x, ceuParcial.final.superior.y);
    });

    const ultimoCeuParcial = ceu[ceu.length - 1];
    CTX_3D.lineTo(ultimoCeuParcial.final.superior.x, 0);
    CTX_3D.lineTo(ceu[0].inicial.superior.x, 0);
    CTX_3D.lineTo(ceu[0].inicial.superior.x, ceu[0].inicial.superior.y);
    CTX_3D.closePath();
    CTX_3D.fillStyle = "rgb(25, 5, 58)";
    CTX_3D.fill();
  }
}
export function renderGun() {
  let originalWidth = GUN.width;
  let originalHeight = GUN.height;

  let scaledWidth = originalWidth * 0.6;
  let scaledHeight = originalHeight * 0.6;

  CTX_3D.drawImage(GUN, 120, 320, scaledWidth, scaledHeight); // Draw the image at coordinates (0, 0)
}
export function drawImageWithTransformations(a,b) {

  let zoom = 0

  let ctx = CTX_TMP
  let img = GND

  let rotateRad = calculateRotationAngle(a,b)
  let rotateGradius = rotateRad / (Math.PI / 180)
  rotateGradius = rotateGradius<0 ? rotateGradius+360 : rotateGradius
  zoom = calcularEscala(rotateGradius)

  // Calcula o centro do canvas
  const centerX = LARG_CANVAS / 2;
  const centerY = ALT_CANVAS / 2;
  // Move a origem para o centro do canvas

  ctx.clearRect(0, 0, LARG_CANVAS, ALT_CANVAS);

  ctx.translate(centerX, centerY); // Mover a origem para o centro
  ctx.rotate(rotateRad); // Aplica a rotação em radianos
  ctx.scale(zoom, zoom); // Aplica o zoom
  ctx.drawImage(img, -img.width / 2, -img.height / 2); // Coloca a imagem centralizada

  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reseta qualquer transformação anterior

/*
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();


  ctx.strokeStyle = "blue";
  //const newPos = recalcularComZoom(a, b, zoom)
*/
  const newA = recalcularComZoom(a,zoom)
  const newB = recalcularComZoom(b,zoom)
/*
  ctx.beginPath();
  ctx.moveTo(newA.x, newA.y);
  ctx.lineTo(newB.x, newB.y);
  ctx.stroke();

  
  ctx.strokeStyle = "green";

  
  ctx.beginPath();
  ctx.moveTo(newPosRotated.a.x, newPosRotated.a.y);
  ctx.lineTo(newPosRotated.b.x, newPosRotated.b.y);
  ctx.stroke();
  */
  const newPosRotated = rotacionarPontos(newA, newB, rotateGradius)

  //var imageData = ctx.getImageData(newA.x,newA.y,2,newB.y-newA.y);

  //return imageData
}
