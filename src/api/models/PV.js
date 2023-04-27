const mongoose = require('mongoose');
const { Schema } = mongoose;

const pvSchema = new Schema({
    code: { type: String, required: [true, 'code field is required'] },
    url: String,
    ordreDuJour: String,
    date: { type: Date, default: Date.now },
})

module.exports = mongoose.model('PV', pvSchema);