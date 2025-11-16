import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, FlatList, Alert, TouchableOpacity, SafeAreaView } from 'react-native'
import { api } from '../api'
import { useTheme } from '../theme'

const quitoHospitals = [
  'Hospital Metropolitano',
  'Hospital de los Valles',
  'Hospital Eugenio Espejo',
  'Hospital Carlos Andrade Marín',
  'Hospital Vozandes',
  'Hospital IESS Quito Sur',
  'Hospital Pablo Arturo Suárez',
  'SOLCA Quito',
  'Hospital de Especialidades Fuerzas Armadas',
  'Hospital San Francisco'
]

const quitoClinics = [
  'Clínica Pichincha',
  'Clínica Pasteur',
  'Clínica Santa Lucía',
  'Clínica Internacional',
  'Clínica Axxis',
  'Clínica San Francisco',
  'Clínica de la Mujer',
  'Centro Médico Meditrópoli',
  'Clínica El Batán',
  'Clínica Kennedy'
]

export default function ActivitiesScreen({ navigation }) {
  const [items, setItems] = useState([])
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [role, setRole] = useState(null)
  const [students, setStudents] = useState([])
  const [q, setQ] = useState('')
  const [placements, setPlacements] = useState([])
  
  const [doctors, setDoctors] = useState([])
  const [doctorQ, setDoctorQ] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [hospital, setHospital] = useState('')
  const [fecha, setFecha] = useState('')
  const { theme, mode } = useTheme()

  async function load() {
    try {
      const me = await api.me()
      setRole(me.user.role)
      if (me.user.role === 'estudiante') {
        const r = await api.myActivities()
        setItems(r.activities)
      } else if (me.user.role === 'profesor') {
        const ps = await api.listPlacements()
        setPlacements(ps.placements)
        if (ps.placements.length) setSelectedPlace(ps.placements[0].id)
        
        const ds = await api.listDoctors('')
        setDoctors(ds.users || [])
      }
    } catch (e) { Alert.alert('Error', e.message) }
  }

  async function create() {
    try {
      if (!selectedStudent) throw new Error('Seleccione un estudiante')
      if (!selectedPlace) throw new Error('Seleccione un lugar')
      await api.createActivity({ user_id: selectedStudent, placement_id: selectedPlace, titulo, descripcion, doctor_id: selectedDoctor, hospital, fecha: fecha || undefined })
      setTitulo(''); setDescripcion('')
      setHospital('')
      setFecha('')
      load()
    } catch (e) { Alert.alert('Error', e.message) }
  }

  useEffect(() => { load() }, [])
  useEffect(() => { // búsqueda de estudiantes para docente
    (async () => {
      try {
        if (role === 'profesor') {
          const r = await api.listStudents(q)
          setStudents(r.users || [])
        }
      } catch (e) {}
    })()
  }, [q, role])
  useEffect(() => { // búsqueda de doctores
    (async () => {
      try {
        if (role === 'profesor') {
          const r = await api.listDoctors(doctorQ)
          setDoctors(r.users || [])
        }
      } catch (e) {}
    })()
  }, [doctorQ, role])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: theme.text }}>Actividades</Text>

        {role === 'profesor' && (
          <View style={{ marginTop: 16, padding: 12, backgroundColor: theme.card, borderRadius: 12, borderWidth:1, borderColor: theme.border }}>
            <Text style={{ color: theme.text, fontWeight: '600' }}>Crear actividad</Text>
            <TextInput placeholder="Buscar estudiante" placeholderTextColor={mode==='dark'?'#9ca3af':'#6b7280'} value={q} onChangeText={setQ} style={{ borderWidth:1, borderColor: theme.border, backgroundColor: theme.background, color: theme.text, borderRadius: 10, marginTop: 8, padding: 10 }} />
            <FlatList
              style={{ maxHeight: 120, marginTop: 8 }}
              data={students}
              keyExtractor={s => String(s.id)}
              horizontal
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setSelectedStudent(item.id)} style={{ paddingVertical: 8, paddingHorizontal: 12, borderWidth:1, borderColor: theme.border, borderRadius: 20, marginRight: 8, backgroundColor: selectedStudent===item.id?theme.primary:theme.background }}>
                  <Text style={{ color: selectedStudent===item.id?'#fff':theme.text }}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <Text style={{ color: theme.text, marginTop: 12 }}>Lugar:</Text>
            <FlatList
              style={{ maxHeight: 90, marginTop: 6 }}
              data={placements}
              keyExtractor={p => String(p.id)}
              horizontal
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setSelectedPlace(item.id)} style={{ paddingVertical: 8, paddingHorizontal: 12, borderWidth:1, borderColor: theme.border, borderRadius: 20, marginRight: 8, backgroundColor: selectedPlace===item.id?theme.secondary:theme.background }}>
                  <Text style={{ color: selectedPlace===item.id?'#fff':theme.text }}>{item.nombre}</Text>
                </TouchableOpacity>
              )}
            />
            {placements.find(p => p.id === selectedPlace)?.tipo === 'hospital' && (
              <>
                <Text style={{ color: theme.text, marginTop: 8 }}>Hospitales en Quito:</Text>
                <FlatList
                  style={{ maxHeight: 90, marginTop: 6 }}
                  data={quitoHospitals}
                  keyExtractor={name => name}
                  horizontal
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => setHospital(item)} style={{ paddingVertical: 8, paddingHorizontal: 12, borderWidth:1, borderColor: theme.border, borderRadius: 20, marginRight: 8, backgroundColor: hospital===item?theme.secondary:theme.background }}>
                      <Text style={{ color: hospital===item?'#fff':theme.text }}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </>
            )}
            {placements.find(p => p.id === selectedPlace)?.tipo === 'clinica' && (
              <>
                <Text style={{ color: theme.text, marginTop: 8 }}>Clínicas en Quito:</Text>
                <FlatList
                  style={{ maxHeight: 90, marginTop: 6 }}
                  data={quitoClinics}
                  keyExtractor={name => name}
                  horizontal
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => setHospital(item)} style={{ paddingVertical: 8, paddingHorizontal: 12, borderWidth:1, borderColor: theme.border, borderRadius: 20, marginRight: 8, backgroundColor: hospital===item?theme.secondary:theme.background }}>
                      <Text style={{ color: hospital===item?'#fff':theme.text }}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </>
            )}
            <Text style={{ color: theme.text, marginTop: 12 }}>Doctor:</Text>
            <TextInput placeholder="Buscar doctor" placeholderTextColor={mode==='dark'?'#9ca3af':'#6b7280'} value={doctorQ} onChangeText={setDoctorQ} style={{ borderWidth:1, borderColor: theme.border, backgroundColor: theme.background, color: theme.text, borderRadius: 10, marginTop: 8, padding: 10 }} />
            <FlatList
              style={{ maxHeight: 120, marginTop: 8 }}
              data={doctors}
              keyExtractor={d => String(d.id)}
              horizontal
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setSelectedDoctor(item.id)} style={{ paddingVertical: 8, paddingHorizontal: 12, borderWidth:1, borderColor: theme.border, borderRadius: 20, marginRight: 8, backgroundColor: selectedDoctor===item.id?theme.secondary:theme.background }}>
                  <Text style={{ color: selectedDoctor===item.id?'#000':theme.text }}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TextInput placeholder="Título" placeholderTextColor={mode==='dark'?'#9ca3af':'#6b7280'} value={titulo} onChangeText={setTitulo} style={{ borderWidth:1, borderColor: theme.border, backgroundColor: theme.background, color: theme.text, borderRadius: 10, marginTop: 12, padding: 10 }} />
            <TextInput placeholder="Descripción" placeholderTextColor={mode==='dark'?'#9ca3af':'#6b7280'} value={descripcion} onChangeText={setDescripcion} style={{ borderWidth:1, borderColor: theme.border, backgroundColor: theme.background, color: theme.text, borderRadius: 10, marginTop: 8, padding: 10 }} />
            <TextInput placeholder="Fecha (YYYY-MM-DD)" placeholderTextColor={mode==='dark'?'#9ca3af':'#6b7280'} value={fecha} onChangeText={setFecha} style={{ borderWidth:1, borderColor: theme.border, backgroundColor: theme.background, color: theme.text, borderRadius: 10, marginTop: 8, padding: 10 }} />
            <TouchableOpacity onPress={create} style={{ alignSelf: 'flex-start', backgroundColor: theme.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, marginTop: 12 }}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Crear</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ marginTop: 20 }}>
          <Text style={{ color: theme.text, fontWeight: '600' }}>Actividades asignadas</Text>
          <FlatList
            style={{ marginTop: 12 }}
            data={items}
            keyExtractor={i => String(i.id)}
            renderItem={({ item }) => (
              <View style={{ padding: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 8, backgroundColor: theme.card, borderRadius: 12 }}>
                <Text style={{ color: theme.text, fontWeight: '600' }}>{item.titulo} ({item.estado})</Text>
                <Text style={{ color: theme.text }}>{item.descripcion}</Text>
                {item.doctor_name ? <Text style={{ color: theme.text }}>Doctor: {item.doctor_name}</Text> : null}
                {item.hospital ? <Text style={{ color: theme.text }}>Hospital: {item.hospital}</Text> : null}
              </View>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}