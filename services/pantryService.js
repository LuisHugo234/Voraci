import AsyncStorage from '@react-native-async-storage/async-storage';

// Aquí Luis tenemos todo comentado para que sepas que hace cada cosa

// Definimos la key bajo la cual se guardará toda nuestra despensa en la memoria del celular
const PANTRY_KEY = '@chefai_pantry';

// Agrega un nuevo alimento a la despensa
export const addIngredient = async (ingredient) => {
    try {
        // Traemos lo que ya existe
        const currentPantry = await getPantry();

        // Creamos el nuevo objeto con un ID único
        const newIngredient = {
            id: Date.now().toString(), // Genera un ID rápido basado en el tiempo
            name: ingredient.name,
            category: ingredient.category || 'General',
            quantity: ingredient.quantity || 1,
            unit: ingredient.unit || 'pza',
            dateAdded: new Date().toISOString(),
        };

        // Lo agregamos a la lista
        const updatedPantry = [...currentPantry, newIngredient];

        // Guardamos la nueva lista en la memoria
        await AsyncStorage.setItem(PANTRY_KEY, JSON.stringify(updatedPantry));

        return newIngredient; // Retornamos el objeto creado por si el frontend lo necesita
    } catch (error) {
        console.error('Error al guardar el ingrediente:', error);
        throw error;
    }
};

// Se obtiene toda la lista de alimentos
export const getPantry = async () => {
    try {
        const pantryData = await AsyncStorage.getItem(PANTRY_KEY);

        if (pantryData === null) {
            const defaultData = [
                { id: '1', name: 'Pechuga de Pollo', category: 'Proteína', quantity: 1, unit: 'kg' },
                { id: '2', name: 'Avena', category: 'Carbohidratos', quantity: 500, unit: 'g' },
                { id: '3', name: 'Huevos', category: 'Proteína', quantity: 12, unit: 'pza' }
            ];
            return defaultData;
        }

        return JSON.parse(pantryData);
    } catch (error) {
        console.error('Error al leer la despensa:', error);
        return [];
    }
};

// Modificamos algún alimento YA existente en la lista
export const updateIngredient = async (id, updatedFields) => {
    try {
        const currentPantry = await getPantry();

        // Buscamos el elemento y actualizamos sus campos
        const updatedPantry = currentPantry.map(item =>
            item.id === id ? { ...item, ...updatedFields } : item
        );

        await AsyncStorage.setItem(PANTRY_KEY, JSON.stringify(updatedPantry));
        return true;
    } catch (error) {
        console.error('Error al actualizar el ingrediente:', error);
        throw error;
    }
};

// Eliminamos algún alimento de la lista
export const deleteIngredient = async (id) => {
    try {
        const currentPantry = await getPantry();

        // Filtramos para dejar todos MENOS el que queremos borrar
        const updatedPantry = currentPantry.filter(item => item.id !== id);

        await AsyncStorage.setItem(PANTRY_KEY, JSON.stringify(updatedPantry));
        return true;
    } catch (error) {
        console.error('Error al eliminar el ingrediente:', error);
        throw error;
    }
};

// Se borra la despensa completa
export const clearPantry = async () => {
    try {
        await AsyncStorage.removeItem(PANTRY_KEY);
        return true;
    } catch (error) {
        console.error('Error al vaciar la despensa:', error);
        throw error;
    }
};