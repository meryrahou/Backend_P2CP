const Doctorant = require('../models/Doctorant');
const Encadrant = require('../models/Encadrant');
const PV = require('../models/PV');
const exceljs = require('exceljs');
const faker = require('faker');
const mongoose = require('mongoose');

function Status(Doctorant) {
  if (Doctorant.inscrit === true && Doctorant.differe == false ) {
    return { stat: 'inscrit' , date: Doctorant.premiereInscription , Pv: Doctorant.listeCode_PV[Doctorant.listeCode_PV.length -1] };
  } else if (Doctorant.inscrit === false && Doctorant.differe == true ) {
    return { stat: 'differe' , date: null , Pv: Doctorant.listeCode_PV[Doctorant.listeCode_PV.length - 1 ] };
  } else if (Doctorant.radie.stat === true && Doctorant.inscrit == false && Doctorant.differe == false ) {
    return { stat: 'radie' , date: Doctorant.radie.date , Pv: Doctorant.radie.Pv };
  } else if (Doctorant.soutenu.stat === true && Doctorant.inscrit == false && Doctorant.differe == false) {
    return { stat: 'soutenu' , date: Doctorant.soutenu.date , Pv: Doctorant.soutenu.Pv };
  }
}

/* liste des NomComplet des Doctorants 
   GET  */
const recupNomComplet = async (req, res) => {
  try {

    const doctorants = await Doctorant.find();
    res.status(200).json(doctorants.map(d => `${d.nom} ${d.prenom}`));
  } catch (err) {
    res.send({status:400 , success:false , msg:err.message});
  }
  }

// GET 
const allDocsId = async (req , res ) =>  {
  try {
    // const doctorant = await Doctorant.find({}, '_id');
    const doctorant = await Doctorant.find({}, '_id inscrit listeCode_PV differe soutenu.stat soutenu.date soutenu.Pv radie.stat radie.date radie.Pv');
    for(const doc of doctorant) {
      const liste = doc.listeCode_PV
    }
    res.json(doctorant);
  } catch (error) {
    res.send({status:400 , success:false , msg:error.message});
  }
  }

/* table page Doctorant 
    GET  */
const tableDoctorants = async (req , res ) =>  {
  try {
  // recuperation des donnees
    const doctorants = await Doctorant
    .find()
    .populate('directeurPrincipal')
    .populate('coDirecteur');

    let liste = [];
    for (const doctorant of doctorants) {
      const { listeCode_PV, inscrit , differe , totalinscription , changementThese , soutenu , radie ,  ...restdoctorant} = doctorant._doc ;
      let url = (await PV.findById(Status(doctorant).Pv)).url;
      const doctorantWithPvs = { ...restdoctorant, totalinscription: doctorant.totalinscription ,
                                  status: Status(doctorant).stat , 'Lien PV': url  , };
      liste.push(doctorantWithPvs);
    }
    res.json( liste );
  } catch (error) {
    res.send({status:400 , success:false , msg:error.message});
  }
  }

/* ajout d'un doctorant
    POST  */
