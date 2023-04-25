const Doctorant = require('../models/Doctorant');
const Encadrant = require('../models/Encadrant');
const PV = require('../models/PV');
const exceljs = require('exceljs');
const faker = require('faker');
const mongoose = require('mongoose');

const createFakeDoctorants = async (req, res) => {
  try {
    // First, create 10 Encadrants
    const encadrants = [];
    for (let i = 0; i < 10; i++) {
      const encadrant = new Encadrant({
        nomComplet: faker.name.findName(),
        grade: faker.name.jobTitle(),
        etablissement: faker.company.companyName(),
      });
      await encadrant.save();
      encadrants.push(encadrant);
    }

    // Create 10 Doctorants with random data
    const doctorants = [];
    for (let i = 0; i < 10; i++) {
      const doctorant = new Doctorant({
        nom: faker.name.lastName(),
        prenom: faker.name.firstName(),
        dateNaissance: faker.date.past(30),
        sexe: faker.random.arrayElement(['M', 'F']),
        telephone: faker.random.number(10000),
        email: faker.internet.email(),
        inscrit: faker.random.boolean(),
        premiereInscription: faker.date.past(3),
        totalinscription: faker.random.number(3),
        intituleeThese: faker.lorem.words(3),
        laboratoire: faker.random.arrayElement(['LMCS', 'LCSI', 'Autre...']),
        FCT: faker.date.future(1),
        typeDoctorat: faker.random.arrayElement(['LMD', 'Classique']),
        typeDiplome: faker.random.arrayElement(['Master', 'Magistere', 'Ingeniorat']),
        etablissementOrigine: faker.company.companyName(),
        directeurPrincipal: encadrants[faker.random.number(9)]._id,
        coDirecteur: encadrants[faker.random.number(9)]._id,
        soutenu: {
          stat: faker.random.boolean(),
          date: faker.date.past(1),
          Pv: new mongoose.Types.ObjectId(),
        },
        radie: {
          stat: faker.random.boolean(),
          date: faker.date.past(1),
          Pv: new mongoose.Types.ObjectId(),
        },
        changementThese: {
          nouvelleThese: faker.lorem.words(3),
          stat: faker.random.boolean(),
          date: faker.date.past(1),
          Pv: new mongoose.Types.ObjectId(),
        },
      });
      await doctorant.save();
      doctorants.push(doctorant);
    }

    // Create 10 PVs
    const pvs = [];
    for (let i = 0; i < 10; i++) {
      const pv = new PV({
        code: faker.lorem.words(3),
        url: faker.lorem.words(3),
        date: faker.date.past(10),
      });
      await pv.save();
      pvs.push(pv);
    }

    // Assign PVs to Doctorants
    doctorants.forEach((doctorant) => {
        doctorant.listeCode_PV = [
          pvs[faker.random.number(9)]._id,
          pvs[faker.random.number(9)]._id,
        ];
      });

    res.json({ message: 'Successfully created fake Doctorants!' });
  } catch (error) {
    console.log(error);
    res.send({status:400 , success:false , msg:error.message});
  }
}
// tableau des doctorants
const DBXL = async ( req , res ) => {
    try {

        const Doctorants = await Doctorant.find();


        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Doctorants');
        worksheet.columns = [
            {header: '_id', key: '_id', width: 10},
            {header: 'nom', key: 'nom', width: 10},
            {header: 'prenom', key: 'prenom', width: 10},
            {header: 'dateNaissance', key: 'dateNaissance', width: 10},
            {header: 'sexe', key: 'sexe', width: 10},
            {header: 'telephone', key: 'telephone', width: 10},
            {header: 'email', key: 'email', width: 10},
            {header: 'inscrit', key: 'inscrit', width: 10},
            {header: 'premiereInscription', key: 'premiereInscription', width: 10},
            {header: 'totalinscription', key: 'totalinscription', width: 10},
            {header: 'intituleeThese', key: 'intituleeThese', width: 10},
            {header: 'laboratoire', key: 'laboratoire', width: 10},
            {header: 'FCT', key: 'FCT', width: 10},
            {header: 'listeCode_PV', key: 'listeCode_PV', width: 10},
            {header: 'typeDoctorat', key: 'typeDoctorat', width: 10},
            {header: 'typeDiplome', key: 'typeDiplome', width: 10},
            {header: 'etablissementOrigine', key: 'etablissementOrigine', width: 10},
            {header: 'directeurPrincipal', key: 'directeurPrincipal', width: 10},
            {header: 'coDirecteur', key: 'coDirecteur', width: 10},
            {header: 'soutenu stat', key: 'soutenu.stat', width: 10},
            {header: 'soutenu date', key: 'soutenu.date', width: 10},
            {header: 'soutenu PV', key: 'soutenu.Pv', width: 10},
            {header: 'radie stat', key: 'radie.stat', width: 10},
            {header: 'radie date', key: 'radie.date', width: 10},
            {header: 'radie PV', key: 'radie.Pv', width: 10},
            {header: 'changement these stat', key: 'changementThese.stat', width: 10},
            {header: 'changement these date', key: 'changementThese.date', width: 10},
            {header: 'changement these PV', key: 'changementThese.Pv', width: 10},
            {header: 'changement these nouvelleThese', key: 'changementThese.nouvelleThese', width: 10},
        ];
        let count = 1;
        Doctorants.forEach( Doctorant => {
            worksheet.addRow(Doctorant);
            worksheet.addRow({
                _id: Doctorant._id,
                nom: Doctorant.nom,
                prenom: Doctorant.prenom,
                dateNaissance: Doctorant.dateNaissance,
                sexe: Doctorant.sexe,
                telephone: Doctorant.telephone,
                email: Doctorant.email,
                inscrit: Doctorant.inscrit,
                premiereInscription: Doctorant.premiereInscription,
                totalinscription: Doctorant.totalinscription,
                intituleeThese: Doctorant.intituleeThese,
                laboratoire: Doctorant.laboratoire,
                FCT: Doctorant.FCT,
                listeCode_PV: Doctorant.listeCode_PV,
                typeDoctorat: Doctorant.typeDoctorat,
                typeDiplome: Doctorant.typeDiplome,
                etablissementOrigine: Doctorant.etablissementOrigine,
                directeurPrincipal: Doctorant.directeurPrincipal,
                coDirecteur: Doctorant.coDirecteur,
                'soutenu.stat': Doctorant.soutenu.stat,
                'soutenu.date': Doctorant.soutenu.date,
                'soutenu.Pv': Doctorant.soutenu.Pv,
                'radie.stat': Doctorant.radie.stat,
                'radie.date': Doctorant.radie.date,
                'radie.Pv': Doctorant.radie.Pv,
                'changementThese.stat': Doctorant.changementThese.stat,
                'changementThese.date': Doctorant.changementThese.date,
                'changementThese.Pv': Doctorant.changementThese.Pv,
                'changementThese.nouvelleThese': Doctorant.changementThese.nouvelleThese,
            });

            count += 1;
        });
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = {bold: true};
        });
        const data = await workbook.xlsx.writeFile('DoctorantsData.xlsx')
        res.send('Base de donne exporter sous fichier: "DoctorantsData.xlsx"');

    } catch (error) {
        res.send({status:400 , success:false , msg:error.message});
    }
}

