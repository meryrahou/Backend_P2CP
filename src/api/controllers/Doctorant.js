const Doctorant = require('../models/Doctorant');
const Encadrant = require('../models/Encadrant');
const PV = require('../models/PV');
const exceljs = require('exceljs');
const faker = require('faker');
const mongoose = require('mongoose');

// done & works
const allDocsId = async (req , res ) =>  {
  try {
    const doctorant = await Doctorant.find({}, '_id inscrit ');
    // // const doctorant = await Doctorant.find({}, '_id inscrit soutenu.stat soutenu.date soutenu.Pv radie.stat radie.date radie.Pv');
    res.json(doctorant);
  } catch (error) {
    res.send({status:400 , success:false , msg:error.message});
  }
  }

// done & works
const allDocs = async (req , res ) =>  {
  try {
    const doctorants = await Doctorant.find()
                        .populate('directeurPrincipal')
                        .populate('coDirecteur');
    let liste = [];

    for (const doctorant of doctorants) {
      const pvPromises = doctorant.listeCode_PV.map((pv) => PV.findById(pv));
      const pvs = await Promise.all(pvPromises);
      const doctorantWithPvs = { ...doctorant._doc, pv: pvs };
      liste.push(doctorantWithPvs);
    }

    res.json( liste );
  } catch (error) {
    res.send({status:400 , success:false , msg:error.message});
  }
  }

// done & works
const ajouter = async (req , res) => {
    try {
    // On recupere les champs du formulaire dans la requete
      /* champs non inclus : 
          inscrit , totalinscription , siminaire , fct , listecodepv , 
          directeur principale , codirecteur , observation , soutenue obj , radier obj , chang obj 
      */
      const { pv, directeur, codirecteur, 
              nom , prenom , dateNaissance , sexe , telephone , email , 
              premiereInscription , intituleeThese , laboratoire , option , 
              typeDoctorat , typeDiplome , etablissementOrigine } = req.body;
  
    // verifiez si pv existe
      const existingPV = await PV.findOne({
        code: pv.code,
        url: pv.url,
        date: pv.date,
        ordreDuJour: pv.ordreDuJour,
      });
      let pvId;
      if (existingPV) {
        pvId = existingPV._id;
      } else {
        // si le pv n'existe pas , on le sauvegarde dans la bdd
        const newPV = new PV(pv);
        const savedPV = await newPV.save();
        pvId = savedPV._id;
      }
  
      // verifier si Encadrant == Directeur existe
      const existingDirecteur = await Encadrant.findOne({
        nomComplet: directeur.nom,
      });
      let directeurId;
      if (existingDirecteur) {
        directeurId = existingDirecteur._id;
      } else {
        // si le directeur n'existe pas , on le sauvegarde dans la bdd
        const newDirecteur = new Encadrant(directeur);
        const savedDirecteur = await newDirecteur.save();
        directeurId = savedDirecteur._id;
      }
  
      // verifier si Encadrant == codirecteur existe
      let codirecteurId = null;
      if (codirecteur) {
        const existingCodirecteur = await Encadrant.findOne({
          nomComplet: codirecteur.nom,
        });
        if (existingCodirecteur) {
          codirecteurId = existingCodirecteur._id;
        } else {
          const newCodirecteur = new Encadrant(codirecteur);
          const savedCodirecteur = await newCodirecteur.save();
          codirecteurId = savedCodirecteur._id;
        }
      }
  
      // verifier si doctorant existe
      const existingDoctorant = await Doctorant.findOne({
        nom: nom,
        prenom: prenom,
        dateNaissance: dateNaissance,
      });
      if (existingDoctorant) {
        return res.status(400).json({ message: 'Doctorant existe deja' });
      } else {
        const doctorant = new Doctorant({
        // --- information personnel --
          nom: nom,
          prenom: prenom,
          dateNaissance: dateNaissance,
          sexe: sexe,
          telephone: telephone,
          email: email,

        // --- information de these ---
          inscrit: true,
          premiereInscription: premiereInscription,
          totalinscription: 1,
          intituleeThese: intituleeThese,
          laboratoire: laboratoire,
          option: option,
          FCT: null,
          listeCode_PV: [],

        // --- Cursus universitaire --- 
          typeDoctorat: typeDoctorat,
          typeDiplome: typeDiplome,
          etablissementOrigine: etablissementOrigine,
          Siminaire: [],

        // --- Information directeur ---
          directeurPrincipal: directeurId,
          codirecteur: codirecteurId,

        // --- Status ---
          observation: null,
          soutenu: { status: false, date: null , Pv: null },
          radie: { status: false, date: null , Pv: null },
          changementThese: { status: false, date: null , Pv: null },

        });
      // on rajoute le pv dans la liste des pv du doctorant
        doctorant.listeCode_PV = [pvId];

      // on le sauvegarder dans la bdd des Doctorant
        const savedDoctorant = await doctorant.save();
      // envoie de reponse
        res.json(savedDoctorant);
      }
    } catch (error) {
      res.send({status:400 , success:false , msg:error.message});
    }
};

