import mongoose, { Schema, Document } from 'mongoose';

export interface IRack extends Document {
  rowId: string;
  rackNumber: string;
  location: string;
  totalUnits: number;
  usedUnits: number;
  equipment: Array<{
    equipmentId: mongoose.Types.ObjectId;
    startUnit: number;
    endUnit: number;
    position: 'front' | 'back';
  }>;
  status: 'active' | 'in_signal_path' | 'ready_for_decommission';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const RackSchema: Schema = new Schema({
  rowId: { type: String, required: true },
  rackNumber: { type: String, required: true },
  location: { type: String, required: true },
  totalUnits: { type: Number, required: true, default: 42 },
  usedUnits: { type: Number, required: true, default: 0 },
  equipment: [{
    equipmentId: { type: Schema.Types.ObjectId, ref: 'Equipment' },
    startUnit: { type: Number, required: true },
    endUnit: { type: Number, required: true },
    position: { type: String, enum: ['front', 'back'], required: true }
  }],
  status: {
    type: String,
    enum: ['active', 'in_signal_path', 'ready_for_decommission'],
    default: 'active'
  },
  notes: { type: String },
}, {
  timestamps: true
});

// Create compound index for unique rack identification
RackSchema.index({ rowId: 1, rackNumber: 1 }, { unique: true });

export default mongoose.model<IRack>('Rack', RackSchema); 