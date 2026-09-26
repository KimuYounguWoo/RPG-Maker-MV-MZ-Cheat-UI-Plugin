import {getCheatSettingsPath} from './PathHelper.js'

export class KeyValueStorage {
    constructor (filePath) {
        this.filePath = filePath

        if (this.__isNwjs()) {
            this.filePath = filePath
            this.fileEncoding = 'utf-8'
            this.fileSystem = require('fs')
            this.path = require('path')
        }
    }

    getItem (key) {
        if (!this.__isNwjs()) {
            return localStorage.getItem(this.__localStorageKey(key))
        }

        return this.__getItemFromFile(key)
    }

    setItem (key, value) {
        if (!this.__isNwjs()) {
            localStorage.setItem(this.__localStorageKey(key), value)
            return
        }

        this.__setItemToFile(key, value)
    }

    __isNwjs () {
        return typeof Utils !== 'undefined' && Utils.isNwjs()
    }

    __localStorageKey (key) {
        return `cheat.${this.filePath}.${key}`
    }

    __readFile () {
        if (!this.fileSystem.existsSync(this.filePath)) {
            return {}
        }

        try {
            return JSON.parse(this.fileSystem.readFileSync(this.filePath, this.fileEncoding))
        } catch (err) {
            const backupPath = `${this.filePath}.corrupt-${Date.now()}`
            try {
                this.fileSystem.renameSync(this.filePath, backupPath)
            } catch (backupError) {
                // Keep using defaults even when a read-only game directory prevents backup.
            }
            console.warn(`[cheat plugin warn] Invalid settings file was ignored: ${this.filePath}`, err)
            return {}
        }
    }

    __getItemFromFile (key) {
        return this.__readFile()[key]
    }

    __setItemToFile (key, value) {
        const data = this.__readFile()

        data[key] = value

        const parentDirectory = this.path.dirname(this.filePath)
        if (!this.fileSystem.existsSync(parentDirectory)) {
            this.fileSystem.mkdirSync(parentDirectory, { recursive: true })
        }

        const temporaryPath = `${this.filePath}.tmp`
        const serializedData = JSON.stringify(data, null, 2)
        this.fileSystem.writeFileSync(temporaryPath, serializedData, this.fileEncoding)

        try {
            this.fileSystem.renameSync(temporaryPath, this.filePath)
        } catch (err) {
            // Some old Windows/NW.js combinations cannot replace an existing file by rename.
            this.fileSystem.writeFileSync(this.filePath, serializedData, this.fileEncoding)
            try {
                this.fileSystem.unlinkSync(temporaryPath)
            } catch (cleanupError) {
            }
        }
    }
}

export const KEY_VALUE_STORAGE = new KeyValueStorage(getCheatSettingsPath('kv-storage.json'))
