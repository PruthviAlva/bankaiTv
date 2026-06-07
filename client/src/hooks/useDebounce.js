import { useState, useEffect } from 'react'

export default function useDebounce(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set a timer — if value changes before it fires, it resets
        const timer = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        // Cleanup: cancel the previous timer on every render
        return () => clearTimeout(timer)
    }, [value, delay]);

    return debouncedValue;
}