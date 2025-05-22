import React from 'react'
import { Pressable, Text, View } from 'react-native'


import { globalStyles } from '../../theme/theme'


interface Props{
    onpress: ()=> void;
    label: string;
}

export const PrimaryButton = ({onpress, label}:Props) => {

    

  return (
    <Pressable
        onPress={onpress} 
        style= {globalStyles.primaryButton}>
        <Text style={globalStyles.buttonText}>{label}</Text>
    </Pressable>
  )
}
