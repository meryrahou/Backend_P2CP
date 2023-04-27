const express = require('express');
const PV = require('../models/PV');
const PVController = require('../controllers/PV');
const router = express.Router();


// ajouter un PV
router.post('/ajouter', PVController.ajouter);

// recupere la table des PV
router.get('/allPV', PVController.allPV);

// exporter xlsx table PV
router.get('/exporter', PVController.exporter);

// recuperer par identifiant
  router.get('/:id', async (req, res) => {
      try {
        const newPV = await PV.findById(req.params.id);
        res.json(newPV);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
  });


module.exports = router;


  