import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './firebaseConfig';

// Configurar Google Sign-In
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
});

export const signInWithGoogle = async () => {
  try {
    // 1. Forzar el picker de cuentas borrando el token de Google anterior
    try {
      await GoogleSignin.revokeAccess();
    } catch (e) {
      // Ignoramos el error si no había sesión previa o el token ya estaba revocado
    }

    // 2. Obtener el token de Google
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    // En las versiones recientes (v13+), el token viene dentro de .data
    const idToken = userInfo?.data?.idToken || userInfo?.idToken;

    if (!idToken) {
      throw new Error("No se pudo obtener el ID Token de Google");
    }

    // 2. Crear una credencial de Google para Firebase
    const googleCredential = GoogleAuthProvider.credential(idToken);

    // 3. Iniciar sesión con la credencial en Firebase
    const userCredential = await signInWithCredential(auth, googleCredential);
    return userCredential.user;
  } catch (error) {
    console.error('Error en Google Sign-In:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await GoogleSignin.revokeAccess();
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
};
