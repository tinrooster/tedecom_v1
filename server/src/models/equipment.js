const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        required: true,
        enum: ['active', 'in_signal_path', 'ready_for_decommission', 'decommissioned', 'pending'],
        default: 'active'
    },
    location: { 
        type: String, 
        required: true 
    },
    serialNumber: { 
        type: String, 
        required: true 
    },
    riskLevel: String,
    compliance: Boolean,
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const Equipment = mongoose.model('Equipment', equipmentSchema);

module.exports = Equipment; 