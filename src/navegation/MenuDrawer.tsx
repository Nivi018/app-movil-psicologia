import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem
} from "@react-navigation/drawer";

import { StackNavigator } from "./StackNavigation";
import { HomeScreen } from "../screens/HomeScreen";
import { globalColors } from "../theme/theme";
import { useWindowDimensions, View } from "react-native";
import { AgendaScreen } from "../screens/AgendaScreen";
import { ExpedientesScreen } from "../screens/ExpedientesScreen";
import { useAuth } from "../context/authContext"; // <-- Asegúrate que la ruta sea correcta

const Drawer = createDrawerNavigator();

export const MyDrower = () => {
  const dimensions = useWindowDimensions();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: dimensions.width >= 758 ? "permanent" : "slide",
        drawerStyle: { width: 250 },
        drawerActiveBackgroundColor: globalColors.primary,
        drawerActiveTintColor: "white",
        drawerInactiveTintColor: globalColors.primary,
        drawerItemStyle: {
          borderRadius: 100,
          paddingHorizontal: 20,
        },
      }}
    >
      <Drawer.Screen name="StackNavigator" component={StackNavigator} />
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Agenda" component={AgendaScreen} />
      <Drawer.Screen name="Expedientes" component={ExpedientesScreen} />
    </Drawer.Navigator>
  );
};

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { logout } = useAuth(); // 👈 Usa el contexto para cerrar sesión correctamente

  const handleLogout = () => {
    logout(); // Esto hará que App.tsx muestre LoginScreen
  };

  return (
    <DrawerContentScrollView>
      <View
        style={{
          height: 150,
          width: 150,
          backgroundColor: globalColors.primary,
          margin: 30,
          borderRadius: 50,
        }}
      />

      <DrawerItemList {...props} />

      <DrawerItem
        label="Cerrar sesión"
        labelStyle={{ color: "red" }}
        onPress={handleLogout}
      />
    </DrawerContentScrollView>
  );
};
