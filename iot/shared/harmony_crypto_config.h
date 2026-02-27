/*
  ═══════════════════════════════════════════════════════════════════
  Harmony Aura — Shared Cryptographic Configuration
  ═══════════════════════════════════════════════════════════════════

  This header defines the shared Pre-Shared Key (PSK) and helper
  functions for AES-256-GCM encryption used across ALL ESP32 devices
  in the Harmony Aura IoT network.

  ⚠️  IMPORTANT: In production, store these keys in ESP32 NVS with
      Flash Encryption enabled. Hardcoding is for development only.

  Protocol:
    - Algorithm:  AES-256-GCM (Authenticated Encryption)
    - Key Size:   256-bit (32 bytes)
    - IV Size:    12 bytes (96-bit, GCM standard)
    - Tag Size:   16 bytes (128-bit)
    - Encoding:   Base64 for Firebase JSON transport
*/

#ifndef HARMONY_CRYPTO_CONFIG_H
#define HARMONY_CRYPTO_CONFIG_H

#include <mbedtls/gcm.h>
#include <mbedtls/base64.h>
#include <mbedtls/entropy.h>
#include <mbedtls/ctr_drbg.h>
#include <string.h>

// ═══════════════════════════════════════════════════
//  PRE-SHARED KEY (PSK) — 256-bit AES Key
//  ⚠️ CHANGE THIS before deployment!
//  Generate with: openssl rand -hex 32
// ═══════════════════════════════════════════════════

static const uint8_t HARMONY_AES_KEY[32] = {
    0x4A, 0x7B, 0x2C, 0x9D, 0x1E, 0x5F, 0x8A, 0x3B,
    0x6C, 0x0D, 0xFE, 0x4F, 0xA0, 0x71, 0xE2, 0x53,
    0xB4, 0x85, 0xD6, 0x27, 0xC8, 0x19, 0x6A, 0xFB,
    0x3C, 0xED, 0x7E, 0x0F, 0x90, 0x61, 0xB2, 0x43
};

// The same key as a hex string for the frontend (Web Crypto API)
// "4a7b2c9d1e5f8a3b6c0dfe4fa071e253b485d627c8196afb3ced7e0f9061b243"

// ═══════════════════════════════════════════════════
//  CRYPTO VERSION — for forward compatibility
// ═══════════════════════════════════════════════════
#define HARMONY_CRYPTO_VERSION 1

// ═══════════════════════════════════════════════════
//  SECURITY CONSTANTS
// ═══════════════════════════════════════════════════
#define AES_KEY_SIZE    32
#define GCM_IV_SIZE     12
#define GCM_TAG_SIZE    16
#define MAX_PLAINTEXT   512  // Max JSON payload size in bytes
#define MAX_B64_SIZE    700  // Max base64-encoded output

// ═══════════════════════════════════════════════════
//  HELPER: Generate cryptographically secure random IV
// ═══════════════════════════════════════════════════

static void generateRandomIV(uint8_t* iv, size_t len) {
    // ESP32 has a hardware RNG (random number generator)
    for (size_t i = 0; i < len; i++) {
        iv[i] = (uint8_t)esp_random();
    }
}

// ═══════════════════════════════════════════════════
//  HELPER: Base64 encode a byte array to a String
// ═══════════════════════════════════════════════════

static String base64Encode(const uint8_t* data, size_t len) {
    size_t olen = 0;
    mbedtls_base64_encode(NULL, 0, &olen, data, len);
    uint8_t* buf = (uint8_t*)malloc(olen + 1);
    if (!buf) return "";
    mbedtls_base64_encode(buf, olen + 1, &olen, data, len);
    buf[olen] = '\0';
    String result = String((char*)buf);
    free(buf);
    return result;
}

// ═══════════════════════════════════════════════════
//  HELPER: Base64 decode a String to byte array
//  Returns number of decoded bytes, or -1 on error.
// ═══════════════════════════════════════════════════

static int base64Decode(const String& input, uint8_t* output, size_t maxLen) {
    size_t olen = 0;
    int ret = mbedtls_base64_decode(output, maxLen, &olen,
                                     (const uint8_t*)input.c_str(), input.length());
    if (ret != 0) return -1;
    return (int)olen;
}

