import mongoose from "mongoose";

const leaveBalanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    casualLeave: { type: Number, default: 0 },
    sickLeave: { type: Number, default: 0 },
    earnedLeave: { type: Number, default: 0 },
    usedLeaves: { type: Number, default: 0 },
  },
  { timestamps: true },
);

leaveBalanceSchema.virtual("remainingLeaves").get(function () {
  const total =
    (this.casualLeave || 0) + (this.sickLeave || 0) + (this.earnedLeave || 0);
  return total - (this.usedLeaves || 0);
});

const LeaveBalance = mongoose.model("LeaveBalance", leaveBalanceSchema);
export default LeaveBalance;
