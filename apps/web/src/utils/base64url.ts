const encodeBase64 = (bytes: Uint8Array): string => {
    const buffer = (globalThis as unknown as { Buffer?: typeof Buffer }).Buffer
    if (buffer !== undefined) {
        return buffer.from(bytes).toString('base64')
    }

    let binary = ''
    for (const b of bytes) {
        binary += String.fromCodePoint(b)
    }

    return btoa(binary)
}

const decodeBase64 = (base64: string): Uint8Array => {
    const buffer = (globalThis as unknown as { Buffer?: typeof Buffer }).Buffer
    if (buffer !== undefined) {
        return new Uint8Array(buffer.from(base64, 'base64'))
    }

    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.codePointAt(i) ?? 0
    }

    return bytes
}

export const base64urlEncode = (input: string | Uint8Array): string => {
    const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input
    const base64 = encodeBase64(bytes)

    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export const base64urlDecodeToBytes = (encoded: string): Uint8Array => {
    const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))
    return decodeBase64(`${normalized}${padding}`)
}

export const base64urlDecodeToString = (encoded: string): string => {
    const bytes = base64urlDecodeToBytes(encoded)
    return new TextDecoder().decode(bytes)
}
