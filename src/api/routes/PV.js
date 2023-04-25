const express = require('express');
const PV = require('../models/PV');
const PVController = require('../controllers/PV');
const router = express.Router();


// POST PV
router.post('/ajouter', async(req, res) => {
  try {
    const { code , url , date } = req.body;
    const pv = await PV.findOne({ code , url , date });

    if (pv) {
      return res.status(409).json({ message: 'PV already exists' , PV: pv });
    }else {
      const newPV = new PV({ code, url, date });
      await newPV.save();

      res.status(201).json({ message: 'PV created successfully' , PV: newPV });
    } 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  
});

// get all PV
router.get('/DB', async (req, res) => {
    try {
      const PVs = await PV.find();
      res.json(PVs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
// exporting Pv DB 
router.get('/DBXL', PVController.PVDBXL);

//get pv by id
router.get('/:id', async (req, res) => {
    try {
      const newPV = await PV.findById(req.params.id);
      res.json(newPV);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});


module.exports = router;


  