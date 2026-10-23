/**
 * User Model — Student Profile Stored in MongoDB.
 *
 * Data Integrity & Security:
 *  - Email normalized (lowercase, trimmed) with unique database index.
 *  - Password hashed via bcryptjs with salt rounds >= 10 in pre-save hook.
 *  - passwordHash set to select: false; stripped in toJSON / toObject transforms.
 *  - Department accommodates 'Computer Science & Engineering' and all college faculties.
 *  - Multikey indexing on skills array and single-field index on department.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // excluded from default queries
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      minlength: [2, 'Department must be at least 2 characters'],
      maxlength: [100, 'Department cannot exceed 100 characters'],
    },
    graduationYear: {
      type: Number,
      min: [2020, 'Graduation year cannot be earlier than 2020'],
      max: [2032, 'Graduation year cannot exceed 2032'],
      default: 2026,
    },
    semester: {
      type: String,
      trim: true,
      default: '6th Semester',
    },
    headline: {
      type: String,
      trim: true,
      maxlength: [160, 'Headline cannot exceed 160 characters'],
      default: 'Student Engineer',
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    githubUrl: {
      type: String,
      trim: true,
      default: '',
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: '',
    },
    portfolioUrl: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'admin'],
        message: 'Role must be student or admin',
      },
      default: 'student',
    },
    isDemo: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
// Note: email index is automatically registered by unique: true
userSchema.index({ skills: 1 });
userSchema.index({ department: 1 });

// ── Instance Method: Compare Password ─────────────────────────────────────────
userSchema.methods.comparePassword = async function (plainPassword) {
  if (!plainPassword || !this.passwordHash) return false;
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// ── Pre-save Hook: Hash Password if Modified ──────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

export const User = mongoose.model('User', userSchema);
