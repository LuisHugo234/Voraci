# Contexto del Proyecto: Voraci (PIA)

Este documento contiene el contexto completo del proyecto "Voraci" para que cualquier IA (como Claude) pueda entender rápidamente de qué trata, qué tecnologías usa y cómo está estructurado.

## 1. Descripción General
**Voraci** es una aplicación móvil (desarrollada con React Native y Expo) diseñada para servir como un asistente culinario inteligente. La aplicación permite a los usuarios gestionar su despensa de ingredientes, escanear alimentos con la cámara de su dispositivo mediante IA de visión, y generar recetas personalizadas basadas en lo que tienen disponible utilizando IA generativa.

## 2. Tecnologías Principales (Tech Stack)
*   **Framework de UI:** React Native (v0.81.5) gestionado a través de Expo (v54).
*   **Navegación:** React Navigation v7 (`@react-navigation/native` y `@react-navigation/bottom-tabs`).
*   **Almacenamiento Local:** `@react-native-async-storage/async-storage` para persistir la despensa en el dispositivo.
*   **Cámara:** `expo-camera` para capturar imágenes de los ingredientes.
*   **Inteligencia Artificial:** `@google/generative-ai` (Gemini 2.5 Flash) para el análisis de imágenes y la generación de recetas.

## 3. Estructura del Proyecto

El proyecto está organizado en las siguientes carpetas y archivos clave:

*   **`App.js`**: Punto de entrada de la aplicación. Configura la navegación mediante `createBottomTabNavigator`, estableciendo las tres pantallas principales (Despensa, Escáner, Chef IA).
*   **`screens/`**: Contiene las vistas principales de la aplicación.
    *   **`PantryScreen.js` (Despensa)**: Interfaz para ver, agregar, buscar y eliminar ingredientes manualmente.
    *   **`ScannerScreen.js` (Escáner)**: Interfaz que utiliza la cámara del dispositivo para tomar fotos de alimentos, enviarlas a la IA para su análisis, y agregar los alimentos detectados a la despensa.
    *   **`ChefScreen.js` (Chef IA)**: Interfaz que toma los ingredientes guardados en la despensa y solicita a la IA que genere recetas basadas en esos ingredientes y en un contexto específico (ej. "Recomposición corporal", tiempo máximo de 30 min, 1 comensal).
*   **`services/`**: Contiene la lógica de negocio y llamadas externas.
    *   **`pantryService.js`**: Gestiona el CRUD (Crear, Leer, Actualizar, Eliminar) de los ingredientes utilizando `AsyncStorage` (almacenamiento local del dispositivo).
    *   **`aiService.js`**: Contiene las integraciones con Google Gemini (`gemini-2.5-flash`). Expone dos funciones principales:
        *   `generateRecipes(userContext)`: Envía un prompt muy estricto y detallado (Master Prompt) a Gemini con los ingredientes de la despensa y reglas nutricionales/restricciones. Retorna un JSON estricto con exactamente 3 recetas generadas.
        *   `analyzeImage(base64Image)`: Envía una foto en Base64 a Gemini para que detecte alimentos e ingredientes y retorne un array JSON con los alimentos identificados.
*   **`.env`**: Archivo (no incluido en el repositorio normalmente) que almacena de forma segura la API Key de Google Generative AI (`EXPO_PUBLIC_GEMINI_API_KEY`).

## 4. Flujo de Usuario (User Flow)
1.  **Gestión de Despensa:** El usuario abre la app y puede agregar manualmente los ingredientes que tiene en casa (ej. "Pollo", "Avena", "Manzana") en `PantryScreen`.
2.  **Escaneo Visual:** Alternativamente, el usuario puede ir a `ScannerScreen`, otorgar permisos de cámara, y tomar una foto de su refrigerador o de un grupo de alimentos. La IA analiza la imagen, extrae los nombres de los alimentos detectados y los agrega automáticamente a la despensa.
3.  **Generación de Recetas:** Con la despensa lista, el usuario va a `ChefScreen` y presiona "Generar Recetas". La app lee la despensa completa, ensambla los nombres de los ingredientes y llama a `aiService.js`. La IA evalúa qué se puede cocinar con esos ingredientes bajo los filtros establecidos y devuelve 3 recetas únicas en formato JSON (con macros, tiempos, dificultad e instrucciones).

## 5. Detalles Clave del Código a tener en cuenta
*   **Prompts Estrictos:** El archivo `aiService.js` tiene un prompt masivo con reglas inquebrantables de formato de salida JSON y consideraciones de seguridad alimentaria. Esto es vital para el parseo correcto en el Frontend.
*   **Estado Local:** Todo se guarda en `AsyncStorage` localmente (clave `@chefai_pantry`). No hay base de datos backend (como Firebase o PostgreSQL) por ahora.
*   **Estilos:** Los estilos están hechos con `StyleSheet` de React Native (Vanilla CSS-in-JS), usando paletas de colores oscuras con tonos verde/lima (`#0f172a`, `#1e293b`, `#bef264`, `#4ade80`).
