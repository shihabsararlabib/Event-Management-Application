// Two-Factor Authentication Module
// Implements TOTP (Time-based One-Time Password) from scratch

class TwoFactorAuth {
    constructor() {
        // Base32 alphabet
        this.base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    }

    // Generate random secret for TOTP
    generateSecret(length = 32) {
        let secret = '';
        for (let i = 0; i < length; i++) {
            secret += this.base32Chars.charAt(Math.floor(Math.random() * this.base32Chars.length));
        }
        return secret;
    }

    // Base32 decode
    base32Decode(encoded) {
        const cleanedEncoded = encoded.toUpperCase().replace(/=+$/, '');
        let bits = '';
        
        for (let i = 0; i < cleanedEncoded.length; i++) {
            const val = this.base32Chars.indexOf(cleanedEncoded[i]);
            if (val === -1) throw new Error('Invalid base32 character');
            bits += val.toString(2).padStart(5, '0');
        }

        const bytes = [];
        for (let i = 0; i + 8 <= bits.length; i += 8) {
            bytes.push(parseInt(bits.substr(i, 8), 2));
        }

        return new Uint8Array(bytes);
    }

    // HMAC-SHA1 implementation (simplified for TOTP)
    hmacSHA1(key, message) {
        const blockSize = 64;
        
        // Ensure key is the right length
        let keyBytes = key;
        if (keyBytes.length > blockSize) {
            keyBytes = this.sha1(keyBytes);
        }
        if (keyBytes.length < blockSize) {
            const temp = new Uint8Array(blockSize);
            temp.set(keyBytes);
            keyBytes = temp;
        }

        // Create padded keys
        const ipadKey = new Uint8Array(blockSize);
        const opadKey = new Uint8Array(blockSize);
        
        for (let i = 0; i < blockSize; i++) {
            ipadKey[i] = keyBytes[i] ^ 0x36;
            opadKey[i] = keyBytes[i] ^ 0x5C;
        }

        // Inner hash
        const innerData = new Uint8Array(ipadKey.length + message.length);
        innerData.set(ipadKey);
        innerData.set(message, ipadKey.length);
        const innerHash = this.sha1(innerData);

        // Outer hash
        const outerData = new Uint8Array(opadKey.length + innerHash.length);
        outerData.set(opadKey);
        outerData.set(innerHash, opadKey.length);
        
        return this.sha1(outerData);
    }

    // Simplified SHA-1 implementation
    sha1(data) {
        // Initialize hash values
        let h0 = 0x67452301;
        let h1 = 0xEFCDAB89;
        let h2 = 0x98BADCFE;
        let h3 = 0x10325476;
        let h4 = 0xC3D2E1F0;

        // Pre-processing
        const msgLen = data.length;
        const bitLen = msgLen * 8;
        
        // Padding
        const paddedLen = Math.ceil((bitLen + 65) / 512) * 64;
        const padded = new Uint8Array(paddedLen);
        padded.set(data);
        padded[msgLen] = 0x80;
        
        // Append length
        const view = new DataView(padded.buffer);
        view.setUint32(paddedLen - 4, bitLen & 0xffffffff, false);
        view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);

        // Process chunks
        for (let chunk = 0; chunk < padded.length; chunk += 64) {
            const w = new Array(80);
            
            // Break chunk into sixteen 32-bit words
            for (let i = 0; i < 16; i++) {
                w[i] = view.getUint32(chunk + i * 4, false);
            }

            // Extend to 80 words
            for (let i = 16; i < 80; i++) {
                const temp = w[i-3] ^ w[i-8] ^ w[i-14] ^ w[i-16];
                w[i] = (temp << 1) | (temp >>> 31);
            }

            // Initialize working variables
            let a = h0, b = h1, c = h2, d = h3, e = h4;

            // Main loop
            for (let i = 0; i < 80; i++) {
                let f, k;
                if (i < 20) {
                    f = (b & c) | ((~b) & d);
                    k = 0x5A827999;
                } else if (i < 40) {
                    f = b ^ c ^ d;
                    k = 0x6ED9EBA1;
                } else if (i < 60) {
                    f = (b & c) | (b & d) | (c & d);
                    k = 0x8F1BBCDC;
                } else {
                    f = b ^ c ^ d;
                    k = 0xCA62C1D6;
                }

                const temp = ((a << 5) | (a >>> 27)) + f + e + k + w[i];
                e = d;
                d = c;
                c = (b << 30) | (b >>> 2);
                b = a;
                a = temp;
            }

            // Add chunk's hash to result
            h0 = (h0 + a) >>> 0;
            h1 = (h1 + b) >>> 0;
            h2 = (h2 + c) >>> 0;
            h3 = (h3 + d) >>> 0;
            h4 = (h4 + e) >>> 0;
        }

