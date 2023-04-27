const Doctorant = require('../models/Doctorant');
const Encadrant = require('../models/Encadrant');
const faker = require('faker');
const mongoose = require('mongoose');

const statistiques = async (req, res) => {
    try {
      const Doctorants = await Doctorant.find();
      let totalDoc = 0;
      let M = 0 , F = 0 ;
      let LMD = 0 , Classique = 0 ;
      let Autre = 0 , LCSI = 0 , LMCS = 0 ;
      let inscrit = 0 , radie = 0 , soutenu = 0 , differe = 0;
      
      Doctorants.forEach(Doctorant => {
        
        //nombre total des doctorants
        totalDoc++;
        // stat par sexe
        if ( Doctorant.sexe === 'M') {
          M++;
        } else if ( Doctorant.sexe === 'F') {
          F++;
        }
        // stat par type doctorat
        if ( Doctorant.typeDoctorat === 'LMD') { LMD++; } 
        else if ( Doctorant.typeDoctorat === 'Classique') { Classique ++; }
      
        // stat par labo
        if ( Doctorant.laboratoire === 'LMCS' ) { LMCS++ ; } 
        else if ( Doctorant.laboratoire === 'LCSI' ) { LCSI++ ; }
        else if ( Doctorant.laboratoire == 'Autre...' ) { Autre++ ; }
      
        // stat par status
        if ( Doctorant.inscrit === true ) { inscrit++ ; } 
        else if ( Doctorant.inscrit === false && Doctorant.soutenu.stat == false && Doctorant.radie.stat == false ) { differe++ ; }
        else if ( Doctorant.radie.stat == true ) { radie++ ; }
        else if ( Doctorant.soutenu.stat == true  ) { soutenu++ ; }

      });

      // stat des nouveau inscrit 
      const yyyy = new Date().getFullYear();
        const cpt = await Doctorant.countDocuments({
          inscrit: true,
          'soutenu.stat': false,
          'radie.stat': false,
          premiereInscription: {
            $gte: new Date( yyyy , 0, 1),
            $lt: new Date( yyyy + 1, 0, 1),
          },
        });

        // nombre totale des encadrants
        const Encadrants = await Encadrant.find();
        let totalEncad = 0;
        Encadrants.forEach(Encadrant => {
            totalEncad++;
        });

        // response
        res.json({ totalDoctorants: totalDoc , totalDirecteurs: totalEncad ,
                    M: M , F: F , 
                    LMD: LMD , Classique: Classique ,
                    LMCS : LMCS , LCSI: LCSI , Autre : Autre , 
                    inscrit : inscrit , radie : radie , differe : differe , soutenu : soutenu ,
                    nouveauInscrit: cpt });
                    
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }
const InscritParY = async (req, res) => {
    try {
        const doctorants = await Doctorant.find();
        const inscritsPerYear = {};
    
        doctorants.forEach((doctorant) => {
          const year = new Date(doctorant.premiereInscription).getFullYear();
          if (!inscritsPerYear[year]) {
            inscritsPerYear[year] = 1;
          } else {
            inscritsPerYear[year]++;
          }
        });
    
        res.status(200).json(inscritsPerYear);
      } catch (error) {
        res.status(500).send(error.message);
      }
  }
const DocsParEncad = async (req, res) => {
    try {
        const encadrants = await Encadrant.find();
        const encadrantCounts = {};

        // Count references to each encadrant in the doctorant schema
        for (const encadrant of encadrants) {
            const directeurCount = await Doctorant.countDocuments({ directeurPrincipal: encadrant._id });
            const codirecteurCount = await Doctorant.countDocuments({ coDirecteur: encadrant._id });
            encadrantCounts[encadrant.nomComplet] = { directeur: directeurCount, codirecteur: codirecteurCount };
        }

        res.send({ encadrantCounts });
    } catch (error) {
        res.send({ status: 400, success: false, msg: error.message });
    }
  }
const totalInscriParDoc = async (req, res) => {
  try {
    const result = await Doctorant.aggregate([
      {
        $group: {
          _id: '$totalinscription',
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
  }
  


module.exports = { InscritParY , statistiques , DocsParEncad , totalInscriParDoc }