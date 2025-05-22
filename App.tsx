import './gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { MyDrower } from './src/navegation/MenuDrawer';
import { LoginScreen } from './src/screens/LoginScreen';
import { AuthProvider, useAuth } from './src/context/authContext';

const MainNavigator = () => {
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? <MyDrower /> : <LoginScreen />;
};

function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

export default App;
