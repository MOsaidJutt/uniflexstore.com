export const SUPPORTED_MODELS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o mini (fast, recommended)' },
  { value: 'gpt-4o', label: 'GPT-4o (most capable)' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (cheapest)' },
] as const

export type SupportedModel = (typeof SUPPORTED_MODELS)[number]['value']

export interface AISettings {
  model: string
  apiKey: string | null
}
