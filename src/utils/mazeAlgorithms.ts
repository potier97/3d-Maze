// Tipos para el laberinto
export interface MazeWalls {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

export interface MazeCell {
  x: number;
  y: number;
  walls: MazeWalls;
  visited?: boolean;
}

// Direcciones para navegación
const DIRECTIONS = [
  { dx: 0, dy: -1, wall: 'top', opposite: 'bottom' },    // Norte
  { dx: 1, dy: 0, wall: 'right', opposite: 'left' },     // Este
  { dx: 0, dy: 1, wall: 'bottom', opposite: 'top' },     // Sur
  { dx: -1, dy: 0, wall: 'left', opposite: 'right' }     // Oeste
] as const;

// Estructura para representar un muro
interface Wall {
  x: number;
  y: number;
  direction: typeof DIRECTIONS[number];
  neighborX: number;
  neighborY: number;
}

/**
 * Crea una cuadrícula inicial completamente cerrada
 */
function createSolidGrid(width: number, height: number): MazeCell[][] {
  const grid: MazeCell[][] = [];
  
  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      grid[y][x] = {
        x,
        y,
        walls: {
          top: true,
          right: true,
          bottom: true,
          left: true
        },
        visited: false
      };
    }
  }
  
  console.log(`📦 Cuadrícula inicial ${width}×${height} creada (todas las paredes cerradas)`);
  return grid;
}

/**
 * Obtiene todos los muros válidos de una celda
 */
function getWallsOfCell(x: number, y: number, width: number, height: number): Wall[] {
  const walls: Wall[] = [];
  
  for (const direction of DIRECTIONS) {
    const neighborX = x + direction.dx;
    const neighborY = y + direction.dy;
    
    // Verificar que el vecino esté dentro de los límites
    if (neighborX >= 0 && neighborX < width && neighborY >= 0 && neighborY < height) {
      walls.push({
        x,
        y,
        direction,
        neighborX,
        neighborY
      });
    }
  }
  
  return walls;
}

/**
 * Remueve un muro entre dos celdas adyacentes
 */
function removeWall(grid: MazeCell[][], wall: Wall): void {
  const currentCell = grid[wall.y][wall.x];
  const neighborCell = grid[wall.neighborY][wall.neighborX];
  
  // Remover pared de la celda actual
  currentCell.walls[wall.direction.wall as keyof MazeWalls] = false;
  
  // Remover pared opuesta del vecino
  neighborCell.walls[wall.direction.opposite as keyof MazeWalls] = false;
  
  console.log(`🔓 Muro removido: (${wall.x},${wall.y}) ↔ (${wall.neighborX},${wall.neighborY})`);
}

/**
 * Verifica si se puede mover directamente entre dos celdas adyacentes
 */
function canMoveDirectly(grid: MazeCell[][], from: { x: number, y: number }, to: { x: number, y: number }): boolean {
  if (!grid || from.y >= grid.length || from.x >= grid[0].length) return false;
  if (to.y >= grid.length || to.x >= grid[0].length || to.y < 0 || to.x < 0) return false;
  
  const fromCell = grid[from.y][from.x];
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // Solo celdas adyacentes
  if (Math.abs(dx) + Math.abs(dy) !== 1) return false;
  
  if (dx === 1) return !fromCell.walls.right;      // Moverse a la derecha
  if (dx === -1) return !fromCell.walls.left;      // Moverse a la izquierda  
  if (dy === 1) return !fromCell.walls.bottom;     // Moverse abajo
  if (dy === -1) return !fromCell.walls.top;       // Moverse arriba
  
  return false;
}

/**
 * Verifica conectividad usando BFS de entrada a salida
 */
