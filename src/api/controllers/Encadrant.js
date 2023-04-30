const Encadrant = require('../models/Encadrant');

const Doctorant = require('../models/Doctorant');

/* liste des encadrants et options qui existe dans la bdd
    utiliser dans inscription (ajouter doctorant) && chagement d'information
    GET */
const allEncad = async (req, res) => {
  try {
    const Encadrants = await Encadrant.find();
    res.json(Encadrants);
  } catch (error) {
    res.send({ status: 400, success: false, msg: error.message });
  }
  }


module.exports = { allEncad  }