import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, Button, FlatList, Alert, TouchableOpacity } from 'react-native'
import { api } from '../api'

export default function AssignmentsScreen() {
  const [q, setQ] = useState('')
  const [students, setStudents] = useState([])
  const [placements, setPlacements] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedPlacement, setSelectedPlacement] = useState(null)

  async function loadPlacements() {
    try {
      const r = await api.listPlacements()
      setPlacements(r.placements)
      if (r.placements.length && !selectedPlacement) setSelectedPlacement(r.placements[0].id)
    } catch (e) { Alert.alert('Error', e.message) }
  }

  async function search() {
    try {
      const r = await api.listStudents(q)
      setStudents(r.users)
    } catch (e) { Alert.alert('Error', e.message) }
  }

  async function assign() {
    try {
      if (!selectedStudent || !selectedPlacement) throw new Error('Selecciona alumno y lugar')
      await api.assignPlacement(selectedStudent.id, selectedPlacement)
      Alert.alert('Ok', 'Asignación registrada')
    } catch (e) { Alert.alert('Error', e.message) }
  }

  useEffect(() => { loadPlacements() }, [])

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Asignaciones de estudiantes</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginVertical: 12 }}>
        <TextInput placeholder="Buscar alumno (nombre/email)" value={q} onChangeText={setQ} style={{ borderWidth:1, padding:8, flex:1 }} />
        <Button title="Buscar" onPress={search} />
      </View>
      <Text>Selecciona lugar</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 }}>
        {placements.map(p => (
          <TouchableOpacity key={p.id} onPress={() => setSelectedPlacement(p.id)} style={{ padding: 8, borderWidth: 1, marginRight: 8, backgroundColor: selectedPlacement===p.id?'#ddd':'#fff' }}>
            <Text>{p.nombre}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text>Resultados</Text>
      <FlatList
        data={students}
        keyExtractor={s => String(s.id)}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedStudent(item)} style={{ padding: 8, borderWidth: 1, marginBottom: 8, backgroundColor: selectedStudent?.id===item.id?'#ddd':'#fff' }}>
            <Text>{item.name}</Text>
            <Text>{item.email}</Text>
          </TouchableOpacity>
        )}
      />
      <Button title="Asignar" onPress={assign} />
    </View>
  )
}