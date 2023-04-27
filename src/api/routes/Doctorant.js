const express = require('express');
const Doctorant = require('../models/Doctorant');
const DoctorantController = require('../controllers/Doctorant');
const router = express.Router();


// creation de 10 different doctorant
  router.post('/fake10doc' , DoctorantController.createFakeDoctorants);

// recuperer la table des doctorant
  router.get('/alldocs', DoctorantController.allDocs);
// recuperer identifiants de tous les doctorants
  router.get('/alldocsId', DoctorantController.allDocsId);


// modification doctorant
  router.post('/ajouter' , DoctorantController.ajouter);
  router.post('/siminaire', DoctorantController.siminaire);
  router.post('/reinscription', DoctorantController.reinscription);
  router.post('/modifierstatus', DoctorantController.modifierstatus);
  router.post('/changementThese', DoctorantController.changementThese);
  router.post('/majFCT', DoctorantController.majFCT);
  router.post('/observation', DoctorantController.observation);

// exportation xlsx des doctorants 
  router.get('/exporter', DoctorantController.exporter);

// recupere deux liste des Laboratoire + Option existant dans la base de donnee
  router.get('/recupLaboOpt', DoctorantController.recupLaboOpt);


// statistique
  router.get('/Statistique/sexe', DoctorantController.sexe);
  router.get('/Statistique/typeDoctorat', DoctorantController.typeDoctorat);
  router.get('/Statistique/laboratoire', DoctorantController.laboratoire);
  router.get('/Statistique/status', DoctorantController.status);
  router.get('/Statistique/total', DoctorantController.total);
  router.get('/Statistique/nouvInscrit', DoctorantController.nouvInscrit);
  router.get('/Statistique/inscritParY', DoctorantController.inscritParY);


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

