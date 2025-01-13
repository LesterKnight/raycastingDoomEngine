import { COMP_SALA, LARG_SALA, DIST_TETO, DIST_PISO } from "./config.js";
import { Player } from "./Classes/Player.js";
import { GameMap } from "./Classes/GameMap.js";
import { calculateRaycastingPOV } from "./rayCasting.js";
import { renderGame ,initMap} from "./functions.js";

const gameMap = new GameMap(
  LARG_SALA,
  COMP_SALA,
  DIST_TETO,
  DIST_PISO,
  "mapa_inicial"
);
const player = new Player(220, 138, 269);
initMap(gameMap)
function f() {
  renderGame(player, gameMap);
  requestAnimationFrame(f);
}
document.addEventListener("keydown", (event) => {
  const key = event.key;

  switch (key) {
    case "ArrowUp":
      event.preventDefault();
      player.moverFrente();
      break;
    case "ArrowDown":
      event.preventDefault();
      player.moverTras();
      break;
    case "ArrowLeft":
      event.preventDefault();
      player.girarEsquerda();
      break;
    case "ArrowRight":
      event.preventDefault();
      player.girarDireita();
      break;
    case "Control":
      calculateRaycastingPOV(player, gameMap);
      break;
    default:
      break;
  }
});

f();
