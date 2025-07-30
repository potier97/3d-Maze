'use client';

import React from 'react';
import { MAZE_SCALE } from '@/utils/constants';

interface AutoModeControlsProps {
  isAutoMode: boolean;
  autoSpeed: number;
  onSpeedChange: (speed: number) => void;
  onToggleMode: () => void;
  pathsCompleted: number;
}

export const AutoModeControls: React.FC<AutoModeControlsProps> = ({
  isAutoMode,
  autoSpeed,
  onSpeedChange,
  onToggleMode,
  pathsCompleted
}) => {
  const speedPresets = [
    { name: 'Lento', value: MAZE_SCALE.camera.speed.slow, desc: '1.2 m/s (caminar lento)' },
    { name: 'Normal', value: MAZE_SCALE.camera.speed.normal, desc: '2.5 m/s (caminar normal)' },
    { name: 'Rápido', value: MAZE_SCALE.camera.speed.fast, desc: '4.0 m/s (caminar rápido)' },
    { name: 'Correr', value: MAZE_SCALE.camera.speed.run, desc: '6.0 m/s (trotar)' }
  ];

  if (!isAutoMode) return null;

  return (
    <div className="absolute top-20 right-4 z-10">
      <div className="bg-purple-900 bg-opacity-50 text-white p-4 rounded-lg backdrop-blur-sm space-y-4 min-w-[280px]">
        <h3 className="text-lg font-bold">🤖 Navegación Humana</h3>
        
        {/* Velocidades preestablecidas */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Velocidad de caminata:</p>
          <div className="grid grid-cols-2 gap-2">
            {speedPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => onSpeedChange(preset.value)}
                className={`text-xs py-2 px-2 rounded transition-colors ${
                  Math.abs(autoSpeed - preset.value) < 0.1
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                }`}
                title={preset.desc}
              >
                {preset.name}<br/>
                <span className="text-xs opacity-80">{preset.value}m/s</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Velocidad personalizada */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Velocidad personalizada:</label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0.5"
              max="8"
              step="0.1"
              value={autoSpeed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs w-12 text-center">{autoSpeed.toFixed(1)}m/s</span>
          </div>
          <div className="text-xs opacity-70">
            {autoSpeed < 1.5 ? '🐌 Muy lento' : 
             autoSpeed < 2.0 ? '🚶 Caminar lento' :
             autoSpeed < 3.0 ? '🚶‍♂️ Caminar normal' :
             autoSpeed < 5.0 ? '🏃 Caminar rápido' :
             '🏃‍♂️ Correr'}
          </div>
        </div>
        
        {/* Estadísticas */}
        <div className="text-xs opacity-80 border-t border-purple-600 pt-2">
          <p>🎯 Laberintos completados: {pathsCompleted}</p>
          <p>⚡ Velocidad actual: {autoSpeed.toFixed(1)} m/s</p>
          <p>🧠 Algoritmo: A* + 20% exploración</p>
          <p>📏 Escala: {MAZE_SCALE.cellSize}m por celda</p>
        </div>
        
        {/* Información adicional */}
        <div className="text-xs opacity-70 space-y-1">
          <p>• Vista en primera persona a {MAZE_SCALE.camera.height}m de altura</p>
          <p>• Validación de colisiones con paredes</p>
          <p>• Pasillos de {MAZE_SCALE.cellSize}m de ancho</p>
          <p>• Paredes de {MAZE_SCALE.wall.height}m de altura</p>
        </div>
      </div>
    </div>
  );
}; 