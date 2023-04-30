const express = require('express');
const StatistiquesController = require('../controllers/Statistiques');
const { ro } = require('faker/lib/locales');
const router = express.Router();


// STATISTIQUES
    router.get('/StatNumerique', StatistiquesController.statistiques);
    router.get('/DocsParEncad', StatistiquesController.DocsParEncad);
    router.get('/InscritParY', StatistiquesController.InscritParY);
    router.get('/totalInscriParDoc', StatistiquesController.totalInscriParDoc);
    router.get('/filtre', StatistiquesController.filtre);


module.exports = router ;