// Tipos para posiciones 3D
export type Position3D = [number, number, number];

// Tipos para configuración de cámara
export interface CameraConfig {
  position: Position3D;
  fov: number;
  near?: number;
  far?: number;
}

// Tipos para configuración de luces
export interface LightConfig {
  ambientIntensity: number;
  directionalIntensity: number;
  directionalPosition: Position3D;
}

// Tipos para el estado de carga
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

// Tipos para controles de órbita
export interface OrbitControlsConfig {
  enablePan?: boolean;
  enableZoom?: boolean;
  enableRotate?: boolean;
  minDistance?: number;
  maxDistance?: number;
} 