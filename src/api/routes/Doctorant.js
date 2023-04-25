const express = require('express');
const Doctorant = require('../models/Doctorant');
const DoctorantController = require('../controllers/Doctorant');
const router = express.Router();

//create 10 fake doc using faker
router.post('/fake10doc' , DoctorantController.createFakeDoctorants);

// create doctorant
router.post('/ajouter', async(req, res) => {
    try {
      const { nom , prenom , dateNaissance } = req.body;

      const existingDoctorant = await Doctorant.findOne({ nom, prenom, dateNaissance });
      if (existingDoctorant) {
        return res.status(409).json({ message: 'Doctorant already exists' , doctorant: existingDoctorant });
      }else {
  
      const newDoctorant = new Doctorant(req.body);
      await newDoctorant.save();
  
      res.status(201).json({ message: 'Doctorant added successfully', doctorant: newDoctorant });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// get all doctorant
router.get('/DB', async (req, res) => {
    try {
      const doctorant = await Doctorant.find();
      res.json(doctorant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// exporting Pv DB 
router.post('/reinscription', DoctorantController.reinscription);

// exporting Pv DB 
router.get('/DBXL', DoctorantController.DBXL);


// statistique
  router.get('/Statistique/sexe', DoctorantController.sexe);
  router.get('/Statistique/typeDoctorat', DoctorantController.typeDoctorat);
  router.get('/Statistique/laboratoire', DoctorantController.laboratoire);
  router.get('/Statistique/status', DoctorantController.status);
  router.get('/Statistique/total', DoctorantController.total);
  router.get('/Statistique/nouvInscrit', DoctorantController.nouvInscrit);
  router.get('/Statistique/inscritParY', DoctorantController.inscritParY);


// get doctorant by id
router.get('/:id', async (req, res) => {
    try {
      const doctorant = await Doctorant.findById(req.params.id);
      if (!doctorant) throw new Error('Doctorant not found');
      res.json(doctorant);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

// update doctorant by id
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

