
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from '../screens/LoginScreen';
//import { RegistroScree } from '../screens/RegistroScree';
import { HomeScreen } from '../screens/HomeScreen';
import { AgendaScreen } from '../screens/AgendaScreen';
import { ExpedientesScreen } from '../screens/ExpedientesScreen';


export type RootStackParams = {
    Home: undefined
    Login: undefined,
    //Registro: undefined,
    Expedientes:undefined,
    Agenda: { logged: boolean; name: string }
}

const Stack= createStackNavigator<RootStackParams>();



export const StackNavigator=()=> {
  return (
   <Stack.Navigator screenOptions={{
    headerShown: true,
    headerStyle: {
        elevation: 0,
        shadowColor: 'transparent'
    }
   }}> 


        <Stack.Screen  name='Home' component={HomeScreen}/>
        <Stack.Screen  name='Login' component={LoginScreen}/>
        {/*<Stack.Screen name='Registro' component={RegistroScree}/>*/}
        <Stack.Screen name='Expedientes' component={ExpedientesScreen}/>
        <Stack.Screen name='Agenda' component={AgendaScreen}/>
        
   </Stack.Navigator>
  );
}