const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    emailNotifications: {
        enabled: {
            type: Boolean,
            default: false
        },
        smtpServer: String,
        smtpPort: {
            type: Number,
            default: 587
        },
        username: String,
        password: String,
        fromAddress: String
    },
    logging: {
        level: {
            type: String,
            enum: ['debug', 'info', 'warn', 'error'],
            default: 'info'
        },
        maxFiles: {
            type: Number,
            default: 5
        },
        maxSize: {
            type: String,
            default: '10m'
        }
    },
    backup: {
        enabled: {
            type: Boolean,
            default: false
        },
        schedule: {
            type: String,
            default: '0 0 * * *' // Cron expression for daily at midnight
        },
        retention: {
            type: Number,
            default: 7 // Days
        },
        path: String
    },
    security: {
        sessionTimeout: {
            type: Number,
            default: 30 // Minutes
        },
        maxLoginAttempts: {
            type: Number,
            default: 5
        },
        requireMfa: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings; 