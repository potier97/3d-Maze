'use client';

import React, { useState } from 'react';

interface MazeControlsProps {
  onRegenerate: () => void;
  onSizeChange: (width: number, height: number) => void;
  isGenerating: boolean;
  currentWidth: number;
  currentHeight: number;
}

export const MazeControls: React.FC<MazeControlsProps> = ({
  onRegenerate,
  onSizeChange,
  isGenerating,
  currentWidth,
  currentHeight
}) => {
  const [width, setWidth] = useState(currentWidth);
  const [height, setHeight] = useState(currentHeight);

  const handleSizeChange = () => {
    onSizeChange(width, height);
  };

  const presetSizes = [
    { name: 'Pequeño', width: 10, height: 10 },
    { name: 'Mediano', width: 20, height: 20 },
    { name: 'Grande', width: 30, height: 30 },
  ];

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="bg-black bg-opacity-50 text-white p-4 rounded-lg backdrop-blur-sm space-y-4 min-w-[250px]">
        <h3 className="text-lg font-bold">Controles del Laberinto</h3>
        
        {/* Botón de regenerar */}
        <button
          onClick={onRegenerate}
          disabled={isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          {isGenerating ? 'Generando...' : 'Regenerar Laberinto'}
        </button>
        
        {/* Tamaños preestablecidos */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Tamaños rápidos:</p>
          <div className="grid grid-cols-3 gap-2">
            {presetSizes.map((preset) => (
              <button
                key={preset.name}
                onClick={() => onSizeChange(preset.width, preset.height)}
                disabled={isGenerating}
                className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-xs py-1 px-2 rounded transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Controles de tamaño personalizado */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Tamaño personalizado:</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs mb-1">Ancho:</label>
              <input
                type="number"
                min="5"
                max="50"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 10)}
                className="w-full bg-gray-700 text-white text-sm p-1 rounded"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Alto:</label>
              <input
                type="number"
                min="5"
                max="50"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 10)}
                className="w-full bg-gray-700 text-white text-sm p-1 rounded"
                disabled={isGenerating}
              />
            </div>
          </div>
          <button
            onClick={handleSizeChange}
            disabled={isGenerating || (width === currentWidth && height === currentHeight)}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm py-1 px-2 rounded transition-colors"
          >
            Aplicar Tamaño
          </button>
        </div>
        
        {/* Información actual */}
        <div className="text-xs opacity-80 border-t border-gray-600 pt-2">
          <p>Tamaño actual: {currentWidth} × {currentHeight}</p>
          <p>Total de celdas: {currentWidth * currentHeight}</p>
        </div>
      </div>
    </div>
  );
}; 