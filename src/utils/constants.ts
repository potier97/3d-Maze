// Configuración de la aplicación
export const LOADING_CONFIG = {
  defaultDelay: 1500,
  minimumDelay: 800,
  maximumDelay: 3000,
} as const;

// Configuración 3D de la escena
export const SCENE_CONFIG = {
  camera: {
    position: [10, 10, 10] as [number, number, number],
    fov: 75,
    near: 0.1,
    far: 1000,
  },
  lights: {
    ambient: {
      intensity: 0.4,
      color: '#ffffff',
    },
    directional: {
      intensity: 1,
      position: [10, 10, 5] as [number, number, number],
      castShadow: true,
    },
  },
  orbitControls: {
    enableDamping: true,
    dampingFactor: 0.05,
    maxPolarAngle: Math.PI / 2,
  },
} as const;

// ESCALA HUMANA MEJORADA PARA EL LABERINTO 3D
export const MAZE_SCALE = {
  // Tamaño de celda más amplio para mejor navegación
  cellSize: 6, // Aumentado de 4m a 6m por celda para pasillos más amplios
  
  // Configuración de muros más proporcionada
  wall: {
    width: 0.4, // Aumentado ligeramente para mejor visualización
    height: 4.0, // Altura estándar de habitación
  },
  
  // Configuración de cámara/agente optimizada
  camera: {
    height: 1.8, // Altura de persona promedio
    fov: 75, // Campo de visión inmersivo
    speed: {
      slow: 1.2,
      normal: 2.5, // Velocidad fluida y natural para navegación contemplativa
      fast: 3.5,
    }
  },
  
  // Piso con mejor proporción
  floor: {
    thickness: 0.15, // Más grueso para mejor visibilidad
    yPosition: -0.075, // Centrado
  },
  
  // Sistema de colisiones ajustado
  collision: {
    playerRadius: 0.4, // Radio del agente
    wallOffset: 0.2, // Distancia mínima a muros
  }
} as const; 