# Laberinto 3D - Next.js 14 + Three.js

Un proyecto de laberinto 3D automático construido con Next.js 14, TypeScript y Three.js.

## 🚀 Características

- **Next.js 14** con App Router
- **TypeScript** configuración estricta
- **Three.js** con React Three Fiber
- **React Three Drei** para componentes 3D
- **Tailwind CSS** para estilos
- **Carga dinámica** con loader personalizado
- **Estructura de proyecto** organizada

## 📦 Instalación

1. Clona el repositorio o asegúrate de estar en el directorio del proyecto
2. Instala las dependencias:

```bash
npm install
```

## 🛠️ Desarrollo

Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx           # ✅ Página principal con doble modo
│   ├── layout.tsx         # Layout de Next.js
│   ├── globals.css        # Estilos globales
│   └── favicon.ico        # Ícono
├── components/
│   ├── Scene3D.tsx        # ✅ Escena 3D con modo dual
│   ├── MazeVisualizer.tsx # ✅ Visualizador 3D del laberinto
│   ├── CameraController.tsx # ✅ Controlador de cámara automática
│   ├── MazeControls.tsx   # ✅ Controles del laberinto
│   ├── AutoModeControls.tsx # ✅ Controles modo automático
│   ├── Loader.tsx         # Componente de carga
│   ├── RotatingCube.tsx   # Cubo de prueba (mantenido)
│   └── index.ts           # ✅ Exportaciones
├── hooks/
│   ├── useLoading.ts      # Hook de carga
│   ├── useMaze.ts         # ✅ Hook del laberinto
│   └── index.ts           # ✅ Exportaciones
└── utils/
    ├── mazeAlgorithms.ts  # ✅ Algoritmo Recursive Backtracking
    ├── pathfinding.ts     # ✅ Algoritmo A* para navegación
    ├── constants.ts       # Constantes de configuración
    ├── types.ts           # Tipos TypeScript
    └── index.ts           # ✅ Exportaciones
```

## 🎮 Controles

- **Clic izquierdo + arrastrar**: Rotar la cámara
- **Rueda del ratón**: Zoom in/out
- **Clic derecho + arrastrar**: Mover la vista

## 🔧 Tecnologías Utilizadas

- [Next.js 14](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Three.js](https://threejs.org/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [React Three Drei](https://docs.pmnd.rs/drei)
- [Tailwind CSS](https://tailwindcss.com/)

## 📝 Configuración TypeScript

El proyecto incluye configuración estricta de TypeScript con:

- `strict: true`
- `noImplicitAny: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- Y más configuraciones estrictas

## ✅ Características Implementadas

- ✅ **Generador de laberintos** con algoritmo Recursive Backtracking
- ✅ **Visualización 3D** del laberinto con paredes y suelo
- ✅ **Controles interactivos** para regenerar y cambiar tamaño
- ✅ **Marcadores visuales** para entrada (verde) y salida (rojo)
- ✅ **Hook personalizado** `useMaze` para manejo del estado
- ✅ **Interfaz intuitiva** con controles de cámara y tamaños preestablecidos
- ✅ **Navegación automática** con algoritmo A* (Pathfinding)
- ✅ **Modo salvapantallas** con cámara en primera persona
- ✅ **Exploración inteligente** con 20% de variación en rutas
- ✅ **Velocidad configurable** para la navegación automática
- ✅ **Regeneración automática** de laberintos al completar recorrido
- ✅ **Doble modo**: Manual (OrbitControls) y Automático (A* Navigation)

## 🎮 Cómo Usar

### 🎮 Modo Manual
1. **Visualización**: El laberinto se genera automáticamente al cargar
2. **Navegación**: Usa el ratón para rotar, hacer zoom y mover la vista
3. **Regenerar**: Haz clic en "Regenerar Laberinto" para crear uno nuevo
4. **Tamaños**: Elige entre pequeño (10x10), mediano (20x20) o grande (30x30)
5. **Personalizar**: Ajusta dimensiones específicas con los controles numéricos

### 🤖 Modo Automático (Salvapantallas)
1. **Activar**: Haz clic en "🤖 Modo Automático" en la parte superior
2. **Observar**: La cámara navega automáticamente usando inteligencia artificial
3. **Velocidad**: Ajusta la velocidad desde 0.5x hasta 10x
4. **Exploración**: El algoritmo A* encuentra el camino óptimo con 20% de variación
5. **Bucle continuo**: Al llegar al final, genera un nuevo laberinto automáticamente

## 🧩 Algoritmos Implementados

### 🏗️ Recursive Backtracking (Generación de Laberintos)
El generador utiliza el algoritmo clásico de Recursive Backtracking que:

1. **Inicializa** una cuadrícula con todas las paredes cerradas
2. **Selecciona** una celda aleatoria como punto de inicio
3. **Explora** vecinos no visitados eliminando paredes entre ellos
4. **Retrocede** cuando no hay vecinos disponibles (backtracking)
5. **Garantiza** entrada en (0,0) y salida en (width-1, height-1)

Este algoritmo asegura que existe exactamente un camino entre cualquier par de celdas.

### 🎯 A* Pathfinding (Navegación Inteligente)
Para la navegación automática, se implementó el algoritmo A* que:

1. **Evalúa** cada celda usando f(n) = g(n) + h(n)
   - **g(n)**: Coste real desde el inicio
   - **h(n)**: Heurística (distancia Manhattan al objetivo)
2. **Mantiene** listas abiertas y cerradas para optimización
3. **Encuentra** el camino más corto garantizado
4. **Añade variación** del 20% para simular exploración humana
5. **Respeta** las paredes del laberinto en todo momento

### 🎬 Sistema de Cámara en Primera Persona
- **Altura fija** de 1.5 unidades del suelo
- **Campo de visión** de 75 grados para inmersión
- **Rotación suave** usando interpolación lineal (lerp)
- **Velocidad configurable** de 0.5x a 10x
- **Transiciones fluidas** entre puntos del camino

## 🚀 Próximos Pasos

Para expandir el laberinto 3D:

1. ✅ ~~Crear algoritmo de generación de laberintos~~
2. ✅ ~~Implementar navegación automática con pathfinding~~
3. ✅ ~~Implementar cámara de primera persona~~
4. ✅ ~~Implementar solver automático del laberinto~~
5. Añadir texturas y materiales mejorados
6. Añadir efectos de iluminación avanzados
7. Implementar múltiples algoritmos de generación (Prim, Kruskal)
8. Añadir efectos de partículas y sonido
9. Implementar modo multijugador
10. Crear sistema de puntuaciones y estadísticas

## 📄 Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar versión de producción
- `npm run lint` - Ejecutar linter

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
