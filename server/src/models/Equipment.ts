import { Document, Schema, model } from 'mongoose';

export interface IEquipment extends Document {
    name: string;
    type: string;
    status: 'active' | 'in_signal_path' | 'ready_for_decommission' | 'decommissioned' | 'pending';
    location: string;
    serialNumber: string;
    riskLevel?: string;
    compliance?: boolean;
    lastUpdated?: Date;
}

const equipmentSchema = new Schema<IEquipment>({
    name: { type: String, required: true },
    type: { type: String, required: true },
    status: { 
        type: String, 
        required: true,
        enum: ['active', 'in_signal_path', 'ready_for_decommission', 'decommissioned', 'pending']
    },
    location: { type: String, required: true },
    serialNumber: { type: String, required: true },
    riskLevel: String,
    compliance: Boolean,
    lastUpdated: Date
});

export const Equipment = model<IEquipment>('Equipment', equipmentSchema);
