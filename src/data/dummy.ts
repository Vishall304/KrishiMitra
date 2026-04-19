import type { ChatMessage } from '../types'

export const feedItems = [
  {
    id: '1',
    kind: 'news' as const,
    title: 'Monsoon outlook positive for kharif sowing',
    description: 'Regional advisory suggests timely rains for soybean and cotton belts over the next fortnight.',
    IconKey: 'newspaper' as const,
  },
  {
    id: '2',
    kind: 'scheme' as const,
    title: 'PM-KISAN installment window open',
    description: 'Eligible farmers can verify land records via the nearest CSC or official portal updates.',
    IconKey: 'buildingLibrary' as const,
  },
  {
    id: '3',
    kind: 'tips' as const,
    title: 'Water-saving tip for uneven rainfall',
    description: 'Mulching between crop rows cuts evaporation and keeps roots cooler during heat spikes.',
    IconKey: 'lightBulb' as const,
  },
]

export const sampleChatSeed: ChatMessage[] = [
  {
    id: 'm1',
    role: 'assistant',
    lang: 'English',
    text: 'Namaste! I am AgriSathi AI. Ask about pests, fertilizer doses, sowing dates, or crop prices.',
  },
  {
    id: 'm2',
    role: 'user',
    lang: 'हिंदी',
    text: 'गेहूं में पीला रंग का कीड़ा दिख रहा है। क्या करूँ?',
  },
  {
    id: 'm3',
    role: 'assistant',
    lang: 'हिंदी',
    text: 'फ़ील्ड की एक ताज़ा फोटो भेजें। आम तौर पर समय पर सिंचाई और संतुलित नाइट्रोजन से प्रकोप कम होता है।',
  },
  {
    id: 'm4',
    role: 'user',
    lang: 'मराठी',
    text: 'मका पिकाला खताचे प्रमाण सांगा.',
  },
  {
    id: 'm5',
    role: 'assistant',
    lang: 'मराठी',
    text: 'जमिनीनुसार फरक पडतो — माती चाचणीनंतर नेमके डोस देऊ. सामान्यतः NPK संतुलित वापर करा.',
  },
]

export const trackerActivitiesSeed = [
  {
    id: 'a1',
    title: 'Irrigation done',
    date: '2026-04-17',
    status: 'done' as const,
  },
  {
    id: 'a2',
    title: 'Fertilizer added',
    date: '2026-04-14',
    status: 'done' as const,
  },
  {
    id: 'a3',
    title: 'Spray completed',
    date: '2026-04-19',
    status: 'pending' as const,
  },
]

export const upcomingRemindersSeed = [
  { id: 'r1', label: 'Check drip lines — Field B', when: 'Today, 5:00 PM' },
  { id: 'r2', label: 'Soil moisture reading', when: 'Tomorrow, 7:30 AM' },
]

export const weatherSnapshot = {
  place: 'Pune Region',
  tempC: 32,
  condition: 'Partly cloudy',
  humidity: 58,
  rainChance: 30,
}
