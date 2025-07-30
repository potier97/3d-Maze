import { MazeCell } from './mazeAlgorithms';
import { MAZE_SCALE } from './constants';

export interface Position {
  x: number;
  y: number;
}

interface PathNode {
  position: Position;
  g: number; // Costo desde el inicio
  h: number; // Heurística hacia el objetivo
  f: number; // Costo total (g + h)
  parent: PathNode | null;
}

/**
 * Calcula la distancia de Manhattan entre dos posiciones
 */
function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Verifica si una posición está dentro de los límites del laberinto
 */
function isValidPosition(position: Position, width: number, height: number): boolean {
  return position.x >= 0 && position.x < width && position.y >= 0 && position.y < height;
}

/**
 * Verifica si se puede mover de una posición a otra (sin atravesar paredes)
 */
function canMoveTo(maze: MazeCell[][], from: Position, to: Position): boolean {
  const fromCell = maze[from.y][from.x];
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  // Solo movimientos ortogonales
  if (Math.abs(dx) + Math.abs(dy) !== 1) return false;

  // Verificar paredes según dirección
  if (dx === 1) return !fromCell.walls.right;   // Moverse hacia la derecha
  if (dx === -1) return !fromCell.walls.left;    // Moverse hacia la izquierda  
  if (dy === 1) return !fromCell.walls.bottom;   // Moverse hacia abajo
  if (dy === -1) return !fromCell.walls.top;     // Moverse hacia arriba

  return false;
}

/**
 * Obtiene los vecinos válidos de una posición
 */
function getNeighbors(maze: MazeCell[][], position: Position): Position[] {
  const height = maze.length;
  const width = maze[0].length;
  const neighbors: Position[] = [];
  
  // Direcciones cardinales
  const directions = [
    { x: 0, y: -1 }, // Norte
    { x: 1, y: 0 },  // Este
    { x: 0, y: 1 },  // Sur
    { x: -1, y: 0 }  // Oeste
  ];

  for (const direction of directions) {
    const neighbor: Position = {
      x: position.x + direction.x,
      y: position.y + direction.y
    };

    if (isValidPosition(neighbor, width, height) && canMoveTo(maze, position, neighbor)) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

/**
 * Reconstruye el camino desde el nodo final hacia el inicio
 */
function reconstructPath(endNode: PathNode): Position[] {
  const path: Position[] = [];
  let current: PathNode | null = endNode;

  while (current !== null) {
    path.unshift(current.position);
    current = current.parent;
  }

  return path;
}

/**
 * Implementación del algoritmo A* para encontrar el camino más corto
 */
function findPathAStar(maze: MazeCell[][], start: Position, end: Position): Position[] {
  console.log(`🎯 ALGORITMO A* INICIADO (PASILLOS AMPLIOS)`);
  console.log(`   🚀 Inicio: (${start.x},${start.y})`);
  console.log(`   🏁 Meta: (${end.x},${end.y})`);
  console.log(`   📐 Escala: ${MAZE_SCALE.cellSize}m por celda`);

  // Listas abiertas y cerradas
  const openList: PathNode[] = [];
  const closedSet = new Set<string>();

  // Nodo inicial
  const startNode: PathNode = {
    position: start,
    g: 0,
    h: manhattanDistance(start, end),
    f: manhattanDistance(start, end),
    parent: null
  };

  openList.push(startNode);

  while (openList.length > 0) {
    // Encontrar el nodo con menor costo f
    let currentIndex = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[currentIndex].f) {
        currentIndex = i;
      }
    }

    const currentNode = openList.splice(currentIndex, 1)[0];
    const currentKey = `${currentNode.position.x},${currentNode.position.y}`;
    closedSet.add(currentKey);

    // ¿Llegamos al objetivo?
    if (currentNode.position.x === end.x && currentNode.position.y === end.y) {
      const finalPath = reconstructPath(currentNode);
      console.log(`✅ CAMINO A* ENCONTRADO (PASILLOS AMPLIOS)`);
      console.log(`   📍 Longitud: ${finalPath.length} celdas`);
      console.log(`   🛣️ Distancia real: ${(finalPath.length - 1) * MAZE_SCALE.cellSize}m`);
      console.log(`   ⏱️ Tiempo estimado: ${Math.round((finalPath.length - 1) * MAZE_SCALE.cellSize / MAZE_SCALE.camera.speed.normal)}s`);
      return finalPath;
    }

    // Explorar vecinos
    const neighbors = getNeighbors(maze, currentNode.position);
    
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      
      // Saltar si ya está en la lista cerrada
      if (closedSet.has(neighborKey)) continue;

      // Costo de movimiento (1 por paso ortogonal en pasillos amplios)
      const movementCost = 1;
      const tentativeG = currentNode.g + movementCost;

             // Verificar si este vecino ya está en la lista abierta
       const existingNode = openList.find(node => 
         node.position.x === neighbor.x && node.position.y === neighbor.y
       );

      if (!existingNode) {
        // Nuevo nodo
        const newNode: PathNode = {
          position: neighbor,
          g: tentativeG,
          h: manhattanDistance(neighbor, end),
          f: tentativeG + manhattanDistance(neighbor, end),
          parent: currentNode
        };
        openList.push(newNode);
      } else if (tentativeG < existingNode.g) {
        // Mejor camino encontrado
        existingNode.g = tentativeG;
        existingNode.f = tentativeG + existingNode.h;
        existingNode.parent = currentNode;
      }
    }
  }

  console.error('❌ A* NO ENCONTRÓ CAMINO EN PASILLOS AMPLIOS');
  return [];
}

/**
 * Función principal para encontrar un camino (usa A* directamente)
 */
export function findPath(maze: MazeCell[][], start: Position, end: Position): Position[] {
  console.log(`🧠 BUSCANDO CAMINO INTELIGENTE EN LABERINTO ${maze[0].length}×${maze.length}`);
  console.log(`   🏗️ Pasillos: ${MAZE_SCALE.cellSize}m de ancho`);
  console.log(`   🤖 Agente: ${MAZE_SCALE.camera.height}m de altura`);
  console.log(`   ⚡ Velocidad: ${MAZE_SCALE.camera.speed.normal}m/s`);
  
  return findPathAStar(maze, start, end);
}

/**
 * Convierte un camino en coordenadas de celdas a posiciones 3D del mundo
 */
export function pathToWorld3D(
  path: Position[], 
  cellSize: number = MAZE_SCALE.cellSize, 
  offsetY: number = MAZE_SCALE.camera.height
): Array<[number, number, number]> {
  console.log(`🗺️ CONVIRTIENDO CAMINO A COORDENADAS 3D`);
  console.log(`   📏 Escala de celda: ${cellSize}m`);
  console.log(`   📐 Altura del agente: ${offsetY}m`);
  
  return path.map((position, index) => {
    const worldX = position.x * cellSize;
    const worldZ = position.y * cellSize;
    
    if (index % 5 === 0) { // Log cada 5 pasos
      console.log(`   🔹 Paso ${index + 1}: Celda(${position.x},${position.y}) → Mundo(${worldX.toFixed(1)}, ${offsetY}, ${worldZ.toFixed(1)})`);
    }
    
    return [worldX, offsetY, worldZ];
  });
} 