const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'equipment_status',
            'decommission_progress',
            'rack_utilization',
            'power_consumption',
            'inventory_valuation',
            'maintenance_schedule',
            'risk_assessment',
            'cost_analysis',
            'compliance_report'
        ]
    },
    format: {
        type: String,
        required: true,
        enum: ['pdf', 'excel', 'csv'],
        default: 'pdf'
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'failed'],
        default: 'pending'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    generatedAt: {
        type: Date
    },
    lastErrorAt: {
        type: Date
    },
    errorMessage: {
        type: String
    },
    parameters: {
        type: mongoose.Schema.Types.Mixed
    },
    data: {
        type: mongoose.Schema.Types.Mixed
    },
    filePath: {
        type: String
    },
    schedule: {
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
        },
        dayOfWeek: {
            type: Number,
            min: 0,
            max: 6
        },
        dayOfMonth: {
            type: Number,
            min: 1,
            max: 31
        },
        time: {
            type: String
        },
        recipients: [{
            type: String
        }]
    }
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report; 