function verifyConnectivity(grid: MazeCell[][], width: number, height: number): boolean {
  const start = { x: 0, y: 0 };
  const end = { x: width - 1, y: height - 1 };
  
  console.log(`🔍 VERIFICANDO CONECTIVIDAD: (${start.x},${start.y}) → (${end.x},${end.y})`);
  
  const visited = new Set<string>();
  const queue = [start];
  visited.add(`${start.x},${start.y}`);
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    // ¿Llegamos al final?
    if (current.x === end.x && current.y === end.y) {
      console.log('✅ CONECTIVIDAD VERIFICADA: ¡Camino A→B confirmado!');
      return true;
    }
    
    // Explorar vecinos adyacentes
    const neighbors = [
      { x: current.x + 1, y: current.y }, // Derecha
      { x: current.x - 1, y: current.y }, // Izquierda
      { x: current.x, y: current.y + 1 }, // Abajo
      { x: current.x, y: current.y - 1 }  // Arriba
    ];
    
    for (const neighbor of neighbors) {
      // Verificar límites
      if (neighbor.x < 0 || neighbor.x >= width || neighbor.y < 0 || neighbor.y >= height) {
        continue;
      }
      
      const key = `${neighbor.x},${neighbor.y}`;
      if (visited.has(key)) continue;
      
      // ¿Hay camino libre?
      if (canMoveDirectly(grid, current, neighbor)) {
        visited.add(key);
        queue.push(neighbor);
      }
    }
  }
  
  console.error('❌ FALLO: No hay conectividad A→B');
  return false;
}

/**
 * ALGORITMO DE PRIM PARA GENERACIÓN DE LABERINTOS
 * Genera un laberinto perfecto (árbol de expansión) con conectividad garantizada
 */
function generatePrimMaze(grid: MazeCell[][], width: number, height: number): void {
  console.log('🌟 INICIANDO ALGORITMO DE PRIM...');
  
  // Paso 1: Elegir celda inicial aleatoria
  const startX = Math.floor(Math.random() * width);
  const startY = Math.floor(Math.random() * height);
  
  console.log(`🎯 Celda inicial: (${startX},${startY})`);
  
  // Marcar celda inicial como visitada
  grid[startY][startX].visited = true;
  let visitedCells = 1;
  const totalCells = width * height;
  
  // Paso 2: Añadir todos los muros de la celda inicial a la lista de candidatos
  const wallList: Wall[] = getWallsOfCell(startX, startY, width, height);
  console.log(`📋 Lista inicial de muros: ${wallList.length} candidatos`);
  
  // Paso 3: Algoritmo principal
  while (wallList.length > 0 && visitedCells < totalCells) {
    // Elegir muro aleatorio de la lista
    const randomIndex = Math.floor(Math.random() * wallList.length);
    const wall = wallList[randomIndex];
    
    // Remover el muro de la lista (lo procesamos ahora)
    wallList.splice(randomIndex, 1);
    
    const currentCell = grid[wall.y][wall.x];
    const neighborCell = grid[wall.neighborY][wall.neighborX];
    
    // ¿El muro separa una celda visitada de una no visitada?
    if (currentCell.visited && !neighborCell.visited) {
      // ¡SÍ! Remover el muro y conectar las celdas
      removeWall(grid, wall);
      
      // Marcar la celda vecina como visitada
      neighborCell.visited = true;
      visitedCells++;
      
      console.log(`🔗 Conectada: (${wall.neighborX},${wall.neighborY}) - Total: ${visitedCells}/${totalCells}`);
      
      // Añadir todos los muros de la nueva celda a la lista de candidatos
      const newWalls = getWallsOfCell(wall.neighborX, wall.neighborY, width, height);
      
      for (const newWall of newWalls) {
        // Solo añadir si el vecino no está visitado
        const newNeighbor = grid[newWall.neighborY][newWall.neighborX];
        if (!newNeighbor.visited) {
          wallList.push(newWall);
        }
      }
      
      // Log de progreso cada 25%
      if (visitedCells % Math.floor(totalCells / 4) === 0) {
        console.log(`🏗️ Progreso: ${visitedCells}/${totalCells} celdas (${Math.round(visitedCells/totalCells*100)}%)`);
      }
    }
    // Si ambas celdas ya están visitadas, simplemente ignoramos este muro
  }
  
  console.log(`✅ ALGORITMO DE PRIM COMPLETADO: ${visitedCells}/${totalCells} celdas conectadas`);
}

