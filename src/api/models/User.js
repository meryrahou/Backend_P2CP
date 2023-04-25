const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
   nomComplet: { type: String, required: [true, 'nom field is required'] },
    email: { type: String, required: [true, 'mail field is required'] },
    role: { type: String, required: [true, 'role field is required'] },
    pwd: { type: String, required: [true, 'password field is required'] },

})

module.exports = mongoose.model('Encadrant', encandrantSchema);