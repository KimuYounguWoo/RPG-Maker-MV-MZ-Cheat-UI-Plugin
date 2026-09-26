export const VARIABLE_VALUE_TYPES = [
    { text: 'Number', value: 'number' },
    { text: 'String', value: 'string' },
    { text: 'Boolean', value: 'boolean' },
    { text: 'Array', value: 'array' },
    { text: 'Object', value: 'object' },
    { text: 'Null', value: 'null' }
]

export function getVariableValueType (value) {
    if (value === null) {
        return 'null'
    }
    if (Array.isArray(value)) {
        return 'array'
    }

    const valueType = typeof value
    if (valueType === 'number' || valueType === 'string' || valueType === 'boolean') {
        return valueType
    }
    if (valueType === 'object') {
        return 'object'
    }

    return 'string'
}

export function formatVariableValue (value) {
    const valueType = getVariableValueType(value)

    if (valueType === 'array' || valueType === 'object') {
        return JSON.stringify(value)
    }
    if (valueType === 'null') {
        return 'null'
    }

    return String(value)
}

export function parseVariableValue (text, valueType) {
    const rawValue = String(text)

    if (valueType === 'string') {
        return rawValue
    }
    if (valueType === 'number') {
        const numberValue = Number(rawValue.trim())
        if (!Number.isFinite(numberValue)) {
            throw new Error('Value must be a finite number')
        }
        return numberValue
    }
    if (valueType === 'boolean') {
        const normalized = rawValue.trim().toLowerCase()
        if (normalized !== 'true' && normalized !== 'false') {
            throw new Error('Boolean value must be true or false')
        }
        return normalized === 'true'
    }
    if (valueType === 'null') {
        return null
    }
    if (valueType === 'array' || valueType === 'object') {
        let parsedValue
        try {
            parsedValue = JSON.parse(rawValue)
        } catch (err) {
            throw new Error(`Invalid JSON: ${err.message}`)
        }

        if (valueType === 'array' && !Array.isArray(parsedValue)) {
            throw new Error('Value must be a JSON array')
        }
        if (valueType === 'object' && (parsedValue === null || Array.isArray(parsedValue) || typeof parsedValue !== 'object')) {
            throw new Error('Value must be a JSON object')
        }
        return parsedValue
    }

    throw new Error(`Unsupported variable type: ${valueType}`)
}

export function convertVariableValue (value, valueType) {
    if (valueType === getVariableValueType(value)) {
        return value
    }
    if (valueType === 'string') {
        return value === null ? '' : String(value)
    }
    if (valueType === 'number') {
        const converted = Number(value)
        return Number.isFinite(converted) ? converted : 0
    }
    if (valueType === 'boolean') {
        if (typeof value === 'string') {
            return value.trim().toLowerCase() === 'true'
        }
        return Boolean(value)
    }
    if (valueType === 'array') {
        return []
    }
    if (valueType === 'object') {
        return {}
    }
    if (valueType === 'null') {
        return null
    }

    throw new Error(`Unsupported variable type: ${valueType}`)
}
