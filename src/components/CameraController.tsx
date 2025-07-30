'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { findPath } from '@/utils/pathfinding';
import { type MazeCell } from '@/utils/mazeAlgorithms';
import { MAZE_SCALE } from '@/utils/constants';
import { AgentVisualization } from './AgentVisualization';

interface CameraControllerProps {
  maze: MazeCell[][] | null;
  isActive: boolean;
  onPathComplete: () => void;
  isAerialView?: boolean;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  maze,
  isActive,
  onPathComplete,
  isAerialView = false
}) => {
  const { camera } = useThree();
  
  // Estados del controlador
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [currentCellIndex, setCurrentCellIndex] = useState(0);
  const [hasReachedGoal, setHasReachedGoal] = useState(false);
  
  // Estado para la visualización del agente
  const [agentPosition, setAgentPosition] = useState<Vector3 | null>(null);
  
  // Referencias para rotación suave
  const currentRotation = useRef(0);
  const targetRotation = useRef(0);
  
  // Camino calculado por A*
  const [mazePath, setMazePath] = useState<Array<{x: number, y: number}>>([]);

  // Actualizar posición del agente cuando cambia el progreso o la vista
  useEffect(() => {
    if (isAerialView) {
      console.log('🗺️ Vista cenital activa - Actualizando marcador visible');
      
      // Actualizar posición del agente para vista cenital
      if (mazePath.length > 0 && currentCellIndex < mazePath.length) {
        const currentCell = mazePath[currentCellIndex];
        const worldPos = cellToWorldPosition(currentCell.x, currentCell.y);
        setAgentPosition(worldPos);
        console.log(`🔴 MARCADOR en: (${worldPos.x.toFixed(1)}, ${worldPos.y.toFixed(1)}, ${worldPos.z.toFixed(1)})`);
      } else if (mazePath.length === 0) {
        // Si no hay path aún, poner marcador en posición inicial
        const startPos = cellToWorldPosition(0, 0);
        setAgentPosition(startPos);
        console.log(`🔴 MARCADOR INICIAL en: (${startPos.x.toFixed(1)}, ${startPos.y.toFixed(1)}, ${startPos.z.toFixed(1)})`);
      }
    } else {
      console.log('🤖 Cambio a vista primera persona - Restaurando cámara');
      
      // IMPORTANTE: Restaurar posición al cambiar a vista IA (sin interrumpir navegación)
      if (mazePath.length > 0 && currentCellIndex < mazePath.length && !hasReachedGoal && agentPosition) {
        // Restaurar posición de cámara exactamente donde está el agente
        camera.position.copy(agentPosition);
        
        // Restaurar orientación usando la rotación actual del agente
        const lookDirection = new Vector3(
          Math.sin(currentRotation.current),
          0,
          -Math.cos(currentRotation.current)
        );
        const lookTarget = camera.position.clone().add(lookDirection.multiplyScalar(5));
        camera.lookAt(lookTarget);
        
        console.log(`🔄 Vista IA restaurada en posición del agente`);
      }
    }
  }, [isAerialView, mazePath, currentCellIndex, hasReachedGoal]);

  /**
   * Convierte coordenadas de celda a posición mundial 3D
   */
  const cellToWorldPosition = (cellX: number, cellY: number): Vector3 => {
    const { cellSize, camera: cam } = MAZE_SCALE;
    const width = maze?.[0]?.length ?? 20;
    const height = maze?.length ?? 20;
    
    // CENTRADO PERFECTO: Mismo cálculo que MazeVisualizer
    const totalMazeWidth = width * cellSize;
    const totalMazeHeight = height * cellSize;
    const offsetX = -totalMazeWidth / 2;
    const offsetZ = -totalMazeHeight / 2;
    
    return new Vector3(
      offsetX + (cellX + 0.5) * cellSize, // Centro exacto de la celda
      cam.height, // Altura constante del agente
      offsetZ + (cellY + 0.5) * cellSize  // Centro exacto de la celda
    );
  };

  

  /**
   * Verifica si se puede mover entre dos celdas adyacentes (sin atravesar muros)
   */
  const canMoveBetweenCells = (fromCell: {x: number, y: number}, toCell: {x: number, y: number}): boolean => {
    if (!maze) return false;
    
    const dx = toCell.x - fromCell.x;
    const dy = toCell.y - fromCell.y;
    
    // Solo movimientos ortogonales
    if (Math.abs(dx) + Math.abs(dy) !== 1) return false;
    
    const currentCell = maze[fromCell.y]?.[fromCell.x];
    if (!currentCell) return false;
    
    // Verificar paredes según la dirección
    if (dx === 1) return !currentCell.walls.right;   // Moverse este
    if (dx === -1) return !currentCell.walls.left;    // Moverse oeste
    if (dy === 1) return !currentCell.walls.bottom;   // Moverse sur
    if (dy === -1) return !currentCell.walls.top;     // Moverse norte
    
    return false;
  };

  /**
   * Calcula la rotación (yaw) necesaria para mirar hacia una celda objetivo
   */
  const getRotationForDirection = (fromCell: {x: number, y: number}, toCell: {x: number, y: number}): number => {
    const dx = toCell.x - fromCell.x;
    const dy = toCell.y - fromCell.y;
    
    if (dx === 1) return Math.PI / 2;    // Este
    if (dx === -1) return -Math.PI / 2;  // Oeste  
    if (dy === 1) return Math.PI;        // Sur
    if (dy === -1) return 0;             // Norte
    
    return 0;
  };

  // Efecto para calcular camino SOLO cuando cambia el laberinto (SIN resetear progreso al cambiar vista)
  useEffect(() => {
    if (!maze || !isActive) return;
    
    console.log('🎯 CALCULANDO CAMINO CON A* (LABERINTO 20×20, PASILLOS AMPLIOS)...');
    
    const width = maze[0]?.length ?? 20;
    const height = maze.length ?? 20;
    
    const start = { x: 0, y: 0 };
    const end = { x: width - 1, y: height - 1 };
    
    try {
      const calculatedPath = findPath(maze, start, end);
      
      if (calculatedPath.length === 0) {
        console.error('❌ No se encontró camino válido');
        return;
      }
      
      console.log(`🛣️ Camino A* calculado: ${calculatedPath.length} pasos`);
      
      // Verificar validez del camino paso a paso
      for (let i = 0; i < calculatedPath.length - 1; i++) {
        const current = calculatedPath[i];
        const next = calculatedPath[i + 1];
        
        if (!canMoveBetweenCells(current, next)) {
          console.error(`❌ Camino inválido entre (${current.x},${current.y}) → (${next.x},${next.y})`);
          return;
        }
      }
      
      console.log('✅ Camino A* validado completamente');
      setMazePath(calculatedPath);
      
      // SOLO reiniciar posición si es un laberinto NUEVO
      const { cellSize, camera: cam } = MAZE_SCALE;
      const totalMazeWidth = width * cellSize;
      const totalMazeHeight = height * cellSize;
      const offsetX = -totalMazeWidth / 2;
      const offsetZ = -totalMazeHeight / 2;
      
      const startWorldPos = new Vector3(
        offsetX + (start.x + 0.5) * cellSize,
        cam.height,
        offsetZ + (start.y + 0.5) * cellSize
      );
      camera.position.copy(startWorldPos);
      
      // IMPORTANTE: Configurar posición inicial del agente para vista cenital
      setAgentPosition(startWorldPos);
      console.log(`📍 Agente inicializado en: (${startWorldPos.x.toFixed(1)}, ${startWorldPos.y.toFixed(1)}, ${startWorldPos.z.toFixed(1)})`);
      
      // Orientar hacia el segundo punto del camino
      if (calculatedPath.length > 1) {
        const secondCell = calculatedPath[1];
        const initialRotation = getRotationForDirection(start, secondCell);
        currentRotation.current = initialRotation;
        targetRotation.current = initialRotation;
        
        // Aplicar rotación inicial - NATURAL hacia la dirección del movimiento
        const lookDirection = new Vector3(
          Math.sin(initialRotation),
          0,
          -Math.cos(initialRotation)
        );
        const lookTarget = camera.position.clone().add(lookDirection.multiplyScalar(5));
        camera.lookAt(lookTarget);
        
        console.log(`🧭 Orientación inicial: ${(initialRotation * 180 / Math.PI).toFixed(0)}° hacia (${secondCell.x},${secondCell.y})`);
      }
      
      // SOLO resetear estados para un NUEVO laberinto
      setIsNavigating(true);
      setIsMoving(false);
      setIsRotating(false);
      setCurrentCellIndex(0);
      setHasReachedGoal(false);
      
      // IMPORTANTE: Inicializar posición del agente para sincronización
      setAgentPosition(startWorldPos);
      
      console.log(`🚀 Navegación iniciada en NUEVO laberinto`);
      
    } catch (error) {
      console.error('❌ Error al calcular camino:', error);
    }
  }, [maze, isActive]); // 🔥 REMOVIDO: isAerialView, camera - SOLO reacciona a cambios de laberinto

  // Bucle de animación principal
  useFrame((_state, delta) => {
    if (!isNavigating || mazePath.length === 0 || !isActive || hasReachedGoal) {
      return;
    }

    // ¿Ya llegamos a la meta?
    if (currentCellIndex >= mazePath.length) {
      console.log('🎉 ¡META ALCANZADA! Laberinto 20×20 resuelto correctamente');
      setHasReachedGoal(true);
      setIsNavigating(false);
      onPathComplete();
      return;
    }

    const currentCell = mazePath[currentCellIndex];
    const currentWorldPos = cellToWorldPosition(currentCell.x, currentCell.y);
    const speed = MAZE_SCALE.camera.speed.normal; // Velocidad adaptada a pasillos amplios
    
    // Si estamos rotando, completar la rotación primero
    if (isRotating) {
      const rotationSpeed = 4.0; // Rotación natural y fluida
      const rotationDiff = targetRotation.current - currentRotation.current;
      
      // Normalizar diferencia de rotación (-π a π)
      let normalizedDiff = rotationDiff;
      while (normalizedDiff > Math.PI) normalizedDiff -= 2 * Math.PI;
      while (normalizedDiff < -Math.PI) normalizedDiff += 2 * Math.PI;
      
      if (Math.abs(normalizedDiff) < 0.05) {
        // Rotación completada - RESET completo para velocidad consistente
        currentRotation.current = targetRotation.current;
        setIsRotating(false);
        
        // IMPORTANTE: Asegurar posición exacta del agente después de rotación
        if (agentPosition) {
          setAgentPosition(agentPosition.clone()); // Reset de estado
        }
        
        setIsMoving(true);
        console.log(`🔄 Rotación completada - iniciando movimiento uniforme hacia (${currentCell.x},${currentCell.y})`);
      } else {
        // Continuar rotando suavemente
        const rotationStep = Math.sign(normalizedDiff) * rotationSpeed * delta;
        currentRotation.current += rotationStep;
        
        // Aplicar rotación a la cámara SOLO en vista IA
        if (!isAerialView) {
          const lookDirection = new Vector3(
            Math.sin(currentRotation.current),
            0,
            -Math.cos(currentRotation.current)
          );
          const lookTarget = camera.position.clone().add(lookDirection.multiplyScalar(5));
          camera.lookAt(lookTarget);
        }
      }
      return;
    }
    
    // Si estamos moviendo hacia la celda actual
    if (isMoving) {
      // NAVEGACIÓN CÉLULA POR CÉLULA: Respetando paredes y reglas originales
      const currentAgentPos = agentPosition || camera.position;
      const distance = currentAgentPos.distanceTo(currentWorldPos);
      const moveDistance = speed * delta;
      
      // DEBUG: Detectar cambios anómalos de velocidad en vista cenital
      if (isAerialView && moveDistance > 0.2) {
        console.warn(`⚠️ Velocidad alta detectada en vista cenital: ${(moveDistance * 60).toFixed(1)} m/s`);
      }
      
      if (distance < 0.2) { // Llegamos a la celda actual - tolerancia precisa
        // ACTUALIZAR POSICIÓN ÚNICA - Llegada exacta a celda
        const finalPosition = currentWorldPos.clone();
        setAgentPosition(finalPosition);
        
        // Sincronizar cámara en vista IA
        if (!isAerialView) {
          camera.position.copy(finalPosition);
        }
        
        setIsMoving(false);
        
        // RESET COMPLETO: Limpiar cualquier estado residual de velocidad
        if (isAerialView) {
          console.log(`✅ Celda (${currentCell.x},${currentCell.y}) alcanzada - Indicador cenital reset`);
        } else {
          console.log(`✅ Celda (${currentCell.x},${currentCell.y}) alcanzada - Vista IA reset`);
        }
        
        // Avanzar a la siguiente celda del path
        const nextIndex = currentCellIndex + 1;
        setCurrentCellIndex(nextIndex);
        
        // Si hay una siguiente celda, verificar reglas de movimiento
        if (nextIndex < mazePath.length) {
          const nextCell = mazePath[nextIndex];
          
          // CRÍTICO: Verificar que podemos movernos entre celdas (respeta paredes)
          if (!canMoveBetweenCells(currentCell, nextCell)) {
            console.error(`❌ COLISIÓN: No se puede mover de (${currentCell.x},${currentCell.y}) a (${nextCell.x},${nextCell.y})`);
            setHasReachedGoal(true); // Detener por colisión
            return;
          }
          
          const nextRotation = getRotationForDirection(currentCell, nextCell);
          
          // SIEMPRE rotar cuando cambia dirección para movimiento natural
          let rotationDiff = nextRotation - currentRotation.current;
          while (rotationDiff > Math.PI) rotationDiff -= 2 * Math.PI;
          while (rotationDiff < -Math.PI) rotationDiff += 2 * Math.PI;
          
          if (Math.abs(rotationDiff) > 0.1) { // Cualquier cambio significativo
            targetRotation.current = nextRotation;
            setIsRotating(true);
            console.log(`🔄 Rotando ${(rotationDiff * 180 / Math.PI).toFixed(0)}° hacia (${nextCell.x},${nextCell.y})`);
          } else {
            // Misma dirección, continuar moviendo
            setIsMoving(true);
          }
        }
      } else {
        // MOVIMIENTO LINEAL UNIFORME HACIA LA CELDA ACTUAL
        const direction = new Vector3()
          .subVectors(currentWorldPos, currentAgentPos)
          .normalize();
        
        // VELOCIDAD CONSISTENTE Y UNIFORME
        const baseSpeed = MAZE_SCALE.camera.speed.normal; // 2.5 m/s
        const targetMoveDistance = baseSpeed * delta;
        const maxMovePerFrame = 0.15; // Límite estricto por frame para uniformidad
        const actualMoveDistance = Math.min(targetMoveDistance, maxMovePerFrame, distance);
        
        // DEBUG: Monitorear velocidad del indicador cenital
        if (isAerialView && actualMoveDistance > 0.12) {
          console.log(`📊 Indicador cenital: velocidad=${(actualMoveDistance/delta).toFixed(1)}m/s, distancia=${distance.toFixed(2)}m, delta=${(delta*1000).toFixed(1)}ms`);
        }
        
        const newAgentPosition = currentAgentPos.clone()
          .add(direction.multiplyScalar(actualMoveDistance));
        
        // Mantener altura constante
        newAgentPosition.y = MAZE_SCALE.camera.height;
        
        // Actualizar posición única del agente
        setAgentPosition(newAgentPosition);
        
        // Sincronizar cámara en vista IA con orientación hacia el objetivo
        if (!isAerialView) {
          camera.position.copy(newAgentPosition);
          
          // ORIENTACIÓN CONTINUA: Mirar siempre hacia el objetivo actual
          const lookDirection = new Vector3(
            Math.sin(currentRotation.current),
            0,
            -Math.cos(currentRotation.current)
          );
          const lookTarget = camera.position.clone().add(lookDirection.multiplyScalar(5));
          camera.lookAt(lookTarget);
        }
      }
      return;
    }
    
    // Si no estamos moviendo ni rotando, verificar siguiente movimiento
    if (!isMoving && !isRotating) {
      // Asegurar que la posición del agente esté inicializada
      if (!agentPosition) {
        const initialPos = camera.position.clone();
        setAgentPosition(initialPos);
      }
      
      // IMPORTANTE: Verificar que el siguiente movimiento es válido antes de iniciarlo
      if (currentCellIndex > 0) {
        const prevCell = mazePath[currentCellIndex - 1];
        if (!canMoveBetweenCells(prevCell, currentCell)) {
          console.error(`❌ MOVIMIENTO INVÁLIDO detectado en path: (${prevCell.x},${prevCell.y}) → (${currentCell.x},${currentCell.y})`);
          setHasReachedGoal(true);
          return;
        }
      }
      
      setIsMoving(true);
    }
  });

  return (
    <>
      {/* Marcador del agente - Solo visible en vista cenital */}
      <AgentVisualization
        agentPosition={agentPosition}
        isVisible={isAerialView}
        isMoving={isMoving || isRotating}
      />
    </>
  );
}; 