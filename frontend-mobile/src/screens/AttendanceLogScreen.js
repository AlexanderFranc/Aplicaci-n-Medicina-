import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, Alert, SafeAreaView, TextInput, TouchableOpacity, Button } from 'react-native'
import { api } from '../api'
import { useTheme } from '../theme'
import { useFocusEffect } from '@react-navigation/native'

export default function AttendanceLogScreen() {
  const [items, setItems] = useState([])
  const [role, setRole] = useState(null)
  const [students, setStudents] = useState([])
  const [q, setQ] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const { theme } = useTheme()

  async function load() {
    try {
      const me = await api.me()
      setRole(me.user.role)
      if (me.user.role === 'estudiante') {
        const r = await api.myAttendances()
        setItems(r.attendances)
      } else {
        setItems([])
      }
    } catch (e) { Alert.alert('Error', e.message) }
  }

  useEffect(() => { load() }, [])
  useFocusEffect(React.useCallback(() => { load() }, []))

  async function searchStudents() {
    try {
      const r = await api.listStudents(q)
      setStudents(r.users || [])
    } catch {}
  }

  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: theme.text }}>Registro de llegada y salida</Text>
        {role !== 'estudiante' && (
          <View style={{ marginTop: 12, padding: 12, backgroundColor: theme.card, borderRadius: 12, borderWidth:1, borderColor: theme.border }}>
            <Text style={{ color: theme.text, fontWeight: '600' }}>Filtros</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TextInput placeholder="Buscar estudiante" value={q} onChangeText={setQ} placeholderTextColor="#6b7280" style={{ borderWidth:1, borderColor: theme.border, backgroundColor: theme.background, color: theme.text, borderRadius: 10, padding: 8, flex:1 }} />
              <Button title="Buscar" onPress={searchStudents} />
            </View>
            <FlatList
              style={{ maxHeight: 90, marginTop: 8 }}
              data={students}
              keyExtractor={s => String(s.id)}
              horizontal
              renderItem={({ item }) => (
                <TouchableOpacity onPress={async () => {
                  setSelectedStudent(item.id)
                  try {
                    const r = await api.allAttendances({ user_id: item.id })
                    setItems(r.attendances)
                  } catch (e) {}
                }} style={{ paddingVertical: 8, paddingHorizontal: 12, borderWidth:1, borderColor: theme.border, borderRadius: 20, marginRight: 8, backgroundColor: selectedStudent===item.id?theme.primary:theme.background }}>
                  <Text style={{ color: selectedStudent===item.id?'#fff':theme.text }}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
        <FlatList
          style={{ marginTop: 12 }}
          data={items}
          keyExtractor={i => String(i.id)}
          renderItem={({ item }) => (
            <View style={{ padding: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 8, backgroundColor: theme.card, borderRadius: 12 }}>
              {role !== 'estudiante' ? (
                <Text style={{ color: theme.text, fontWeight: '600' }}>{item.user_name} ({item.user_email})</Text>
              ) : null}
              <Text style={{ color: theme.text }}>{item.placement_nombre}</Text>
              <Text style={{ color: theme.text }}>Llegada: {item.check_in ? new Date(item.check_in).toLocaleString() : '—'}</Text>
              <Text style={{ color: theme.text }}>Salida: {item.check_out ? new Date(item.check_out).toLocaleString() : '—'}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  )
}