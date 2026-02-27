/**
 * ═══════════════════════════════════════════════════════════════════
 *  Harmony Aura — Frontend Crypto Provider (Web Crypto API)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Decrypts AES-256-GCM encrypted payloads received from Firebase RTDB.
 * Uses the browser-native Web Crypto API (SubtleCrypto) — zero external
 * dependencies and hardware-accelerated on modern browsers.
 *
 * Encrypted Envelope Format (from ESP32):
 *   {
 *     s: {
 *       v:  1,            // Crypto protocol version
 *       iv: "base64...",  // 12-byte initialization vector
 *       ct: "base64...",  // AES-256-GCM ciphertext
 *       at: "base64..."   // 16-byte authentication tag
 *     }
 *   }
 *
 * ⚠️  The PSK hex string below must match the key in harmony_crypto_config.h
 */

// ═══════════════════════════════════════════════════
//  PRE-SHARED KEY — Must match the ESP32 key exactly
//  ⚠️ In production, fetch this from a secure backend
//     endpoint, NOT hardcoded in client code.
// ═══════════════════════════════════════════════════

const PSK_HEX = '4a7b2c9d1e5f8a3b6c0dfe4fa071e253b485d627c8196afb3ced7e0f9061b243';

// Expected crypto version
const EXPECTED_VERSION = 1;

// ═══════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════

/**
 * Convert a hex string to a Uint8Array.
 */
function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
}

/**
 * Decode a Base64 string to a Uint8Array.
 */
function base64ToBytes(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

// ═══════════════════════════════════════════════════
//  CACHED CRYPTO KEY (imported once, reused)
// ═══════════════════════════════════════════════════

let cachedKey = null;

/**
 * Import the PSK as a CryptoKey (AES-GCM, decrypt-only).
 * Cached after first call for performance.
 */
async function getKey() {
    if (cachedKey) return cachedKey;

    const keyBytes = hexToBytes(PSK_HEX);
    cachedKey = await crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'AES-GCM' },
        false,          // Not extractable
        ['decrypt']     // Usage: decrypt only
    );

    return cachedKey;
}

// ═══════════════════════════════════════════════════
//  MAIN FUNCTION: Decrypt an encrypted envelope
// ═══════════════════════════════════════════════════

/**
 * Decrypt an AES-256-GCM encrypted payload from Firebase.
 *
 * @param {Object} envelope - The `s` object from Firebase: { v, iv, ct, at }
 * @returns {Object|null} - Decrypted JSON object, or null on failure.
 *
 * Usage:
 *   const data = snapshot.val();
 *   if (data?.s) {
 *       const decrypted = await decryptEnvelope(data.s);
 *       // decrypted = { heart_rate_bpm: 72, body_temp_c: 36.5, ... }
 *   }
 */
export async function decryptEnvelope(envelope) {
    try {
        // Validate version
        if (!envelope || envelope.v !== EXPECTED_VERSION) {
            console.warn('[Crypto] Unknown or missing encryption version:', envelope?.v);
            return null;
        }

        const { iv: ivB64, ct: ctB64, at: atB64 } = envelope;

        if (!ivB64 || !ctB64 || !atB64) {
            console.warn('[Crypto] Missing encryption fields (iv/ct/at)');
            return null;
        }

        // Decode Base64
        const iv = base64ToBytes(ivB64);
        const ciphertext = base64ToBytes(ctB64);
        const authTag = base64ToBytes(atB64);

        // AES-GCM expects ciphertext + tag concatenated
        const combined = new Uint8Array(ciphertext.length + authTag.length);
        combined.set(ciphertext);
        combined.set(authTag, ciphertext.length);

        // Get the AES key
        const key = await getKey();

        // Decrypt
        const decryptedBuffer = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv,
                tagLength: 128 // 16 bytes = 128 bits
            },
            key,
            combined
        );

        // Decode UTF-8 → JSON
        const decoder = new TextDecoder();
        const jsonString = decoder.decode(decryptedBuffer);
        const parsed = JSON.parse(jsonString);

        return parsed;

    } catch (error) {
        if (error.name === 'OperationError') {
            console.error('[Crypto] ⚠ TAMPER DETECTED — Auth tag verification failed!');
        } else {
            console.error('[Crypto] Decryption error:', error.message);
        }
        return null;
    }
}

/**
 * Check if a Firebase snapshot value is encrypted.
 * Returns true if it has the secure envelope structure.
 */
export function isEncrypted(data) {
    return data && data.s && typeof data.s.v === 'number' && data.s.iv && data.s.ct;
}
