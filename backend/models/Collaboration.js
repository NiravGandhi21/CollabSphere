/**
 * Collaboration Model — Join Requests from Students to Project Leads.
 *
 * Status Lifecycle: Pending → Accepted | Declined
 *
 * Data Integrity:
 *  - Partial unique index on { projectId, applicantId } where status === 'Pending':
 *    Guarantees at database level that an applicant cannot have multiple active
 *    pending requests for the same project showcase, while allowing re-application
 *    if a previous request was Declined.
 *  - Indexes for lead inbox and applicant history query sorting.
 */

import mongoose from 'mongoose';

const collaborationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant ID is required'],
    },
    pitchMessage: {
      type: String,
      required: [true, 'A pitch message is required'],
      trim: true,
      minlength: [20, 'Pitch message must be at least 20 characters'],
      maxlength: [500, 'Pitch message cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Accepted', 'Declined'],
        message: 'Status must be Pending, Accepted, or Declined',
      },
      default: 'Pending',
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
        ret.projectId = ret.projectId?._id
          ? ret.projectId._id.toString()
          : ret.projectId?.toString
          ? ret.projectId.toString()
          : ret.projectId;
        ret.applicantId = ret.applicantId?._id
          ? ret.applicantId._id.toString()
          : ret.applicantId?.toString
          ? ret.applicantId.toString()
          : ret.applicantId;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        ret.projectId = ret.projectId?._id
          ? ret.projectId._id.toString()
          : ret.projectId?.toString
          ? ret.projectId.toString()
          : ret.projectId;
        ret.applicantId = ret.applicantId?._id
          ? ret.applicantId._id.toString()
          : ret.applicantId?.toString
          ? ret.applicantId.toString()
          : ret.applicantId;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
// Enforce single active pending application per applicant per project
collaborationSchema.index(
  { projectId: 1, applicantId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'Pending' },
  }
);

// Project lead incoming applications query (sorted descending by creation date)
collaborationSchema.index({ projectId: 1, createdAt: -1 });

// Applicant outgoing history query (sorted descending by creation date)
collaborationSchema.index({ applicantId: 1, createdAt: -1 });

export const Collaboration = mongoose.model('Collaboration', collaborationSchema);
