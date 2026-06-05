import { AdminTopbar } from '@/components/admin/topbar'
import { CSVImport } from './_csv-import'

export default function ImportPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <AdminTopbar
        title="Import Products"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Products', href: '/admin/products' }]}
      />
      <main className="flex-1 p-6">
        <CSVImport />
      </main>
    </div>
  )
}
