import { useState } from 'react'

interface SwitchProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  disabled?: boolean
  color?: 'violet' | 'blue' | 'green'
  size?: 'sm' | 'md' | 'lg'
}

export const Switch = ({ 
  checked = false, 
  onChange, 
  label,
  disabled = false,
  color = 'violet',
  size = 'md'
}: SwitchProps) => {
  const [isChecked, setIsChecked] = useState(checked)

  const handleToggle = () => {
    if (disabled) return
    const newValue = !isChecked
    setIsChecked(newValue)
    onChange?.(newValue)
  }

  const colors = {
    violet: 'bg-violet-600 focus:ring-violet-500',
    blue: 'bg-blue-600 focus:ring-blue-500', 
    green: 'bg-green-600 focus:ring-green-500'
  }

  const sizes = {
    sm: { switch: 'h-4 w-8', thumb: 'h-3 w-3', translate: 'translate-x-4' },
    md: { switch: 'h-6 w-11', thumb: 'h-4 w-4', translate: 'translate-x-6' },
    lg: { switch: 'h-8 w-14', thumb: 'h-6 w-6', translate: 'translate-x-7' }
  }

  const sizeClass = sizes[size]
  const colorClass = colors[color]

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative inline-flex items-center rounded-full 
          transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${sizeClass.switch}
          ${disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-200' 
            : isChecked 
              ? colorClass
              : 'bg-gray-300 hover:bg-gray-400'
          }
        `}
      >
        <span
          className={`
            inline-block transform rounded-full bg-white 
            shadow-md transition-all duration-300 ease-in-out
            ${sizeClass.thumb}
            ${isChecked ? sizeClass.translate : 'translate-x-1'}
          `}
        />
      </button>
      {label && (
        <label 
          onClick={handleToggle}
          className={`
            text-sm font-medium cursor-pointer
            ${disabled ? 'text-gray-400' : 'text-gray-700'}
          `}
        >
          {label}
        </label>
      )}
    </div>
  )
}