//done according to new databse
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
        
        // --- information personnel --
        nom: faker.name.lastName(),
        prenom: faker.name.firstName(),
        dateNaissance: faker.date.past(30),
        sexe: faker.random.arrayElement(['M', 'F']),
        telephone: faker.random.number(10000),
        email: faker.internet.email(),
        
        // --- information de these ---
        inscrit: true,
        premiereInscription: faker.date.past(3),
        totalinscription: faker.random.number(9),
        intituleeThese: faker.lorem.words(3),
        laboratoire: faker.random.arrayElement(['LMCS', 'LCSI' ]),
        option: faker.random.arrayElement(['SI', 'SIQ' ]),
        FCT: null,

        // --- Cursus universitaire --- 
        typeDoctorat: faker.random.arrayElement(['LMD', 'Classique']),
        typeDiplome: faker.random.arrayElement(['Master', 'Magistere', 'Ingeniorat']),
        etablissementOrigine: faker.company.companyName(),
        Siminaire: [{
          titre: faker.lorem.words(4),
          resume: faker.lorem.words(15),
          animateur: faker.lorem.words(2),
        },],

        // --- Information directeur ---
        directeurPrincipal: encadrants[faker.random.number(9)]._id,
        coDirecteur: encadrants[faker.random.number(9)]._id,

        // --- Status ---
        observation: null,
        soutenu: {
          stat: false,
          date: null,
          Pv: null,
        },
        radie: {
          stat: false,
          date: null,
          Pv: null,
        },
        changementThese: {
          stat: false,
          date: null,
          Pv: null,
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
        ordreDuJour: faker.lorem.words(10),
      });
      await pv.save();
      pvs.push(pv);
    }

    // Assign PVs to Doctorants
    doctorants.forEach((doctorant) => {
        doctorant.listeCode_PV = [
          pvs[faker.random.number(9)]._id,
        ];
      });

    res.json({ message: 'Successfully created fake Doctorants!' });
  } catch (error) {
    res.send({status:400 , success:false , msg:error.message});
  }
}

