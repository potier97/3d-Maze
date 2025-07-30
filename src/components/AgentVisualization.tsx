'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group } from 'three';

interface AgentVisualizationProps {
  agentPosition: Vector3 | null;
  isVisible: boolean;
  isMoving: boolean; // Mantenido para compatibilidad
}

/**
 * Marcador discreto para mostrar la posición del agente en vista cenital
 */
export const AgentVisualization: React.FC<AgentVisualizationProps> = ({
  agentPosition,
  isVisible
}) => {
  const groupRef = useRef<Group>(null);

  // Solo actualizar posición sin animaciones
  useFrame((state, delta) => {
    if (!groupRef.current || !isVisible || !agentPosition) return;

    // Posición fija del marcador sin animaciones
    groupRef.current.position.set(
      agentPosition.x,
      agentPosition.y + 3, // Menos elevado para ser más discreto
      agentPosition.z
    );
  });

  if (!isVisible || !agentPosition) {
    return null;
  }

  return (
    <group ref={groupRef}>
      {/* Punto principal discreto - AZUL */}
      <mesh>
        <sphereGeometry args={[0.8, 12, 12]} />
        <meshBasicMaterial color="#0066FF" />
      </mesh>

      {/* Anillo exterior discreto */}
      <mesh rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[1.2, 1.5, 12]} />
        <meshBasicMaterial color="#3399FF" transparent opacity={0.6} />
      </mesh>

      {/* Luz suave para destacar */}
      <pointLight 
        position={[0, 1, 0]} 
        color="#0066FF" 
        intensity={2} 
        distance={10}
      />
    </group>
  );
}; 