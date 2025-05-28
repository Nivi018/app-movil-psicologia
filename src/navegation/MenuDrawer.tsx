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
import { useWindowDimensions, View, Image } from "react-native";
import { AgendaScreen } from "../screens/AgendaScreen";
import { ExpedientesScreen } from "../screens/ExpedientesScreen";
import { MostrarExpedientesScreen } from "../screens/MostrarExpedientesScreen";
import { useAuth } from "../context/authContext"; // <-- Asegúrate que la ruta sea correcta

const Drawer = createDrawerNavigator();

export const MyDrower = () => {
  const dimensions = useWindowDimensions();
  const { userRole } = useAuth();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerType: dimensions.width >= 750 ? "permanent" : "slide",
        drawerStyle: { width: 250 },
        drawerActiveBackgroundColor: globalColors.success,
        drawerActiveTintColor: "white",
        drawerInactiveTintColor: globalColors.success,
        drawerItemStyle: {
          borderRadius: 100,
          paddingHorizontal: 20,
        },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Agenda" component={AgendaScreen} />
      {userRole === "admin" && (
        <Drawer.Screen name="Expediente" component={ExpedientesScreen} />
      )}
      {userRole === "admin" && (
        <Drawer.Screen name="Mostrar Expedientes" component={MostrarExpedientesScreen} />
      )}
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
      <View style={{ alignItems: "center", marginVertical: 10 }}>
        <Image
          source={require("../assets/LogoTec.png")} // Asegúrate de que la ruta sea correcta
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            marginBottom: 1,
          }}
          resizeMode="cover"
        />
      </View>
      

      <DrawerItemList {...props} />

      <DrawerItem
        label="Cerrar sesión"
        labelStyle={{ color: "red" }}
        onPress={handleLogout}
      />
    </DrawerContentScrollView>
  );
};
