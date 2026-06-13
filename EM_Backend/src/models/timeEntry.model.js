import mongoose from "mongoose";

const timeEntrySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true, // "HH:mm" (24h format)
    },
    endTime: {
      type: String,
      required: true, // "HH:mm" (24h format)
    },
    breakDuration: {
      type: Number,
      default: 0, // in minutes
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    duration: {
      type: Number,
      required: true, // total duration in minutes (calculated: endTime - startTime - breakDuration)
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const TimeEntry = mongoose.model("TimeEntry", timeEntrySchema);

export default TimeEntry;
