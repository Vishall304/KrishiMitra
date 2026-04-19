export type TabId = 'home' | 'detect' | 'ai' | 'tracker' | 'profile'

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  lang: string
  text: string
}
