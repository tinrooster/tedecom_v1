import { Document, Schema, model } from 'mongoose';

export interface ISettings extends Document {
  emailNotifications: {
    enabled: boolean;
    smtpServer: string;
    smtpPort: number;
    username: string;
    password: string;
    fromAddress: string;
  };
  logging: {
    level: string;
    maxFiles: number;
    maxSize: string;
  };
  backup: {
    enabled: boolean;
    schedule: string;
    retention: number;
    path: string;
  };
}

const settingsSchema = new Schema<ISettings>({
  emailNotifications: {
    enabled: { type: Boolean, default: false },
    smtpServer: String,
    smtpPort: { type: Number, default: 587 },
    username: String,
    password: String,
    fromAddress: String
  },
  logging: {
    level: { type: String, default: 'info' },
    maxFiles: { type: Number, default: 5 },
    maxSize: { type: String, default: '10m' }
  },
  backup: {
    enabled: { type: Boolean, default: false },
    schedule: { type: String, default: '0 0 * * *' },
    retention: { type: Number, default: 7 },
    path: String
  }
});

export const Settings = model<ISettings>('Settings', settingsSchema); 