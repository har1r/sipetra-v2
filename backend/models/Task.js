const mongoose = require("mongoose");

const taskAttachmentSchema = new mongoose.Schema({
  driveLink: { type: String, required: true, trim: true },
  linkName: { type: String, required: true, trim: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  uploadedAt: { type: Date, default: Date.now },
});

const requestedDataSchema = new mongoose.Schema({
  taxpayerName: { type: String, required: true, trim: true },
  taxpayerNameSearch: {
    type: String,
    lowercase: true,
    trim: true,
  },
  taxpayerAddress: { type: String, required: true, trim: true },
  taxpayerVillage: { type: String, required: true, trim: true },
  taxpayerSubdistrict: { type: String, required: true, trim: true },
  taxObjectAddress: { type: String, required: true, trim: true },
  taxObjectVillage: { type: String, required: true, trim: true },
  taxObjectSubdistrict: { type: String, required: true, trim: true },
  landArea: { type: Number, required: true, min: 0 },
  buildingArea: { type: Number, required: true, min: 0 },
  certificate: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ["in_progress", "approved", "revised", "rejected"],
    default: "in_progress",
  },
  note: { type: String, trim: true, default: "" },
}, { _id: false });

const taskApprovalSchema = new mongoose.Schema(
  {
    stageOrder: { type: Number, required: true },
    stage: {
      type: String,
      required: true,
      enum: [
        "penginputan",
        "penelitian",
        "pengarsipan",
        "pengiriman",
        "pemeriksaan",
      ],
      default: "penginputan",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["in_progress", "approved", "revised", "rejected"],
      default: "in_progress",
    },
    note: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const taskSchema = new mongoose.Schema(
  {
    serviceType: {
      type: String,
      enum: [
        "pengaktifan",
        "mutasi habis update",
        "mutasi habis reguler",
        "mutasi sebagian",
        "pembetulan",
        "objek pajak baru",
      ],
      required: true,
    },
    nopel: { type: String, required: true, trim: true },
    baseData: {
      nop: { type: String, required: true, trim: true },
      taxpayerName: { type: String, required: true, trim: true },
      taxpayerNameSearch: {
        type: String,
        lowercase: true,
        trim: true,
      },
      taxpayerAddress: { type: String, required: true, trim: true },
      taxpayerVillage: { type: String, required: true, trim: true },
      taxpayerSubdistrict: { type: String, required: true, trim: true },
      taxObjectAddress: { type: String, required: true, trim: true },
      taxObjectVillage: { type: String, required: true, trim: true },
      taxObjectSubdistrict: { type: String, required: true, trim: true },
      landArea: { type: Number, required: true, min: 0 },
      buildingArea: { type: Number, required: true, min: 0 },
    },
    dynamicFields: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    requestedChanges: [requestedDataSchema],
    attachments: [taskAttachmentSchema],
    approvals: [taskApprovalSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    currentStage: {
      type: String,
      required: true,
      enum: [
        "penginputan",
        "penelitian",
        "pengarsipan",
        "pengiriman",
        "pemeriksaan",
      ],
      default: "penginputan",
    },
    overallStatus: {
      type: String,
      enum: ["in_progress", "approved", "rejected", "revised"],
      default: "in_progress",
    },
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: "Report" },
    revisedHistories: [
      {
        revisedAct: String,
        revisedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        revisedNote: String,
        revisedAt: { type: Date, default: Date.now },
        stageAtRevision: String,
        isResolved: { type: Boolean, default: false },
      },
    ],
    isLocked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

taskSchema.virtual("report", {
  ref: "Report",
  localField: "reportId",
  foreignField: "_id",
  justOne: true,
});

taskSchema.index({ serviceType: 1 });
taskSchema.index({ nopel: 1 }, { unique: true });
taskSchema.index({ "baseData.nop": 1 });
taskSchema.index({ "baseData.taxObjectSubdistrict": 1 });
taskSchema.index({ "baseData.taxObjectVillage": 1 });
taskSchema.index({ "baseData.taxpayerNameSearch": 1 });
taskSchema.index({ "requestedChanges.taxpayerNameSearch": 1 });
taskSchema.index({ currentStage: 1 });
taskSchema.index({ overallStatus: 1 });
taskSchema.index({ reportId: 1 });
taskSchema.index({ createdAt: -1 });

taskSchema.pre("save", function (next) {
  if (this.baseData?.taxpayerName) {
    this.baseData.taxpayerNameSearch = this.baseData.taxpayerName.toLowerCase();
  }

  if (this.requestedChanges?.length) {
    this.requestedChanges.forEach((change) => {
      if (change.taxpayerName) {
        change.taxpayerNameSearch = change.taxpayerName.toLowerCase();
      }
    });
  }

  next();
});

function calculateStatus(items) {
  if (!items || items.length === 0) {
    return "in_progress";
  }

  if (items.some((i) => i.status === "rejected")) return "rejected";
  if (items.some((i) => i.status === "revised")) return "revised";
  if (items.every((i) => i.status === "approved")) return "approved";

  return "in_progress";
}

taskSchema.pre("save", function (next) {
  const requested = this.requestedChanges || [];
  const approvals = this.approvals || [];

  let stageStatus = "in_progress";

  if (requested.length > 0) {
    stageStatus = calculateStatus(requested);
  }

  const currentApproval = approvals.find(
    (approval) => approval.stage === this.currentStage,
  );

  if (currentApproval) {
    currentApproval.status = stageStatus;

    if (stageStatus === "approved") {
      currentApproval.approvedAt = new Date();
    } else {
      currentApproval.approvedAt = null;
    }
  }

  if (approvals.length > 0) {
    this.overallStatus = calculateStatus(approvals);
  }

  next();
});

module.exports = mongoose.model("Task", taskSchema);
