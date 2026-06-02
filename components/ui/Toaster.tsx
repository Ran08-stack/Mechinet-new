"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { X } from "lucide-react"

type ToastAction = {
  label: string
  onClick: () => void
}

type Toast = {
  id: number
  message: string
  action?: ToastAction
  duration?: number
}

type ToastContextValue = {
  toast: (t: Omit<Toast, "id">) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast חייב להיות בתוך <Toaster>")
  return ctx
}

export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { ...t, id }])
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        dir="rtl"
        className="fixed bottom-4 start-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2"
        style={{ pointerEvents: "none" }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast
  onClose: () => void
}) {
  useEffect(() => {
    const ms = toast.duration ?? 10000
    const timer = setTimeout(onClose, ms)
    return () => clearTimeout(timer)
  }, [toast.duration, onClose])

  return (
    <div
      style={{ pointerEvents: "auto" }}
      className="flex items-center gap-3 rounded-md bg-fg px-4 py-2.5 text-[13px] text-bg shadow-[var(--shadow-lg)]"
    >
      <span>{toast.message}</span>
      {toast.action && (
        <button
          onClick={() => {
            toast.action!.onClick()
            onClose()
          }}
          className="rounded px-2 py-1 text-[12px] font-semibold text-accent hover:bg-white/10"
        >
          {toast.action.label}
        </button>
      )}
      <button
        onClick={onClose}
        aria-label="סגור"
        className="inline-grid h-5 w-5 place-items-center rounded opacity-60 hover:bg-white/10 hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
