import { Send, X } from 'lucide-react'
import TextareaAutosize from 'react-textarea-autosize'
import { type Ref } from 'react'

import { cn } from '@isyuricunha/utils'

type ComposerProps = {
  inputRef: Ref<HTMLTextAreaElement>
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onCancel: () => void
  disabled: boolean
  loading: boolean
  cancelling: boolean
  placeholder: string
  label: string
}

export const NeryChatComposer = ({
  inputRef,
  value,
  onChange,
  onSend,
  onCancel,
  disabled,
  loading,
  cancelling,
  placeholder,
  label
}: ComposerProps) => (
  <div className='flex items-end gap-2'>
    <TextareaAutosize
      ref={inputRef}
      minRows={1}
      maxRows={6}
      maxLength={2000}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
        event.preventDefault()
        if (!disabled && !loading && value.trim()) onSend()
      }}
      placeholder={placeholder}
      aria-label={placeholder}
      className='placeholder:text-muted-foreground/60 min-w-0 flex-1 resize-none rounded-xl border border-[var(--border-subtle)] bg-[var(--yu-bg-input)] px-4 py-3 text-sm transition-colors focus:border-[var(--action-primary-border)] focus:ring-2 focus:ring-[var(--action-primary-border)] focus:outline-none'
      disabled={disabled || loading}
    />
    <button
      type='button'
      onClick={loading ? onCancel : onSend}
      disabled={loading ? cancelling : !value.trim() || disabled}
      aria-label={label}
      title={label}
      className={cn(
        'text-text-inverse rounded-lg px-4 py-3 shadow-sm transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
        loading
          ? 'bg-status-danger hover:bg-status-danger/90'
          : 'bg-action-primary hover:bg-action-primary-hover'
      )}
    >
      {loading ? <X className='h-4 w-4' /> : <Send className='h-4 w-4' />}
    </button>
  </div>
)
