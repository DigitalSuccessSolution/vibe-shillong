import { useState, useEffect } from 'react'

/**
 * Custom hook to debounce any fast-changing value (e.g. search inputs).
 * Delays updating the debounced value until after `delay` milliseconds
 * have elapsed since the last time the value was changed.
 *
 * @param {*} value The value to debounce
 * @param {number} delay Milliseconds to delay (default 300ms)
 * @returns {*} The debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
