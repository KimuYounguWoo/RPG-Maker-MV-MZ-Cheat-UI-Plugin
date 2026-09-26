import test from 'node:test'
import assert from 'node:assert/strict'

import {
    convertVariableValue,
    formatVariableValue,
    getVariableValueType,
    parseVariableValue
} from '../cheat-engine/www/cheat/js/VariableValue.js'

test('preserves and parses RPG Maker variable value types', () => {
    assert.equal(parseVariableValue('42', 'number'), 42)
    assert.equal(parseVariableValue('false', 'boolean'), false)
    assert.deepEqual(parseVariableValue('[1,"two"]', 'array'), [1, 'two'])
    assert.deepEqual(parseVariableValue('{"gold":10}', 'object'), {gold: 10})
    assert.equal(parseVariableValue('0042', 'string'), '0042')
})

test('formats compound values and rejects mismatched JSON types', () => {
    assert.equal(getVariableValueType([1, 2]), 'array')
    assert.equal(formatVariableValue({enabled: true}), '{"enabled":true}')
    assert.throws(() => parseVariableValue('{"a":1}', 'array'), /JSON array/)
    assert.throws(() => parseVariableValue('Infinity', 'number'), /finite number/)
})

test('converts values when the user explicitly selects a new type', () => {
    assert.equal(convertVariableValue('12', 'number'), 12)
    assert.equal(convertVariableValue(0, 'boolean'), false)
    assert.deepEqual(convertVariableValue('not json', 'array'), [])
    assert.deepEqual(convertVariableValue(null, 'object'), {})
})
