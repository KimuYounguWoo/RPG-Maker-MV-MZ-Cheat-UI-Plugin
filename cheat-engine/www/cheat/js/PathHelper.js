function isNwjs () {
    return typeof Utils !== 'undefined' && Utils.isNwjs()
}

function isMv () {
    return typeof Utils !== 'undefined' && Utils.RPGMAKER_NAME === 'MV'
}

export function getGameContentPath (fileName = '') {
    if (!isNwjs()) {
        return fileName
    }

    const path = require('path')
    const rootDirectory = isMv() ? './www' : '.'
    return path.join(rootDirectory, fileName)
}

export function getCheatSettingsPath (fileName) {
    if (!isNwjs()) {
        return `cheat-settings/${fileName}`
    }

    const path = require('path')
    const targetPath = getGameContentPath(path.join('cheat-settings', fileName))

    // v1.0.3 always wrote settings below ./www, including in MZ games.
    // Move those files once so existing user settings continue to work.
    if (!isMv()) {
        const legacyPath = path.join('./www', 'cheat-settings', fileName)
        migrateLegacyFile(legacyPath, targetPath)
    }

    return targetPath
}

function migrateLegacyFile (legacyPath, targetPath) {
    const fs = require('fs')
    const path = require('path')

    if (legacyPath === targetPath || fs.existsSync(targetPath) || !fs.existsSync(legacyPath)) {
        return
    }

    const targetDirectory = path.dirname(targetPath)
    if (!fs.existsSync(targetDirectory)) {
        fs.mkdirSync(targetDirectory, { recursive: true })
    }

    fs.writeFileSync(targetPath, fs.readFileSync(legacyPath))
}
