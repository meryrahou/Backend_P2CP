const Encadrant = require('../models/Encadrant');

const Doctorant = require('../models/Doctorant');

const total = async (req, res) => {
    try {
      const Encadrants = await Encadrant.find();
      let total = 0;
      Encadrants.forEach(Encadrant => {
        total++;
      });
      res.json({ total: total  });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }

const DocsParEncad = async (req, res) => {
    try {
      const encadrants = await Encadrant.find();
      const encadrantCounts = {};
  
      // Count references to each encadrant in the doctorant schema
      for (const encadrant of encadrants) {
        const count = await Doctorant.countDocuments({
          $or: [
            { directeurPrincipal: encadrant._id },
            { coDirecteur: encadrant._id }
          ]
        });
        encadrantCounts[encadrant.nomComplet] = count;
      }
  
      res.send({ status: 200, success: true, counts: encadrantCounts });
    } catch (error) {
      res.send({ status: 400, success: false, msg: error.message });
    }
  }

module.exports = { DocsParEncad , total }