const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  status: {
    type: String,
    enum: ['active', 'pending', 'decommissioned'],
    default: 'active'
  },
  location: String,
  serialNumber: String,
  purchaseDate: Date,
  decommissionDate: Date,
  notes: String,
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  }],
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

const Equipment = mongoose.model('Equipment', equipmentSchema);
module.exports = Equipment;
