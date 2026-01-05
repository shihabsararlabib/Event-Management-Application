// RSA Implementation from Scratch - No built-in crypto libraries
// Mathematical operations for RSA encryption

class RSAEncryption {
    constructor() {
        this.publicKey = null;
        this.privateKey = null;
    }

    // Miller-Rabin primality test
    isPrime(n, k = 5) {
        if (n <= 1n) return false;
        if (n <= 3n) return true;
        if (n % 2n === 0n) return false;

        // Write n-1 as 2^r * d
        let d = n - 1n;
        let r = 0n;
        while (d % 2n === 0n) {
            d /= 2n;
            r++;
        }

        // Witness loop
        witnessLoop: for (let i = 0; i < k; i++) {
            const a = this.randomBigInt(2n, n - 2n);
            let x = this.modPow(a, d, n);

            if (x === 1n || x === n - 1n) continue;

            for (let j = 0n; j < r - 1n; j++) {
                x = this.modPow(x, 2n, n);
                if (x === n - 1n) continue witnessLoop;
            }
            return false;
        }
        return true;
    }

    // Generate random BigInt in range [min, max]
    randomBigInt(min, max) {
        const range = max - min + 1n;
        const bits = range.toString(2).length;
        let result;
        do {
            result = 0n;
            for (let i = 0; i < bits; i++) {
                result = (result << 1n) | BigInt(Math.random() < 0.5 ? 0 : 1);
            }
            result = min + (result % range);
        } while (result < min || result > max);
        return result;
    }

    // Modular exponentiation
    modPow(base, exponent, modulus) {
        if (modulus === 1n) return 0n;
        let result = 1n;
        base = base % modulus;
        while (exponent > 0n) {
            if (exponent % 2n === 1n) {
                result = (result * base) % modulus;
            }
            exponent = exponent >> 1n;
            base = (base * base) % modulus;
        }
        return result;
    }

    // Extended Euclidean Algorithm
    extendedGCD(a, b) {
        if (b === 0n) {
            return { gcd: a, x: 1n, y: 0n };
        }
        const { gcd, x: x1, y: y1 } = this.extendedGCD(b, a % b);
        const x = y1;
        const y = x1 - (a / b) * y1;
        return { gcd, x, y };
    }

    // Modular multiplicative inverse
    modInverse(a, m) {
        const { gcd, x } = this.extendedGCD(a, m);
        if (gcd !== 1n) {
            throw new Error('Modular inverse does not exist');
        }
        return (x % m + m) % m;
    }

    // Generate large prime number
    generatePrime(bits = 512) {
        while (true) {
            let num = 0n;
            for (let i = 0; i < bits; i++) {
                if (Math.random() < 0.5) {
                    num |= (1n << BigInt(i));
                }
            }
            num |= (1n << BigInt(bits - 1)); // Ensure it's bits long
            num |= 1n; // Ensure it's odd

            if (this.isPrime(num)) {
                return num;
            }
        }
    }

    // Generate RSA key pair
    generateKeyPair(bits = 1024) {
        const halfBits = bits / 2;
        
        // Generate two distinct primes
        const p = this.generatePrime(halfBits);
        let q;
        do {
            q = this.generatePrime(halfBits);
        } while (p === q);

        const n = p * q;
        const phi = (p - 1n) * (q - 1n);

        // Choose e (commonly 65537)
        const e = 65537n;

        // Calculate d (private exponent)
        const d = this.modInverse(e, phi);

        this.publicKey = { e, n };
        this.privateKey = { d, n };

        return {
            publicKey: this.publicKey,
            privateKey: this.privateKey
        };
    }

    // Encrypt message with public key
    encrypt(message, publicKey = this.publicKey) {
        if (!publicKey) throw new Error('Public key not available');
        
        // Convert message to BigInt
        let m;
        if (typeof message === 'string') {
            m = BigInt('0x' + Buffer.from(message, 'utf8').toString('hex'));
        } else if (typeof message === 'bigint') {
            m = message;
        } else {
            throw new Error('Message must be string or BigInt');
        }

        if (m >= publicKey.n) {
            throw new Error('Message too large for key size');
        }

        const encrypted = this.modPow(m, publicKey.e, publicKey.n);
        return encrypted.toString(16);
    }

    // Decrypt ciphertext with private key
    decrypt(ciphertext, privateKey = this.privateKey) {
        if (!privateKey) throw new Error('Private key not available');

        const c = BigInt('0x' + ciphertext);
        const decrypted = this.modPow(c, privateKey.d, privateKey.n);

        // Convert back to string
        const hex = decrypted.toString(16);
        const paddedHex = hex.length % 2 === 0 ? hex : '0' + hex;
        return Buffer.from(paddedHex, 'hex').toString('utf8');
    }

    // Encrypt long messages by breaking into blocks
    encryptLong(message, publicKey = this.publicKey) {
        if (!publicKey) throw new Error('Public key not available');

        const maxBlockSize = Math.floor(publicKey.n.toString(2).length / 8) - 11; // PKCS#1 padding
        const blocks = [];

        for (let i = 0; i < message.length; i += maxBlockSize) {
            const block = message.substring(i, i + maxBlockSize);
            blocks.push(this.encrypt(block, publicKey));
        }

        return blocks.join(':');
    }

    // Decrypt long messages
    decryptLong(ciphertext, privateKey = this.privateKey) {
        if (!privateKey) throw new Error('Private key not available');

        const blocks = ciphertext.split(':');
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
                e: this.publicKey.e.toString(),
                n: this.publicKey.n.toString()
            }),
            privateKey: JSON.stringify({
                d: this.privateKey.d.toString(),
                n: this.privateKey.n.toString()
            })
        };
    }

    // Import keys from strings
    importKeys(publicKeyStr, privateKeyStr) {
        if (publicKeyStr) {
            const pk = JSON.parse(publicKeyStr);
            this.publicKey = {
                e: BigInt(pk.e),
                n: BigInt(pk.n)
            };
        }
        if (privateKeyStr) {
            const sk = JSON.parse(privateKeyStr);
            this.privateKey = {
                d: BigInt(sk.d),
                n: BigInt(sk.n)
            };
        }
    }
}

export default RSAEncryption;
