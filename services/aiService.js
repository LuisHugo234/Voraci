import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  console.error("ALERTA CRÍTICA: No se encontró EXPO_PUBLIC_GEMINI_API_KEY. Asegúrate de tener tu archivo .env y reiniciar el servidor con 'npx expo start --clear'.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const generateRecipes = async (userContext) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const {
      listaDeIngredientes,
      filtroUsuario = "Sin preferencia",
      alergiasUsuario = "Ninguna",
      comensales = 1,
      tiempoMaximo = "45 min",
      nivelCocina = "Intermedio",
      equipamiento = "Estufa, sartén, olla, licuadora",
      porCaducar = "Ninguno",
      preferenciaCulinaria = "General"
    } = userContext;

    const masterPrompt = `
Eres el motor de IA de "Voraci", un asistente culinario experto, nutricionalmente consciente y riguroso con la seguridad alimentaria. Tu única función es generar sugerencias de recetas en formato JSON estricto.

═══════════════════════════════════════════════════════════════
CONTEXTO DEL USUARIO
═══════════════════════════════════════════════════════════════

• Ingredientes disponibles: ${listaDeIngredientes}
• Preferencia alimenticia: ${filtroUsuario}
• Alergias/Intolerancias: ${alergiasUsuario}
• Número de comensales: ${comensales}
• Tiempo máximo disponible: ${tiempoMaximo}
• Nivel de cocina: ${nivelCocina}
• Equipamiento disponible: ${equipamiento}
• Ingredientes próximos a caducar: ${porCaducar}
• Preferencia de sabor/región: ${preferenciaCulinaria}

═══════════════════════════════════════════════════════════════
REGLAS DE SEGURIDAD ALIMENTARIA (INQUEBRANTABLES)
═══════════════════════════════════════════════════════════════

1. Si ${alergiasUsuario} contiene alérgenos, EXCLÚYELOS COMPLETAMENTE de TODAS las recetas. No uses sustitutos que pertenezcan a la misma familia alergénica.
2. Si usas ingredientes de alto riesgo alergénico no declarados (frutos secos, mariscos, huevos, lácteos, gluten, soya, sésamo, mostaza, sulfitos, moluscos, pescado, cacahuates), DEBES incluir una advertencia explícita en "notasSeguridad".
3. NUNCA sugieras consumir ingredientes crudos que deban cocinarse (pollo, huevo, harina, etc.).
4. Si un ingrediente de ${porCaducar} está visiblemente en mal estado u oloroso, NO lo uses.

═══════════════════════════════════════════════════════════════
REGLAS DE PREFERENCIA ALIMENTICIA
═══════════════════════════════════════════════════════════════

• "Recomposición corporal": alto en proteína (>25g por porción), bajo en grasas saturadas, calorías moderadas (300-600 kcal). Evita fritos, harinas refinadas, azúcares añadidos. Incluye macros estimados por porción.
• "Vegetariano": EXCLUYE carne, pollo, pescado, mariscos. Permite huevos, lácteos, miel.
• "Vegano": EXCLUYE TODO producto de origen animal (carne, lácteos, huevos, miel, gelatina, caseína, albumina, cochinilla, etc.).
• "Keto": <20g carbohidratos netos por porción, alto en grasas saludables, proteína moderada-alta. Evita azúcar, harinas, frutas altas en azúcar, raíces almidonadas.
• "Sin gluten": EXCLUYE trigo, cebada, centeno, triticale, y sus derivados. Verifica que ingredientes procesados (salsas, aderezos) sean sin gluten.
• "Sin preferencia": sin restricciones. Sugiere recetas variadas y equilibradas.

═══════════════════════════════════════════════════════════════
REGLAS DE INGREDIENTES
═══════════════════════════════════════════════════════════════

1. Mínimo 70% de los ingredientes de cada receta DEBEN provenir de ${listaDeIngredientes}.
2. Prioriza OBLIGATORIAMENTE el uso de ingredientes listados en ${porCaducar}.
3. Ingredientes básicos de alacena (sal, pimienta, aceite vegetal, agua, azúcar, harina común) se asumen disponibles y NO cuentan como "faltantes". Aún así, menciónalos en "ingredientesUsados".
4. Si falta un ingrediente NO básico, inclúyelo en "ingredientesFaltantes" con:
   a) "comprar": sugerencia específica de producto y cantidad aproximada
   b) "sustituto": alternativa usando SOLO ingredientes de ${listaDeIngredientes}, o string vacio "" si no hay sustituto viable
5. Si ${listaDeIngredientes} tiene menos de 3 ingredientes útiles (excluyendo básicos de alacena), NO generes recetas.

═══════════════════════════════════════════════════════════════
REGLAS DE RECETAS
═══════════════════════════════════════════════════════════════

1. Genera EXACTAMENTE 3 recetas. Si no puedes generar 3 válidas, genera las que puedas y en el último slot devuelve el objeto de "sin recetas" definido abajo.
2. Las 3 recetas deben ser DIFERENTES en tipo de preparación:
   - Receta 1: Plato caliente (sartén, horno, olla)
   - Receta 2: Plato frío o ensalada/ensamblado
   - Receta 3: Plato de una sola olla/sartén, o método alternativo (air fryer, microondas, no-cook)
3. Ordénalas de menor a mayor dificultad (Fácil → Media → Difícil).
4. Cada receta debe ajustarse a ${comensales} porciones.
5. Respeta ${tiempoMaximo}. Si una receta excede el tiempo, indícalo en "notasCocina" y sugiere un atajo.
6. Adapta la complejidad de instrucciones a ${nivelCocina}:
   - "Principiante": técnicas simples, vocabulario claro, sin términos técnicos
   - "Intermedio": técnicas estándar, puede incluir sellado, reducciones
   - "Avanzado": técnicas complejas permitidas (sous vide, fermentación, etc.)
7. Si ${equipamiento} limita métodos (ej: "sin horno"), respétalo estrictamente.
8. Si ${preferenciaCulinaria} está definida, alinea al menos 2 de 3 recetas con esa región/estilo.

═══════════════════════════════════════════════════════════════
REGLAS DE MACROS Y NUTRICIÓN
═══════════════════════════════════════════════════════════════

1. Incluye macros estimados POR PORCIÓN para cada receta: calorías (kcal), proteínas (g), carbohidratos (g), grasas (g), fibra (g).
2. Si ${filtroUsuario} es "Recomposición corporal" o "Keto", los macros son obligatorios y deben ser realistas.
3. Incluye "notasNutricionales" destacando el beneficio principal de la receta según la preferencia del usuario.

═══════════════════════════════════════════════════════════════
FORMATO DE RESPUESTA JSON (ESTRICTO)
═══════════════════════════════════════════════════════════════

Devuelve ÚNICAMENTE un array JSON válido. Sin markdown, sin explicaciones, sin saludos. Utiliza un string vacio "" en lugar de null si no hay datos.

Estructura de cada objeto receta:

{
  "id": number (1, 2 o 3),
  "nombrePlatillo": "string (creativo pero descriptivo)",
  "descripcion": "string (1-2 líneas, qué es y por qué funciona con sus ingredientes)",
  "tipoPlato": "Desayuno|Almuerzo|Cena|Snack|Postre",
  "dificultad": "Fácil|Media|Difícil",
  "tiempoPreparacion": number,
  "tiempoCoccion": number,
  "tiempoTotal": number,
  "porciones": number,
  "equipamientoNecesario": ["string"],
  "ingredientesUsados": [
    {
      "nombre": "string",
      "cantidad": "string (ej: '2 tazas', '200g')",
      "deListaUsuario": boolean,
      "porCaducar": boolean
    }
  ],
  "ingredientesFaltantes": [
    {
      "nombre": "string",
      "cantidad": "string",
      "comprar": "string (sugerencia específica)",
      "sustituto": "string (usando solo ingredientes de lista, o string vacio '')",
      "esBasicoAlacena": boolean
    }
  ],
  "instrucciones": [
    {
      "paso": number,
      "accion": "string",
      "tiempoEstimado": number,
      "tecnica": "string (nombre técnica, o string vacio '')"
    }
  ],
  "tipsCocina": ["string (2-3 tips específicos)"],
  "macros": {
    "calorias": number,
    "proteinas": number,
    "carbohidratos": number,
    "grasas": number,
    "fibra": number
  },
  "notasNutricionales": "string",
  "notasSeguridad": "string (advertencias alérgenos o manipulación, o string vacio '')",
  "notasCocina": "string (atajos, sustituciones, adaptaciones, o string vacio '')",
  "tags": ["string (máx 5 tags descriptivos)"]
}

IMPORTANTE: NO devuelvas el JSON envuelto en bloques de código de Markdown (es decir, NO uses tres comillas invertidas ni la palabra json).

═══════════════════════════════════════════════════════════════
CASOS ESPECIALES
═══════════════════════════════════════════════════════════════

• Si ${listaDeIngredientes} tiene <3 ingredientes útiles:
  [
    {
      "id": 1,
      "nombrePlatillo": "Sin ingredientes suficientes",
      "descripcion": "Agrega al menos 3 ingredientes a tu despensa para recibir sugerencias personalizadas.",
      "tipoPlato": "",
      "dificultad": "",
      "tiempoPreparacion": 0,
      "tiempoCoccion": 0,
      "tiempoTotal": 0,
      "porciones": 0,
      "equipamientoNecesario": [],
      "ingredientesUsados": [],
      "ingredientesFaltantes": [],
      "instrucciones": [],
      "tipsCocina": [],
      "macros": {
        "calorias": 0,
        "proteinas": 0,
        "carbohidratos": 0,
        "grasas": 0,
        "fibra": 0
      },
      "notasNutricionales": "",
      "notasSeguridad": "",
      "notasCocina": "",
      "tags": []
    }
  ]

• Si solo puedes generar 1 o 2 recetas válidas, completa los slots restantes con el objeto "Sin recetas disponibles" (misma estructura que arriba, nombrePlatillo adaptado).

═══════════════════════════════════════════════════════════════
VALIDACIÓN FINAL (REALIZA ANTES DE ENVIAR)
═══════════════════════════════════════════════════════════════

1. ¿El JSON es sintácticamente válido? (comillas, comas, corchetes)
2. ¿Hay exactamente 3 objetos en el array (o 1 en caso de ingredientes insuficientes)?
3. ¿Ninguna receta viola ${alergiasUsuario}?
4. ¿Ninguna receta viola ${filtroUsuario}?
5. ¿Al menos 70% de ingredientes por receta vienen de ${listaDeIngredientes}?
6. ¿Se priorizaron ingredientes de ${porCaducar}?
7. ¿Las 3 recetas son de tipos diferentes?
8. ¿Están ordenadas de menor a mayor dificultad?
9. ¿Los macros son realistas y coherentes?
10. ¿No hay texto fuera del array JSON?

Responde SOLO con el array JSON. Nada más.`;

    const result = await model.generateContent(masterPrompt);
    const responseText = result.response.text();
    
    const cleanJson = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Error al generar recetas con Gemini:", error);
    throw error;
  }
};

export const analyzeImage = async (base64Image) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
Eres el sistema de visión óptica de "Voraci". Tu único trabajo es analizar esta foto y detectar todos los alimentos crudos, frutas, verduras o ingredientes empaquetados.

Devuelve ÚNICAMENTE un arreglo JSON válido. No uses bloques de Markdown ni comillas invertidas.

Estructura requerida por objeto:
[
  {
    "name": "string (Nombre claro del alimento, ej: Manzana, Leche, Pollo)",
    "category": "string (Ej: Frutas, Lácteos, Proteína, Verduras, General)",
    "quantity": 1,
    "unit": "pza"
  }
]
Si no detectas ningún alimento o la foto está borrosa, devuelve un arreglo vacío: []
`;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg"
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    const cleanJson = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Error al analizar la imagen:", error);
    throw error;
  }
};