const ajouter = async (req , res) => {
    try {
    // On recupere les champs du formulaire dans la requete
      /* champs non inclus : 
          inscrit , differe , totalinscription , siminaire , fct , listecodepv , 
          directeur principale , codirecteur , observation , soutenue obj , radier obj , chang obj */
      const { pv, directeur, codirecteur, typeDoctorat , typeDiplome , etablissementOrigine , 
              nom , prenom , dateNaissance , sexe , telephone , email , 
              premiereInscription , intituleeThese , laboratoire , option } = req.body;
  
    // verifiez si pv existe
      const existingPV = await PV.findOne({ code: pv.code, url: pv.url, date: pv.date, ordreDuJour: pv.ordreDuJour });
      let pvId;
      if (existingPV) { pvId = existingPV._id ; } 
      else {
        // si le pv n'existe pas , on le sauvegarde dans la bdd
        const newPV = new PV(pv);
        const savedPV = await newPV.save();
        pvId = savedPV._id;
      }
  
      // verifier si Encadrant == Directeur existe
      const existingDirecteur = await Encadrant.findOne({ nomComplet: directeur.nomComplet });
      let directeurId;
      if (existingDirecteur) { directeurId = existingDirecteur._id ; } 
      else {
        // si le directeur n'existe pas , on le sauvegarde dans la bdd
        const newDirecteur = new Encadrant(directeur);
        const savedDirecteur = await newDirecteur.save();
        directeurId = savedDirecteur._id;
      }
  
      // verifier si Encadrant == codirecteur existe
      let codirecteurId = null;
      if (codirecteur) {
        const existingCodirecteur = await Encadrant.findOne({ nomComplet: codirecteur.nomComplet });
        if (existingCodirecteur) { codirecteurId = existingCodirecteur._id ; } 
        else {
          const newCodirecteur = new Encadrant(codirecteur);
          const savedCodirecteur = await newCodirecteur.save();
          codirecteurId = savedCodirecteur._id;
        }
      }
  
      // verifier si doctorant existe
      const existingDoctorant = await Doctorant.findOne({ nom: nom , prenom: prenom ,  dateNaissance: dateNaissance });
      if (existingDoctorant) { return res.status(400).json({ message: 'Doctorant existe deja' }) ; } 
      else {
        const doctorant = new Doctorant({
        // --- information personnel --
          nom: nom, prenom: prenom, dateNaissance: dateNaissance, 
          sexe: sexe, telephone: telephone, email: email,

        // --- information de these ---
          inscrit: true, differe: false , premiereInscription: premiereInscription , totalinscription: 1 ,
          intituleeThese: intituleeThese , laboratoire: laboratoire , option: option , FCT: null ,
          listeCode_PV: [] ,

        // --- Cursus universitaire --- 
          typeDoctorat: typeDoctorat , typeDiplome: typeDiplome ,
          etablissementOrigine: etablissementOrigine ,
          Siminaire: [] ,

        // --- Information directeur ---
          directeurPrincipal: directeurId ,
          codirecteur: codirecteurId ,

        // --- Status ---
          observation: null ,
          soutenu: { status: false , date: null , Pv: null },
          radie: { status: false , date: null , Pv: null },
          changementThese: { status: false , date: null , Pv: null },
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
  }

/* genration aleatoires des données
    GET  */
const createFakeDoctorants = async (req, res) => {
  try {
    // creation de 10 Directeur
    const encadrants = [];
    for (let i = 0; i < 10; i++) {
      const encadrant = new Encadrant({
        nomComplet: faker.name.findName(),
        grade: faker.name.jobTitle(),
        etablissement: faker.company.companyName(),
        telephone: faker.random.number(10000),
        email: faker.internet.email(),
      });
      await encadrant.save();
      encadrants.push(encadrant);
    }
    // creation d'un PV pour l'inscription de plusieurs doctorants
    const pv = new PV({
      code: faker.lorem.words(3),
      url: "https://docs.google.com/document/d/1MoYAZUAV0mwE4_yQDhJnddyC5dRzKv-S/edit?usp=sharing&ouid=100263356820022022985&rtpof=true&sd=true",
      date: faker.date.past(10),
      ordreDuJour: faker.lorem.words(10),
    });
    await pv.save();

    // creation de 10 Doctorants
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
        differe: false,
        premiereInscription: faker.date.past(30),
        totalinscription: faker.random.number(9),
        intituleeThese: faker.lorem.words(3),
        laboratoire: faker.random.arrayElement(['LMCS', 'LCSI' ]),
        option: faker.random.arrayElement(['SI', 'SIQ' ]),
        FCT: null,
        listeCode_PV: [pv._id],

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
        soutenu: { stat: false, date: null, Pv: null, },
        radie: { stat: false, date: null, Pv: null, },
        changementThese: { stat: false, date: null, Pv: null, },
      });
      await doctorant.save();
      doctorants.push(doctorant);
    }
    res.json({ message: 'Successfully created fake Doctorants!' , doctorants });
  } catch (error) {
    res.send({status:400 , success:false , msg:error.message});
  }
  }

/* table page exporter 
    GET  */
const tableauExporter = async (req, res) => {
  try {
  // recuperation des donnees
    const doctorants = await Doctorant.find()
    .select(' _id nom prenom premiereInscription intituleeThese laboratoire FCT directeurPrincipal listeCode_PV inscrit radie soutenu differe')
    .populate('directeurPrincipal')
    .exec();

    let listedoc = [];
    for (const doctorant of doctorants) {
      // recuperation url du Pv au depant du status
      let url = (await PV.findById(Status(doctorant).Pv)).url;
      const { listeCode_PV, directeurPrincipal , inscrit , radie , soutenu , differe , ...restdoctorant} = doctorant._doc ;
      const doctorantWithPvs = { ...restdoctorant , status: Status(doctorant).stat , 'Lien PV': url , 
                                  directeurPrincipale: directeurPrincipal.nomComplet  };
      listedoc.push(doctorantWithPvs);
    }

  // envoie de reponse
    res.status(200).json(listedoc);
  } catch (err) {
    res.send({status:400 , success:false , msg:err.message});
  }
  }

/* function exporter doctorants par liste des ids
    GET  */
const exporter = async ( req , res ) => {
    try {
    // recuperation des champs dans la requete
      const { doctorantsids , nombool , prenombool , dateNaissancebool ,
              sexebool , telephonebool , emailbool ,
              typeDoctoratbool , typeDiplomebool , etablissementOriginebool , 
              premiereInscriptionbool , totalinscriptionbool , intituleeThesebool ,
              laboratoirebool , optionbool , FCTbool , statusbool , 
              directeurbool , codirecteurbool , changementThesebool , observationbool , pvbool } = req.body;
    
    // creation du fichier excel
      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet('Doctorants');
      // declaration des colomns
      worksheet.columns = [
        {header: '_id', key: '_id', width: 10}, 
        {header: 'Nom', key: 'nom', width: 10}, {header: 'Prenom', key: 'prenom', width: 10},
        {header: 'Sexe', key: 'sexe', width: 10},
        {header: 'Date de Naissance', key: 'dateNaissance', width: 10}, {header: 'Email', key: 'email', width: 10},
        
        {header: 'Type du Doctorat', key: 'typeDoctorat', width: 10}, {header: 'Type du Diplome', key: 'typeDiplome', width: 10},
        {header: 'Etablissement Origine', key: 'etablissementOrigine', width: 10},
        
        {header: 'Date Premiere Inscription', key: 'premiereInscription', width: 10}, 
        {header: 'Duree Doctorat', key: 'totalinscription', width: 10},
        {header: 'Intitulee These', key: 'intituleeThese', width: 10}, 
        {header: 'Option', key: 'option', width: 10},
        {header: 'Date enregistrement fichier centrale des theses', key: 'FCT', width: 10},
        {header: 'Status', key: 'status', width: 10}, 
        {header: 'Date Changement Status', key: 'status.date', width: 10}, 
        {header: 'Code PV du changement status', key: 'status.code.PV', width: 10},
        {header: 'Url du PV', key: 'status.PV.url', width: 10},
        {header: 'Ordre du jour du PV', key: 'status.ordreDuJour.PV', width: 10},
        {header: 'Observation', key: 'Observation', width: 10},

        {header: 'Nom Directeur Principale', key: 'directeur.nom', width: 10}, 
        {header: 'Grade Directeur Principale', key: 'directeur.grade', width: 10}, 
        {header: 'Etablissement Directeur Principale', key: 'directeur.etablissement', width: 10},
        {header: 'Telephone Directeur Principale', key: 'directeur.telephone', width: 10},
        {header: 'Email Directeur Principale', key: 'directeur.email', width: 10},
        
        {header: 'Nom Co-Directeur', key: 'co-directeur.nom', width: 10}, 
        {header: 'Grade Co-Directeur ', key: 'co-directeur.grade', width: 10}, 
        {header: 'Etablissement Co-Directeur', key: 'co-directeur.etablissement', width: 10},
        {header: 'Telephone Co-Directeur Principale', key: 'co-directeur.telephone', width: 10},
        {header: 'Email Co-Directeur Principale', key: 'co-directeur.email', width: 10},

        {header: 'Changement these', key: 'changementThese.stat', width: 10},
        {header: 'Date Changement these', key: 'changementThese.date', width: 10},
        {header: 'Code PV Changement these', key: 'changementThese.code.Pv', width: 10},
        {header: 'Url PV Changement these', key: 'changementThese.url.Pv', width: 10},

        {header: 'lien PV1', key: 'urlpv1', width: 10}, {header: 'lien PV2', key: 'urlpv2', width: 10},
        {header: 'lien PV3', key: 'urlpv3', width: 10}, {header: 'lien PV4', key: 'urlpv4', width: 10},
        {header: 'lien PV5', key: 'urlpv5', width: 10},{header: 'lien PV6', key: 'urlpv6', width: 10},
        {header: 'lien PV7', key: 'urlpv7', width: 10}, {header: 'lien PV8', key: 'urlpv8', width: 10},
        {header: 'lien PV9', key: 'urlpv9', width: 10}, {header: 'lien PV10', key: 'urlpv10', width: 10},
        {header: 'lien PV11', key: 'urlpv11', width: 10}, {header: 'lien PV12', key: 'urlpv12', width: 10},
        {header: 'lien PV13', key: 'urlpv13', width: 10}, {header: 'lien PV14', key: 'urlpv14', width: 10},
        {header: 'lien PV15', key: 'urlpv15', width: 10}, {header: 'lien PV16', key: 'urlpv16', width: 10},
        {header: 'lien PV17', key: 'urlpv17', width: 10}, {header: 'lien PV18', key: 'urlpv18', width: 10},
        {header: 'lien PV19', key: 'urlpv19', width: 10}, {header: 'lien PV20', key: 'urlpv20', width: 10},
      ];
    // recuperation des doctorants choisis
      let doctorantts = []
      for (const doctorantid of doctorantsids) {
        let doctorant = await Doctorant.findById(doctorantid)
                        .populate('directeurPrincipal')
                        .populate('coDirecteur');
        const pvPromises = doctorant.listeCode_PV.map((pv) => PV.findById(pv));
        const pvs = await Promise.all(pvPromises);
        const doctorantWithPvs = { ...doctorant._doc, pv: pvs };
        doctorantts.push(doctorantWithPvs);
      }
    // remplissage du fichier 
      for (const doctorant of doctorantts) {

        if (nombool == false ) { doctorant.nom = null }
        if (prenombool == false ) { doctorant.prenom = null }
        if (dateNaissancebool == false ) { doctorant.dateNaissance = null }
        if (sexebool == false ) { doctorant.sexe = null }
        if (telephonebool == false ) { doctorant.telephone = null }
        if (emailbool == false ) { doctorant.email = null }
        
        if (!typeDoctoratbool) { doctorant.typeDoctorat = null }
        if (!typeDiplomebool) { doctorant.typeDiplome = null }
        if (!etablissementOriginebool) { doctorant.etablissementOrigine = null }

        if (!premiereInscriptionbool) { doctorant.premiereInscription = null }
        if (!totalinscriptionbool) { doctorant.totalinscription = null }
        if (!intituleeThesebool) { doctorant.intituleeThese = null }
        if (!laboratoirebool) { doctorant.laboratoire = null }
        if (!optionbool) { doctorant.option = null }
        if (!FCTbool) { doctorant.FCT = null }

        let statuu = Status(doctorant)
        if ( statuu.Pv?._id ) {
          statuu.Pv =  await PV.findById(statuu.Pv._id)
        }
        if (!statusbool) { statuu.Pv = null , statuu.stat = null , statuu.date = null }
        
        if (!directeurbool) { doctorant.directeurPrincipal = null }
        if (!codirecteurbool) { doctorant.coDirecteur = null }

        if (doctorant.changementThese.Pv?._id ) {
          doctorant.changementThese.Pv =  await PV.findById(doctorant.changementThese.Pv._id)
        }
        if (!changementThesebool) { doctorant.changementThese.status = null , doctorant.changementThese.status = null , doctorant.changementThese.date = null  }
        if (!observationbool) { doctorant.observation = null }
        if (!pvbool) { doctorant.pv = null }

        worksheet.addRow({
          _id: doctorant._id,
          nom: doctorant.nom, prenom: doctorant.prenom, dateNaissance: doctorant.dateNaissance,
          sexe: doctorant.sexe, telephone: doctorant.telephone, email: doctorant.email,
          
          typeDoctorat: doctorant.typeDoctorat, typeDiplome: doctorant.typeDiplome,
          etablissementOrigine: doctorant.etablissementOrigine,

          premiereInscription: doctorant.premiereInscription, totalinscription: doctorant.totalinscription,
          intituleeThese: doctorant.intituleeThese,
          laboratoire: doctorant.laboratoire, option: doctorant.option, FCT: doctorant.FCT,
          status: statuu.stat, 'status.date': statuu.date, 
          'status.code.PV': statuu.Pv?.code, 
          'status.PV.url': statuu.Pv?.url, 'status.ordreDuJour.PV': statuu.Pv?.ordreDuJour,

          'directeur.nom': doctorant.directeurPrincipal.nomComplet, 
          'directeur.grade': doctorant.directeurPrincipal.grade, 
          'directeur.etablissement': doctorant.directeurPrincipal.etablissement,
          'directeur.telephone': doctorant.directeurPrincipal.telephone,
          'directeur.email': doctorant.directeurPrincipal.email,

          'co-directeur.nom': doctorant.coDirecteur.nomComplet, 
          'co-directeur.grade': doctorant.coDirecteur.grade, 
          'co-directeur.etablissement': doctorant.coDirecteur.etablissement,
          'co-directeur.telephone': doctorant.coDirecteur.telephone,
          'co-directeur.email': doctorant.coDirecteur.email,
        
          'changementThese.stat': doctorant.changementThese.stat  ? 'Changee' : 'Non changee', 
          'changementThese.date': doctorant.changementThese.date, 
          'changementThese.code.Pv': doctorant.changementThese.Pv?.code,
          'changementThese.url.Pv': doctorant.changementThese.Pv?.url,
          observation: doctorant.observation,

          'urlpv4': doctorant.pv[3]?.url, 'urlpv5': doctorant.pv[4]?.url, 'urlpv6': doctorant.pv[5]?.url, 
          'urlpv1': doctorant.pv[0]?.url, 'urlpv2': doctorant.pv[1]?.url, 'urlpv3': doctorant.pv[2]?.url, 
          'urlpv7': doctorant.pv[6]?.url, 'urlpv8': doctorant.pv[7]?.url, 'urlpv9': doctorant.pv[8]?.url, 
          'urlpv10': doctorant.pv[9]?.url, 'urlpv11': doctorant.pv[10]?.url, 'urlpv12': doctorant.pv[11]?.url, 
          'urlpv13': doctorant.pv[12]?.url, 'urlpv14': doctorant.pv[13]?.url, 'urlpv15': doctorant.pv[14]?.url, 
          'urlpv16': doctorant.pv[15]?.url, 'urlpv17': doctorant.pv[16]?.url, 'urlpv18': doctorant.pv[17]?.url, 
          'urlpv19': doctorant.pv[18]?.url, 'urlpv20': doctorant.pv[19]?.url,
        });
      };
      worksheet.getRow(1).eachCell((cell) => {
          cell.font = {bold: true};
      });

    // execution de la creation du fichier excel
      const data = await workbook.xlsx.writeFile('DoctorantsData.xlsx')
    // envoie de reponse
      res.send( 'Base de donne exporter sous fichier: "DoctorantsData.xlsx"');
  } catch (error) {
      res.send({status:400 , success:false , msg:error.message});
  }
}

/* table page reinscription
    GET */
const tableauReinscription = async (req, res) => {
  try {
    // recupere les donnees des doctorants avec status : inscrit || Differe
    const doctorants = await Doctorant.find({
      $or: [ { inscrit: true } , { differe: true } ]
    })
    .select(' _id nom prenom premiereInscription directeurPrincipal listeCode_PV')
    .populate('directeurPrincipal')
    .exec();

  // recuperation du Pv , nomComplet du directeur
    let listedoc = [];
    for (const doctorant of doctorants) {
      const lastPV = await PV.findById(doctorant.listeCode_PV[doctorant.listeCode_PV.length - 1]);
      const { listeCode_PV, directeurPrincipal , ...restdoctorant} = doctorant._doc ;
      const doctorantWithPvs = { ...restdoctorant, 'Lien PV': lastPV?.url , directeurPrincipale: directeurPrincipal.nomComplet };
      listedoc.push(doctorantWithPvs);
    }
  // envoie de reponse
    res.status(200).json(listedoc);
  } catch (err) {
    res.send({status:400 , success:false , msg:err.message});
  }
  }

/* table page reinscription differe
    GET */
const tableauReinscriptionDiffere = async (req, res) => {
  try {
  // recupere les donnees des doctorants avec status : Differe
    const doctorants = await Doctorant.find({
      $or: [ { differe: true } ]
    })
    .select(' _id nom prenom premiereInscription directeurPrincipal listeCode_PV')
    .populate('directeurPrincipal')
    .exec();

  // recuperation du Pv , nomComplet du directeur
    let listedoc = [];
    for (const doctorant of doctorants) {
      const lastPV = await PV.findById(doctorant.listeCode_PV[doctorant.listeCode_PV.length - 1]);
      const { listeCode_PV, directeurPrincipal , ...restdoctorant} = doctorant._doc ;
      const doctorantWithPvs = { ...restdoctorant, 'Lien PV': lastPV?.url , directeurPrincipal: directeurPrincipal.nomComplet };
      listedoc.push(doctorantWithPvs);
    }
  // envoie de reponse
    res.status(200).json(listedoc);
  } catch (err) {
    res.send({status:400 , success:false , msg:err.message});
  }
  }

/* reinscription de plusieurs doctorants 
    POST */
const reinscription = async (req, res) => {
  try {
  // recuperation des donnees
    const { doctorants , pv } = req.body;

  // creatiopn du pv dans la bdd des PV
    const newPv = new PV(pv);
    const pvId = (await newPv.save())._id;

  // mise a jour de tous les doctorants inscrit vers differe
  await Doctorant.updateMany(
    { $and: [{ 'radie.stat': false }, { 'soutenu.stat': false }] },
    { $set: { inscrit: false, differe: true } }
  );
  
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
          doctorant.differe = false;
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

/* table page Modifier Status
    GET */
const tableauModifStatus = async (req, res) => {
  try {
  // recupere les donnees des doctorants avec status : inscrit || Differe
    const doctorants = await Doctorant.find()
    .select(' _id nom prenom premiereInscription directeurPrincipal listeCode_PV inscrit differe soutenu radie')
    .populate('directeurPrincipal')
    .exec();

  // recuperation du Pv , nomComplet du directeur
    let listedoc = [];
    for (const doctorant of doctorants) {
      let url = (await PV.findById(Status(doctorant).Pv)).url;
      const { listeCode_PV, directeurPrincipal , inscrit , radie , differe , soutenu , ...restdoctorant} = doctorant._doc ;
      const doctorantWithPvs = { ...restdoctorant, directeurPrincipal: directeurPrincipal.nomComplet ,
                                     status: Status(doctorant).stat , 'Lien PV': url  };
      listedoc.push(doctorantWithPvs);
    }
  // envoie de reponse
    res.status(200).json(listedoc);
  } catch (err) {
    res.send({status:400 , success:false , msg:err.message});
  }
  }

/* modification du status de plusieurs doctorants 
    POST */
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
          doctorant.inscrit = true ; doctorant.differe = false ; doctorant.listeCode_PV.push(pvId) ;
          doctorant.soutenu.stat = false ; doctorant.soutenu.date = null ; doctorant.soutenu.Pv = null ;
          doctorant.radie.stat = false ; doctorant.radie.date = null ; doctorant.radie.Pv = null ;
          break;
        case 'radie':
          doctorant.inscrit = false ; doctorant.differe = false ;
          doctorant.soutenu.stat = false ; doctorant.soutenu.date = null ; doctorant.soutenu.Pv = null;
          doctorant.radie.stat = true ; doctorant.radie.date = pv.date ; doctorant.radie.Pv = pvId;
          break;
        case 'soutenu':
          doctorant.inscrit = false ; doctorant.differe = false ;
          doctorant.soutenu.stat = true ; doctorant.soutenu.date = pv.date ; doctorant.soutenu.Pv = pvId;
          doctorant.radie.stat = false ; doctorant.radie.date = null ; doctorant.radie.Pv = null;
          break;
        case 'differe':
          doctorant.inscrit = false ; doctorant.differe = true ;
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

/* table page Changement de These 
    condition : Doctorant inscrit 
    GET */
const tableauChangementThese = async (req, res) => {
  try {
  // recupere les donnees des doctorants avec status : inscrit
    const doctorants = await Doctorant.find({
      $and: [ { inscrit: true } , { "changementThese.stat": false } ]    
    })
    .select('_id nom prenom intituleThese laboratoire directeurPrincipal')
    .populate('directeurPrincipal' )
    .exec();
  // recuperation du nomComplet du directeur
    const filteredDoctorants = doctorants.map((doctorant) => {
      const { _id , nom, prenom, intituleThese, laboratoire, directeurPrincipal} = doctorant;
      return { _id , nom, prenom, intituleThese, laboratoire, directeurPrincipale: directeurPrincipal.nomComplet};
    });

  // envoie de reponse
    res.status(200).json(filteredDoctorants);
  } catch (err) {
    res.send({status:400 , success:false , msg:err.message});
  }
  }

/* changement de these d'un seul doctorant 
    POST */
const changementThese = async (req , res) => {
  try {
  // recuperation des donnees
    const { doctorantId , nouveauIntituleThese , pv } = req.body;

  // creation pv
    const newPV = new PV(pv);
    await newPV.save();

  // recuperation du doctorant
    const doctorant = await Doctorant.findById(doctorantId);

    if (!doctorant) {
      return res.status(404).json({ error: 'Doctorant existe pas' });
    }
      // changement du status , date , pv , intitule These
      doctorant.intituleeThese = nouveauIntituleThese;
      doctorant.changementThese.stat = true;
      doctorant.changementThese.Pv = newPV._id;

      //sauvegarde du doctorant
      await doctorant.save();
  // envoie de reponse
    res.json({ id: doctorant._id, intituleeThese: doctorant.intituleeThese, changementThese: doctorant.changementThese, })
  } catch (error) {
    res.send({status:400 , success:false , msg:error.message});
  }
}

/* ajouter un siminaire a un seul doctorant 
    POST */
const siminaire = async (req, res) => {
  try {
  // recuperation des donnees
    const { doctorantId , titre , resume , animateur  } = req.body;

  // recuperation du doctorant
    let doctorant = await Doctorant.findById(doctorantId);

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
    res.json({ doctorantId: doctorant._id, seminaires: doctorant.Siminaire, });
  } catch (error) {
    res.send({status:400 , success:false , msg:error.message});
  }
}

/* ajouter une observation a un seul doctorant 
    POST */
const observation = async (req, res) => {
  try {
  // recuperation des donnees
  const { doctorantid , observation } = req.body;

  // recuperation du doctorant
  const doctorant = await Doctorant.findById(doctorantid);

    if (!doctorant) {
      return res.status(404).json({ message: 'Doctorant existe pas' });
    } else {
      doctorant.observation = observation;
      await doctorant.save();
    }
  // envoie de reponse
    res.json({ doctorantId: doctorant._id, observation: doctorant.observation, });
  } catch (error) {
    res.send({status:400 , success:false , msg:error.message});
  }
}

/* ajouter un date d'enregistrement de fichier centrale des theses a un seul doctorant 
    POST */
const majFCT = async (req, res) => {
  try {
  // recuperation des donnees
    const { doctorantid , FCT } = req.body;
    
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
    return res.json({ doctorantId: doctorant._id, FCT: doctorant.FCT });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/* liste des laboratoire et options qui existe dans la bdd
    utiliser dans inscription (ajouter doctorant) && chagement d'information
    GET */
const recupLaboOpt = async  (req , res) => {
  try {
    // Recupere tous les valeurs distincts dans le tableau des doctorants
    const laboratoires = await Doctorant.distinct('laboratoire');
    const options = await Doctorant.distinct('option');

    // On enleve les dupliquer
    const uniqueLaboratoires = [...new Set(laboratoires)];
    const uniqueOptions = [...new Set(options)];

    // envoie de reponse
    res.json({
      laboratoires: uniqueLaboratoires.length ? uniqueLaboratoires : ["LMCS", "LCSI"],
      options: uniqueOptions.length ? uniqueOptions : ["SI", "SIQ"]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/* modifier les informations personnelles d'un doctorant 
    POST */
const modifierInfoDoc = async (req, res) => {
  try {
    // recuperation des donnees
    const { id , nom ,  prenom ,  telephone ,  email ,  dateNaissance ,  sexe ,  typeDiplome ,  laboratoire ,  etablissementOrigine ,  option ,  directeurPrincipal ,  coDirecteur } = req.body;
    // recuperation du doctorant
    const doctorant = await Doctorant.findById(id);
    if (!doctorant) {
      return res.status(404).send({ message: 'Doctorant not found' });
    }
    // mise a jour des champs
    doctorant.nom = nom; doctorant.prenom = prenom; doctorant.telephone = telephone;
    doctorant.email = email; doctorant.dateNaissance = dateNaissance; doctorant.sexe = sexe;
    doctorant.typeDiplome = typeDiplome; doctorant.laboratoire = laboratoire;
    doctorant.etablissementOrigine = etablissementOrigine; doctorant.option = option;
    doctorant.directeurPrincipal = directeurPrincipal._id;
    doctorant.coDirecteur = coDirecteur._id;
    // sauvegarde dans la bdd
    await doctorant.save();
  // envoie de reponse
    res.send(doctorant);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error updating doctorant' });
  }
  }
    
  
module.exports = 
{ 
  allDocsId , tableDoctorants , recupLaboOpt , recupNomComplet ,
  tableauChangementThese , tableauReinscription , tableauModifStatus , tableauReinscriptionDiffere , tableauExporter ,
  ajouter , modifierstatus  ,  reinscription , changementThese , exporter , modifierInfoDoc , 
  siminaire , majFCT , observation ,
  createFakeDoctorants , Status }