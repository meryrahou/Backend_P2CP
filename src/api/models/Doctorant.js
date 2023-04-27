const mongoose = require('mongoose');
const { Schema } = mongoose;

const doctorantSchema = new Schema({

    // --- information personnel --
    nom: { type: String, required: [true, 'nom field is required'], },
    prenom: { type: String, required: [true, 'prenom field is required'] },
    dateNaissance: { type: Date, default: Date.now },
    sexe: { type: String, enum: ['M', 'F'] },
    telephone: Number,
    email: { type: String, required: [true, 'email field is required'], },

    // --- information de these ---
    inscrit: Boolean,
    premiereInscription: { type: Date, default: Date.now },
    totalinscription: Number,
    intituleeThese: String,
    laboratoire: { type: String, enum: ['LMCS', 'LCSI', 'Autre...'] },
    option: { type: String, enum: ['SI', 'SIQ' , 'Autre...'] },
    FCT: { type: Date, default: Date.now },
    listeCode_PV: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'PV',
        required: [true, 'PV field is required'],
        default: null,
    },],

    // --- Cursus universitaire --- 
    typeDoctorat: { type: String, enum: ['LMD', 'Classique'] },
    typeDiplome: { type: String, enum: ['Master', 'Magistere' , 'Ingeniorat'] },
    etablissementOrigine: String,
    Siminaire: [{
        titre: { type: String, required: [true, 'titre field is required'], },
        resume: { type: String, required: [true, 'resume field is required'], },
        animateur: { type: String, required: [true, 'animateur field is required'], },
    },],

    // --- Information directeur ---
    directeurPrincipal: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Encadrant',
        default: null,
    },
    coDirecteur: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Encadrant',
        default: null,
    },

    // --- Status ---
    observation: String,
    soutenu: {
        stat: Boolean,
        date: { type: Date, default: Date.now },
        Pv: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'PV',
            default: null,
            },
    },
    radie: {
        stat: Boolean,
        date: { type: Date, default: Date.now },
        Pv: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'PV',
            default: null,
            },
    },
    changementThese: {
        stat: Boolean,
        date: { type: Date, default: Date.now },
        Pv: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'PV',
            default: null,
            },
    }

})

module.exports = mongoose.model('Doctorant', doctorantSchema);