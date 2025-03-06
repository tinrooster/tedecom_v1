import mongoose, { Schema, Document } from 'mongoose';

export interface IReportTemplate extends Document {
  name: string;
  type: string;
  format: 'pdf' | 'excel' | 'csv';
  description: string;
  createdBy: mongoose.Types.ObjectId;
  isDefault: boolean;
  settings: {
    header: {
      title: string;
      logo?: string;
      companyName?: string;
      dateFormat: string;
    };
    styling: {
      primaryColor: string;
      secondaryColor: string;
      fontFamily: string;
      fontSize: number;
    };
    sections: {
      summary: boolean;
      details: boolean;
      charts: boolean;
      recommendations: boolean;
    };
    tableSettings: {
      showBorders: boolean;
      alternateRowColors: boolean;
      compactMode: boolean;
    };
    pageSettings: {
      orientation: 'portrait' | 'landscape';
      margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
      };
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReportTemplateSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  format: { type: String, enum: ['pdf', 'excel', 'csv'], required: true },
  description: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isDefault: { type: Boolean, default: false },
  settings: {
    header: {
      title: { type: String, required: true },
      logo: { type: String },
      companyName: { type: String },
      dateFormat: { type: String, default: 'MM/DD/YYYY' }
    },
    styling: {
      primaryColor: { type: String, default: '#1976d2' },
      secondaryColor: { type: String, default: '#dc004e' },
      fontFamily: { type: String, default: 'Arial' },
      fontSize: { type: Number, default: 12 }
    },
    sections: {
      summary: { type: Boolean, default: true },
      details: { type: Boolean, default: true },
      charts: { type: Boolean, default: true },
      recommendations: { type: Boolean, default: true }
    },
    tableSettings: {
      showBorders: { type: Boolean, default: true },
      alternateRowColors: { type: Boolean, default: true },
      compactMode: { type: Boolean, default: false }
    },
    pageSettings: {
      orientation: { type: String, enum: ['portrait', 'landscape'], default: 'portrait' },
      margins: {
        top: { type: Number, default: 0.5 },
        right: { type: Number, default: 0.5 },
        bottom: { type: Number, default: 0.5 },
        left: { type: Number, default: 0.5 }
      }
    }
  }
}, {
  timestamps: true
});

// Ensure only one default template per type and format
ReportTemplateSchema.index({ type: 1, format: 1, isDefault: 1 }, { unique: true, sparse: true });

export default mongoose.model<IReportTemplate>('ReportTemplate', ReportTemplateSchema); 