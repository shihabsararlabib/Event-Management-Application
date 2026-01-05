// Encryption Middleware
// Handles automatic encryption/decryption of user data and posts

import RSAEncryption from '../security/RSAEncryption.js';
import ECCEncryption from '../security/ECCEncryption.js';
import MACGenerator from '../security/MACGenerator.js';
import CryptoKey from '../models/CryptoKey.js';

class EncryptionService {
    constructor() {
        this.mac = new MACGenerator();
    }

    // Get or create user encryption keys
    async getUserKeys(userId) {
        try {
            // Try to get active keys from database
            const rsaKeyDoc = await CryptoKey.findOne({
                userId: userId,
                algorithm: 'RSA',
                status: 'active'
            });

            const eccKeyDoc = await CryptoKey.findOne({
                userId: userId,
                algorithm: 'ECC',
                status: 'active'
            });

            const macKeyDoc = await CryptoKey.findOne({
                userId: userId,
                algorithm: 'HMAC-SHA256',
                status: 'active'
            });

            let rsaKeys, eccKeys, macKey;

            // Generate RSA keys if not found
            if (!rsaKeyDoc) {
                const rsa = new RSAEncryption();
                rsaKeys = rsa.generateKeyPair(2048);
                
                // Save to database
                const keyDoc = new CryptoKey({
                    userId: userId,
                    keyId: `rsa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    algorithm: 'RSA',
                    publicKey: JSON.stringify({
                        e: rsaKeys.publicKey.e.toString(),
                        n: rsaKeys.publicKey.n.toString()
                    }),
                    privateKey: JSON.stringify({
                        d: rsaKeys.privateKey.d.toString(),
                        n: rsaKeys.privateKey.n.toString()
                    }),
                    status: 'active',
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                });
                await keyDoc.save();
            } else {
                const publicKey = JSON.parse(rsaKeyDoc.publicKey);
                const privateKey = JSON.parse(rsaKeyDoc.privateKey);
                rsaKeys = {
                    publicKey: {
                        e: BigInt(publicKey.e),
                        n: BigInt(publicKey.n)
                    },
                    privateKey: {
                        d: BigInt(privateKey.d),
                        n: BigInt(privateKey.n)
                    }
                };
            }

            // Generate ECC keys if not found
            if (!eccKeyDoc) {
                const ecc = new ECCEncryption();
                eccKeys = ecc.generateKeyPair();
                
                const keyDoc = new CryptoKey({
                    userId: userId,
                    keyId: `ecc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    algorithm: 'ECC',
                    publicKey: JSON.stringify({
                        x: eccKeys.publicKey.x.toString(16),
                        y: eccKeys.publicKey.y.toString(16)
                    }),
                    privateKey: eccKeys.privateKey.toString(16),
                    status: 'active',
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                });
                await keyDoc.save();
            } else {
                const publicKey = JSON.parse(eccKeyDoc.publicKey);
                eccKeys = {
                    publicKey: {
                        x: BigInt('0x' + publicKey.x),
                        y: BigInt('0x' + publicKey.y)
                    },
                    privateKey: BigInt('0x' + eccKeyDoc.privateKey)
                };
            }

            // Generate MAC key if not found
            if (!macKeyDoc) {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let key = '';
                for (let i = 0; i < 64; i++) {
                    key += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                
                const keyDoc = new CryptoKey({
                    userId: userId,
                    keyId: `mac_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    algorithm: 'HMAC-SHA256',
                    key: key,
                    status: 'active',
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                });
                await keyDoc.save();
                macKey = key;
            } else {
                macKey = macKeyDoc.key;
            }

            return { rsaKeys, eccKeys, macKey };
        } catch (error) {
            console.error('Error getting user keys:', error);
            throw error;
        }
    }

    // Multi-level encryption: RSA then ECC
    async encryptData(data, userId) {
        try {
            const { rsaKeys, eccKeys, macKey } = await this.getUserKeys(userId);
            
            // Convert data to string
            const dataStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
            
            // First layer: RSA encryption
            const rsa = new RSAEncryption();
            rsa.publicKey = rsaKeys.publicKey;
            rsa.privateKey = rsaKeys.privateKey;
            const rsaEncrypted = rsa.encryptLong(dataStr);
            
            // Second layer: ECC encryption
            const ecc = new ECCEncryption();
            ecc.publicKey = eccKeys.publicKey;
            ecc.privateKey = eccKeys.privateKey;
            const eccEncrypted = ecc.encryptLong(rsaEncrypted);
            
            // Generate MAC for integrity
            const mac = this.mac.generateHMAC(eccEncrypted, macKey);
            
            return {
                ciphertext: eccEncrypted,
                mac: mac
            };
        } catch (error) {
            console.error('Error encrypting data:', error);
            throw error;
        }
    }

    // Multi-level decryption: ECC then RSA
    async decryptData(encryptedData, userId) {
        try {
            const { rsaKeys, eccKeys, macKey } = await this.getUserKeys(userId);
            
            // Verify MAC first
            const isValid = this.mac.verifyHMAC(encryptedData.ciphertext, encryptedData.mac, macKey);
            if (!isValid) {
                throw new Error('Data integrity check failed: MAC verification failed');
            }
            
            // First layer: ECC decryption
            const ecc = new ECCEncryption();
            ecc.publicKey = eccKeys.publicKey;
            ecc.privateKey = eccKeys.privateKey;
            const eccDecrypted = ecc.decryptLong(encryptedData.ciphertext);
            
            // Second layer: RSA decryption
            const rsa = new RSAEncryption();
            rsa.publicKey = rsaKeys.publicKey;
            rsa.privateKey = rsaKeys.privateKey;
            const rsaDecrypted = rsa.decryptLong(eccDecrypted);
            
            // Try to parse as JSON, otherwise return as string
            try {
                return JSON.parse(rsaDecrypted);
            } catch {
                return rsaDecrypted;
            }
        } catch (error) {
            console.error('Error decrypting data:', error);
            throw error;
        }
    }

    // Encrypt user information
    async encryptUserInfo(user) {
        try {
            const sensitiveData = {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email
            };
            
            return await this.encryptData(sensitiveData, user._id);
        } catch (error) {
            console.error('Error encrypting user info:', error);
            throw error;
        }
    }

    // Decrypt user information
    async decryptUserInfo(encryptedData, userId) {
        try {
            return await this.decryptData(encryptedData, userId);
        } catch (error) {
            console.error('Error decrypting user info:', error);
            throw error;
        }
    }

    // Generate MAC for data
    generateDataMAC(data, key) {
        return this.mac.generateHMAC(data, key);
    }

    // Verify data MAC
    verifyDataMAC(data, mac, key) {
        return this.mac.verifyHMAC(data, mac, key);
    }
}

export default EncryptionService;

// Helper functions for direct use
const service = new EncryptionService();

export const getUserKeys = async (userId) => {
    return await service.getUserKeys(userId);
};

export const encryptData = async (data, keys) => {
    const dataStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
    
    // First layer: RSA encryption
    const rsa = new RSAEncryption();
    rsa.publicKey = keys.rsaKeys.publicKey;
    rsa.privateKey = keys.rsaKeys.privateKey;
    const rsaEncrypted = rsa.encryptLong(dataStr);
    
    // Second layer: ECC encryption
    const ecc = new ECCEncryption();
    ecc.publicKey = keys.eccKeys.publicKey;
    ecc.privateKey = keys.eccKeys.privateKey;
    const eccEncrypted = ecc.encryptLong(rsaEncrypted);
    
    // Generate MAC for integrity
    const mac = new MACGenerator();
    const dataMac = mac.generateHMAC(eccEncrypted, keys.macKey);
    
    return {
        encryptedData: eccEncrypted,
        dataMac: dataMac
    };
};

export const decryptData = async (encryptedData, dataMac, keys) => {
    // Verify MAC first
    const mac = new MACGenerator();
    const isValid = mac.verifyHMAC(encryptedData, dataMac, keys.macKey);
    if (!isValid && dataMac) {
        throw new Error('Data integrity check failed: MAC verification failed');
    }
    
    // First layer: ECC decryption
    const ecc = new ECCEncryption();
    ecc.publicKey = keys.eccKeys.publicKey;
    ecc.privateKey = keys.eccKeys.privateKey;
    const eccDecrypted = ecc.decryptLong(encryptedData);
    
    // Second layer: RSA decryption
    const rsa = new RSAEncryption();
    rsa.publicKey = keys.rsaKeys.publicKey;
    rsa.privateKey = keys.rsaKeys.privateKey;
    const rsaDecrypted = rsa.decryptLong(eccDecrypted);
    
    // Try to parse as JSON, otherwise return as string
    try {
        return JSON.parse(rsaDecrypted);
    } catch {
        return rsaDecrypted;
    }
};
