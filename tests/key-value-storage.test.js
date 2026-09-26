import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {createRequire} from 'node:module'

globalThis.require = createRequire(import.meta.url)
globalThis.Utils = {
    isNwjs: () => true,
    RPGMAKER_NAME: 'MZ'
}

const {KeyValueStorage} = await import('../cheat-engine/www/cheat/js/KeyValueStorage.js')

test('creates parent directories and preserves settings values', () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'cheat-storage-'))
    try {
        const filePath = path.join(tempDirectory, 'nested', 'settings.json')
        const storage = new KeyValueStorage(filePath)
        storage.setItem('data', JSON.stringify({speed: 5}))

        assert.equal(storage.getItem('data'), '{"speed":5}')
        assert.equal(fs.existsSync(`${filePath}.tmp`), false)
    } finally {
        fs.rmSync(tempDirectory, {recursive: true, force: true})
    }
})

test('backs up malformed JSON and continues with defaults', () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'cheat-storage-'))
    try {
        const filePath = path.join(tempDirectory, 'settings.json')
        fs.writeFileSync(filePath, '{broken json', 'utf-8')
        const storage = new KeyValueStorage(filePath)

        const originalWarn = console.warn
        console.warn = () => {}
        try {
            assert.equal(storage.getItem('missing'), undefined)
        } finally {
            console.warn = originalWarn
        }
        assert.equal(fs.readdirSync(tempDirectory).some(name => name.startsWith('settings.json.corrupt-')), true)
    } finally {
        fs.rmSync(tempDirectory, {recursive: true, force: true})
    }
})
