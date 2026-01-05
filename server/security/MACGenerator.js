// Message Authentication Code (MAC) Implementation
// HMAC and CBC-MAC from scratch

class MACGenerator {
    constructor() {
        // SHA-256 constants for HMAC
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
        const msgBytes = typeof message === 'string' 
            ? new TextEncoder().encode(message)
            : new Uint8Array(message);
        
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

    // HMAC-SHA256 implementation
    hmac(key, message) {
        const blockSize = 64; // SHA-256 block size in bytes
        
        // Convert key and message to bytes
        let keyBytes = new TextEncoder().encode(key);
        const messageBytes = new TextEncoder().encode(message);

        // If key is longer than block size, hash it
        if (keyBytes.length > blockSize) {
            const hashedKey = this.sha256(keyBytes);
            keyBytes = new Uint8Array(hashedKey.match(/.{2}/g).map(byte => parseInt(byte, 16)));
        }

        // Pad key to block size
        const paddedKey = new Uint8Array(blockSize);
        paddedKey.set(keyBytes);

        // Create inner and outer padded keys
        const ipad = new Uint8Array(blockSize);
        const opad = new Uint8Array(blockSize);
        
        for (let i = 0; i < blockSize; i++) {
            ipad[i] = paddedKey[i] ^ 0x36;
            opad[i] = paddedKey[i] ^ 0x5c;
        }

        // HMAC = H(opad || H(ipad || message))
        const innerConcat = new Uint8Array(ipad.length + messageBytes.length);
        innerConcat.set(ipad);
        innerConcat.set(messageBytes, ipad.length);
        const innerHash = this.sha256(innerConcat);

        const innerHashBytes = new Uint8Array(innerHash.match(/.{2}/g).map(byte => parseInt(byte, 16)));
        const outerConcat = new Uint8Array(opad.length + innerHashBytes.length);
        outerConcat.set(opad);
        outerConcat.set(innerHashBytes, opad.length);
        
        return this.sha256(outerConcat);
    }

    // Generate HMAC for data
    generateHMAC(data, key) {
        const dataStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
        return this.hmac(key, dataStr);
    }

    // Verify HMAC
    verifyHMAC(data, mac, key) {
        const computedMac = this.generateHMAC(data, key);
        return computedMac === mac;
    }

    // CBC-MAC implementation (simplified version)
    cbcMac(message, key) {
        // Convert to bytes
        const messageBytes = new TextEncoder().encode(message);
        const keyBytes = new TextEncoder().encode(key);

        // Pad message to multiple of block size (16 bytes)
        const blockSize = 16;
        const paddedLength = Math.ceil(messageBytes.length / blockSize) * blockSize;
        const paddedMessage = new Uint8Array(paddedLength);
        paddedMessage.set(messageBytes);

        // Initialize CBC with zero IV
        let cbc = new Uint8Array(blockSize);

        // Process each block
        for (let i = 0; i < paddedMessage.length; i += blockSize) {
            const block = paddedMessage.slice(i, i + blockSize);
            
            // XOR with previous CBC value
            for (let j = 0; j < blockSize; j++) {
                cbc[j] ^= block[j];
            }

            // Simple encryption using key
            for (let j = 0; j < blockSize; j++) {
                cbc[j] = (cbc[j] + keyBytes[j % keyBytes.length]) % 256;
            }
        }

        // Return MAC as hex string
        return Array.from(cbc).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Generate CBC-MAC
    generateCBCMAC(data, key) {
        const dataStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
        return this.cbcMac(dataStr, key);
    }

    // Verify CBC-MAC
    verifyCBCMAC(data, mac, key) {
        const computedMac = this.generateCBCMAC(data, key);
        return computedMac === mac;
    }

    // Generate MAC with timestamp to prevent replay attacks
    generateTimestampedMAC(data, key, type = 'hmac') {
        const timestamp = Date.now();
        const dataWithTimestamp = {
            data: data,
            timestamp: timestamp
        };
        
        const mac = type === 'hmac' 
            ? this.generateHMAC(dataWithTimestamp, key)
            : this.generateCBCMAC(dataWithTimestamp, key);

        return {
            mac: mac,
            timestamp: timestamp
        };
    }

    // Verify timestamped MAC
    verifyTimestampedMAC(data, mac, timestamp, key, type = 'hmac', maxAge = 300000) {
        // Check if timestamp is within acceptable range (default 5 minutes)
        const now = Date.now();
        if (now - timestamp > maxAge) {
            return false;
        }

        const dataWithTimestamp = {
            data: data,
            timestamp: timestamp
        };

        const computedMac = type === 'hmac'
            ? this.generateHMAC(dataWithTimestamp, key)
            : this.generateCBCMAC(dataWithTimestamp, key);

        return computedMac === mac;
    }
}

export default MACGenerator;
