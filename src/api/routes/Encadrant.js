const express = require('express');
const Encadrant = require('../models/Encadrant');
const EncadrantController = require('../controllers/Encadrant');
const router = express.Router();

// POST ENCADRANT
router.post('/ajouter', async(req, res) => {
  try {
    const { nomComplet, grade, etablissement } = req.body;
    const encadrant = await Encadrant.findOne({ nomComplet, grade, etablissement });

    if (encadrant) {
      return res.status(409).json({ message: 'Encadrant already exists' , encadrant: encadrant  });
    }else {
      const newEncadrant = new Encadrant({ nomComplet, grade, etablissement });
      await newEncadrant.save();

      res.status(201).json({ message: 'Encadrant created successfully' , encadrant: newEncadrant });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

// get all Encadrant
router.get('/DB', async (req, res) => {
    try {
      const Encadrants = await Encadrant.find();
      res.json(Encadrants);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// count hpw many encadrant
  router.get('/Statistique/total', EncadrantController.total);

// count how many doctorant par encadrant 
router.get('/DocsParEncad', EncadrantController.DocsParEncad);


  //get Encadrant by id

  router.get('/:id', async (req, res) => {
    try {
      const newEncadrant = await Encadrant.findById(req.params.id);
      res.json(newEncadrant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

module.exports = router;
