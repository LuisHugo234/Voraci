import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { auth } from '../services/firebaseConfig';
import { signOut } from '../services/authService';

export default function ProfileScreen() {
    const user = auth.currentUser;
    const [filtroUsuario, setFiltroUsuario] = useState('General');
    const [alergiasUsuario, setAlergiasUsuario] = useState('');
    const [comensales, setComensales] = useState(1);
    const [tiempoMaximo, setTiempoMaximo] = useState(30);
    const [nivelCocina, setNivelCocina] = useState('Intermedio');
    const [preferenciaCulinaria, setPreferenciaCulinaria] = useState('General');

    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const saved = await AsyncStorage.getItem('@voraci_user_context');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setFiltroUsuario(parsed.filtroUsuario || 'General');
                    setAlergiasUsuario(parsed.alergiasUsuario || '');
                    setComensales(parsed.comensales || 1);
                    setTiempoMaximo(parsed.tiempoMaximo || 30);
                    setNivelCocina(parsed.nivelCocina || 'Intermedio');
                    setPreferenciaCulinaria(parsed.preferenciaCulinaria || 'General');
                }
            } catch (error) {
                console.error("Error al cargar preferencias:", error);
            }
        };
        loadPreferences();
    }, []);

    const handleSave = async () => {
        const userContext = {
            filtroUsuario,
            alergiasUsuario,
            comensales,
            tiempoMaximo,
            nivelCocina,
            preferenciaCulinaria
        };
        try {
            await AsyncStorage.setItem('@voraci_user_context', JSON.stringify(userContext));
            Alert.alert("¡Preferencias guardadas!", "El Chef IA las usará en tu próxima receta.");
        } catch (error) {
            Alert.alert("Error", "No se pudieron guardar las preferencias.");
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            Alert.alert("Error", "Hubo un problema al cerrar sesión.");
        }
    };

    const renderPills = (options, selectedValue, onSelect) => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
            {options.map((option, index) => {
                const isSelected = selectedValue === option;
                return (
                    <TouchableOpacity
                        key={index}
                        style={[styles.pill, isSelected && styles.pillSelected]}
                        onPress={() => onSelect(option)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                            {option}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* HEADER DE USUARIO */}
                <View style={styles.header}>
                    {user?.photoURL ? (
                        <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarFallback}>
                            <Text style={styles.avatarFallbackText}>
                                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                            </Text>
                        </View>
                    )}
                    <Text style={styles.userName}>{user?.displayName || 'Usuario Voraci'}</Text>
                    <Text style={styles.userEmail}>{user?.email || ''}</Text>
                </View>

                {/* PREFERENCIAS DEL CHEF IA */}
                <Text style={styles.sectionTitle}>PREFERENCIAS DEL CHEF IA</Text>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Objetivo Dietético</Text>
                    {renderPills(['Recomposición Corporal', 'Keto', 'Vegano', 'Vegetariano', 'General'], filtroUsuario, setFiltroUsuario)}
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Alergias o Intolerancias</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="ej. lactosa, mariscos, gluten..."
                        placeholderTextColor="#94a3b8"
                        value={alergiasUsuario}
                        onChangeText={setAlergiasUsuario}
                    />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Comensales</Text>
                    <View style={styles.counterContainer}>
                        <TouchableOpacity 
                            style={styles.counterBtn} 
                            onPress={() => setComensales(Math.max(1, comensales - 1))}
                        >
                            <Text style={styles.counterBtnText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.counterValue}>{comensales}</Text>
                        <TouchableOpacity 
                            style={styles.counterBtn} 
                            onPress={() => setComensales(Math.min(10, comensales + 1))}
                        >
                            <Text style={styles.counterBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Tiempo Máximo de Preparación</Text>
                    <Slider
                        style={{ width: '100%', height: 40 }}
                        minimumValue={15}
                        maximumValue={60}
                        step={15}
                        value={tiempoMaximo}
                        onValueChange={setTiempoMaximo}
                        minimumTrackTintColor="#bef264"
                        maximumTrackTintColor="#475569"
                        thumbTintColor="#bef264"
                    />
                    <Text style={styles.sliderValueText}>Máximo {tiempoMaximo} min</Text>
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Nivel de Cocina</Text>
                    {renderPills(['Principiante', 'Intermedio', 'Avanzado'], nivelCocina, setNivelCocina)}
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Preferencia Culinaria</Text>
                    {renderPills(['General', 'Mexicana', 'Francesa', 'Italiana', 'Asiática', 'Mediterránea'], preferenciaCulinaria, setPreferenciaCulinaria)}
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
                    <Text style={styles.saveBtnText}>Guardar Preferencias</Text>
                </TouchableOpacity>

                {/* CUENTA */}
                <View style={styles.accountSection}>
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
                        <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    scrollContent: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    avatarFallback: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#bef264',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarFallbackText: {
        fontSize: 32,
        fontFamily: 'Sora_700Bold',
        color: '#0f172a',
    },
    userName: {
        fontSize: 20,
        fontFamily: 'Sora_700Bold',
        color: '#e2e8f0',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#94a3b8',
    },
    sectionTitle: {
        fontSize: 13,
        fontFamily: 'DMSans_700Bold',
        color: '#94a3b8',
        marginBottom: 15,
        letterSpacing: 1,
    },
    fieldContainer: {
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: 14,
        fontFamily: 'DMSans_600SemiBold',
        color: '#e2e8f0',
        marginBottom: 10,
    },
    pillsScroll: {
        flexDirection: 'row',
    },
    pill: {
        backgroundColor: '#1e293b',
        borderWidth: 1,
        borderColor: '#475569',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
    },
    pillSelected: {
        backgroundColor: '#bef264',
        borderColor: '#bef264',
    },
    pillText: {
        color: '#94a3b8',
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 13,
    },
    pillTextSelected: {
        color: '#0f172a',
    },
    input: {
        backgroundColor: '#1e293b',
        borderWidth: 1,
        borderColor: '#475569',
        borderRadius: 12,
        color: '#e2e8f0',
        padding: 12,
        fontFamily: 'DMSans_400Regular',
        fontSize: 15,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    counterBtn: {
        backgroundColor: '#1e293b',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    counterBtnText: {
        color: '#bef264',
        fontSize: 20,
        fontFamily: 'Sora_700Bold',
    },
    counterValue: {
        color: '#e2e8f0',
        fontSize: 18,
        fontFamily: 'Sora_700Bold',
        marginHorizontal: 20,
    },
    sliderValueText: {
        color: '#94a3b8',
        fontFamily: 'DMSans_400Regular',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 5,
    },
    saveBtn: {
        backgroundColor: '#bef264',
        borderRadius: 14,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    saveBtnText: {
        color: '#0f172a',
        fontFamily: 'Sora_700Bold',
        fontSize: 15,
    },
    accountSection: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#1e293b',
        paddingTop: 30,
    },
    logoutBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#f87171',
        borderRadius: 14,
        padding: 15,
        alignItems: 'center',
    },
    logoutBtnText: {
        color: '#f87171',
        fontFamily: 'Sora_700Bold',
        fontSize: 15,
    }
});
