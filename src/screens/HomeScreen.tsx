import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react'
import { Pressable, Text, View } from 'react-native'
import { RootStackParams } from '../navegation/StackNavigation';
import { globalStyles } from '../theme/theme';
import { PrimaryButton } from '../components/shared/PrimaryButton';


export const HomeScreen = () => {


     const navigation = useNavigation<NavigationProp<RootStackParams>>();

     useEffect(()=>{
        navigation.setOptions({
            headerLeft: ()=>{
                <Pressable>
                    <Text>Menu</Text>
                </Pressable>
            }
        })
     },[])

  return (
    <View style={globalStyles.container}>
           <PrimaryButton
                onpress={()=> navigation.navigate('Agenda' as never)}
                label='Agendar cita'
           />
    </View>
  )
}
