import test from 'node:test'
import assert from 'node:assert/strict'

import {compareVersions, isVersionLessThan} from '../cheat-engine/www/cheat/js/Version.js'

test('compares numeric version segments instead of lexicographic strings', () => {
    assert.equal(compareVersions('0.100.0', '0.26.4'), 1)
    assert.equal(compareVersions('v1.0.10', 'v1.0.3'), 1)
    assert.equal(compareVersions('v1.0.4', '1.0.4'), 0)
    assert.equal(isVersionLessThan('0.25.0', '0.26.4'), true)
})
