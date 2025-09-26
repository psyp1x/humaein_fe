export type ToastVariant = 'default' | 'success' | 'destructive'

export type ToastMessage = {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

type Listener = (toasts: ToastMessage[]) => void

let toasts: ToastMessage[] = []
const listeners = new Set<Listener>()

function emit() {
  for (const l of listeners) l(toasts)
}

export function subscribe(listener: Listener) {
  listeners.add(listener)
  listener(toasts)
  return () => listeners.delete(listener)
}

export function showToast(msg: Omit<ToastMessage, 'id'>) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const item: ToastMessage = { id, duration: 3500, variant: 'default', ...msg }
  toasts = [item, ...toasts].slice(0, 5)
  emit()
  const duration = item.duration ?? 3500
  if (duration > 0) {
    setTimeout(() => {
      dismiss(id)
    }, duration)
  }
  return id
}

export function dismiss(id: string) {
  const before = toasts.length
  toasts = toasts.filter(t => t.id !== id)
  if (toasts.length !== before) emit()
}
