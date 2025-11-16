import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Text, TouchableOpacity, View } from 'react-native'
import LoginScreen from './src/screens/LoginScreen'
import AttendanceScreen from './src/screens/AttendanceScreen'
import ActivitiesScreen from './src/screens/ActivitiesScreen'
import EvaluationScreen from './src/screens/EvaluationScreen'
import MatrixScreen from './src/screens/MatrixScreen'
import AssignmentsScreen from './src/screens/AssignmentsScreen'
import AttendanceLogScreen from './src/screens/AttendanceLogScreen'
import { ThemeProvider, useTheme } from './src/theme'

const Stack = createNativeStackNavigator()

function ThemeToggle() {
  const { mode, setMode, theme } = useTheme()
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: theme.primary }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>UISEK</Text>
      </View>
      <TouchableOpacity onPress={() => setMode(mode === 'light' ? 'dark' : 'light')} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: theme.secondary }}>
        <Text style={{ color: '#000', fontWeight: '700' }}>{mode === 'light' ? 'Modo nocturno' : 'Modo claro'}</Text>
      </TouchableOpacity>
    </View>
  )
}

function RootNavigator() {
  const { theme, mode } = useTheme()
  const navTheme = {
    dark: mode === 'dark',
    colors: {
      primary: theme.primary,
      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.border,
      notification: theme.secondary
    }
  }
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.card }, headerTintColor: theme.text, headerRight: () => (<ThemeToggle />) }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Asistencia" component={AttendanceScreen} />
        <Stack.Screen name="Actividades" component={ActivitiesScreen} />
        <Stack.Screen name="Evaluación" component={EvaluationScreen} />
        <Stack.Screen name="Matriz" component={MatrixScreen} />
        <Stack.Screen name="Registro" component={AttendanceLogScreen} />
        <Stack.Screen name="Asignaciones" component={AssignmentsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  )
}