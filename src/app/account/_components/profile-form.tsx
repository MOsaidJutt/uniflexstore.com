'use client'

import { useActionState } from 'react'
import { updateProfileAction } from '@/server/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError, FormAlert } from '@/components/auth/auth-card'

interface ProfileFormProps {
  userId: string
  name: string | null
  email: string
  phone: string | null
}

export function ProfileForm({ userId, name, email, phone }: ProfileFormProps) {
  const boundAction = updateProfileAction.bind(null, userId)
  const [state, action, isPending] = useActionState(boundAction, undefined)
  const fe = state?.fieldErrors

  return (
    <form action={action} className="space-y-5">
      <FormAlert error={state?.error} success={state?.success} />

      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={name ?? ''}
          placeholder="Your name"
          required
          error={fe?.name}
          aria-describedby={fe?.name ? 'profile-name-error' : undefined}
        />
        <FieldError id="profile-name-error" message={fe?.name} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email address</Label>
        {/* readOnly + defaultValue avoids the React controlled-input warning and the
            "disabled fields aren't announced as readonly" screen reader issue */}
        <Input
          id="email"
          type="email"
          defaultValue={email}
          readOnly
          aria-describedby="email-readonly-hint"
          className="cursor-default opacity-60 focus:ring-0 focus:border-[var(--border-default)]"
        />
        <p id="email-readonly-hint" className="text-xs text-[var(--text-muted)]">
          Email cannot be changed. Contact support if needed.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={phone ?? ''}
          placeholder="+1 (555) 000-0000"
          error={fe?.phone}
          aria-describedby={fe?.phone ? 'profile-phone-error' : undefined}
        />
        <FieldError id="profile-phone-error" message={fe?.phone} />
      </div>

      <Button type="submit" variant="accent" loading={isPending}>
        Save changes
      </Button>
    </form>
  )
}
