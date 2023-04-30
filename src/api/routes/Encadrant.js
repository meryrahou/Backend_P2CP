const express = require('express');
const Encadrant = require('../models/Encadrant');
const EncadrantController = require('../controllers/Encadrant');
const router = express.Router();

// recuperer tableau des encadrant
  router.get('/allEncad', EncadrantController.allEncad );

//get Encadrant by id
  router.get('/:id', async (req, res) => {
    try {
      const newEncadrant = await Encadrant.findById(req.params.id );
      res.json(newEncadrant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    } 
  });

module.exports = router;
