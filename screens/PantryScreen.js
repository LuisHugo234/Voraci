import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { getPantry, addIngredient, deleteIngredient } from '../services/pantryService';

export default function PantryScreen() {
    const [ingredients, setIngredients] = useState([]);
    const [filteredIngredients, setFilteredIngredients] = useState([]);
    const [inputText, setInputText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            const data = await getPantry();
            setIngredients(data);
            setFilteredIngredients(data);
        } catch (error) {
            Alert.alert('Error', 'No se pudo cargar la despensa');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        const filtered = ingredients.filter(item =>
            item.name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredIngredients(filtered);
    };

    const handleAdd = async () => {
        if (inputText.trim() === '') {
            Alert.alert('Validación', 'Por favor ingresa un alimento válido.');
            return;
        }

        await addIngredient({
            name: inputText.trim(),
            category: 'General',
            quantity: 1
        });

        setInputText('');
        loadData();
    };

    const handleDelete = async (id) => {
        await deleteIngredient(id);
        loadData();
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4ade80" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tu Despensa</Text>

            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Ej. Manzanas, Pollo..."
                    placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={handleAdd}>
                    <Text style={styles.buttonText}>Agregar</Text>
                </TouchableOpacity>
            </View>

            <TextInput
                style={[styles.input, { marginBottom: 20 }]}
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="Buscar en tu despensa"
                placeholderTextColor="#94a3b8"
            />

            <FlatList
                data={filteredIngredients}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View style={styles.itemCard}>
                        <View style={styles.chipPill}>
                            <Text style={styles.chipText}>{item.name}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDelete(item.id)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.deleteText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Tu despensa está vacía.</Text>}
            />
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a'
    },
    title: {
        fontFamily: 'Sora_700Bold',
        fontSize: 28,
        color: '#bef264',
        marginBottom: 20,
    },
    formContainer: {
        flexDirection: 'row',
        marginBottom: 15
    },
    input: {
        flex: 1,
        backgroundColor: '#1e293b',
        color: '#e2e8f0',
        padding: 15,
        borderRadius: 14,
        marginRight: 10,
        fontFamily: 'DMSans_400Regular',
        fontSize: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    button: {
        backgroundColor: '#bef264',
        justifyContent: 'center',
        paddingHorizontal: 20,
        borderRadius: 14,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    buttonText: {
        color: '#0f172a',
        fontFamily: 'DMSans_700Bold',
        fontSize: 15
    },
    itemCard: {
        backgroundColor: '#1e293b',
        padding: 15,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    chipPill: {
        backgroundColor: 'rgba(190,242,100,0.12)',
        borderColor: '#bef264',
        borderWidth: 1,
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    chipText: {
        color: '#bef264',
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 14
    },
    deleteButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    deleteText: {
        color: '#f87171',
        fontSize: 18,
        fontWeight: 'bold'
    },
    emptyText: {
        color: '#94a3b8',
        fontFamily: 'DMSans_400Regular',
        textAlign: 'center',
        marginTop: 30,
        fontSize: 15
    }
});