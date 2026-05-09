/**
 * User Model
 * ──────────
 * Mongoose schema for user accounts.
 * Passwords are hashed with Argon2id (memory-hard, GPU-resistant).
 */

const mongoose = require('mongoose');
const argon2 = require('argon2');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be at most 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      index: true,
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return password in queries by default
    },

    preferredCurrency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },

    avatar: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: {
      // Transform output when converting to JSON
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

// ── Indexes ──
userSchema.index({ createdAt: -1 });

// ── Pre-save hook: hash password ──
userSchema.pre('save', async function (next) {
  // Only hash the password if it's been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Argon2id: recommended variant — resistant to side-channel and GPU attacks
    this.password = await argon2.hash(this.password, {
      type: argon2.argon2id,
      memoryCost: 65536,  // 64 MB
      timeCost: 3,        // 3 iterations
      parallelism: 4,     // 4 threads
    });
    next();
  } catch (error) {
    next(error);
  }
});

// ── Instance method: verify password ──
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await argon2.verify(this.password, candidatePassword);
  } catch {
    return false;
  }
};

// ── Instance method: check if password needs rehashing ──
userSchema.methods.needsRehash = function () {
  return argon2.needsRehash(this.password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