/**
 * Garantiza entrada y salida específicas
 */
function ensureEntranceAndExit(grid: MazeCell[][], width: number, height: number): void {
  // Entrada en (0,0) - abrir hacia el exterior (lado izquierdo)
  grid[0][0].walls.left = false;
  
  // Salida en (width-1, height-1) - abrir hacia el exterior (lado derecho)
  grid[height - 1][width - 1].walls.right = false;
  
  console.log('🚪 Entrada (0,0) y salida (width-1,height-1) configuradas');
}

/**
 * GENERADOR PRINCIPAL usando ALGORITMO DE PRIM
 */
export function generateMaze(width: number, height: number): MazeCell[][] {
  console.log(`🎯 GENERANDO LABERINTO CON ALGORITMO DE PRIM ${width}×${height}...`);
  
  // Validar dimensiones
  if (width < 2 || height < 2) {
    throw new Error('El laberinto debe ser al menos 2×2');
  }

  // PASO 1: Crear cuadrícula completamente sólida
  const grid = createSolidGrid(width, height);
  
  // PASO 2: Generar laberinto usando Algoritmo de Prim
  generatePrimMaze(grid, width, height);
  
  // PASO 3: Configurar entrada y salida
  ensureEntranceAndExit(grid, width, height);
  
  // PASO 4: Verificación final de conectividad
  console.log('🔍 VERIFICACIÓN FINAL DE CONECTIVIDAD...');
  if (!verifyConnectivity(grid, width, height)) {
    console.error('❌ FALLO CRÍTICO: Laberinto no conectado');
    throw new Error('El laberinto generado no tiene conectividad A→B');
  }
  
  // PASO 5: Limpiar marcadores de visited
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      delete grid[y][x].visited;
    }
  }
  
  console.log('🎉 ¡LABERINTO CON ALGORITMO DE PRIM GENERADO CON ÉXITO!');
  console.log(`   🌟 Algoritmo: Prim's Minimum Spanning Tree`);
  console.log(`   📍 Entrada: (0,0) [punto verde]`);
  console.log(`   🎯 Salida: (${width-1},${height-1}) [punto rojo]`);
  console.log(`   🛣️ Conectividad: A→B garantizada`);
  console.log(`   🏗️ Estructura: Laberinto perfecto (árbol)`);
  console.log(`   🎨 Visualización: Muros estéticos se agregan en Three.js`);
  console.log(`   📐 Tamaño: ${width}×${height} = ${width * height} celdas`);
  
  return grid;
}

/**
 * Función utilitaria para debug del laberinto
 */
export function mazeToString(grid: MazeCell[][]): string {
  const height = grid.length;
  const width = grid[0].length;
  let result = '';
  
  // Línea superior
  for (let x = 0; x < width; x++) {
    result += grid[0][x].walls.top ? '+---' : '+   ';
  }
  result += '+\n';
  
  // Filas del laberinto
  for (let y = 0; y < height; y++) {
    let rowTop = '';
    let rowBottom = '';
    
    for (let x = 0; x < width; x++) {
      const cell = grid[y][x];
      
      // Entrada especial
      if (x === 0 && y === 0) {
        rowTop += '  A '; // A = Entrada
      } else {
        rowTop += cell.walls.left ? '|   ' : '    ';
      }
      
      // Pared inferior
      rowBottom += cell.walls.bottom ? '+---' : '+   ';
    }
    
    // Salida especial
    if (y === height - 1 && width > 0) {
      rowTop += ' B'; // B = Salida
    } else {
      rowTop += grid[y][width - 1].walls.right ? '|' : ' ';
    }
    
    rowBottom += '+';
    result += rowTop + '\n' + rowBottom + '\n';
  }
  
  return result;
} 