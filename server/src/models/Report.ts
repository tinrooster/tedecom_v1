import { Document, Schema, model } from 'mongoose';

export interface IReport extends Document {
    title: string;
    type: string;
    format: string;
    status: string;
    createdBy: string;
    createdAt: Date;
    generatedAt?: Date;
    lastErrorAt?: Date;
    parameters?: Record<string, any>;
    data?: any;
    schedule?: {
        frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
        dayOfWeek?: number;
        dayOfMonth?: number;
        time?: string;
        recipients?: string[];
    };
}

const reportSchema = new Schema<IReport>({
    title: { type: String, required: true },
    type: { type: String, required: true },
    format: { type: String, required: true },
    status: { type: String, required: true },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    generatedAt: Date,
    lastErrorAt: Date,
    parameters: Schema.Types.Mixed,
    data: Schema.Types.Mixed,
    schedule: {
        frequency: String,
        dayOfWeek: Number,
        dayOfMonth: Number,
        time: String,
        recipients: [String]
    }
});

export const Report = model<IReport>('Report', reportSchema);