// ═══════════════════════════════════════════════════
//  ENCRYPT: Plaintext JSON → { iv, ct, at } Base64
//  Returns true on success.
// ═══════════════════════════════════════════════════

struct EncryptedPayload {
    String iv;    // Base64-encoded 12-byte IV
    String ct;    // Base64-encoded ciphertext
    String at;    // Base64-encoded 16-byte auth tag
};

static bool encryptPayload(const char* plaintext, EncryptedPayload& out) {
    size_t ptLen = strlen(plaintext);
    if (ptLen == 0 || ptLen > MAX_PLAINTEXT) return false;

    // Generate random IV
    uint8_t iv[GCM_IV_SIZE];
    generateRandomIV(iv, GCM_IV_SIZE);

    // Allocate ciphertext buffer (same size as plaintext for GCM)
    uint8_t* ciphertext = (uint8_t*)malloc(ptLen);
    uint8_t tag[GCM_TAG_SIZE];

    if (!ciphertext) return false;

    // Initialize AES-GCM context
    mbedtls_gcm_context gcm;
    mbedtls_gcm_init(&gcm);

    int ret = mbedtls_gcm_setkey(&gcm, MBEDTLS_CIPHER_ID_AES,
                                  HARMONY_AES_KEY, AES_KEY_SIZE * 8);
    if (ret != 0) {
        mbedtls_gcm_free(&gcm);
        free(ciphertext);
        return false;
    }

    // Encrypt
    ret = mbedtls_gcm_crypt_and_tag(&gcm, MBEDTLS_GCM_ENCRYPT,
                                     ptLen,
                                     iv, GCM_IV_SIZE,
                                     NULL, 0,  // No additional authenticated data
                                     (const uint8_t*)plaintext, ciphertext,
                                     GCM_TAG_SIZE, tag);

    mbedtls_gcm_free(&gcm);

    if (ret != 0) {
        free(ciphertext);
        return false;
    }

    // Base64 encode outputs
    out.iv = base64Encode(iv, GCM_IV_SIZE);
    out.ct = base64Encode(ciphertext, ptLen);
    out.at = base64Encode(tag, GCM_TAG_SIZE);

    free(ciphertext);
    return true;
}

// ═══════════════════════════════════════════════════
//  DECRYPT: { iv, ct, at } Base64 → Plaintext JSON
//  Returns plaintext String, or empty on failure.
// ═══════════════════════════════════════════════════

static String decryptPayload(const String& ivB64, const String& ctB64, const String& atB64) {
    // Decode Base64 inputs
    uint8_t iv[GCM_IV_SIZE];
    uint8_t tag[GCM_TAG_SIZE];
    uint8_t ciphertext[MAX_PLAINTEXT];
    uint8_t plaintext[MAX_PLAINTEXT];

    int ivLen = base64Decode(ivB64, iv, GCM_IV_SIZE);
    int tagLen = base64Decode(atB64, tag, GCM_TAG_SIZE);
    int ctLen = base64Decode(ctB64, ciphertext, MAX_PLAINTEXT);

    if (ivLen != GCM_IV_SIZE || tagLen != GCM_TAG_SIZE || ctLen < 1) {
        Serial.println("[CRYPTO] Base64 decode failed");
        return "";
    }

    // Initialize AES-GCM context
    mbedtls_gcm_context gcm;
    mbedtls_gcm_init(&gcm);

    int ret = mbedtls_gcm_setkey(&gcm, MBEDTLS_CIPHER_ID_AES,
                                  HARMONY_AES_KEY, AES_KEY_SIZE * 8);
    if (ret != 0) {
        mbedtls_gcm_free(&gcm);
        return "";
    }

    // Decrypt and verify auth tag
    ret = mbedtls_gcm_auth_decrypt(&gcm,
                                    ctLen,
                                    iv, GCM_IV_SIZE,
                                    NULL, 0,  // No AAD
                                    tag, GCM_TAG_SIZE,
                                    ciphertext, plaintext);

    mbedtls_gcm_free(&gcm);

    if (ret != 0) {
        Serial.println("[CRYPTO] ⚠ TAMPER DETECTED — Auth tag mismatch!");
        return "";
    }

    // Null-terminate and return
    plaintext[ctLen] = '\0';
    return String((char*)plaintext);
}

#endif // HARMONY_CRYPTO_CONFIG_H
