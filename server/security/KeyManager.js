// Key Management Module
// Handles key generation, distribution, storage, and rotation

import RSAEncryption from './RSAEncryption.js';
import ECCEncryption from './ECCEncryption.js';

class KeyManager {
    constructor() {
        this.rsaKeys = new Map();
        this.eccKeys = new Map();
        this.macKeys = new Map();
        this.keyRotationInterval = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    // Generate unique key ID
    generateKeyId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000000);
        return `key_${timestamp}_${random}`;
    }

    // Generate RSA key pair for a user
    generateRSAKeyPair(userId) {
        const rsa = new RSAEncryption();
        const keys = rsa.generateKeyPair(2048);
        const keyId = this.generateKeyId();

        const keyData = {
            keyId: keyId,
            userId: userId,
            algorithm: 'RSA',
            publicKey: {
                e: keys.publicKey.e.toString(),
                n: keys.publicKey.n.toString()
            },
            privateKey: {
                d: keys.privateKey.d.toString(),
                n: keys.privateKey.n.toString()
            },
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + this.keyRotationInterval),
            status: 'active'
        };

        this.rsaKeys.set(keyId, keyData);
        return keyData;
    }

    // Generate ECC key pair for a user
    generateECCKeyPair(userId) {
        const ecc = new ECCEncryption();
        const keys = ecc.generateKeyPair();
        const keyId = this.generateKeyId();

        const keyData = {
            keyId: keyId,
            userId: userId,
            algorithm: 'ECC',
            publicKey: {
                x: keys.publicKey.x.toString(16),
                y: keys.publicKey.y.toString(16)
            },
            privateKey: keys.privateKey.toString(16),
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + this.keyRotationInterval),
            status: 'active'
        };

        this.eccKeys.set(keyId, keyData);
        return keyData;
    }

    // Generate MAC key for data integrity
    generateMACKey(userId) {
        const keyId = this.generateKeyId();
        
        // Generate random MAC key
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let macKey = '';
        for (let i = 0; i < 64; i++) {
            macKey += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const keyData = {
            keyId: keyId,
            userId: userId,
            algorithm: 'HMAC-SHA256',
            key: macKey,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + this.keyRotationInterval),
            status: 'active'
        };

        this.macKeys.set(keyId, keyData);
        return keyData;
    }

    // Generate all keys for a user
    generateUserKeys(userId) {
        const rsaKeys = this.generateRSAKeyPair(userId);
        const eccKeys = this.generateECCKeyPair(userId);
        const macKey = this.generateMACKey(userId);

        return {
            rsaKeys: rsaKeys,
            eccKeys: eccKeys,
            macKey: macKey
        };
    }

    // Get RSA keys for a user
    getRSAKeys(keyId) {
        return this.rsaKeys.get(keyId);
    }

    // Get ECC keys for a user
    getECCKeys(keyId) {
        return this.eccKeys.get(keyId);
    }

    // Get MAC key for a user
    getMACKey(keyId) {
        return this.macKeys.get(keyId);
    }

    // Get all active keys for a user
    getUserKeys(userId) {
        const rsaKeys = Array.from(this.rsaKeys.values())
            .filter(k => k.userId === userId && k.status === 'active');
        const eccKeys = Array.from(this.eccKeys.values())
            .filter(k => k.userId === userId && k.status === 'active');
        const macKeys = Array.from(this.macKeys.values())
            .filter(k => k.userId === userId && k.status === 'active');

        return {
            rsaKeys: rsaKeys,
            eccKeys: eccKeys,
            macKeys: macKeys
        };
    }

    // Rotate keys for a user (generate new keys and mark old ones as expired)
    rotateUserKeys(userId) {
        // Mark old keys as expired
        for (const [keyId, keyData] of this.rsaKeys.entries()) {
            if (keyData.userId === userId && keyData.status === 'active') {
                keyData.status = 'expired';
                keyData.expiredAt = new Date();
            }
        }

        for (const [keyId, keyData] of this.eccKeys.entries()) {
            if (keyData.userId === userId && keyData.status === 'active') {
                keyData.status = 'expired';
                keyData.expiredAt = new Date();
            }
        }

        for (const [keyId, keyData] of this.macKeys.entries()) {
            if (keyData.userId === userId && keyData.status === 'active') {
                keyData.status = 'expired';
                keyData.expiredAt = new Date();
            }
        }

        // Generate new keys
        return this.generateUserKeys(userId);
    }

    // Check if keys need rotation
    checkKeyRotation(keyId, keyType = 'rsa') {
        let keyData;
        
        if (keyType === 'rsa') {
            keyData = this.rsaKeys.get(keyId);
        } else if (keyType === 'ecc') {
            keyData = this.eccKeys.get(keyId);
        } else if (keyType === 'mac') {
            keyData = this.macKeys.get(keyId);
        }

        if (!keyData) return true; // Key not found, needs rotation

        const now = new Date();
        return now >= keyData.expiresAt;
    }

    // Revoke a specific key
    revokeKey(keyId, keyType = 'rsa') {
        let keyData;
        
        if (keyType === 'rsa') {
            keyData = this.rsaKeys.get(keyId);
        } else if (keyType === 'ecc') {
            keyData = this.eccKeys.get(keyId);
        } else if (keyType === 'mac') {
            keyData = this.macKeys.get(keyId);
        }

        if (keyData) {
            keyData.status = 'revoked';
            keyData.revokedAt = new Date();
            return true;
        }

        return false;
    }

    // Export public keys for distribution
    exportPublicKeys(userId) {
        const rsaKeys = Array.from(this.rsaKeys.values())
            .filter(k => k.userId === userId && k.status === 'active')
            .map(k => ({
                keyId: k.keyId,
                algorithm: k.algorithm,
                publicKey: k.publicKey,
                createdAt: k.createdAt,
                expiresAt: k.expiresAt
            }));

        const eccKeys = Array.from(this.eccKeys.values())
            .filter(k => k.userId === userId && k.status === 'active')
            .map(k => ({
                keyId: k.keyId,
                algorithm: k.algorithm,
                publicKey: k.publicKey,
                createdAt: k.createdAt,
                expiresAt: k.expiresAt
            }));

        return {
            rsaKeys: rsaKeys,
            eccKeys: eccKeys
        };
    }

    // Store keys in database format
    prepareForStorage(keyData) {
        return {
            keyId: keyData.keyId,
            userId: keyData.userId,
            algorithm: keyData.algorithm,
            publicKey: JSON.stringify(keyData.publicKey),
            privateKey: JSON.stringify(keyData.privateKey),
            key: keyData.key,
            createdAt: keyData.createdAt,
            expiresAt: keyData.expiresAt,
            status: keyData.status
        };
    }

    // Load keys from database format
    loadFromStorage(storedData) {
        const keyData = {
            keyId: storedData.keyId,
            userId: storedData.userId,
            algorithm: storedData.algorithm,
            createdAt: storedData.createdAt,
            expiresAt: storedData.expiresAt,
            status: storedData.status
        };

        if (storedData.publicKey) {
            keyData.publicKey = JSON.parse(storedData.publicKey);
        }
        if (storedData.privateKey) {
            keyData.privateKey = JSON.parse(storedData.privateKey);
        }
        if (storedData.key) {
            keyData.key = storedData.key;
        }

        // Store in appropriate map
        if (storedData.algorithm === 'RSA') {
            this.rsaKeys.set(keyData.keyId, keyData);
        } else if (storedData.algorithm === 'ECC') {
            this.eccKeys.set(keyData.keyId, keyData);
        } else if (storedData.algorithm.includes('HMAC')) {
            this.macKeys.set(keyData.keyId, keyData);
        }

        return keyData;
    }

    // Clear all expired keys (for cleanup)
    clearExpiredKeys() {
        const now = new Date();
        
        // Clear expired RSA keys
        for (const [keyId, keyData] of this.rsaKeys.entries()) {
            if (keyData.status === 'expired' && 
                now - keyData.expiredAt > 90 * 24 * 60 * 60 * 1000) { // 90 days after expiration
                this.rsaKeys.delete(keyId);
            }
        }

        // Clear expired ECC keys
        for (const [keyId, keyData] of this.eccKeys.entries()) {
            if (keyData.status === 'expired' && 
                now - keyData.expiredAt > 90 * 24 * 60 * 60 * 1000) {
                this.eccKeys.delete(keyId);
            }
        }

        // Clear expired MAC keys
        for (const [keyId, keyData] of this.macKeys.entries()) {
            if (keyData.status === 'expired' && 
                now - keyData.expiredAt > 90 * 24 * 60 * 60 * 1000) {
                this.macKeys.delete(keyId);
            }
        }
    }
}

export default KeyManager;
