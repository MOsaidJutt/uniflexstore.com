'use client'

import { useTransition, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Eye, EyeOff, Trash2, Bot, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  updateStoreSettings,
  updateAISettings,
  deleteAIApiKey,
  type StoreSettings,
} from '@/server/actions/admin/settings'
import { SUPPORTED_MODELS } from '@/lib/ai-models'

// ─── Store settings tab ───────────────────────────────────────────────────────

function StoreSettingsTab({ initial }: { initial: StoreSettings }) {
  const [pending, startTransition] = useTransition()
  const { register, handleSubmit } = useForm<StoreSettings>({ defaultValues: initial })

  const onSubmit = (data: StoreSettings) => {
    startTransition(async () => {
      const result = await updateStoreSettings(data)
      if (result.error) toast.error(result.error)
      else toast.success('Settings saved')
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center justify-end">
        <Button type="submit" loading={pending}>Save Settings</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Store Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="store-name">Store Name</Label>
            <Input id="store-name" {...register('storeName')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" {...register('currency')} placeholder="USD" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="support-email">Support Email</Label>
            <Input id="support-email" {...register('supportEmail')} type="email" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tax Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
            <Input
              id="tax-rate"
              {...register('taxRate')}
              type="number"
              step="0.001"
              min="0"
              max="100"
              placeholder="8.875"
            />
            <p className="text-xs text-[var(--text-muted)]">e.g. 8.875 for 8.875% (NYC rate)</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Shipping Rates</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="free-shipping-threshold">Free Shipping Threshold ($)</Label>
              <Input id="free-shipping-threshold" {...register('freeShippingThreshold')} type="number" step="0.01" min="0" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="standard-shipping-rate">Standard Shipping ($)</Label>
              <Input id="standard-shipping-rate" {...register('standardShippingRate')} type="number" step="0.01" min="0" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="express-shipping-rate">Express Shipping ($)</Label>
              <Input id="express-shipping-rate" {...register('expressShippingRate')} type="number" step="0.01" min="0" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Email Subject Lines</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="order-confirmation-subject">Order Confirmation Subject</Label>
            <Input id="order-confirmation-subject" {...register('orderConfirmationSubject')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shipping-update-subject">Shipping Update Subject</Label>
            <Input id="shipping-update-subject" {...register('shippingUpdateSubject')} />
          </div>
          <Separator />
          <p className="text-xs text-[var(--text-muted)]">
            Email templates are defined in{' '}
            <code className="rounded bg-[var(--bg-subtle)] px-1 py-0.5">src/lib/email.ts</code>.
            Edit that file to customize the full template HTML.
          </p>
        </CardContent>
      </Card>
    </form>
  )
}

// ─── AI settings tab ──────────────────────────────────────────────────────────

interface AITabProps {
  model: string
  maskedKey: string | null
  hasKey: boolean
}

function AISettingsTab({ model: initialModel, maskedKey, hasKey: initialHasKey }: AITabProps) {
  const [pending, startTransition] = useTransition()
  const [deletePending, startDeleteTransition] = useTransition()
  const [selectedModel, setSelectedModel] = useState(initialModel)
  const [newKey, setNewKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [hasKey, setHasKey] = useState(initialHasKey)
  const [currentMasked, setCurrentMasked] = useState(maskedKey)

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateAISettings({
        model: selectedModel,
        apiKey: newKey || undefined,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('AI settings saved')
        if (newKey) {
          // Update display to reflect new key is stored
          setHasKey(true)
          setCurrentMasked(newKey.slice(0, 12) + '••••••••' + newKey.slice(-4))
          setNewKey('')
        }
      }
    })
  }

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteAIApiKey()
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('API key removed')
        setHasKey(false)
        setCurrentMasked(null)
        setNewKey('')
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Status banner */}
      <div
        className={[
          'flex items-center gap-3 rounded-xl border px-4 py-3',
          hasKey
            ? 'border-[var(--success)]/25 bg-[var(--success)]/6'
            : 'border-[var(--warning)]/25 bg-[var(--warning)]/6',
        ].join(' ')}
      >
        <div
          className={[
            'flex h-8 w-8 items-center justify-center rounded-full',
            hasKey ? 'bg-[var(--success)]/12' : 'bg-[var(--warning)]/12',
          ].join(' ')}
        >
          {hasKey ? (
            <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
          ) : (
            <Bot className="h-4 w-4 text-[var(--warning)]" />
          )}
        </div>
        <div>
          <p
            className={[
              'text-sm font-500',
              hasKey ? 'text-[var(--success)]' : 'text-[var(--warning)]',
            ].join(' ')}
          >
            {hasKey ? 'AI assistant is active' : 'AI assistant is not configured'}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {hasKey
              ? `Using model: ${selectedModel}`
              : 'Add an OpenAI API key to enable the shopping assistant.'}
          </p>
        </div>
      </div>

      {/* Model selector */}
      <Card>
        <CardHeader>
          <CardTitle>Model</CardTitle>
          <CardDescription>Choose the OpenAI model powering the chat assistant.</CardDescription>
        </CardHeader>
        <CardContent>
          <div role="radiogroup" aria-label="Model" className="grid gap-2 sm:grid-cols-2">
            {SUPPORTED_MODELS.map((m) => (
              <button
                key={m.value}
                type="button"
                role="radio"
                aria-checked={selectedModel === m.value}
                onClick={() => setSelectedModel(m.value)}
                className={[
                  'flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition-colors',
                  selectedModel === m.value
                    ? 'border-[var(--brand-accent)] bg-[var(--brand-teal-light)] text-[var(--brand-accent)]'
                    : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]',
                ].join(' ')}
              >
                <div
                  className={[
                    'h-3.5 w-3.5 shrink-0 rounded-full border-2',
                    selectedModel === m.value
                      ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)]'
                      : 'border-[var(--border-strong)]',
                  ].join(' ')}
                />
                <span className="font-500">{m.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API key management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>OpenAI API Key</CardTitle>
              <CardDescription className="mt-1">
                Stored securely in the database. Never logged or exposed publicly.
              </CardDescription>
            </div>
            {hasKey && (
              <Badge variant="secondary" className="text-[var(--success)] border-[var(--success)]/30 bg-[var(--success)]/8">
                Configured
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current key display */}
          {hasKey && currentMasked && (
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3.5 py-2.5">
                <p className="font-mono text-sm text-[var(--text-secondary)]">
                  {showKey ? currentMasked : '••••••••••••••••••••••••••'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? 'Hide key' : 'Reveal key (masked)'}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border-default)] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                loading={deletePending}
                onClick={handleDelete}
                aria-label="Delete API key"
              >
                {!deletePending && <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          )}

          {/* New key input */}
          <div className="space-y-1.5">
            <Label htmlFor="new-api-key">
              {hasKey ? 'Replace API Key' : 'Add API Key'}
            </Label>
            <Input
              id="new-api-key"
              type="password"
              autoComplete="off"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder={hasKey ? 'Paste new key to replace…' : 'sk-proj-…'}
            />
            <p className="text-xs text-[var(--text-muted)]">
              Get your key at{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--brand-accent)] hover:underline"
              >
                platform.openai.com/api-keys
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="button" loading={pending} onClick={handleSave}>
          Save AI Settings
        </Button>
      </div>
    </div>
  )
}

// ─── Combined form ────────────────────────────────────────────────────────────

interface SettingsFormProps {
  initial: StoreSettings
  initialAI: AITabProps
}

export function SettingsForm({ initial, initialAI }: SettingsFormProps) {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Store Settings</h1>
        <p className="text-sm text-[var(--text-muted)]">Configure your store preferences</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai">
            <Bot className="mr-1.5 h-3.5 w-3.5" />
            AI Assistant
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <StoreSettingsTab initial={initial} />
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <AISettingsTab {...initialAI} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
