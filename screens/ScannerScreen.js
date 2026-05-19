import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { analyzeImage } from '../services/aiService';
import { addIngredient } from '../services/pantryService';

export default function ScannerScreen({ navigation }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const cameraRef = useRef(null);

    // Animación de pulso
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
            ])
        ).start();
    }, [pulseAnim]);

    if (!permission) return <View style={styles.container} />;

    if (!permission.granted) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.title}>Voraci necesita tus ojos 👀</Text>
                <Text style={styles.subtitle}>Para escanear tus ingredientes, necesitamos acceso a tu cámara.</Text>
                <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Otorgar Permiso</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const result = await cameraRef.current.takePictureAsync({
                    quality: 0.5,
                    base64: true,
                });
                setPhoto(result);
            } catch (error) {
                Alert.alert('Error', 'No se pudo capturar la imagen.');
            }
        }
    };

    const clearPhoto = () => {
        setPhoto(null);
    };

    const handleUsePhoto = async () => {
        setLoading(true);
        try {
            const alimentosDetectados = await analyzeImage(photo.base64);

            if (alimentosDetectados.length === 0) {
                Alert.alert('Mmm...', 'No pude detectar ningún alimento claro en esta foto. Intenta de nuevo.');
                setLoading(false);
                clearPhoto();
                return;
            }

            for (const item of alimentosDetectados) {
                await addIngredient(item);
            }

            Alert.alert(
                '¡Magia completada!',
                `Se agregaron ${alimentosDetectados.length} alimentos a tu despensa.`,
                [
                    {
                        text: 'Ver Despensa', onPress: () => {
                            clearPhoto();
                            navigation.navigate('Despensa');
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Hubo un problema al conectar con la IA de visión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {photo ? (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: photo.uri }} style={styles.imagePreview} />

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#bef264" />
                            <Animated.Text style={[styles.loadingText, { opacity: pulseAnim }]}>
                                La IA está analizando tu foto...
                            </Animated.Text>
                        </View>
                    ) : (
                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85} onPress={clearPhoto}>
                                <Text style={styles.secondaryButtonText}>Descartar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} onPress={handleUsePhoto}>
                                <Text style={styles.buttonText}>Analizar Foto</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            ) : (
                <CameraView style={styles.camera} facing="back" ref={cameraRef}>
                    {/* Overlay Decorativo */}
                    <View style={styles.overlayContainer}>
                        <View style={styles.scannerFrame}>
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                            <Animated.Text style={[styles.instructionText, { opacity: pulseAnim }]}>
                                Alinea los alimentos en el marco
                            </Animated.Text>
                        </View>
                    </View>

                    <View style={styles.cameraControls}>
                        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                            <View style={styles.captureInnerCircle} />
                        </TouchableOpacity>
                    </View>
                </CameraView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a'
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        padding: 20
    },
    title: {
        fontFamily: 'Sora_700Bold',
        fontSize: 24,
        color: '#bef264',
        marginBottom: 10,
        textAlign: 'center'
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        color: '#94a3b8',
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 30
    },
    button: {
        backgroundColor: '#bef264',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 14,
        minWidth: 200,
        alignItems: 'center'
    },
    buttonText: {
        color: '#0f172a',
        fontFamily: 'DMSans_700Bold',
        fontSize: 15
    },
    camera: {
        flex: 1
    },
    overlayContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scannerFrame: {
        width: 250,
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: '#bef264',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 2,
        borderLeftWidth: 2,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 2,
        borderRightWidth: 2,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 2,
        borderRightWidth: 2,
    },
    instructionText: {
        fontFamily: 'DMSans_600SemiBold',
        color: '#bef264',
        fontSize: 14,
        textAlign: 'center',
        marginTop: '110%'
    },
    cameraControls: {
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 40,
        paddingTop: 20
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    captureInnerCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white'
    },
    previewContainer: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#0f172a'
    },
    imagePreview: {
        flex: 1,
        borderRadius: 16,
        marginBottom: 20
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    secondaryButton: {
        backgroundColor: '#1e293b',
        padding: 15,
        borderRadius: 14,
        flex: 0.48,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f87171'
    },
    secondaryButtonText: {
        color: '#f87171',
        fontFamily: 'DMSans_700Bold',
        fontSize: 15
    },
    primaryButton: {
        backgroundColor: '#bef264',
        padding: 15,
        borderRadius: 14,
        flex: 0.48,
        alignItems: 'center'
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    loadingText: {
        fontFamily: 'DMSans_600SemiBold',
        color: '#bef264',
        marginTop: 15,
        fontSize: 15,
    }
});