import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Sora_700Bold } from '@expo-google-fonts/sora';
import { DMSans_400Regular, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebaseConfig';

import PantryScreen from './screens/PantryScreen';
import ChefScreen from './screens/ChefScreen';
import ScannerScreen from './screens/ScannerScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#1e293b', height: 52 },
        tabBarActiveTintColor: '#bef264',
        tabBarInactiveTintColor: '#475569',
        tabBarLabelStyle: { fontFamily: 'Sora_700Bold', fontSize: 13, marginBottom: 6 },
        tabBarIcon: () => null,
        tabBarIconStyle: { display: 'none' }
      }}
    >
      <Tab.Screen name="Despensa" component={PantryScreen} />
      <Tab.Screen name="Escáner" component={ScannerScreen} />
      <Tab.Screen name="Chef IA" component={ChefScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authResolved, setAuthResolved] = useState(false);

  const [fontsLoaded] = useFonts({
    Sora_700Bold,
    DMSans_400Regular,
    DMSans_600SemiBold,
    DMSans_700Bold
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthResolved(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (fontsLoaded && authResolved) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authResolved]);

  if (!fontsLoaded || !authResolved) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#bef264" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}