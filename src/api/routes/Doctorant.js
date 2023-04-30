const express = require('express');
const Doctorant = require('../models/Doctorant');
const DoctorantController = require('../controllers/Doctorant');
const router = express.Router();


// creation de 10 different doctorant
  router.post('/fake10doc' , DoctorantController.createFakeDoctorants);

// TABLES DES PAGES FRONT
  router.get('/alldocsId', DoctorantController.allDocsId);
  router.get('/tableDoctorants', DoctorantController.tableDoctorants);
  router.get('/tableauChangementThese', DoctorantController.tableauChangementThese);
  router.get('/tableauReinscription', DoctorantController.tableauReinscription);
  router.get('/tableauModifStatus', DoctorantController.tableauModifStatus);
  router.get('/tableauReinscriptionDiffere', DoctorantController.tableauReinscriptionDiffere);
  router.get('/tableauExporter', DoctorantController.tableauExporter);


// FONCTIONNALITEE DES CARTES
  router.post('/ajouter' , DoctorantController.ajouter);
  router.post('/reinscription', DoctorantController.reinscription);
  router.post('/modifierstatus', DoctorantController.modifierstatus);
  router.post('/changementThese', DoctorantController.changementThese);
  //update infp prrsonele
  router.post('/siminaire', DoctorantController.siminaire);
  router.post('/observation', DoctorantController.observation);
  router.post('/majFCT', DoctorantController.majFCT);
  //importer
  router.get('/exporter', DoctorantController.exporter);
  router.get('/modifierInfoDoc', DoctorantController.modifierInfoDoc);


// recupere deux liste des Laboratoire + Option existant dans la base de donnee
  router.get('/recupLaboOpt', DoctorantController.recupLaboOpt);
  router.get('/recupNomComplet', DoctorantController.recupNomComplet);


// recuperer un doctorant par identidiant
  router.get('/:id', async (req, res) => {
      try {
        const doctorant = await Doctorant.findById(req.params.id);
        if (!doctorant) throw new Error('Doctorant not found');
        res.json(doctorant);
      } catch (error) {
        res.status(404).json({ error: error.message });
      }
  });

// mise a jour des information du doctorant
  router.put('/:id', async (req, res) => {
      res.send('Update Doctorant by id');
      try {
        const doctorant = await Doctorant.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!doctorant) throw new Error('Doctorant not found');
        res.json(doctorant);
      } catch (error) {
        res.status(404).json({ error: error.message });
      }
  });

module.exports = router;

