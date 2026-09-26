function numericParts (version) {
    const matches = String(version || '').match(/\d+/g)
    return matches ? matches.map(part => Number(part)) : []
}

export function compareVersions (left, right) {
    const leftParts = numericParts(left)
    const rightParts = numericParts(right)
    const length = Math.max(leftParts.length, rightParts.length)

    for (let i = 0; i < length; ++i) {
        const leftPart = leftParts[i] || 0
        const rightPart = rightParts[i] || 0

        if (leftPart < rightPart) {
            return -1
        }
        if (leftPart > rightPart) {
            return 1
        }
    }

    return 0
}

export function isVersionLessThan (version, minimumVersion) {
    return compareVersions(version, minimumVersion) < 0
}
