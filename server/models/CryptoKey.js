// Import Dependencies
import mongoose from "mongoose";

const cryptoKeySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    keyId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    algorithm: {
        type: String,
        required: true,
        enum: ['RSA', 'ECC', 'HMAC-SHA256']
    },
    publicKey: {
        type: String, // JSON string
        required: function() {
            return this.algorithm === 'RSA' || this.algorithm === 'ECC';
        }
    },
    privateKey: {
        type: String, // JSON string - encrypted
        required: function() {
            return this.algorithm === 'RSA' || this.algorithm === 'ECC';
        }
    },
    key: {
        type: String, // For MAC keys
        required: function() {
            return this.algorithm === 'HMAC-SHA256';
        }
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'revoked'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
    expiredAt: Date,
    revokedAt: Date
}, {
    timestamps: true
});

// Index for faster queries
cryptoKeySchema.index({ userId: 1, status: 1 });
cryptoKeySchema.index({ expiresAt: 1 });

const CryptoKey = mongoose.model("CryptoKey", cryptoKeySchema);
export default CryptoKey;
