'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { importProductsFromCSV } from '@/server/actions/admin/products'

const CSV_TEMPLATE = 'name,slug,description,price,sku,stock,isActive,isFeatured\n"Example Product","example-product","A great product",29.99,SKU-001,100,true,false'

export function CSVImport() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<{ created?: number; errors?: string[] } | null>(null)
  const [pending, startTransition] = useTransition()

  async function handleImport() {
    if (!file) return
    const text = await file.text()
    startTransition(async () => {
      const res = await importProductsFromCSV(text)
      if (res.error || !('created' in res)) { toast.error(res.error ?? 'Import failed'); return }
      setResult({ created: res.created, errors: res.errors })
      toast.success(`Imported ${res.created} products`)
    })
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader><CardTitle>CSV Format</CardTitle></CardHeader>
        <CardContent>
          <pre className="rounded-lg bg-[var(--bg-subtle)] p-4 text-xs overflow-auto">{CSV_TEMPLATE}</pre>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = 'products-template.csv'; a.click()
            }}
          >
            Download Template
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Upload CSV</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <label className="flex flex-col items-center justify-center gap-3 cursor-pointer rounded-xl border-2 border-dashed border-[var(--border-default)] bg-[var(--bg-subtle)] px-6 py-10 hover:border-[var(--brand-accent)] transition-colors">
            <input type="file" accept=".csv" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <Upload className="h-8 w-8 text-[var(--text-muted)]" />
            {file ? (
              <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                <FileText className="h-4 w-4" />
                {file.name}
              </div>
            ) : (
              <span className="text-sm text-[var(--text-muted)]">Click to select a CSV file</span>
            )}
          </label>

          {result && (
            <div className="rounded-lg border border-[var(--border-default)] p-4 text-sm">
              <p className="font-medium text-emerald-600">{result.created} products imported</p>
              {result.errors && result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-[var(--error)] font-medium">Failed rows:</p>
                  <ul className="mt-1 space-y-0.5 text-[var(--text-muted)]">
                    {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={handleImport} disabled={!file} loading={pending}>Import Products</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
