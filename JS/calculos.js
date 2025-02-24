import { Posicao } from "./Classes/Posicao.js";
import{RAYCASTING_POV,RAYCASTING_RES,DEBUG_RAYCASTING_POS_2D, LARG_TILE } from "./config.js"
import { renderRay2D } from "./Render/render2d.js";
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
      (tile.pos.x - pontoColidido.x) * Math.tan(anguloRaioEmRadianos);
  else
    posicaoInterseccaoY =
      pontoColidido.y +
      (tile.pos.x + tile.largura - pontoColidido.x) *
        Math.tan(anguloRaioEmRadianos);

  if (
    posicaoInterseccaoY >= tile.pos.y &&
    posicaoInterseccaoY <= tile.pos.y + tile.altura
  ) {
    let x = ladoEsquerdo ? tile.pos.x : tile.pos.x + tile.largura;
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
      (tile.pos.y - pontoColidido.y) / Math.tan(anguloRaioEmRadianos);
  else
    posicaoInterseccaoX =
      pontoColidido.x +
      (tile.pos.y + tile.altura - pontoColidido.y) /
        Math.tan(anguloRaioEmRadianos);

  if (
    posicaoInterseccaoX >= tile.pos.x &&
    posicaoInterseccaoX <= tile.pos.x + tile.largura
  ) {
    let y = cima ? tile.pos.y : tile.pos.y + tile.altura;
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
export function rayCasting(x0, y0, angulo, raio,int = false) {
  const anguloEmRadianos = angulo * (Math.PI / 180);
  const x = x0 + raio * Math.cos(anguloEmRadianos);
  const y = y0 + raio * Math.sin(anguloEmRadianos);
  if(int){
    return new Posicao(parseInt(x),parseInt(y))
  }
  else
  return new Posicao(x,y);
}
//criar a logica que ira disparar N raios, adiciona-los a coleçao e renderiza-los no fim
export function normalizarAngulo(angulo) {
  return ((angulo % 360) + 360) % 360;
}
export function calcColisaoPrecisa(//NOTA: ORIENTACAO É REFERENTE AO PLAYER
  player,
  angle,
  ray,
  tile,
  wallCollisionList,
) {

  

  if(DEBUG_RAYCASTING_POS_2D)
          renderRay2D(player.pos,ray, "rgba(0,0,0,0.3)")

  let colisao;
  let orientacao = {
    esquerda: false,
    direita: false,
    cima: false,
    baixo: false,
  };

  if (player.pos.y < tile.pos.y) orientacao.cima = true;

  if (player.pos.y > tile.pos.y + tile.altura) orientacao.baixo = true;

  if (player.pos.x < tile.pos.x) orientacao.esquerda = true;

  if (player.pos.x > tile.pos.x + tile.largura) orientacao.direita = true;

  if (orientacao.esquerda || orientacao.direita) {
    colisao = calcularIntersecaoLateral(tile,ray,angle, orientacao.esquerda);//é para saber se é a esquerda e deve inverter
      wallCollisionList.set(angle, { colisao, tile, orientacao });
  }
  if (!colisao && (orientacao.cima || orientacao.baixo)) {
    
    colisao = calcIntersecaoVertical(tile, ray, angle, orientacao.cima);
      wallCollisionList.set(angle, { colisao, tile, orientacao });
  }
    if(!colisao)
      return false;
    
  return colisao;
}

export function calcularEscala(anguloEmGraus) {
  // Converte o ângulo de graus para radianos
  const anguloNormalizado = anguloEmGraus % 90;
  const anguloEmRadianos = anguloNormalizado * (Math.PI / 180);
  
  // Calcula o fator de escala usando a fórmula
  const escala = 1 / (Math.cos(anguloEmRadianos) + Math.sin(anguloEmRadianos));
  
  return Math.min(escala, 1);;
}

export function calculateRotationAngle(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y    ;
  const angle = Math.atan2(dy, dx);
  const targetAngle = Math.PI / 2; // 90 graus em radianos
  return targetAngle - angle;
}

export function rotacionarPontos(a, b, anguloEmGraus, pontoReferencia = {x:250,y:250}) {

  const anguloEmRadianos = anguloEmGraus * (Math.PI / 180);
  function rotacionar(x, y, angulo, px, py) {
    // Translação para o ponto de referência
    const xDeslocado = x - px;
    const yDeslocado = y - py;
    // Rotação
    const xNovo = xDeslocado * Math.cos(angulo) - yDeslocado * Math.sin(angulo);
    const yNovo = xDeslocado * Math.sin(angulo) + yDeslocado * Math.cos(angulo);

    // Translação de volta para o ponto de referência
    return { x: xNovo + px, y: yNovo + py };
  }

  // 3. Rotaciona os pontos a e b em relação ao ponto de referência
  const pontoARotacionado = rotacionar(a.x, a.y, anguloEmRadianos, pontoReferencia.x, pontoReferencia.y);
  const pontoBRotacionado = rotacionar(b.x, b.y, anguloEmRadianos, pontoReferencia.x, pontoReferencia.y);

  return { a: pontoARotacionado, b: pontoBRotacionado };
}

export function recalcularComZoom(ponto,zoomFactor){
  let canvasWidth = 500
  let canvasHeight = 500

  let newCanvasWidth = canvasWidth*zoomFactor
  let newCanvasHeight = canvasHeight*zoomFactor
  let offset = (canvasWidth-newCanvasWidth)/2
  let percentX = ponto.x/canvasWidth
  let percentY = ponto.y/canvasHeight
  let newX = (percentX*newCanvasWidth) + offset
  let newY =(percentY*newCanvasHeight)+offset
  return {x:newX,y:newY}
}
