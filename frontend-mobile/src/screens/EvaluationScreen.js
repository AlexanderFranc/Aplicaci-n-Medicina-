import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'
import { api } from '../api'

export default function EvaluationScreen() {
  const [activityId, setActivityId] = useState('')
  const [puntaje, setPuntaje] = useState('5')
  const [comentario, setComentario] = useState('')

  async function evaluate() {
    try {
      await api.evaluate({ activity_id: Number(activityId), puntaje: Number(puntaje), comentario })
      Alert.alert('Ok', 'Evaluación registrada')
    } catch (e) { Alert.alert('Error', e.message) }
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Evaluar actividad</Text>
      <TextInput placeholder="ID actividad" value={activityId} onChangeText={setActivityId} keyboardType="numeric" style={{ borderWidth:1, marginTop:12, padding:8 }} />
      <TextInput placeholder="Puntaje 1-5" value={puntaje} onChangeText={setPuntaje} keyboardType="numeric" style={{ borderWidth:1, marginTop:12, padding:8 }} />
      <TextInput placeholder="Comentario" value={comentario} onChangeText={setComentario} style={{ borderWidth:1, marginTop:12, padding:8 }} />
      <Button title="Enviar" onPress={evaluate} />
    </View>
  )
}