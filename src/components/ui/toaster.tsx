import { useEffect, useState } from 'react'
import { subscribe, dismiss, ToastMessage } from '../../lib/toast'
import { cn } from '../../lib/utils'

export function Toaster() {
  const [list, setList] = useState<ToastMessage[]>([])
  useEffect(() => {
    const unsub = subscribe(setList)
    return () => { unsub() }
  }, [])
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {list.map(t => (
        <div
          key={t.id}
          className={cn(
            'w-80 rounded-md border bg-background shadow-lg p-3 text-sm',
            t.variant === 'success' && 'border-green-200 bg-green-50 text-green-800',
            t.variant === 'destructive' && 'border-red-200 bg-red-50 text-red-800'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              {t.title && <div className="font-medium">{t.title}</div>}
              {t.description && <div className="text-muted-foreground">{t.description}</div>}
            </div>
            <button className="text-xs opacity-70 hover:opacity-100" onClick={() => dismiss(t.id)}>Dismiss</button>
          </div>
        </div>
      ))}
    </div>
  )}
