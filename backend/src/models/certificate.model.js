import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    studentId: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      lowercase: true,
    },

    studentEmail: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      lowercase: true,
      match: /.+\@.+\..+/,
    },

    course: {
      type: String,
      required: true,
      trim: true,
    },

    grade: {
      type: String,
      required: true,
    },

    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
    },

    // 🔐 Cryptographic anchor (immutable)
    certificateHash: {
      type: String,
      required: true,
      unique: true,
    },

    // 🔒 Issuance state
    issued: {
      type: Boolean,
      default: false,
    },

    issuedAt: {
      type: Date,
    },

    // ⛓ Blockchain linkage
    transactionHash: {
      type: String,
      unique: true,
      sparse: true,
    },

    qrCode: String,

    blockchainVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// =======================================================
// 🔒 HARD LOCK: Prevent metadata mutation after creation
// =======================================================
certificateSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (!update) return next();

  const forbiddenFields = [
    "studentName",
    "studentId",
    "studentEmail",
    "course",
    "grade",
    "issueDate",
    "certificateHash",
  ];

  if (update.$set) {
    for (const field of forbiddenFields) {
      if (update.$set[field] !== undefined) {
        return next(
          new Error("Certificate metadata is immutable once created")
        );
      }
    }
  }

  next();
});

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;
