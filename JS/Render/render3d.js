import { CTX_3D } from "../config.js";

export function renderRay3D(a, b, color = "rgb(255, 123, 0)") {
  CTX_3D.strokeStyle = color;
  CTX_3D.beginPath();
  CTX_3D.moveTo(a.x, a.y);
  CTX_3D.lineTo(b.x, b.y);
  CTX_3D.stroke();
  CTX_3D.closePath();
}
export function renderDot3D(a) {
  CTX_3D.fillStyle = "red";
  CTX_3D.beginPath();
  CTX_3D.arc(
    a.x,
    a.y,
    8,
    0,
    2 * Math.PI,
    false
  )
  CTX_3D.fill();
  CTX_3D.closePath();
}

export default { renderRay3D,renderDot3D };
