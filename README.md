# raycastingDoomEngine

Este repositório documenta o desenvolvimento de um sistema de renderização baseado em raycasting e projeção em pseudo-3D, explorando conceitos fundamentais para a criação de um ambiente interativo.

Índice

Introdução

Estrutura do Sistema

Conceitos Fundamentais

Desafios e Soluções

Funcionalidades Implementadas

Próximos Passos

Introdução

O projeto utiliza técnicas de raycasting para construir uma visualização tridimensional em um ambiente 2D, permitindo a renderização dinâmica de paredes e pisos baseados em posições e ângulos do jogador.

Estrutura do Sistema

Paredes: Renderizadas utilizando raycasting para determinar a distância de colisão e projetadas com base no campo de visão do jogador.

Piso: Renderizado utilizando projeções em perspectiva para criar uma sensação de profundidade, baseado nas linhas de base das paredes.

Grid: Planejado para representar os tiles do piso com base em linhas calculadas dinamicamente.

Conceitos Fundamentais

Raycasting: Técnica usada para determinar os pontos de interseção entre um feixe de luz (raio) e objetos no ambiente.

Projeção em Perspectiva: Método para ajustar a escala e posição de objetos no canvas com base em suas distâncias ao jogador.

Distância Projetada: Distância ajustada considerando o ângulo entre o raio lançado e o campo de visão do jogador.

Campo de Visão (FOV): Definido em 60 graus para este projeto, mas configurável.

Altura do Jogador: Importante para determinar a posição do horizonte e ajustar a perspectiva do piso.

Distância Focal: Usada para calcular o tamanho projetado dos objetos no canvas.

Desafios e Soluções

Desafio 1: Renderização de Piso com Linhas Horizontais

Problema: As linhas não se ajustavam dinamicamente ao movimento do jogador.

Solução: Utilização da base dos retângulos das paredes para delimitar a área do piso.

Desafio 2: Distância Projetada do Piso

Problema: Diferença entre cálculos de projeção para paredes e pisos.

Solução: Ajustar a fórmula de projeção para considerar o centro do canvas e a distância focal.

Desafio 3: Criar um Grid Dinâmico no Piso

Problema: A criação de um grid ajustado à perspectiva do jogador.

Solução: Utilizar as posições calculadas das paredes como base para o grid do piso.

Funcionalidades Implementadas

Renderização de paredes com projeção em perspectiva.

Delimitação do piso utilizando as bases das paredes.

Cálculo dinâmico para a renderização de linhas horizontais representando tiles.

Planejamento e ajuste para a criação de grids de piso.

Próximos Passos

Implementar a renderização de grids completos no piso.

Otimizar os cálculos para suportar diferentes tamanhos de tiles.

Adicionar suporte para elevações e camadas adicionais, como escadas.

Refinar o algoritmo de projeção para suportar ângulos mais complexos.

Desenvolvido com foco em eficiência e aprendizado contínuo. Sinta-se à vontade para contribuir ou sugerir melhorias! 🚀

