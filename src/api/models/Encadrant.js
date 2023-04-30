const mongoose = require('mongoose');
const { Schema } = mongoose;

const encadrantSchema = new Schema({
    nomComplet: { type: String, required: [true, 'nom field is required'] },
    grade: { type: String, required: [true, 'nom field is required'] },
    etablissement: { type: String, required: [true, 'nom field is required'] },
    telephone: Number,
    email: { type: String, required: [true, 'email field is required'], },

})

module.exports = mongoose.model('Encadrant', encadrantSchema);




