'use client';

import React from 'react';
import { MazeCell } from '@/utils/mazeAlgorithms';
import { MAZE_SCALE } from '@/utils/constants';

interface MazeVisualizerProps {
  maze: MazeCell[][] | null;
  isGenerating: boolean;
  mazeWidth: number;
  mazeHeight: number;
}

const Wall: React.FC<{ position: [number, number, number]; args: [number, number, number] }> = ({ position, args }) => {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshLambertMaterial color="#8B4513" />
    </mesh>
  );
};

const Floor: React.FC<{ position: [number, number, number]; args: [number, number, number] }> = ({ position, args }) => {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={args} />
      <meshLambertMaterial color="#654321" />
    </mesh>
  );
};

const EntranceMarker: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[0.8, 0.8, 0.2, 16]} />
      <meshLambertMaterial color="#00ff00" emissive="#004400" />
    </mesh>
  );
};

const ExitMarker: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[0.8, 0.8, 0.2, 16]} />
      <meshLambertMaterial color="#ff0000" emissive="#440000" />
    </mesh>
  );
};

/**
 * Componente para muros estéticos perimetrales
 */
const PerimeterWalls: React.FC<{ mazeWidth: number; mazeHeight: number }> = ({ mazeWidth, mazeHeight }) => {
  const { cellSize, wall } = MAZE_SCALE;
  
  // Calcular dimensiones exactas del laberinto
  const totalMazeWidth = mazeWidth * cellSize;
  const totalMazeHeight = mazeHeight * cellSize;
  
  // Centrado perfecto: sin offset adicional
  const offsetX = -totalMazeWidth / 2;
  const offsetZ = -totalMazeHeight / 2;
  
  // Tamaño de aberturas (1.5 celdas)
  const openingSize = cellSize * 1.5;
  
  return (
    <>
      {/* Muro Norte (arriba) - alineado exactamente */}
      <Wall
        position={[0, wall.height / 2, offsetZ - wall.width / 2]}
        args={[totalMazeWidth + wall.width * 2, wall.height, wall.width]}
      />
      
      {/* Muro Sur (abajo) - alineado exactamente */}
      <Wall
        position={[0, wall.height / 2, offsetZ + totalMazeHeight + wall.width / 2]}
        args={[totalMazeWidth + wall.width * 2, wall.height, wall.width]}
      />
      
      {/* Muro Oeste (izquierda) - con abertura amplia para entrada */}
      <Wall
        position={[offsetX - wall.width / 2, wall.height / 2, 0]}
        args={[wall.width, wall.height, totalMazeHeight - openingSize]}
      />
      
      {/* Muro Este (derecha) - con abertura amplia para salida */}
      <Wall
        position={[offsetX + totalMazeWidth + wall.width / 2, wall.height / 2, 0]}
        args={[wall.width, wall.height, totalMazeHeight - openingSize]}
      />
      
      {/* Esquinas estéticas reforzadas */}
      {/* Esquina Noroeste */}
      <Wall
        position={[offsetX - wall.width / 2, wall.height / 2, offsetZ - wall.width / 2]}
        args={[wall.width, wall.height, wall.width]}
      />
      
      {/* Esquina Noreste */}
      <Wall
        position={[offsetX + totalMazeWidth + wall.width / 2, wall.height / 2, offsetZ - wall.width / 2]}
        args={[wall.width, wall.height, wall.width]}
      />
      
      {/* Esquina Suroeste */}
      <Wall
        position={[offsetX - wall.width / 2, wall.height / 2, offsetZ + totalMazeHeight + wall.width / 2]}
        args={[wall.width, wall.height, wall.width]}
      />
      
      {/* Esquina Sureste */}
      <Wall
        position={[offsetX + totalMazeWidth + wall.width / 2, wall.height / 2, offsetZ + totalMazeHeight + wall.width / 2]}
        args={[wall.width, wall.height, wall.width]}
      />
    </>
  );
};

