export const ALT_TILE = 4;
export const LARG_TILE =4;

export const ALT_TILE_PISO = 16;
export const LARG_TILE_PISO = 16;

export const COMP_SALA = 10;
export const LARG_SALA = 10;

export const DIST_TETO = 2;
export const DIST_PISO = 1;

export const RAYCASTING_RES = 120   ; //120 linhas na tela
export const RAYCASTING_POV = 60; //60 graus
export const RAYCASTING_STEP_SIZE = 0.1;
export const MAX_RAYCASTING_SIZE = 45;

export const CANVAS2D = document.getElementById("2d-view");
export const CTX_2D = CANVAS2D.getContext("2d");
CTX_2D.scale(12, 12);

export const CANVAS3D = document.getElementById("3d-view");
export const CTX_3D = CANVAS3D.getContext("2d");
export const GUN = new Image();
GUN.src = 'gun.png';


export const ALT_CANVAS = CANVAS3D.height;
export const LARG_CANVAS = CANVAS3D.width;
export const DIST_FOCAL = LARG_CANVAS / 2;

export const DEBUG_GROUND_POS_2D = true
export const DEBUG_GROUND_POS_3D = true

export const DEBUG_RAYCASTING_POS_2D = true
export const DEBUG_RAYCASTING_POS_3D = true