        // Produce final hash
        const result = new Uint8Array(20);
        const resultView = new DataView(result.buffer);
        resultView.setUint32(0, h0, false);
        resultView.setUint32(4, h1, false);
        resultView.setUint32(8, h2, false);
        resultView.setUint32(12, h3, false);
        resultView.setUint32(16, h4, false);
        
        return result;
    }

    // Generate TOTP token
    generateTOTP(secret, timeStep = 30, digits = 6) {
        try {
            // Decode secret
            const key = this.base32Decode(secret);

            // Get current time step
            const time = Math.floor(Date.now() / 1000 / timeStep);

            // Convert time to 8-byte array
            const timeBytes = new Uint8Array(8);
            const timeView = new DataView(timeBytes.buffer);
            timeView.setUint32(4, time, false);

            // Generate HMAC
            const hmac = this.hmacSHA1(key, timeBytes);

            // Dynamic truncation
            const offset = hmac[hmac.length - 1] & 0x0f;
            const view = new DataView(hmac.buffer);
            const code = view.getUint32(offset, false) & 0x7fffffff;

            // Generate token
            const token = String(code % Math.pow(10, digits)).padStart(digits, '0');
            
            return token;
        } catch (error) {
            console.error('Error generating TOTP:', error);
            return null;
        }
    }

    // Verify TOTP token
    verifyTOTP(token, secret, window = 1, timeStep = 30, digits = 6) {
        try {
            // Check current time step and adjacent windows
            for (let i = -window; i <= window; i++) {
                const time = Math.floor(Date.now() / 1000 / timeStep) + i;
                
                // Decode secret
                const key = this.base32Decode(secret);

                // Convert time to 8-byte array
                const timeBytes = new Uint8Array(8);
                const timeView = new DataView(timeBytes.buffer);
                timeView.setUint32(4, time, false);

                // Generate HMAC
                const hmac = this.hmacSHA1(key, timeBytes);

                // Dynamic truncation
                const offset = hmac[hmac.length - 1] & 0x0f;
                const view = new DataView(hmac.buffer);
                const code = view.getUint32(offset, false) & 0x7fffffff;

                // Generate expected token
                const expectedToken = String(code % Math.pow(10, digits)).padStart(digits, '0');

                if (token === expectedToken) {
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('Error verifying TOTP:', error);
            return false;
        }
    }

    // Generate QR code data for authenticator apps
    generateQRCodeData(secret, accountName, issuer = 'EventShield') {
        const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
        return otpauthUrl;
    }

    // Generate backup codes
    generateBackupCodes(count = 10) {
        const codes = [];
        for (let i = 0; i < count; i++) {
            let code = '';
            for (let j = 0; j < 8; j++) {
                code += Math.floor(Math.random() * 10);
            }
            // Format as XXXX-XXXX
            codes.push(code.slice(0, 4) + '-' + code.slice(4));
        }
        return codes;
    }

    // Verify backup code
    verifyBackupCode(code, backupCodes) {
        const normalizedCode = code.replace(/[^0-9]/g, '');
        for (let i = 0; i < backupCodes.length; i++) {
            const normalizedBackupCode = backupCodes[i].replace(/[^0-9]/g, '');
            if (normalizedCode === normalizedBackupCode) {
                return i; // Return index so it can be removed after use
            }
        }
        return -1;
    }
}

export default TwoFactorAuth;
