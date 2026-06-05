'use client'

import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { AdminSidebar } from './sidebar'

export function MobileSidebarTrigger() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] transition-colors lg:hidden">
          <Menu className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-60">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <AdminSidebar />
      </SheetContent>
    </Sheet>
  )
}
