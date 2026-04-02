const mongoose = require("mongoose");
const { RECORD_TYPE_VALUES, RECORD_TYPES } = require("../constants/record-types");

const financialRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: RECORD_TYPE_VALUES,
      required: true,
      index: true,
      default: RECORD_TYPES.EXPENSE,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

financialRecordSchema.index({ user: 1, date: -1, isDeleted: 1 });
financialRecordSchema.index({ user: 1, type: 1, category: 1, isDeleted: 1 });

module.exports = mongoose.model("FinancialRecord", financialRecordSchema);
