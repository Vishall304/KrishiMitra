import type { ChatMessage } from '../types'

export type FeedItemKind =
  | 'news'
  | 'scheme'
  | 'tips'
  | 'market'
  | 'weather'
  | 'irrigation'
  | 'fertilizer'
  | 'pest'

export type FeedItem = {
  id: string
  kind: FeedItemKind
  title: string
  description: string
  meta?: string
  IconKey:
    | 'newspaper'
    | 'buildingLibrary'
    | 'lightBulb'
    | 'trendingUp'
    | 'cloudRain'
    | 'droplet'
    | 'sprout'
    | 'bug'
}

export const feedItems: FeedItem[] = [
  {
    id: 'f1',
    kind: 'weather',
    title: 'Weather alert: light showers expected Tuesday',
    description:
      'Pune-Satara belt may see 5–12 mm rain. Cover harvested produce and delay fertiliser application by 24 hours.',
    meta: 'Today · IMD advisory',
    IconKey: 'cloudRain',
  },
  {
    id: 'f2',
    kind: 'market',
    title: 'Tomato mandi price up 8% this week',
    description:
      'Pune APMC average ₹28/kg (from ₹26). Onion steady at ₹18/kg. Consider staggered selling over 3 days for better realisation.',
    meta: 'Mandi bhav · today',
    IconKey: 'trendingUp',
  },
  {
    id: 'f3',
    kind: 'news',
    title: 'Monsoon outlook positive for kharif sowing',
    description:
      'Regional advisory suggests timely rains for soybean and cotton belts over the next fortnight. Prepare seedbed and check seed viability now.',
    meta: 'Krishi Jagran · 2 hr',
    IconKey: 'newspaper',
  },
  {
    id: 'f4',
    kind: 'scheme',
    title: 'PM-KISAN installment window open',
    description:
      'Eligible farmers can verify land records via the nearest CSC or the official portal. Aadhaar-bank linking must match exactly to avoid rejections.',
    meta: 'Government of India',
    IconKey: 'buildingLibrary',
  },
  {
    id: 'f5',
    kind: 'fertilizer',
    title: 'NPK top-dressing for tillering stage wheat',
    description:
      'Split urea into 2 doses: 50% at crown root initiation, 50% at tillering. Apply before irrigation to reduce volatile loss.',
    meta: 'Tip · KVK Baramati',
    IconKey: 'sprout',
  },
  {
    id: 'f6',
    kind: 'irrigation',
    title: 'Drip water-saving tip during dry spell',
    description:
      'Shift drip cycles to early morning (5–7 AM) and late evening. Reduce run-time by 15% if soil moisture reading stays above 60% FC.',
    meta: 'Tip',
    IconKey: 'droplet',
  },
  {
    id: 'f7',
    kind: 'pest',
    title: 'White fly watch for cotton bolls',
    description:
      'Scout 20 plants per acre. If you see more than 6 flies/leaf, spray neem oil 3 ml/L in the evening. Rotate chemistries every 10 days.',
    meta: 'Pest advisory',
    IconKey: 'bug',
  },
  {
    id: 'f8',
    kind: 'tips',
    title: 'Water-saving tip for uneven rainfall',
    description:
      'Mulching between crop rows cuts evaporation and keeps roots cooler during heat spikes. Use crop residue if straw is available.',
    meta: 'Tip',
    IconKey: 'lightBulb',
  },
  {
    id: 'f9',
    kind: 'scheme',
    title: 'PMFBY enrolment closes in 9 days',
    description:
      'Pradhan Mantri Fasal Bima Yojana — premium auto-debit applies to KCC holders unless they opt out at their bank.',
    meta: 'Scheme · deadline soon',
    IconKey: 'buildingLibrary',
  },
  {
    id: 'f10',
    kind: 'market',
    title: 'Onion storage tip before seasonal glut',
    description:
      'Keep stored onions below 30% RH. Ventilation layers of 10 cm with bamboo grids reduce rot losses by up to 35%.',
    meta: 'Post-harvest',
    IconKey: 'trendingUp',
  },
  {
    id: 'f11',
    kind: 'news',
    title: 'Soil health card drive resumes in 12 districts',
    description:
      'Free testing at block offices. Carry 500 g soil from diagonal points of the field, 0–15 cm deep, in a clean cloth bag.',
    meta: 'Farming news',
    IconKey: 'newspaper',
  },
  {
    id: 'f12',
    kind: 'tips',
    title: 'Intercropping idea: pigeonpea + soybean',
    description:
      'Row ratio 2:4 improves nitrogen fixation and reduces pest pressure. Sow with 30 cm × 10 cm spacing and balance rhizobium seed treatment.',
    meta: 'Tip',
    IconKey: 'lightBulb',
  },
]

export const sampleChatSeed: ChatMessage[] = [
  {
    id: 'm1',
    role: 'assistant',
    lang: 'English',
    text: 'Namaste! I am KrishiMitra AI. Ask about pests, fertilizer doses, sowing dates, or crop prices.',
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
]

export const trackerActivitiesSeed = [
  { id: 'a1', title: 'Irrigation done', date: '2026-04-17', status: 'done' as const },
  { id: 'a2', title: 'Fertilizer added', date: '2026-04-14', status: 'done' as const },
  { id: 'a3', title: 'Spray completed', date: '2026-04-19', status: 'pending' as const },
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