// to fix according to front
const exporter = async ( req , res ) => {
    try {

        const Doctorants = await Doctorant.find()
                            .populate('directeurPrincipal')
                            .populate('coDirecteur');

        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Doctorants');

        worksheet.columns = [
            {header: '_id', key: '_id', width: 10},
            {header: 'nom', key: 'nom', width: 10},
            {header: 'prenom', key: 'prenom', width: 10},
            {header: 'sexe', key: 'sexe', width: 10},
            {header: 'dateNaissance', key: 'dateNaissance', width: 10},
            {header: 'telephone', key: 'telephone', width: 10},
            {header: 'email', key: 'email', width: 10},

            {header: 'inscrit', key: 'inscrit', width: 10},
            {header: 'premiereInscription', key: 'premiereInscription', width: 10},
            {header: 'totalinscription', key: 'totalinscription', width: 10},
            {header: 'intituleeThese', key: 'intituleeThese', width: 10},
            {header: 'laboratoire', key: 'laboratoire', width: 10},
            {header: 'option', key: 'option', width: 10},
            {header: 'FCT', key: 'FCT', width: 10},
            {header: 'listeCode_PV', key: 'listeCode_PV', width: 10},

            {header: 'typeDoctorat', key: 'typeDoctorat', width: 10},
            {header: 'typeDiplome', key: 'typeDiplome', width: 10},
            {header: 'etablissementOrigine', key: 'etablissementOrigine', width: 10},
            // {header: 'Siminaire titre', key: 'Siminaire.titre' , width: 10},
            // {header: 'Siminaire animateur', key: 'Siminaire.animateur', width: 10},
            // {header: 'Siminaire resume', key: 'Siminaire.resume', width: 10},
            
            {header: 'directeur nom', key: 'directeur.nom', width: 10},
            {header: 'directeur grade', key: 'directeur.grade', width: 10},
            {header: 'directeur etablissement', key: 'directeur.etablissement', width: 10},
            {header: 'co-directeur nom', key: 'co-directeur.nom', width: 10},
            {header: 'co-directeur grade', key: 'co-directeur.grade', width: 10},
            {header: 'co-directeur etablissement', key: 'co-directeur.etablissement', width: 10},

            {header: 'observation', key: 'observation', width: 10},
            {header: 'soutenu stat', key: 'soutenu.stat', width: 10},
            {header: 'soutenu date', key: 'soutenu.date', width: 10},
            {header: 'soutenu PV', key: 'soutenu.Pv', width: 10},
            {header: 'radie stat', key: 'radie.stat', width: 10},
            {header: 'radie date', key: 'radie.date', width: 10},
            {header: 'radie PV', key: 'radie.Pv', width: 10},
            {header: 'changement these stat', key: 'changementThese.stat', width: 10},
            {header: 'changement these date', key: 'changementThese.date', width: 10},
            {header: 'changement these PV', key: 'changementThese.Pv', width: 10},
        ];

        let count = 1;

        Doctorants.forEach( Doctorant => {
          let titree = null;
          let animateurr = null;
          let resumee = null;
          let directeurrr = null;
          let codirecteurrr = null;
          if ( typeof Doctorant.siminaire !== 'undefined' && Doctorant.siminaire.length > 0) {
            let siminairee = Doctorant.siminaire[0];
            titree = siminairee.titre
            animateurr = siminairee.animateur
            resumee = siminairee.resume
          } 
          if ( Doctorant.directeurPrincipal !== null ) {
            directeurrr = Doctorant.directeurPrincipal
          }
          if ( Doctorant.coDirecteur !== null ) {
            codirecteurrr = Doctorant.coDirecteur
          }


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
                option: Doctorant.option,
                FCT: Doctorant.FCT,
                listeCode_PV: Doctorant.listeCode_PV,

                typeDoctorat: Doctorant.typeDoctorat,
                typeDiplome: Doctorant.typeDiplome,
                etablissementOrigine: Doctorant.etablissementOrigine,
                // 'Siminaire.titre': titree,
                // 'Siminaire.animateur': animateurr,
                // 'Siminaire.resume': resumee,

                'directeur.nom': directeurrr.nomComplet,
                'directeur.grade': directeurrr.grade,
                'directeur.etablissement': directeurrr.etablissement,
                'co-directeur.nom': codirecteurrr.nomComplet,
                'co-directeur.grade': codirecteurrr.grade,
                'co-directeur.etablissement': codirecteurrr.etablissement,
               
                observation: Doctorant.observation,
                'soutenu.stat': Doctorant.soutenu.stat,
                'soutenu.date': Doctorant.soutenu.date,
                'soutenu.Pv': Doctorant.soutenu.Pv,
                'radie.stat': Doctorant.radie.stat,
                'radie.date': Doctorant.radie.date,
                'radie.Pv': Doctorant.radie.Pv,
                'changementThese.stat': Doctorant.changementThese.stat,
                'changementThese.date': Doctorant.changementThese.date,
                'changementThese.Pv': Doctorant.changementThese.Pv,
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

// done & works
const reinscription = async (req, res) => {
  try {
  // recuperation des donnees
    const { doctorants , pv } = req.body;

  // creatiopn du pv dans la bdd des PV
    const newPv = new PV(pv);
    const pvId = (await newPv.save())._id;

  // mise a jour de tous les doctorants inscrit vers differe
    await Doctorant.updateMany({}, { $set: { inscrit: false } });

  // re-inscription des doctorants re-inscrit
    for (const id of doctorants) {
      // verifier que le doctorant existe deja
      const doctorant = await Doctorant.findById(id);
      if (!doctorant) {
        return res.status(404).json({ message: `Doctorant avec id: ${id} n'existe pas` });
      } else { 
          // mise a jour des champs necessaire
          doctorant.totalinscription++;
          doctorant.inscrit = true;
          doctorant.listeCode_PV.push(pvId);

          // mise a jour du doctorant
          await doctorant.save();
      }
    }
  // envoie de reponse
    res.status(200).json({ message: 'Reinscription reussie' });
  } catch (error) {
    res.send({status:400 , success:false , msg:error.message});
  }
};

// done and works
const modifierstatus = async (req , res) => {
  try {
  // recuperation des donnees
    const { doctorants , status , pv } = req.body;

  // creation du nouveau pv
    const newPV = new PV(pv);
    const pvId = ( await newPV.save() )._id;
      
  // iteration de la liste des doctorants et mettre a jour du statu
    for (const doctorantid of doctorants) {
      // recuperation du doctorant de la bdd
      const doctorant = await Doctorant.findById(doctorantid);
      // mise a jour du statu
      switch (status) {
        case 'inscrit':
          doctorant.inscrit = true ; doctorant.listeCode_PV.push(pvId) ;
          doctorant.soutenu.stat = false ; doctorant.soutenu.date = null ; doctorant.soutenu.Pv = null ;
          doctorant.radie.stat = false ; doctorant.radie.date = null ; doctorant.radie.Pv = null ;
          break;
        case 'radie':
          doctorant.inscrit = false;
          doctorant.soutenu.stat = false ; doctorant.soutenu.date = null ; doctorant.soutenu.Pv = null;
          doctorant.radie.stat = true ; doctorant.radie.date = pv.date ; doctorant.radie.Pv = pvId;
          break;
        case 'soutenu':
          doctorant.inscrit = false;
          doctorant.soutenu.stat = true ; doctorant.soutenu.date = pv.date ; doctorant.soutenu.Pv = pvId;
          doctorant.radie.stat = false ; doctorant.radie.date = null ; doctorant.radie.Pv = null;
          break;
        case 'differe':
          doctorant.inscrit = false;
          doctorant.soutenu.stat = false ; doctorant.soutenu.date = null ; doctorant.soutenu.Pv = null;
          doctorant.radie.stat = false ; doctorant.radie.date = null ; doctorant.radie.Pv = null;
          break;
        default:
          return res.status(400).send(`Status invalide : ${status}`);
      }
    // sauvegarde du doctorant
      await doctorant.save();
    }

  // envoie de reponse
    res.status(200).send('Modification de statu reussie des doctorants.');
  } catch (error) {
    console.error(error);
    res.send({status:400 , success:false , msg:error.message});
  }
}

// done & works
const changementThese = async (req , res) => {
  try {
  // recuperation des donnees
    //in case of nom 
    //const { nom , prenom , dateNaissance , nouveauIntituleThese , pv } = req.body;
    //in case of id 
    const { doctorantId , nouveauIntituleThese , pv } = req.body;

  // creation pv
    const newPV = new PV(pv);
    await newPV.save();

  // recuperation du doctorant
    //by nom
    // const doctorant = await Doctorant.findOne({ nom , prenom , dateNaissance });
    // by id
    const doctorant = await Doctorant.findById(doctorantId);


    if (!doctorant) {
      return res.status(404).json({ error: 'Doctorant existe pas' });
    }
      // changement du status , date , pv , intitule These
      doctorant.intituleeThese = nouveauIntituleThese;
      doctorant.changementThese.stat = true;
      doctorant.changementThese.date = newPV.date;
      doctorant.changementThese.Pv = newPV._id;

      //sauvegarde du doctorant
      await doctorant.save();
  // envoie de reponse
    res.json({
      doctorant: {
        id: doctorant._id,
        intituleeThese: doctorant.intituleeThese,
        changementThese: doctorant.changementThese,
      },
    })
  } catch (error) {
    res.send({status:400 , success:false , msg:error.message});
  }
}

// done and works
const siminaire = async (req, res) => {
  try {
  // recuperation des donnees
    const { doctorantId , nom , prenom , dateNaissance , titre , resume , animateur  } = req.body;

  // recuperation du doctorant
    let doctorant = await Doctorant.findById(doctorantId);
    if (mongoose.Types.ObjectId.isValid(doctorantId)) {
      doctorant = await Doctorant.findById(doctorantId);
    } else {
      doctorant = await Doctorant.findOne({ nom , prenom , dateNaissance });
    }

    if (!doctorant) {
      return res.status(404).json({ message: 'Doctorant existe pas' });
    } else {
      // Ajout du seminaire a la liste
      let seminaire = { titre , resume , animateur };
      doctorant.Siminaire.push(seminaire);

      // sauvegarde du doctorant a la bdd
      await doctorant.save();
    }
  // envoie de reponse
    res.json({
      message: 'Siminaire ajoute !',
      doctorantId: doctorant._id,
      seminaires: doctorant.Siminaire,
    });
  } catch (error) {
    res.send({status:400 , success:false , msg:error.message});
  }
}

// done and works
const observation = async (req, res) => {
  try {
  // recuperation des donnees
    const { nom , prenom , dateNaissance , observation  } = req.body;

  // recuperation du doctorant
    let  doctorant = await Doctorant.findOne({ nom , prenom , dateNaissance });

    if (!doctorant) {
      return res.status(404).json({ message: 'Doctorant existe pas' });
    } else {
      doctorant.observation = observation;
      await doctorant.save();
    }
  // envoie de reponse
    res.json({
      message: 'Observation ajoute !',
      doctorantId: doctorant._id,
      observation: doctorant.observation,
    });
  } catch (error) {
    res.send({status:400 , success:false , msg:error.message});
  }
}
// done & works
const majFCT = async (req, res) => {
  try {
  // recuperation des donnees
    const { doctorantid, FCT } = req.body;
    
  // recuperation du doctorant
    const doctorant = await Doctorant.findById(doctorantid);
    if (!doctorant) {
      return res.status(404).json({ error: 'Doctorant not found' });
    }
    
  // mise a jour de la date du fichier centrale
    doctorant.FCT = FCT;
  // sauvegarde du doctorant
    await doctorant.save();
    
  // envoie de reponse
    return res.json({
      message: 'FCT du doctorant mis à jour avec succès',
      doctorantId: doctorant._id,
      FCT: doctorant.FCT
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

const recupLaboOpt = async  (req , res) => {
  try {
    // Get all distinct laboratoire and option values from doctorant documents in the database
    const laboratoires = await Doctorant.distinct('laboratoire');
    const options = await Doctorant.distinct('option');

    // Filter out null and undefined values from the lists
    const filteredLaboratoires = laboratoires.filter(laboratoire => laboratoire != null && laboratoire != undefined);
    const filteredOptions = options.filter(option => option != null && option != undefined);

    // Remove duplicates from the lists
    const uniqueLaboratoires = [...new Set(filteredLaboratoires)];
    const uniqueOptions = [...new Set(filteredOptions)];

    // Return the lists as a response
    res.json({
      laboratoires: uniqueLaboratoires.length ? uniqueLaboratoires : ["LMCS", "LCSI"],
      options: uniqueOptions.length ? uniqueOptions : ["SI", "SIQ"]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

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
  

module.exports = 
{ 
  allDocsId , allDocs , exporter , recupLaboOpt ,
  ajouter , modifierstatus  ,  reinscription , changementThese , 
  siminaire , majFCT , observation ,
  createFakeDoctorants , 
  nouvInscrit  , inscritParY , sexe , typeDoctorat , laboratoire , status , total }