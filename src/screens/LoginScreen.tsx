import React, { useRef, useEffect,  useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/authContext'; // Ajusta la ruta
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import { Picker } from '@react-native-picker/picker';



import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  Keyboard,
  ScrollView,
  Alert
} from 'react-native';

import { PrimaryButton } from '../components/shared/PrimaryButton';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParams } from '../navegation/StackNavigation';
import { globalStyles } from '../theme/theme';



const { height: screenHeight } = Dimensions.get('window');

export const LoginScreen = () => {
  const { login } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const bottomSheetAnim = useRef(new Animated.Value(screenHeight * 0.8)).current;
  const [collapsed, setCollapsed] = useState(false);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [userType, setUserType] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const listenerId = bottomSheetAnim.addListener(({ value }) => {
      setCollapsed(value >= screenHeight * 0.7);
    });

    return () => {
      bottomSheetAnim.removeListener(listenerId);
    };
  }, []);

  const topCardHeight = bottomSheetAnim.interpolate({
    inputRange: [screenHeight * 0.2, screenHeight * 0.8],
    outputRange: [screenHeight * 0.3, screenHeight * 0.6],
    extrapolate: 'clamp',
  });

  const toggleBottomCard = () => {
    const toValue = collapsed ? screenHeight * 0.2 : screenHeight * 0.8;
    Animated.timing(bottomSheetAnim, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const closeBottomCard = () => {
    Animated.timing(bottomSheetAnim, {
      toValue: screenHeight * 0.2,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleLogin = async () => {
  try {
    setError(null);
    const url =
      userType === 'admin'
        ? 'https://backend-psicologia.fly.dev/api/admin/loginAdmin'
        : 'https://backend-psicologia.fly.dev/api/users/login';

    const response = await axios.post(url, formData);

    const data = response.data;

    if (data.success) {
      console.log('Login exitoso:', data);

      const token = data.token;
      await AsyncStorage.setItem('token', token);

      // Decodificar el token para obtener rol y email
      const decoded: any = jwtDecode(token);
      await AsyncStorage.setItem('role', decoded.rol);

      login(); // Cambiar estado global

      Alert.alert('Éxito', 'Inicio de sesión correcto', [
        {
          text: 'Aceptar',
          onPress: () => navigation.navigate('Expedientes'),
        },
      ]);
    } else {
      setError(data.message || 'Credenciales incorrectas');
      Alert.alert('Error', data.message || 'Credenciales incorrectas');
    }
  } catch (err: any) {
    if (err.response) {
      console.error('Respuesta del servidor con error:', err.response.data);
      setError(err.response.data?.message || 'Error del servidor');
      Alert.alert('Error', err.response.data?.message || 'Error del servidor');
    } else if (err.request) {
      console.error('No hubo respuesta del servidor:', err.request);
      setError('No se recibió respuesta del servidor.');
      Alert.alert('Error', 'No se recibió respuesta del servidor.');
    } else {
      console.error('Error en la configuración de la solicitud:', err.message);
      setError('Error al enviar solicitud.');
      Alert.alert('Error', 'Error al enviar solicitud.');
    }
  }
};



  return (
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={globalStyles.container}>
      <Pressable onPress={closeBottomCard}>
        <Animated.View style={[globalStyles.topCard, { height: topCardHeight }]}>
          <Text style={globalStyles.title}>Bienvenido</Text>
        </Animated.View>
      </Pressable>

      <Animated.View style={[globalStyles.bottomCard, { top: bottomSheetAnim }]}>
        <Pressable onPress={toggleBottomCard}>
          <View style={globalStyles.handleLarge} />
        </Pressable>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <ScrollView
            contentContainerStyle={globalStyles.form}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={globalStyles.label}>Tipo de usuario</Text>
            <View style={globalStyles.pickerContainer}>
              <Picker
                selectedValue={userType}
                onValueChange={(itemValue) => setUserType(itemValue)}
              >
                <Picker.Item label="Usuario" value="user" />
                <Picker.Item label="Administrador" value="admin" />
              </Picker>
            </View>
            
            <Text style={globalStyles.label}>Correo electrónico</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="email@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
            />

            <Text style={globalStyles.label}>Contraseña</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="********"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, password: text }))}
            />

            

            <PrimaryButton label="Iniciar sesión" onpress={handleLogin} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  </TouchableWithoutFeedback>
);
};
