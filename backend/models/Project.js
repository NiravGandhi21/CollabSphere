/**
 * Project Model — Capstone & Showcase Projects Stored in MongoDB.
 *
 * Data Integrity & Constraints:
 *  - Title, description, and GitHub repository URL are mandatory.
 *  - References creator and members via Mongoose ObjectIds pointing to User model.
 *  - memberIds validator guarantees unique team roster and prevents creator self-inclusion.
 *  - Compound index on { techStack: 1, isAcceptingMembers: 1 } optimizes directory filters.
 *  - Single-field index on creatorId accelerates authored project lookups.
 *  - Full-text search index on { title, tagline, description }.
 */

import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: [200, 'Tagline cannot exceed 200 characters'],
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    problemStatement: {
      type: String,
      trim: true,
      maxlength: [1000, 'Problem statement cannot exceed 1000 characters'],
      default: '',
    },
    techStack: {
      type: [String],
      default: [],
    },
    githubUrl: {
      type: String,
      required: [true, 'GitHub repository URL is required'],
      trim: true,
    },
    liveDemoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    isAcceptingMembers: {
      type: Boolean,
      default: false,
    },
    requiredRoles: {
      type: String,
      trim: true,
      maxlength: [300, 'Required roles cannot exceed 300 characters'],
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: 'Engineering Prototype',
    },
    // Reference to User who created the project showcase (Lead)
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project creator is required'],
    },
    // Array of User IDs for confirmed collaborators (Team Roster)
    memberIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      default: [],
      validate: {
        validator: function (members) {
          if (!Array.isArray(members)) return false;
          const strList = members.map((m) => (m?._id ? m._id.toString() : m.toString()));
          // Roster uniqueness check
          const isUnique = new Set(strList).size === strList.length;
          if (!isUnique) return false;
          // Creator cannot be added into the memberIds roster
          if (this.creatorId && strList.includes(this.creatorId.toString())) {
            return false;
          }
          return true;
        },
        message: 'Team roster cannot contain duplicate members or include the project creator.',
      },
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
        ret.creatorId = ret.creatorId?._id
          ? ret.creatorId._id.toString()
          : ret.creatorId?.toString
          ? ret.creatorId.toString()
          : ret.creatorId;
        ret.memberIds = (ret.memberIds || []).map((m) =>
          m?._id ? m._id.toString() : m?.toString ? m.toString() : m
        );
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        ret.creatorId = ret.creatorId?._id
          ? ret.creatorId._id.toString()
          : ret.creatorId?.toString
          ? ret.creatorId.toString()
          : ret.creatorId;
        ret.memberIds = (ret.memberIds || []).map((m) =>
          m?._id ? m._id.toString() : m?.toString ? m.toString() : m
        );
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
// Full-text search index across titles, taglines, and descriptions
projectSchema.index({ title: 'text', tagline: 'text', description: 'text' });

// Compound index for technology and recruitment filtering (/api/projects?tech=...&openOnly=true)
projectSchema.index({ techStack: 1, isAcceptingMembers: 1 });

// Single-field index for author profile showcases (/api/users/:id)
projectSchema.index({ creatorId: 1 });

export const Project = mongoose.model('Project', projectSchema);
