import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView } from 'react-native'
import { api } from '../api'
import { useTheme } from '../theme'

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { theme, mode } = useTheme()

  async function login() {
    try {
      const r = await api.login(email, password)
      const role = r.user.role
      if (role === 'estudiante') navigation.replace('Asistencia')
      else navigation.replace('Matriz')
    } catch (e) {
      Alert.alert('Error', e.message)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: theme.text }}>Bienvenido</Text>
      <Text style={{ fontSize: 16, marginTop: 4, color: theme.text }}>Inicia sesión para continuar</Text>
      <View style={{ marginTop: 24 }}>
        <TextInput placeholder="Email" placeholderTextColor={mode === 'dark' ? '#9ca3af' : '#6b7280'} value={email} onChangeText={setEmail} autoCapitalize="none" style={{ borderWidth:1, borderColor: theme.border, backgroundColor: theme.card, color: theme.text, borderRadius: 10, marginTop: 12, padding: 12 }} />
        <TextInput placeholder="Contraseña" placeholderTextColor={mode === 'dark' ? '#9ca3af' : '#6b7280'} value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth:1, borderColor: theme.border, backgroundColor: theme.card, color: theme.text, borderRadius: 10, marginTop: 12, padding: 12 }} />
        <TouchableOpacity onPress={login} style={{ backgroundColor: theme.primary, paddingVertical: 12, borderRadius: 10, marginTop: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Entrar</Text>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  )
}