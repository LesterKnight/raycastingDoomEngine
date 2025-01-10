import { Posicao } from "./Classes/Posicao.js";
import{RAYCASTING_POV,RAYCASTING_RES } from "./config.js"
//calcula intersecção lateral entre o tile e o raycasting
export function calcularIntersecaoLateral(
  tile,
  pontoColidido,
  angle,
  ladoEsquerdo
) {
  const anguloRaioEmRadianos = angle * (Math.PI / 180);
  let posicaoInterseccaoY;

  if (ladoEsquerdo)
    posicaoInterseccaoY =
      pontoColidido.y +
      (tile.posicao.x - pontoColidido.x) * Math.tan(anguloRaioEmRadianos);
  else
    posicaoInterseccaoY =
      pontoColidido.y +
      (tile.posicao.x + tile.largura - pontoColidido.x) *
        Math.tan(anguloRaioEmRadianos);

  if (
    posicaoInterseccaoY >= tile.posicao.y &&
    posicaoInterseccaoY <= tile.posicao.y + tile.altura
  ) {
    let x = ladoEsquerdo ? tile.posicao.x : tile.posicao.x + tile.largura;
    return new Posicao(x, posicaoInterseccaoY);
  }
}
export function calcIntersecaoVertical(tile, pontoColidido, angle, cima) {
  const anguloRaioEmRadianos = angle * (Math.PI / 180);
  let posicaoInterseccaoX;

  //consiste sempre em desenhar uma reta, com um angulo fornecido calcular a distancia da reta ate o ponto b
  if (cima)
    posicaoInterseccaoX =
      pontoColidido.x +
      (tile.posicao.y - pontoColidido.y) / Math.tan(anguloRaioEmRadianos);
  else
    posicaoInterseccaoX =
      pontoColidido.x +
      (tile.posicao.y + tile.altura - pontoColidido.y) /
        Math.tan(anguloRaioEmRadianos);

  if (
    posicaoInterseccaoX >= tile.posicao.x &&
    posicaoInterseccaoX <= tile.posicao.x + tile.largura
  ) {
    let y = cima ? tile.posicao.y : tile.posicao.y + tile.altura;
    //renderColisao({x:posicaoInterseccaoX, y})
    return new Posicao(posicaoInterseccaoX, y);
  }
}
export function calcDistanciaReal(ponto1, ponto2) {//DISTANCIA EUCLIDIANA
  const deltaX = ponto2.x - ponto1.x; // Diferença em x
  const deltaY = ponto2.y - ponto1.y; // Diferença em y
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY); // Fórmula da distância
}
export function anguloRelativo(anguloRaio,anguloCentral){
  return (anguloRaio - anguloCentral) * (Math.PI / 180); // Convertendo para radianos
}
export function calcDistanciaProjetada(distanciaReal, anguloRaio, anguloCentral) {//calcula a distancia da tela do raycasting
  const anguloR = anguloRelativo(anguloRaio,anguloCentral)
  const distanciaProjetada = distanciaReal * Math.cos(anguloR);
  return distanciaProjetada;
}
//cria um raio no plano 2d entre o jogador e um ponto definido
export function rayCasting(x0, y0, angulo, raio) {
  const anguloEmRadianos = angulo * (Math.PI / 180);
  const x = x0 + raio * Math.cos(anguloEmRadianos);
  const y = y0 + raio * Math.sin(anguloEmRadianos);
  return { x, y };
}
//criar a logica que ira disparar N raios, adiciona-los a coleçao e renderiza-los no fim
export function normalizarAngulo(angulo) {
  return ((angulo % 360) + 360) % 360;
}
export function calcDistanciaPerspectiva(distancia) {
  let alturaProjetada, larguraProjetada;
  alturaProjetada = (ALT_TILE * DIST_FOCAL) / distancia;
  larguraProjetada = (ALT_TILE * DIST_FOCAL) / distancia;
  return { alturaProjetada, larguraProjetada };
}
export function calcularIndex(player, colisao) {
  // Usa a função calcularAngle para obter o ângulo relativo entre a posição do jogador e a colisão

  

  let relativeAngle = calcularAngle(player, colisao); 
  // Esperado: O cálculo do ângulo relativo será baseado na diferença das coordenadas. 
  // O ângulo resultante entre o jogador (147, 220) e a colisão (228, 63.96) será aproximadamente 333.6 graus.

  // Calcula o início do FOV e normaliza o valor do ângulo inicial do campo de visão (FOV)
  let fovStart = normalizarAngulo(player.angle - RAYCASTING_POV / 2); 
  // Esperado: O player.angle pode ser, por exemplo, 0, então o FOV começa em 330 graus.
  // fovStart será 330 (0 - 30), representando o início do campo de visão.

  // Calcula o índice diretamente, normalizando o ângulo para o FOV
  let index = ((relativeAngle - fovStart + 360) % 360) / (RAYCASTING_POV / RAYCASTING_RES);
  // Esperado:
  // Se o relativeAngle for aproximadamente 333.6 graus e fovStart for 330, o índice seria calculado como:
  // index = ((333.6 - 330 + 360) % 360) / (60 / 60)
  // index = (3.6 % 360) / 1
  // index = 3.6
  // O índice esperado para esse ângulo seria aproximadamente **3.6**.

  return index;
}


export function calcularAngle(player, P) {
  // Calcula a diferença entre as coordenadas do ponto P e a posição do jogador
  let deltaX = P.x - player.posicao.x;
  let deltaY = P.y - player.posicao.y;

  // Calcula o ângulo entre o jogador e o ponto P em radianos
  let angleToPoint = Math.atan2(deltaY, deltaX);

  // Converte o ângulo para graus
  let angleToPointDegrees = (angleToPoint * 180) / Math.PI;

  // Ajusta o ângulo relativo ao ângulo de visão atual do jogador e normaliza
  let relativeAngle = normalizarAngulo(angleToPointDegrees - player.angle);

  return relativeAngle;
}
