import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPantry } from '../services/pantryService';
import { generateRecipes } from '../services/aiService';

export default function ChefScreen() {
    const [recipes, setRecipes] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setRecipes(null);

        try {
            const pantry = await getPantry();
            const ingredientNames = pantry.map(item => item.name).join(', ');

            if (!ingredientNames || ingredientNames.trim() === '') {
                Alert.alert('Despensa Vacía', 'Agrega algunos alimentos en la pestaña de Despensa primero.');
                setLoading(false);
                return;
            }

            const saved = await AsyncStorage.getItem('@voraci_user_context');
            const userContext = saved ? JSON.parse(saved) : {
                filtroUsuario: 'General',
                alergiasUsuario: '',
                comensales: 1,
                tiempoMaximo: 30,
                nivelCocina: 'Intermedio',
                preferenciaCulinaria: 'General'
            };
            
            // Adjuntamos la lista de ingredientes al contexto
            userContext.listaDeIngredientes = ingredientNames;
            // Convertimos el tiempoMaximo numérico a string para el prompt (ej. "30 min")
            userContext.tiempoMaximo = `${userContext.tiempoMaximo} min`;

            const generatedData = await generateRecipes(userContext);
            
            if (Array.isArray(generatedData)) {
                setRecipes(generatedData);
            } else {
                throw new Error("Formato de recetas inválido");
            }

        } catch (error) {
            console.error("ChefScreen Error:", error);
            Alert.alert('Error', 'Hubo un problema de conexión con el Chef IA o el formato de respuesta no fue el esperado. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const renderMacro = (label, value) => (
        <View style={styles.macroPill}>
            <Text style={styles.macroText}>{label}: {value}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chef IA</Text>

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleGenerate}
                activeOpacity={0.85}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#0f172a" />
                ) : (
                    <Text style={styles.buttonText}>Generar Recetas</Text>
                )}
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
                {recipes ? (
                    recipes.map((recipe, index) => (
                        <View key={index} style={styles.recipeCard}>
                            <Text style={styles.recipeTitle}>{recipe.nombrePlatillo}</Text>
                            <Text style={styles.recipeDesc}>{recipe.descripcion}</Text>
                            
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Macros por porción</Text>
                                <View style={styles.macrosContainer}>
                                    {renderMacro('Calorías', `${recipe.macros?.calorias || 0} kcal`)}
                                    {renderMacro('Proteína', `${recipe.macros?.proteinas || 0}g`)}
                                    {renderMacro('Carbs', `${recipe.macros?.carbohidratos || 0}g`)}
                                    {renderMacro('Grasas', `${recipe.macros?.grasas || 0}g`)}
                                </View>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Ingredientes Usados</Text>
                                {recipe.ingredientesUsados?.map((ing, i) => (
                                    <Text key={i} style={styles.ingredientText}>• {ing.cantidad} de {ing.nombre}</Text>
                                ))}
                            </View>

                            {recipe.ingredientesFaltantes?.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: '#f87171' }]}>Faltantes</Text>
                                    {recipe.ingredientesFaltantes.map((ing, i) => (
                                        <Text key={i} style={styles.ingredientText}>• {ing.nombre} ({ing.comprar})</Text>
                                    ))}
                                </View>
                            )}

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Instrucciones</Text>
                                {recipe.instrucciones?.map((inst, i) => (
                                    <View key={i} style={styles.instructionRow}>
                                        <View style={styles.stepCircle}>
                                            <Text style={styles.stepNumber}>{inst.paso}</Text>
                                        </View>
                                        <Text style={styles.instructionText}>{inst.accion}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.placeholderText}>
                            Presiona el botón para analizar tu despensa y crear magia culinaria.
                        </Text>
                    </View>
                )}
                {/* Extra space at bottom for scroll */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        padding: 20,
        paddingTop: 60
    },
    title: {
        fontFamily: 'Sora_700Bold',
        fontSize: 28,
        color: '#bef264',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#bef264',
        padding: 15,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    buttonDisabled: {
        opacity: 0.7
    },
    buttonText: {
        color: '#0f172a',
        fontFamily: 'DMSans_700Bold',
        fontSize: 15
    },
    scrollArea: {
        flex: 1,
    },
    emptyState: {
        marginTop: 40,
        padding: 20,
        alignItems: 'center'
    },
    placeholderText: {
        fontFamily: 'DMSans_400Regular',
        color: '#94a3b8',
        textAlign: 'center',
        fontSize: 15,
        lineHeight: 22
    },
    recipeCard: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 18,
        marginBottom: 20,
        borderLeftWidth: 3,
        borderLeftColor: '#bef264',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    recipeTitle: {
        fontFamily: 'Sora_700Bold',
        fontSize: 20,
        color: '#bef264',
        marginBottom: 6
    },
    recipeDesc: {
        fontFamily: 'DMSans_400Regular',
        color: '#e2e8f0',
        fontSize: 14,
        marginBottom: 15,
        lineHeight: 20
    },
    section: {
        marginBottom: 15
    },
    sectionTitle: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 13,
        color: '#94a3b8',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    macrosContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    macroPill: {
        backgroundColor: 'rgba(190,242,100,0.12)',
        borderColor: '#bef264',
        borderWidth: 1,
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 10,
    },
    macroText: {
        color: '#bef264',
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 12
    },
    ingredientText: {
        fontFamily: 'DMSans_400Regular',
        color: '#e2e8f0',
        fontSize: 14,
        marginBottom: 4
    },
    instructionRow: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-start'
    },
    stepCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#bef264',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2
    },
    stepNumber: {
        color: '#0f172a',
        fontFamily: 'DMSans_700Bold',
        fontSize: 12
    },
    instructionText: {
        flex: 1,
        fontFamily: 'DMSans_400Regular',
        color: '#e2e8f0',
        fontSize: 14,
        lineHeight: 22
    }
});