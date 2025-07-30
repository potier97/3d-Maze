'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Scene3D, Loader } from '@/components';
import { useLoading } from '@/hooks/useLoading';
import { LOADING_CONFIG, MAZE_SCALE } from '@/utils';

const DynamicScene3D = dynamic(() => import('@/components').then(mod => ({ default: mod.Scene3D })), {
  ssr: false,
  loading: () => <Loader message="Cargando laberinto 20×20..." />
});

export default function Home() {
  const { isLoading } = useLoading(LOADING_CONFIG.defaultDelay);

  // Estados simples
  const [isAerialView, setIsAerialView] = useState(false);
  const [solutionsCompleted, setSolutionsCompleted] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [regenerateMaze, setRegenerateMaze] = useState<(() => void) | null>(null);

  const handleMazeCompleted = () => {
    setSolutionsCompleted(prev => prev + 1);
    setIsSolved(true);
    console.log(`🎉 ¡Laberinto 20×20 resuelto! Total: ${solutionsCompleted + 1}`);
  };

  const handleMazeRegenerate = useCallback((regenerateFn: () => void) => {
    setRegenerateMaze(() => regenerateFn);
  }, []);

  const handleRestart = () => {
    if (regenerateMaze) {
      console.log('🔄 Reiniciando laberinto...');
      setIsSolved(false);
      setIsAerialView(false); // Cambiar automáticamente a vista IA
      regenerateMaze();
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-gray-900">
      {isLoading && <Loader message="Cargando solucionador de laberintos 20×20..." />}
      
      <DynamicScene3D 
        isAerialView={isAerialView}
        onPathComplete={handleMazeCompleted}
        onMazeRegenerate={handleMazeRegenerate}
      />
      
      {/* Control de vista simple */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setIsAerialView(!isAerialView)}
          className={`py-3 px-4 rounded-lg font-medium transition-colors ${
            isAerialView
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {isAerialView ? 'Vista IA' : 'Vista Cenital'}
        </button>
      </div>
      
      {/* Mensaje simple de finalización */}
      {isSolved && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="bg-black bg-opacity-80 text-white p-6 rounded-lg backdrop-blur-sm text-center border-2 border-green-400">
            <h2 className="text-2xl font-bold mb-4 text-green-400">Laberinto Finalizado</h2>
            
            <button
              onClick={handleRestart}
              className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-medium text-white transition-colors text-lg"
            >
              Reiniciar
            </button>
          </div>
        </div>
      )}
      
      {/* Información técnica */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-black bg-opacity-50 text-white p-3 rounded-lg backdrop-blur-sm text-xs">
          <p>🧠 IA: A* Pathfinding Algorithm</p>
          <p>🏗️ Generador: Prim&apos;s Minimum Spanning Tree</p>
          <p>📐 Escala: {MAZE_SCALE.cellSize}m × {MAZE_SCALE.wall.height}m</p>
          <p>📏 Tamaño: 20×20 = 400 celdas</p>
          <p>🛣️ Área: {(20 * MAZE_SCALE.cellSize) * (20 * MAZE_SCALE.cellSize)}m²</p>
        </div>
      </div>
    </main>
  );
}
