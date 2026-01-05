// ECC (Elliptic Curve Cryptography) Implementation from Scratch
// Using secp256k1 curve (y^2 = x^3 + 7)

class ECCEncryption {
    constructor() {
        // secp256k1 curve parameters
        this.p = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F');
        this.a = 0n;
        this.b = 7n;
        this.Gx = BigInt('0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798');
        this.Gy = BigInt('0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8');
        this.n = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
        this.G = { x: this.Gx, y: this.Gy };
        
        this.privateKey = null;
        this.publicKey = null;
    }

    // Modular arithmetic
    mod(n, m = this.p) {
        return ((n % m) + m) % m;
    }

    // Modular inverse using Extended Euclidean Algorithm
    modInverse(a, m = this.p) {
        a = this.mod(a, m);
        let [old_r, r] = [a, m];
        let [old_s, s] = [1n, 0n];

        while (r !== 0n) {
            const quotient = old_r / r;
            [old_r, r] = [r, old_r - quotient * r];
            [old_s, s] = [s, old_s - quotient * s];
        }

        if (old_r > 1n) {
            throw new Error('Modular inverse does not exist');
        }

        return this.mod(old_s, m);
    }

    // Point addition on elliptic curve
    pointAdd(P, Q) {
        if (P === null) return Q;
        if (Q === null) return P;

        if (P.x === Q.x && P.y === Q.y) {
            return this.pointDouble(P);
        }

        if (P.x === Q.x) {
            return null; // Point at infinity
        }

        const m = this.mod((Q.y - P.y) * this.modInverse(Q.x - P.x));
        const x = this.mod(m * m - P.x - Q.x);
        const y = this.mod(m * (P.x - x) - P.y);

        return { x, y };
    }

    // Point doubling on elliptic curve
    pointDouble(P) {
        if (P === null) return null;

        const m = this.mod((3n * P.x * P.x + this.a) * this.modInverse(2n * P.y));
        const x = this.mod(m * m - 2n * P.x);
        const y = this.mod(m * (P.x - x) - P.y);

        return { x, y };
    }

    // Scalar multiplication (point * scalar)
    scalarMultiply(k, P = this.G) {
        if (k === 0n) return null;
        if (k === 1n) return P;

        let result = null;
        let addend = P;

        while (k > 0n) {
            if (k & 1n) {
                result = this.pointAdd(result, addend);
            }
            addend = this.pointDouble(addend);
            k >>= 1n;
        }

        return result;
    }

    // Generate random number in range [1, n-1]
    randomBigInt() {
        const bytes = 32;
        let result = 0n;
        
        for (let i = 0; i < bytes; i++) {
            const randomByte = BigInt(Math.floor(Math.random() * 256));
            result = (result << 8n) | randomByte;
        }

        return this.mod(result, this.n - 1n) + 1n;
    }

    // Generate ECC key pair
    generateKeyPair() {
        // Private key: random number in [1, n-1]
        this.privateKey = this.randomBigInt();

        // Public key: G * privateKey
        this.publicKey = this.scalarMultiply(this.privateKey);

        return {
            privateKey: this.privateKey,
            publicKey: this.publicKey
        };
    }

    // Encrypt message using ECIES (Elliptic Curve Integrated Encryption Scheme)
    encrypt(message, publicKey = this.publicKey) {
        if (!publicKey) throw new Error('Public key not available');

        // Convert message to BigInt
        let m;
        if (typeof message === 'string') {
            const hex = Buffer.from(message, 'utf8').toString('hex');
            m = BigInt('0x' + hex);
        } else if (typeof message === 'bigint') {
            m = message;
        } else {
            throw new Error('Message must be string or BigInt');
        }

        // Generate ephemeral key pair
        const ephemeralPrivate = this.randomBigInt();
        const ephemeralPublic = this.scalarMultiply(ephemeralPrivate);

        // Shared secret: ephemeralPrivate * publicKey
        const sharedSecret = this.scalarMultiply(ephemeralPrivate, publicKey);
        
        // Use x-coordinate of shared secret as encryption key
        const encryptionKey = sharedSecret.x;

        // Encrypt: message XOR with encryption key
        const ciphertext = m ^ encryptionKey;

        return {
            ephemeralPublic: {
                x: ephemeralPublic.x.toString(16),
                y: ephemeralPublic.y.toString(16)
            },
            ciphertext: ciphertext.toString(16)
        };
    }

