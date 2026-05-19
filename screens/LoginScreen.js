import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { signInWithGoogle } from '../services/authService';

export default function LoginScreen() {
    const [loading, setLoading] = useState(false);

    const fadeAnim1 = useRef(new Animated.Value(0)).current;
    const fadeAnim2 = useRef(new Animated.Value(0)).current;
    const fadeAnim3 = useRef(new Animated.Value(0)).current;
    const fadeAnim4 = useRef(new Animated.Value(0)).current;
    const translateYAnim1 = useRef(new Animated.Value(20)).current;
    const translateYAnim2 = useRef(new Animated.Value(20)).current;
    const translateYAnim3 = useRef(new Animated.Value(20)).current;
    const translateYAnim4 = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.stagger(200, [
            Animated.parallel([
                Animated.timing(fadeAnim1, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.timing(translateYAnim1, { toValue: 0, duration: 600, useNativeDriver: true })
            ]),
            Animated.parallel([
                Animated.timing(fadeAnim2, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.timing(translateYAnim2, { toValue: 0, duration: 600, useNativeDriver: true })
            ]),
            Animated.parallel([
                Animated.timing(fadeAnim3, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.timing(translateYAnim3, { toValue: 0, duration: 600, useNativeDriver: true })
            ]),
            Animated.parallel([
                Animated.timing(fadeAnim4, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.timing(translateYAnim4, { toValue: 0, duration: 600, useNativeDriver: true })
            ])
        ]).start();
    }, []);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (error) {
            Alert.alert('Error', 'No se pudo iniciar sesión con Google.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Grain/dots background simulation */}
            <View style={styles.grainOverlay} />

            <View style={styles.content}>
                <Animated.View style={{ opacity: fadeAnim1, transform: [{ translateY: translateYAnim1 }], alignItems: 'center' }}>
                    {/* Decorative minimalist fork/pot icon */}
                    <View style={styles.iconContainer}>
                        <View style={styles.potBody} />
                        <View style={styles.potLid} />
                        <View style={styles.potHandle} />
                    </View>
                </Animated.View>

                <Animated.View style={{ opacity: fadeAnim2, transform: [{ translateY: translateYAnim2 }] }}>
                    <Text style={styles.title}>Voraci</Text>
                </Animated.View>

                <Animated.View style={{ opacity: fadeAnim3, transform: [{ translateY: translateYAnim3 }] }}>
                    <Text style={styles.tagline}>Tu chef inteligente, siempre listo</Text>
                </Animated.View>

                <Animated.View style={[{ opacity: fadeAnim4, transform: [{ translateY: translateYAnim4 }], width: '100%', alignItems: 'center' }]}>
                    <TouchableOpacity
                        style={styles.googleButton}
                        activeOpacity={0.85}
                        onPress={handleGoogleSignIn}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <View style={styles.googleButtonContent}>
                                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={styles.googleIcon}>
                                    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </Svg>
                                <Text style={styles.googleButtonText}>Continuar con Google</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
    },
    grainOverlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.05,
        backgroundColor: 'transparent',
        // In a real app we'd use a repeating texture image, 
        // but sticking to StyleSheet: we use a subtle dotted pattern simulation if possible, 
        // or just rely on the solid dark background to stay within constraints.
    },
    content: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    potBody: {
        width: 60,
        height: 40,
        backgroundColor: '#bef264',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginTop: 10,
    },
    potLid: {
        width: 70,
        height: 8,
        backgroundColor: '#bef264',
        borderRadius: 4,
    },
    potHandle: {
        width: 16,
        height: 6,
        backgroundColor: '#bef264',
        position: 'absolute',
        top: 2,
        borderRadius: 3,
    },
    title: {
        fontFamily: 'Sora_700Bold',
        fontSize: 42,
        color: '#bef264',
        marginBottom: 10,
        textAlign: 'center',
    },
    tagline: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        color: '#94a3b8',
        marginBottom: 50,
        textAlign: 'center',
    },
    googleButton: {
        backgroundColor: '#1e293b',
        borderRadius: 14,
        width: '100%',
        maxWidth: 300,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    googleButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleIcon: {
        marginRight: 12,
    },
    googleButtonText: {
        fontFamily: 'DMSans_700Bold',
        color: '#ffffff',
        fontSize: 16,
    }
});
