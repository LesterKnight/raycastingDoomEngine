export default function calcularPontosIniciaisPiso2D(wallCollisionList, player) {//calcula retas para o piso 2D

    let color = "rgba(255,0,0,0.5"
    const tileRects = new Map();
    let vet = {
      esquerdo: [],
      direito: [],
      cima: [],
      baixo: []
    }
  
  
    for (const [angle, collisionData] of wallCollisionList.entries()) {
      //SE FOR A PRIMEIRA ITERAÇÃO DO OBJETO, INICIALIZA OS VETORES DE RETANGULOS
      if (!tileRects.get(collisionData.tile)) {
        tileRects.set(collisionData.tile, {
          esquerdo: [],
          direito: [],
          cima: [],
          baixo: [],
        });
      }
  
      if (collisionData.tile.verificarColisaoEsquerda(collisionData.colisao))
        tileRects.get(collisionData.tile).esquerdo.push({ angle, collisionData });
      if (collisionData.tile.verificarColisaoDireita(collisionData.colisao))
        tileRects.get(collisionData.tile).direito.push({ angle, collisionData });
      if (collisionData.tile.verificarColisaoAbaixo(collisionData.colisao))
        tileRects.get(collisionData.tile).baixo.push({ angle, collisionData });
      if (collisionData.tile.verificarColisaoAcima(collisionData.colisao))
        tileRects.get(collisionData.tile).cima.push({ angle, collisionData });
  
    }
    for (const [tile, rects] of tileRects.entries()) {
      if (rects.esquerdo.length > 0) {
        let posInicial = rects.esquerdo[0].collisionData.colisao
        let posFinal = rects.esquerdo[rects.esquerdo.length - 1].collisionData.colisao
        for (let i = posInicial.y; i < posFinal.y; i++) {
          if (checkTileCornerCollision(i)) {
            let pos = new Posicao(parseInt(posInicial.x), parseInt(i))
            renderDot2D(pos, color)
            let data = {
              pos,
              tile,
              rects
            }
            vet.esquerdo.push(data)
          }
        }
      }
      if (rects.direito.length > 0) {
        let posInicial = rects.direito[0].collisionData.colisao
        let posFinal = rects.direito[rects.direito.length - 1].collisionData.colisao
        for (let i = posFinal.y; i < posInicial.y; i++) {
          if (checkTileCornerCollision(i)) {
            let pos = new Posicao(parseInt(posInicial.x), parseInt(i))
            renderDot2D(pos, color)
            let data = {
              pos,
              tile,
              rects
            }
            vet.direito.push(data)
          }
        }
      }
  
      if (rects.cima.length > 0) {
        let posInicial = rects.cima[0].collisionData.colisao
        let posFinal = rects.cima[rects.cima.length - 1].collisionData.colisao
        for (let i = posFinal.x; i < posInicial.x; i++) {
          if (checkTileCornerCollision(i)) {
            let pos = new Posicao(parseInt(i), parseInt(posInicial.y))
            renderDot2D(pos, color)
            let data = {
              pos,
              tile,
              rects
            }
            vet.cima.push(data)
          }
        }
      }
  
      if (rects.baixo.length > 0) {
        let posInicial = rects.baixo[0].collisionData.colisao
        let posFinal = rects.baixo[rects.baixo.length - 1].collisionData.colisao
        for (let i = posInicial.x; i < posFinal.x; i++) {
          if (checkTileCornerCollision(i)) {
            let pos = new Posicao(parseInt(i), parseInt(posInicial.y))
            renderDot2D(pos, color)
            let data = {
              pos,
              tile,
              rects
            }
            vet.baixo.push(data)
          }
        }
      }
    }
    return vet
  }

export default function calcularIndexEAngulo(player,relativeAngle) {//calcula indice customizado para objetos fora do loop original
    // 3. Calcular o índice no FOV
    let fovStart = normalizarAngulo(player.angle - RAYCASTING_POV / 2);
    let index = ((relativeAngle - fovStart + 360) % 360) / (RAYCASTING_POV / RAYCASTING_RES);
    return index
      //index: Math.floor(index)  // Arredondando para o índice mais próximo
  }

 export default function checkTileCornerCollision(i) {
    if (parseInt(i) % LARG_TILE == 0)
      return true
    else return false
  }
        //const tileCopy = Object.assign({}, collisionData.tile);