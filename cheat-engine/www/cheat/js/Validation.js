export function parseFiniteNumber (value, options = {}) {
    const label = options.label || 'Value'
    const numberValue = Number(value)

    if (!Number.isFinite(numberValue)) {
        throw new Error(`${label} must be a finite number`)
    }
    if (options.integer && !Number.isInteger(numberValue)) {
        throw new Error(`${label} must be an integer`)
    }
    if (options.min !== undefined && numberValue < options.min) {
        throw new Error(`${label} must be at least ${options.min}`)
    }
    if (options.max !== undefined && numberValue > options.max) {
        throw new Error(`${label} must be at most ${options.max}`)
    }

    return numberValue
}
