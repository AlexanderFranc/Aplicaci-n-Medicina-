import React, { createContext, useContext, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const themes = {
  light: {
    background: '#f5f9ff',
    text: '#0b2545',
    primary: '#0047AB',
    secondary: '#FFD200',
    border: '#dbeafe',
    card: '#ffffff'
  },
  dark: {
    background: '#0a1224',
    text: '#e6edf7',
    primary: '#4DABF7',
    secondary: '#FFCC00',
    border: '#1f2a44',
    card: '#121a2b'
  }
}

const ThemeContext = createContext({ theme: themes.light, mode: 'light', setMode: () => {} })

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light')
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    ;(async () => {
      try {
        let m = null
        if (Platform.OS === 'web') {
          m = typeof window !== 'undefined' ? window.localStorage.getItem('theme') : null
        } else {
          m = await SecureStore.getItemAsync('theme')
        }
        if (m) setMode(m)
      } catch {}
      setLoaded(true)
    })()
  }, [])
  useEffect(() => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') window.localStorage.setItem('theme', mode)
      } else {
        SecureStore.setItemAsync('theme', mode)
      }
    } catch {}
  }, [mode])
  const value = { theme: themes[mode], mode, setMode }
  return loaded ? <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider> : null
}

export function useTheme() {
  return useContext(ThemeContext)
}

export const appThemes = themes