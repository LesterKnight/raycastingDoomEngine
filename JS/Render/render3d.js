import { CTX_3D } from "../config.js";

export function renderRay3D(a, b, color = "rgb(255, 123, 0)") {
  CTX_3D.strokeStyle = color;
  CTX_3D.beginPath();
  CTX_3D.moveTo(a.x, a.y);
  CTX_3D.lineTo(b.x, b.y);
  CTX_3D.stroke();
  CTX_3D.closePath();
}

export default { renderRay3D };
