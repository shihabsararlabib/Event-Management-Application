// Custom Password Hashing with Salt Implementation
// SHA-256 implementation from scratch + custom salting

class PasswordHasher {
    constructor() {
        // SHA-256 constants
        this.K = [
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
        ];

        this.H = [
            0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
            0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
        ];
    }

    // Right rotate
    rotr(n, x) {
        return (x >>> n) | (x << (32 - n));
    }

    // SHA-256 implementation
    sha256(message) {
        // Convert string to bytes
        const msgBytes = new TextEncoder().encode(message);
        
        // Pre-processing: adding padding bits
        const msgBits = msgBytes.length * 8;
        const paddedLength = Math.ceil((msgBits + 65) / 512) * 512;
        const paddedBytes = new Uint8Array(paddedLength / 8);
        paddedBytes.set(msgBytes);
        paddedBytes[msgBytes.length] = 0x80;

        // Append length as 64-bit big-endian
        const view = new DataView(paddedBytes.buffer);
        view.setUint32(paddedBytes.length - 4, msgBits & 0xffffffff, false);
        view.setUint32(paddedBytes.length - 8, Math.floor(msgBits / 0x100000000), false);

        // Process message in 512-bit chunks
        const h = [...this.H];

        for (let chunkStart = 0; chunkStart < paddedBytes.length; chunkStart += 64) {
            const w = new Array(64);

            // Copy chunk into first 16 words
            for (let i = 0; i < 16; i++) {
                w[i] = view.getUint32(chunkStart + i * 4, false);
            }

            // Extend the first 16 words into the remaining 48 words
            for (let i = 16; i < 64; i++) {
                const s0 = this.rotr(7, w[i - 15]) ^ this.rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3);
                const s1 = this.rotr(17, w[i - 2]) ^ this.rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10);
                w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
            }

            // Initialize working variables
            let [a, b, c, d, e, f, g, h_] = h;

            // Main loop
            for (let i = 0; i < 64; i++) {
                const S1 = this.rotr(6, e) ^ this.rotr(11, e) ^ this.rotr(25, e);
                const ch = (e & f) ^ ((~e) & g);
                const temp1 = (h_ + S1 + ch + this.K[i] + w[i]) >>> 0;
                const S0 = this.rotr(2, a) ^ this.rotr(13, a) ^ this.rotr(22, a);
                const maj = (a & b) ^ (a & c) ^ (b & c);
                const temp2 = (S0 + maj) >>> 0;

                h_ = g;
                g = f;
                f = e;
                e = (d + temp1) >>> 0;
                d = c;
                c = b;
                b = a;
                a = (temp1 + temp2) >>> 0;
            }

            // Add compressed chunk to current hash value
            h[0] = (h[0] + a) >>> 0;
            h[1] = (h[1] + b) >>> 0;
            h[2] = (h[2] + c) >>> 0;
            h[3] = (h[3] + d) >>> 0;
            h[4] = (h[4] + e) >>> 0;
            h[5] = (h[5] + f) >>> 0;
            h[6] = (h[6] + g) >>> 0;
            h[7] = (h[7] + h_) >>> 0;
        }

        // Produce final hash value
        return h.map(x => x.toString(16).padStart(8, '0')).join('');
    }

    // Generate random salt
    generateSalt(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let salt = '';
        for (let i = 0; i < length; i++) {
            salt += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return salt;
    }

    // Hash password with salt using PBKDF2-like approach
    hashPassword(password, salt = null, iterations = 10000) {
        // Generate salt if not provided
        if (!salt) {
            salt = this.generateSalt();
        }

        // Combine password and salt
        let hash = password + salt;

        // Apply SHA-256 multiple times (key stretching)
        for (let i = 0; i < iterations; i++) {
            hash = this.sha256(hash);
        }

        // Return salt and hash combined
        return {
            salt: salt,
            hash: hash,
            iterations: iterations,
            combined: `${salt}$${iterations}$${hash}`
        };
    }

    // Verify password against stored hash
    verifyPassword(password, storedHash) {
        try {
            // Parse stored hash
            const parts = storedHash.split('$');
            if (parts.length !== 3) {
                throw new Error('Invalid hash format');
            }

            const salt = parts[0];
            const iterations = parseInt(parts[1]);
            const hash = parts[2];

            // Hash the provided password with the same salt and iterations
            const result = this.hashPassword(password, salt, iterations);

            // Compare hashes
            return result.hash === hash;
        } catch (error) {
            return false;
        }
    }

    // Hash data (for general purpose hashing)
    hash(data) {
        return this.sha256(data);
    }
}

export default PasswordHasher;
