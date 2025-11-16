import React from 'react'
import { View, Text, Button } from 'react-native'

export default function MatrixScreen({ navigation }) {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Bienvenido doctor</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8 }}>
        <Button title="Actividades" onPress={() => navigation.navigate('Actividades')} />
        <Button title="Registro" onPress={() => navigation.navigate('Registro')} />
      </View>
    </View>
  )
}