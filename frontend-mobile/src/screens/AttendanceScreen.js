import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, Alert, TouchableOpacity, SafeAreaView } from 'react-native'
import { api } from '../api'
import { useTheme } from '../theme'

export default function AttendanceScreen({ navigation }) {
  const { theme } = useTheme()

  async function load() {
    try {
      // No-op: la lista de registros se visualiza en la pantalla "Registro"
    } catch (e) {
      Alert.alert('Error', e.message)
    }
  }

  async function checkIn() {
    try {
      await api.checkIn()
      Alert.alert('Ok', 'Llegada registrada')
      load()
      navigation.navigate('Registro')
    } catch (e) { Alert.alert('Error', e.message) }
  }

  async function checkOut() {
    try {
      await api.checkOut()
      Alert.alert('Ok', 'Salida registrada')
      load()
      navigation.navigate('Registro')
    } catch (e) { Alert.alert('Error', e.message) }
  }

  useEffect(() => { load() }, [])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', color: theme.text }}>Asistencia</Text>

      

      <View style={{ marginTop: 12, padding: 12, backgroundColor: theme.card, borderRadius: 12, borderWidth:1, borderColor: theme.border }}>
        <Text style={{ color: theme.text, fontWeight: '600' }}>Acciones</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <TouchableOpacity onPress={checkIn} style={{ backgroundColor: theme.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Check-In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={checkOut} style={{ backgroundColor: theme.secondary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Check-Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginTop: 12, padding: 12, backgroundColor: theme.card, borderRadius: 12, borderWidth:1, borderColor: theme.border }}>
        <Text style={{ color: theme.text, fontWeight: '600' }}>Actividades</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <TouchableOpacity onPress={() => navigation.navigate('Actividades')} style={{ backgroundColor: theme.background, borderWidth:1, borderColor: theme.border, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 }}>
            <Text style={{ color: theme.text, fontWeight: '600' }}>Ir a Actividades</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginTop: 12, padding: 12, backgroundColor: theme.card, borderRadius: 12, borderWidth:1, borderColor: theme.border }}>
        <Text style={{ color: theme.text, fontWeight: '600' }}>Registro</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <TouchableOpacity onPress={() => navigation.navigate('Registro')} style={{ backgroundColor: theme.background, borderWidth:1, borderColor: theme.border, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 }}>
            <Text style={{ color: theme.text, fontWeight: '600' }}>Ver Registro</Text>
          </TouchableOpacity>
        </View>
      </View>

      
    </View>
    </SafeAreaView>
  )
}