const Encadrant = require('../models/Encadrant');

const Doctorant = require('../models/Doctorant');

const ajouter = async (req, res) => {
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
    res.send({ status: 400, success: false, msg: error.message });
  }
  }

const allEncad = async (req, res) => {
  try {
    const Encadrants = await Encadrant.find();
    res.json(Encadrants);
  } catch (error) {
    res.send({ status: 400, success: false, msg: error.message });
  }
  }


module.exports = { ajouter , allEncad  }