export const MazeVisualizer: React.FC<MazeVisualizerProps> = ({
  maze,
  isGenerating,
  mazeWidth,
  mazeHeight
}) => {
  if (!maze || isGenerating) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshLambertMaterial color="#666666" />
        </mesh>
      </group>
    );
  }

  const { cellSize, wall, floor } = MAZE_SCALE;
  const width = maze[0]?.length || mazeWidth;
  const height = maze.length || mazeHeight;

  // CENTRADO PERFECTO: Offset exacto para centrar el laberinto
  const totalMazeWidth = width * cellSize;
  const totalMazeHeight = height * cellSize;
  const offsetX = -totalMazeWidth / 2;
  const offsetZ = -totalMazeHeight / 2;

  const walls: React.ReactElement[] = [];
  const floors: React.ReactElement[] = [];

  // Generar piso y muros del laberinto
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = maze[y][x];
      // Posición exacta de cada celda
      const cellX = offsetX + (x + 0.5) * cellSize;
      const cellZ = offsetZ + (y + 0.5) * cellSize;

      // Piso de la celda con mejor textura
      floors.push(
        <Floor
          key={`floor-${x}-${y}`}
          position={[cellX, floor.yPosition, cellZ]}
          args={[cellSize, floor.thickness, cellSize]}
        />
      );

      // Muros de la celda (solo internos, no perimetrales)
      if (cell.walls.top && y > 0) {
        walls.push(
          <Wall
            key={`wall-top-${x}-${y}`}
            position={[cellX, wall.height / 2, cellZ - cellSize / 2]}
            args={[cellSize, wall.height, wall.width]}
          />
        );
      }

      if (cell.walls.right && x < width - 1) {
        walls.push(
          <Wall
            key={`wall-right-${x}-${y}`}
            position={[cellX + cellSize / 2, wall.height / 2, cellZ]}
            args={[wall.width, wall.height, cellSize]}
          />
        );
      }

      if (cell.walls.bottom && y < height - 1) {
        walls.push(
          <Wall
            key={`wall-bottom-${x}-${y}`}
            position={[cellX, wall.height / 2, cellZ + cellSize / 2]}
            args={[cellSize, wall.height, wall.width]}
          />
        );
      }

      if (cell.walls.left && x > 0) {
        walls.push(
          <Wall
            key={`wall-left-${x}-${y}`}
            position={[cellX - cellSize / 2, wall.height / 2, cellZ]}
            args={[wall.width, wall.height, cellSize]}
          />
        );
      }
    }
  }

  // Posiciones de marcadores SIN superposición - perfectamente alineados
  const entrancePos: [number, number, number] = [
    offsetX - cellSize * 1.2, // Fuera del muro oeste
    0.3,
    offsetZ + cellSize * 0.5 // Alineado con la primera celda
  ];

  const exitPos: [number, number, number] = [
    offsetX + totalMazeWidth + cellSize * 1.2, // Fuera del muro este
    0.3,
    offsetZ + totalMazeHeight - cellSize * 0.5 // Alineado con la última celda
  ];

  return (
    <group>
      {/* Piso base PERFECTAMENTE CALCULADO para 20×20 */}
      <mesh 
        position={[0, floor.yPosition - 0.1, 0]} 
        receiveShadow
      >
        <boxGeometry args={[
          totalMazeWidth + cellSize * 4, // Exacto: 120m + 24m = 144m
          floor.thickness, 
          totalMazeHeight + cellSize * 4 // Exacto: 120m + 24m = 144m
        ]} />
        <meshLambertMaterial color="#3A5F3A" />
      </mesh>
      
      {/* Piso del laberinto */}
      {floors}
      
      {/* Muros internos del laberinto */}
      {walls}
      
      {/* MUROS ESTÉTICOS PERIMETRALES PERFECTAMENTE ALINEADOS */}
      <PerimeterWalls mazeWidth={width} mazeHeight={height} />
      
      {/* Marcadores de entrada y salida perfectamente alineados */}
      <EntranceMarker position={entrancePos} />
      <ExitMarker position={exitPos} />
      
      {/* Luces de ambiente para los marcadores */}
      <pointLight 
        position={[entrancePos[0], entrancePos[1] + 2, entrancePos[2]]} 
        color="#00ff00" 
        intensity={1.5} 
        distance={10}
      />
      <pointLight 
        position={[exitPos[0], exitPos[1] + 2, exitPos[2]]} 
        color="#ff0000" 
        intensity={1.5} 
        distance={10}
      />
    </group>
  );
}; 