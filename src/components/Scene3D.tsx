'use client';

import React, { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { MazeVisualizer } from './MazeVisualizer';
import { CameraController } from './CameraController';
import { useMaze } from '@/hooks/useMaze';
import { MAZE_SCALE } from '@/utils/constants';

interface Scene3DProps {
  isAerialView?: boolean;
  onPathComplete?: () => void;
  onMazeRegenerate?: (regenerateFn: () => void) => void;
}

/**
 * Componente para controlar la cámara aérea fija
 */
const AerialCameraController: React.FC = () => {
  const { camera } = useThree();

  useEffect(() => {
    // Posición fija: 120m arriba del centro del laberinto
    camera.position.set(0, 120, 0);
    
    // Mirar directamente hacia abajo al centro del laberinto
    camera.lookAt(0, 0, 0);
    
    // Asegurar que la cámara esté completamente vertical
    camera.up.set(0, 1, 0);
    camera.updateProjectionMatrix();
    
    console.log('📷 Vista aérea fija configurada: (0, 120, 0) → (0, 0, 0)');
  }, [camera]);

  return null;
};

export const Scene3D: React.FC<Scene3DProps> = ({
  isAerialView = false,
  onPathComplete,
  onMazeRegenerate
}) => {
  const { maze, isGenerating, regenerateMaze } = useMaze();

  // Tamaño fijo del laberinto
  const MAZE_WIDTH = 20;
  const MAZE_HEIGHT = 20;

  // Pasar función de regeneración al componente padre
  useEffect(() => {
    if (onMazeRegenerate) {
      onMazeRegenerate(regenerateMaze);
    }
  }, [regenerateMaze, onMazeRegenerate]);

  const handlePathComplete = () => {
    console.log('🔄 Laberinto 20×20 completado exitosamente');
    
    if (onPathComplete) {
      onPathComplete();
    }
  };

  return (
    <div className="w-full h-screen">
      <Canvas
        camera={isAerialView ? {
          // Vista aérea: posición fija desde arriba
          position: [0, 120, 0],
          fov: 60
        } : {
          // Vista IA: solo FOV, sin posición hardcodeada
          fov: MAZE_SCALE.camera.fov
        }}
        shadows
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          {/* Luces optimizadas para laberinto 20×20 */}
          <ambientLight intensity={0.4} />
          
          <directionalLight 
            position={[150, 150, 75]} // Más alejada para laberinto más grande
            intensity={isAerialView ? 2.0 : 1.6}
            castShadow 
            shadow-mapSize-width={4096}
            shadow-mapSize-height={4096}
            shadow-camera-near={1}
            shadow-camera-far={400}
            shadow-camera-left={-200}
            shadow-camera-right={200}
            shadow-camera-top={200}
            shadow-camera-bottom={-200}
          />
          
          {/* Luces adicionales solo para primera persona */}
          {!isAerialView && (
            <>
              <pointLight position={[0, 40, 0]} intensity={0.8} distance={200} />
              <pointLight position={[40, 25, 40]} intensity={0.5} distance={150} />
              <pointLight position={[-40, 25, -40]} intensity={0.5} distance={150} />
            </>
          )}
          
          <Environment preset="dawn" />
          
          {/* Controles - AMBOS siempre montados para mantener estado */}
          {/* Vista aérea: Cámara fija sin controles */}
          {isAerialView && <AerialCameraController />}
          
          {/* Primera persona: Navegación automática - SIEMPRE MONTADO */}
          <CameraController
            maze={maze}
            isActive={!isGenerating}
            onPathComplete={handlePathComplete}
            isAerialView={isAerialView}
          />
          
          {/* Laberinto 20×20 */}
          <MazeVisualizer 
            maze={maze}
            isGenerating={isGenerating}
            mazeWidth={MAZE_WIDTH}
            mazeHeight={MAZE_HEIGHT}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}; 