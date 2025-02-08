import {
  ALT_TILE,
  LARG_TILE,
  COMP_SALA,
  LARG_SALA,
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
  GUN,
  WALL,
  DEBUG_FILL_WALL,
  DEBUG_WALL_RECTS,
  DEBUG_DIVIDE_WALL,
} from "../config.js";
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

export function renderIMG3D(a, b, image, numberOfParts, part) {
  const newWidth = numberOfParts * (LARG_CANVAS / RAYCASTING_RES);
  const newHeight = b.y - a.y;
  const currentPart = part % numberOfParts;
  const imgHeight = image.height;
  const sliceWidth = image.width / numberOfParts; // Largura de cada fatia
  const sliceHeight = imgHeight; // Altura total da imagem

  // Calculando a posição x da fatia atual
  const sx = currentPart * sliceWidth;
  const sy = 0;

  CTX_3D.drawImage(
    image,
    sx,
    sy,
    sliceWidth,
    sliceHeight,
    currentPart * sliceWidth,
    0,
    sliceWidth,
    sliceHeight
  );

  
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
  CTX_3D.fillStyle = "pink";
  CTX_3D.fillRect(0, 0, LARG_CANVAS, ALT_CANVAS);
}
export function desenharRetangulosParede3D(wallRectangles) {
  //renderiza os trapezios, SEPARAR NO FUTURO
  for (const [tile, trapezios] of wallRectangles.entries()) {
    Object.keys(trapezios).forEach((lado) => {
      const trapezio = trapezios[lado];
      let size = trapezio.length;
      if (size > 0) {
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
          let lineWidth = 1;
          let color = "black";
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

        if (DEBUG_DIVIDE_WALL) {
          //renderRay3D(trapezio[0].superior,trapezio[0].inferior,"red",2)
          for (let i = 0; i < size; i++)
            renderIMG3D(
              trapezio[i].superior,
              trapezio[i].inferior,
              WALL,
              size,
              i
            );
        }
      }
    });
  }
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

export function desenharChao3D(chao) {
  if (chao.length > 0) {
    // Ordenar ceu por x
    chao.sort((a, b) => a.inicial.inferior.x - b.inicial.inferior.x);

    CTX_3D.beginPath();
    CTX_3D.moveTo(chao[0].inicial.inferior.x, chao[0].inicial.inferior.y);

    chao.forEach((chaoParcial) => {
      CTX_3D.lineTo(
        chaoParcial.inicial.inferior.x,
        chaoParcial.inicial.inferior.y
      );
      CTX_3D.lineTo(chaoParcial.final.inferior.x, chaoParcial.final.inferior.y);
    });

    const ultimoChaoParcial = chao[chao.length - 1];
    CTX_3D.lineTo(ultimoChaoParcial.final.inferior.x, ALT_CANVAS);
    CTX_3D.lineTo(chao[0].inicial.inferior.x, ALT_CANVAS);
    CTX_3D.lineTo(chao[0].inicial.inferior.x, chao[0].inicial.inferior.y);
    CTX_3D.closePath();
    CTX_3D.fillStyle = "rgba(0,0,0,0.05)";
    CTX_3D.fill();
  }
}
export function renderGun() {
  let originalWidth = GUN.width;
  let originalHeight = GUN.height;

  let scaledWidth = originalWidth * 0.8;
  let scaledHeight = originalHeight * 0.8;

  CTX_3D.drawImage(GUN, 0, 200, scaledWidth, scaledHeight); // Draw the image at coordinates (0, 0)
}