//re-inscription
const reinscription = async (req, res) => {
    try {
      const doctorantIds = req.body.doctorantIds;
      const pv = req.body.pv;

  
      const newPV = new PV({
        code: pv.code,
        url: pv.url,
        date: pv.date
      });
      await newPV.save();
  
      const updatedDoctorants = [];
      for (const doctorantId of doctorantIds) {
        const doctorant = await Doctorant.findById(doctorantId);
  
        doctorant.totalinscription += 1;
        doctorant.listeCode_PV.push(newPV._id);
        doctorant.inscrit = true;
        const updatedDoctorant = await doctorant.save();

        updatedDoctorants.push(updatedDoctorant);
      }
  
      res.json({ success: true, data: updatedDoctorants });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  };

// statistique 
const sexe = async (req, res) => {
    try {
      const Doctorants = await Doctorant.find();
      let M = 0;
      let F = 0;
      Doctorants.forEach(Doctorant => {
        if ( Doctorant.sexe === 'M') {
          M++;
        } else if ( Doctorant.sexe === 'F') {
          F++;
        }
      });
      res.json({ male: M , female: F });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }
const total = async (req, res) => {
    try {
      const Doctorants = await Doctorant.find();
      let total = 0;
      Doctorants.forEach(Doctorant => {
        total++;
      });
      res.json({ total: total  });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }
const typeDoctorat = async (req, res) => {
    try {
      const Doctorants = await Doctorant.find();
      let LMD = 0;
      let Classique = 0;
      Doctorants.forEach(Doctorant => {
             if ( Doctorant.typeDoctorat === 'LMD') { LMD++; } 
        else if ( Doctorant.typeDoctorat === 'Classique') { Classique ++; }
      });
      res.json({ LMD: LMD , Classique: Classique });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }
const laboratoire = async (req, res) => {
    try {
      const Doctorants = await Doctorant.find();
      let LMCS = 0;
      let LCSI = 0;
      let Autre = 0;
      Doctorants.forEach(Doctorant => {
             if ( Doctorant.laboratoire === 'LMCS' ) { LMCS++ ; } 
        else if ( Doctorant.laboratoire === 'LCSI' ) { LCSI++ ; }
        else if ( Doctorant.laboratoire == 'Autre...' ) { Autre++ ; }
      });
      res.json({ LMCS : LMCS , LCSI: LCSI , Autre : Autre });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }
const status = async (req, res) => {
    try {
      const Doctorants = await Doctorant.find();
      let inscrit = 0;
      let radie = 0;
      let soutenu = 0;
      let differe = 0;
      Doctorants.forEach(Doctorant => {
                                            //define cases by l'equipe
             if ( Doctorant.inscrit === true ) { inscrit++ ; } 
        else if ( Doctorant.inscrit === false && Doctorant.soutenu.stat == false && Doctorant.radie.stat == false ) { differe++ ; }
        else if ( Doctorant.radie.stat == true ) { radie++ ; }
        else if ( Doctorant.soutenu.stat == true  ) { soutenu++ ; }

      });
      res.json({ inscrit : inscrit , radie : radie , differe : differe , soutenu : soutenu });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }
const nouvInscrit = async (req, res) => {
    try {
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
        res.json({ nouveauInscrit: cpt });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
  }
const inscritParY = async (req, res) => {
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
  

module.exports = { DBXL , sexe , typeDoctorat , laboratoire , status , total , createFakeDoctorants , nouvInscrit  , inscritParY , reinscription }