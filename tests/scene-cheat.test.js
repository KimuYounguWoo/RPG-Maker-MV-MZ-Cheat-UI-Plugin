import test from 'node:test'
import assert from 'node:assert/strict'

globalThis.Utils = {
    isNwjs: () => false,
    RPGMAKER_NAME: 'MZ'
}

const {Alert} = await import('../cheat-engine/www/cheat/js/AlertHelper.js')
const {SceneCheat} = await import('../cheat-engine/www/cheat/js/CheatHelper.js')

test('quick save waits for completion before reporting success', async () => {
    const events = []
    globalThis.$gameSystem = {
        onBeforeSave: () => events.push('before-save')
    }
    globalThis.DataManager = {
        saveGame: async slot => {
            events.push(`save-${slot}`)
            return true
        }
    }
    Alert.alertInternal = (level, message) => events.push(`${level}:${message}`)

    assert.equal(await SceneCheat.quickSave(3), true)
    assert.deepEqual(events, ['before-save', 'save-3', 'success:Game saved to slot 3'])
})

test('quick load does not change scene when loading fails', async () => {
    const events = []
    globalThis.DataManager = {
        loadGame: async () => {
            throw new Error('broken save')
        }
    }
    globalThis.SceneManager = {
        goto: () => events.push('goto')
    }
    globalThis.Scene_Map = function SceneMap () {}
    Alert.alertInternal = (level, message) => events.push(`${level}:${message}`)

    assert.equal(await SceneCheat.quickLoad(2), false)
    assert.equal(events.includes('goto'), false)
    assert.deepEqual(events, ['error:Failed to load game from slot 2'])
})

test('quick load runs the engine load hook before changing scene', async () => {
    const events = []
    globalThis.DataManager = {
        loadGame: async slot => events.push(`load-${slot}`)
    }
    globalThis.$gameSystem = {
        onAfterLoad: () => events.push('after-load')
    }
    globalThis.SceneManager = {
        goto: scene => events.push(scene === globalThis.Scene_Map ? 'goto-map' : 'goto-other')
    }
    globalThis.Scene_Map = function SceneMap () {}
    Alert.alertInternal = (level, message) => events.push(`${level}:${message}`)

    assert.equal(await SceneCheat.quickLoad(4), true)
    assert.deepEqual(events, ['load-4', 'after-load', 'goto-map', 'success:Game loaded from slot 4'])
})