    // Decrypt ciphertext
    decrypt(encryptedData, privateKey = this.privateKey) {
        if (!privateKey) throw new Error('Private key not available');

        const ephemeralPublic = {
            x: BigInt('0x' + encryptedData.ephemeralPublic.x),
            y: BigInt('0x' + encryptedData.ephemeralPublic.y)
        };

        const ciphertext = BigInt('0x' + encryptedData.ciphertext);

        // Shared secret: privateKey * ephemeralPublic
        const sharedSecret = this.scalarMultiply(privateKey, ephemeralPublic);
        
        // Use x-coordinate of shared secret as decryption key
        const decryptionKey = sharedSecret.x;

        // Decrypt: ciphertext XOR with decryption key
        const decrypted = ciphertext ^ decryptionKey;

        // Convert back to string
        const hex = decrypted.toString(16);
        const paddedHex = hex.length % 2 === 0 ? hex : '0' + hex;
        
        try {
            return Buffer.from(paddedHex, 'hex').toString('utf8');
        } catch (error) {
            throw new Error('Decryption failed: invalid data');
        }
    }

    // Encrypt long messages by breaking into blocks
    encryptLong(message, publicKey = this.publicKey) {
        if (!publicKey) throw new Error('Public key not available');

        const maxBlockSize = 32; // 32 bytes per block
        const blocks = [];

        for (let i = 0; i < message.length; i += maxBlockSize) {
            const block = message.substring(i, i + maxBlockSize);
            blocks.push(this.encrypt(block, publicKey));
        }

        return JSON.stringify(blocks);
    }

    // Decrypt long messages
    decryptLong(ciphertext, privateKey = this.privateKey) {
        if (!privateKey) throw new Error('Private key not available');

        const blocks = JSON.parse(ciphertext);
        let message = '';

        for (const block of blocks) {
            message += this.decrypt(block, privateKey);
        }

        return message;
    }

    // Export keys as strings
    exportKeys() {
        return {
            publicKey: JSON.stringify({
                x: this.publicKey.x.toString(16),
                y: this.publicKey.y.toString(16)
            }),
            privateKey: this.privateKey.toString(16)
        };
    }

    // Import keys from strings
    importKeys(publicKeyStr, privateKeyStr) {
        if (publicKeyStr) {
            const pk = JSON.parse(publicKeyStr);
            this.publicKey = {
                x: BigInt('0x' + pk.x),
                y: BigInt('0x' + pk.y)
            };
        }
        if (privateKeyStr) {
            this.privateKey = BigInt('0x' + privateKeyStr);
        }
    }

    // Sign message (for authentication)
    sign(message, privateKey = this.privateKey) {
        if (!privateKey) throw new Error('Private key not available');

        // Convert message to hash (simple hash function)
        let hash = 0n;
        for (let i = 0; i < message.length; i++) {
            hash = this.mod((hash << 5n) + BigInt(message.charCodeAt(i)), this.n);
        }

        // Generate random k
        const k = this.randomBigInt();

        // r = (k * G).x mod n
        const kG = this.scalarMultiply(k);
        const r = this.mod(kG.x, this.n);

        // s = k^-1 * (hash + r * privateKey) mod n
        const kInv = this.modInverse(k, this.n);
        const s = this.mod(kInv * (hash + r * privateKey), this.n);

        return { r: r.toString(16), s: s.toString(16) };
    }

    // Verify signature
    verify(message, signature, publicKey = this.publicKey) {
        if (!publicKey) throw new Error('Public key not available');

        const r = BigInt('0x' + signature.r);
        const s = BigInt('0x' + signature.s);

        // Convert message to hash
        let hash = 0n;
        for (let i = 0; i < message.length; i++) {
            hash = this.mod((hash << 5n) + BigInt(message.charCodeAt(i)), this.n);
        }

        // w = s^-1 mod n
        const w = this.modInverse(s, this.n);

        // u1 = hash * w mod n
        const u1 = this.mod(hash * w, this.n);

        // u2 = r * w mod n
        const u2 = this.mod(r * w, this.n);

        // Point = u1 * G + u2 * publicKey
        const point1 = this.scalarMultiply(u1);
        const point2 = this.scalarMultiply(u2, publicKey);
        const point = this.pointAdd(point1, point2);

        // Verify: r == point.x mod n
        return r === this.mod(point.x, this.n);
    }
}

export default ECCEncryption;
