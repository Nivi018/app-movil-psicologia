import React, { useRef, useEffect,  useState } from 'react';
import axios from 'axios';


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

  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const bottomSheetAnim = useRef(new Animated.Value(screenHeight * 0.8)).current;
  const [collapsed, setCollapsed] = React.useState(false);

  /* estados de componetes de login*/
  const [formData, setFormData ]=useState({email:'', password: ''});
  const [useType, setUserType ] = useState<'user' | 'admin'>('user');
  const [error, setError]= useState<string | null>(null);



  useEffect(() => {
    const listenerId = bottomSheetAnim.addListener(({ value }) => {
      setCollapsed(value >= screenHeight * 0.7);
    });

    return () => {
      bottomSheetAnim.removeListener(listenerId); // Limpiar el listener
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


  /**login */
  const handleLogin = async () => {
    try {
      setError(null);
      const response = await axios.post('https://backend-psicologia.fly.dev/api/admin/loginAdmin', formData);
      
      if (response.status === 200) {
        console.log('Login exitoso:', response.data);
  
        // Mostrar alerta de éxito
        Alert.alert('Éxito', 'Inicio de sesión correcto', [
          {
            text: 'Aceptar',
            onPress: () => navigation.navigate('Expedientes') // Navega después de cerrar la alerta
          }
        ]);
      }
    } catch (err: any) {
      console.log('Error en login:', err.response?.data || err.message);
      setError('Correo o contraseña incorrectos');
  
      // Opcional: Mostrar alerta de error también
      Alert.alert('Error', 'Correo o contraseña incorrectos');
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
              <Text style={globalStyles.label}>Correo electrónico</Text>
              <TextInput
                style={globalStyles.input}
                placeholder="email@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text)=> setFormData((prev)=>({ ...prev, email:text}))}
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