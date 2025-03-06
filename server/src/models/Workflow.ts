import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkflowStep {
  name: string;
  description: string;
  order: number;
  requiredApprovals: string[];
  estimatedDuration: number;
  checklist: Array<{
    item: string;
    completed: boolean;
    notes?: string;
  }>;
}

export interface IWorkflow extends Document {
  name: string;
  description: string;
  equipmentType: string;
  steps: IWorkflowStep[];
  status: 'draft' | 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowStepSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, required: true },
  requiredApprovals: [{ type: String }],
  estimatedDuration: { type: Number, required: true }, // in minutes
  checklist: [{
    item: { type: String, required: true },
    completed: { type: Boolean, default: false },
    notes: String
  }]
});

const WorkflowSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  equipmentType: { type: String, required: true },
  steps: [WorkflowStepSchema],
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Create index for equipment type queries
WorkflowSchema.index({ equipmentType: 1, status: 1 });

export default mongoose.model<IWorkflow>('Workflow', WorkflowSchema); 