'use client';

import { useState, useCallback, useEffect } from 'react';
import { generateMaze, type MazeCell } from '@/utils/mazeAlgorithms';

interface UseMazeReturn {
  maze: MazeCell[][] | null;
  isGenerating: boolean;
  regenerateMaze: () => void;
}

export const useMaze = (): UseMazeReturn => {
  const [maze, setMaze] = useState<MazeCell[][] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Tamaño fijo 20×20 (ajustado para pasillos de 6m)
  const FIXED_WIDTH = 20;
  const FIXED_HEIGHT = 20;

  const generateFixedMaze = useCallback(async () => {
    console.log('🎯 GENERANDO LABERINTO FIJO 20×20 (PASILLOS AMPLIOS)...');
    setIsGenerating(true);
    setMaze(null);
    
    try {
      // Pequeña pausa para UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log(`🏗️ CREANDO LABERINTO ${FIXED_WIDTH}×${FIXED_HEIGHT}`);
      console.log(`📐 DIMENSIONES REALES: ${FIXED_WIDTH * 6}m × ${FIXED_HEIGHT * 6}m`);
      
      const newMaze = generateMaze(FIXED_WIDTH, FIXED_HEIGHT);
      setMaze(newMaze);
      
      console.log('✅ LABERINTO 20×20 GENERADO EXITOSAMENTE');
      console.log(`🎯 Laberinto listo: ${FIXED_WIDTH}×${FIXED_HEIGHT} = ${FIXED_WIDTH * FIXED_HEIGHT} celdas`);
      console.log(`🛣️ Área total: ${FIXED_WIDTH * 6}m × ${FIXED_HEIGHT * 6}m = ${(FIXED_WIDTH * 6) * (FIXED_HEIGHT * 6)}m²`);
      
    } catch (error) {
      console.error('❌ Error crítico al generar laberinto 20×20:', error);
      
      // Reintentar una vez
      try {
        console.log('🔄 Reintentando generación...');
        const fallbackMaze = generateMaze(FIXED_WIDTH, FIXED_HEIGHT);
        setMaze(fallbackMaze);
        console.log('✅ Laberinto generado en segundo intento');
      } catch (fallbackError) {
        console.error('❌ Error crítico en segundo intento:', fallbackError);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [FIXED_WIDTH, FIXED_HEIGHT]);

  // Función pública para regenerar laberinto
  const regenerateMaze = useCallback(() => {
    console.log('🔄 REINICIANDO LABERINTO...');
    generateFixedMaze();
  }, [generateFixedMaze]);

  // Generar laberinto automáticamente al inicio
  useEffect(() => {
    if (!maze) {
      console.log('🚀 INICIANDO GENERACIÓN AUTOMÁTICA DE LABERINTO 20×20...');
      generateFixedMaze();
    }
  }, [maze, generateFixedMaze]);

  return {
    maze,
    isGenerating,
    regenerateMaze
  };
}; 