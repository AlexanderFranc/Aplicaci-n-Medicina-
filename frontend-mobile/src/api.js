import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'

export async function setToken(t) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.localStorage.setItem('token', t)
    return
  }
  await SecureStore.setItemAsync('token', t)
}

export async function getToken() {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' ? window.localStorage.getItem('token') : null
  }
  return await SecureStore.getItemAsync('token')
}

async function request(path, method = 'GET', body) {
  const token = await getToken()
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  })
  if (!res.ok) throw new Error((await res.json()).error || 'Error')
  return await res.json()
}

export const api = {
  login: async (email, password) => {
    const r = await request('/auth/login', 'POST', { email, password })
    await setToken(r.token)
    return r
  },
  me: () => request('/auth/me'),
  checkIn: (placement_id) => request('/attendances/check-in', 'POST', placement_id ? { placement_id } : undefined),
  checkOut: () => request('/attendances/check-out', 'POST'),
  myAttendances: () => request('/attendances/my'),
  allAttendances: (params) => {
    const qs = params ? Object.entries(params).filter(([_,v]) => v!==undefined && v!==null && v!=='').map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&') : ''
    return request(`/attendances/all${qs?`?${qs}`:''}`)
  },
  listPlacements: () => request('/placements'),
  myPlacements: () => request('/placements/my'),
  listStudents: (q) => request(`/users?role=estudiante${q?`&q=${encodeURIComponent(q)}`:''}`),
  listDoctors: (q) => request(`/users?role=medico${q?`&q=${encodeURIComponent(q)}`:''}`),
  assignPlacement: (user_id, placement_id) => request('/placements/assign', 'POST', { user_id, placement_id }),
  createActivity: (data) => request('/activities', 'POST', data),
  myActivities: () => request('/activities/my'),
  evaluate: (data) => request('/evaluations', 'POST', data),
  pendingReviews: () => request('/reviews/pending')
}