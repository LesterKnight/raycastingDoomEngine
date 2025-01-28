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
} from "../config.js";
export function renderRay3D(a, b, color = "rgb(255, 123, 0)", strokeSize = 1) {
  // Save the current context state
  CTX_3D.save();

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
  CTX_3D.restore();
}

export function renderDot3D(a, color = "red") {
  CTX_3D.fillStyle = color;
  CTX_3D.beginPath();
  CTX_3D.arc(a.x, a.y, 8, 0, 2 * Math.PI, false);
  CTX_3D.fill();
  CTX_3D.closePath();
}

export function desenharRetangulosParede3D(wallRectangles) {
  //renderiza os trapezios, SEPARAR NO FUTURO

  for (const [tile, trapezios] of wallRectangles.entries()) {
    Object.keys(trapezios).forEach((lado) => {
      const trapezio = trapezios[lado];
      let size = trapezio.length;
      if (size > 0) {
        //COLUNAS HORIZONTAIS
        renderRay3D(trapezio[0].superior, trapezio[size - 1].superior);
        renderRay3D(trapezio[0].inferior, trapezio[size - 1].inferior);
        //COLUNAS VERTICAIS
        renderRay3D(trapezio[0].superior, trapezio[0].inferior);
        renderRay3D(trapezio[size - 1].superior, trapezio[size - 1].inferior);
        /*
               //CRIA UM X NAS CAIXAS
               if (tile.altura == ALT_TILE && tile.largura == LARG_TILE) {
                 renderRay3D(trapezio[0].superior, trapezio[size - 1].inferior);
                 renderRay3D(trapezio[0].inferior, trapezio[size - 1].superior);
               }
        */
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

export function screenBlanking3D() {
  CTX_3D.clearRect(0, 0, CANVAS2D.width, CANVAS2D.height);
}
