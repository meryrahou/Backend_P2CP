const Doctorant = require('../models/Doctorant');
const exceljs = require('exceljs');
const Encadrant = require('../models/Encadrant');
const faker = require('faker');
const { Status } = require('./Doctorant')
const mongoose = require('mongoose');

// function qui exporter une liste des ids des doctorant donnees en fichier excel 
const  exporter = async ( doctorantsids ) => {
  try {
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Doctorants');
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
    for (const doctorant of doctorantts) {

      let statuu = Status(doctorant)
      if ( statuu.Pv?._id ) {
        statuu.Pv =  await PV.findById(statuu.Pv._id)
      }

      if (doctorant.changementThese.Pv?._id ) {
        doctorant.changementThese.Pv =  await PV.findById(doctorant.changementThese.Pv._id)
        codeee = doctorant.changementThese.Pv.code
        urlll = doctorant.changementThese.Pv.url
      }

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
      const data = await workbook.xlsx.writeFile('FiltreDoctorant.xlsx')
      console.log( 'Base de donne exporter sous fichier: "FiltreDoctorant.xlsx"');
} catch (error) {
  console.error(error);
}
}

/* Calcule des statistiques Numeriques && pourcentage MAJ
    Carte information : page statistiques
    GET  */
const statistiques = async (req, res) => {
  try {
    const Doctorants = await Doctorant.find();

    const anneeActuelle = new Date().getFullYear();

    let totalDoc = 0;
    
    let totalM = 0; let anneActuelleM = 0; let annePrecM = 0;
    let totalF = 0; let anneActuelleF = 0; let annePrecF = 0;

    let totalLMD = 0; let anneActuelleLMD = 0; let annePrecLMD = 0;
    let totalClassique = 0; let anneActuelleClassique = 0; let annePrecClassique = 0;    
    
    let totalLCSI = 0; let anneActuelleLCSI = 0; let annePrecLCSI = 0;
    let totalLMCS = 0; let anneActuelleLMCS = 0; let annePrecLMCS = 0;    
    let totalAutre = 0; let anneActuelleAutre = 0; let annePrecAutre = 0;    
    
    let inscrit = 0 , radie = 0 , soutenu = 0 , differe = 0;

    Doctorants.forEach(Doctorant => {
      
      //nombre total des doctorants
        totalDoc++;

      // stat par sexe
      if ( Doctorant.sexe === 'M') {
        totalM++;
        if (new Date(Doctorant.premiereInscription).getFullYear() === anneeActuelle) {
          anneActuelleM++;
        } else if (new Date(Doctorant.premiereInscription).getFullYear() === anneeActuelle - 1) {
          annePrecM++;
        }
      } else if ( Doctorant.sexe === 'F') {
        totalF++;
        if (new Date(Doctorant.premiereinscription).getFullYear() === anneeActuelle) {
          anneActuelleF++;
        } else if (new Date(Doctorant.premiereinscription).getFullYear() === anneeActuelle - 1) {
          annePrecF++;
        }        
      }

      // stat par type doctorat
      if ( Doctorant.typeDoctorat === 'LMD') { 
        totalLMD++;
        if (new Date(Doctorant.premiereInscription).getFullYear() === anneeActuelle) {
          anneActuelleLMD++;
        } else if (new Date(Doctorant.premiereInscription).getFullYear() === anneeActuelle - 1) {
          annePrecLMD++;
        }      
      } 
      else if ( Doctorant.typeDoctorat === 'Classique') { 
        totalClassique++;
        if (new Date(Doctorant.premiereInscription).getFullYear() === anneeActuelle) {
          anneActuelleClassique++;
        } else if (new Date(Doctorant.premiereInscription).getFullYear() === anneeActuelle - 1) {
          annePrecClassique++;
        }
      }   
    
      // stat par labo
      if ( Doctorant.laboratoire === 'LMCS' ) { 
        totalLMCS++ ; 
        if (new Date(Doctorant.premiereInscription).getFullYear() === anneeActuelle) {
          anneActuelleLMCS++;
        } else if (new Date(Doctorant.premiereInscription).getFullYear() === anneeActuelle - 1) {
          annePrecLMCS++;
        }
      } 
      else if ( Doctorant.laboratoire === 'LCSI' ) { 
        totalLCSI++ ; 
        if (new Date(Doctorant.premiereInscription).getFullYear() === anneeActuelle) {
          anneActuelleLCSI++;
        } else if (new Date(Doctorant.premiereInscription).getFullYear() === anneeActuelle - 1) {
          annePrecLCSI++;
        }
      }
      else { 
        totalAutre++ ; 
        if (new Date(Doctorant.premiereInscription).getFullYear() === anneeActuelle) {
          anneActuelleAutre++;
        } else if (new Date(Doctorant.premiereInscription).getFullYear() === anneeActuelle - 1) {
          annePrecAutre++;
        }
      }
    
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

    // calcule de pourcentage
    const MAdvancement = ((anneActuelleM - annePrecM) / annePrecM) * 100;
    const FAdvancement = ((anneActuelleF - annePrecF) / annePrecF) * 100;
    
    const LMDAdvancement = ((anneActuelleLMD - annePrecLMD) / annePrecLMD) * 100;
    const classiqueAdvancement = ((anneActuelleClassique - annePrecClassique) / annePrecClassique) * 100;

    const LMCSAdvancement = ((anneActuelleLMCS - annePrecLMCS) / annePrecLMCS) * 100;
    const LCSIAdvancement = ((anneActuelleLCSI - annePrecLCSI) / annePrecLCSI) * 100;
    const AutreAdvancement = ((anneActuelleAutre - annePrecAutre) / annePrecAutre) * 100;

    // response
    // tell khaled to verifier si le advancement est non null
    res.json({ totalDoctorants: totalDoc , totalDirecteurs: totalEncad ,
                inscrit : inscrit , radie : radie , differe : differe , soutenu : soutenu ,
                nouveauInscrit: cpt, 

                totalM: totalM, Madvancement: MAdvancement,
                
                totalF: totalF, Fadvancement: FAdvancement,
        
                LMDtotal: totalLMD, LMDadvancement: LMDAdvancement,
                
                totalClassique: totalClassique, Classiqueadvancement: classiqueAdvancement,
        
                totalLMCS: totalLMCS, LMCSadvancement: LMCSAdvancement,
        
                totalLCSI: totalLCSI, LCSIAdvancement: LCSIAdvancement,
        
                totalAutre: totalAutre, AutreAdvancement: AutreAdvancement,
      });
  } catch (error) {
    res.send({status:400 , success:false , msg:error.message});
  }
  }

/* Calcule le nombre des doctorants inscrit chaque annee 
    (dans 10 dernieres annees)
    Graphe : page statistiques
    GET  */
const InscritParY = async (req, res) => {
  try {
    const doctorants = await Doctorant.find();
    const inscritsPerYear = {};
    const currentYear = new Date().getFullYear() - 10;

    doctorants.forEach((doctorant) => {
      const year = new Date(doctorant.premiereInscription).getFullYear();
      if (year >= currentYear) {
        if (!inscritsPerYear[year]) {
          inscritsPerYear[year] = 1;
        } else {
          inscritsPerYear[year]++;
        }
      }
    });
    for (const year in inscritsPerYear) {
      if (inscritsPerYear[year] === null) {
        delete inscritsPerYear[year];
      }
    }
    res.status(200).json(inscritsPerYear);
  } catch (error) {
    res.send({status: 400, success: false, msg: error.message});
  }
  };

/* Calcule le nombre des doctorants par encadrant comme : directeur && co-directeur 
    Table : page statistiques
    GET  */
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

/* Calcule le nombre de doctorant par la duree des doctorats
    Diagramme des batons : page statistiques
    GET  */
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

/* Calcule le nombre des doctorants par les filtres definies 
    Stat Multicriteres : page statistiques
    GET  */
  const filtre = async (req, res) => {
    try {
      const { sexe, status, date1, date2, laboratoire, dureeDoctorat: { min: minDuree, max: maxDuree }, option, typeDoctorat, typeDiplome } = req.body;
      
      const Doctorants = await Doctorant.find();
      
      let count = 0;
      let liste = [];
      let listeid = [];
  
      Doctorants.forEach((doctorant) => {
        const doctorantLaboratoire = doctorant.laboratoire === "LMCS" || doctorant.laboratoire === "LCSI" ? doctorant.laboratoire : "Autre";
        const doctorantOption = doctorant.option === "SI" || doctorant.option === "SIQ" ? doctorant.option : "Autre";
        
        let matched = true;

        if (sexe && sexe !== doctorant.sexe) { matched = false ; }
        if (status && status !== Status(doctorant).stat) { matched = false ; }
        if (date1 && date2) {
          let startDate = new Date(date1);
          let endDate = new Date(date2);
          if (endDate < startDate) { let temp = startDate; startDate = endDate; endDate = temp; }
          if (doctorant.premiereInscription < startDate || doctorant.premiereInscription > endDate) { matched = false ; }
        }
        if (minDuree && maxDuree) {
          if (maxDuree < minDuree) { let temp = minDuree; minDuree = maxDuree; maxDuree = temp; }
          if (doctorant.totalinscription < minDuree || doctorant.totalinscription > maxDuree) { matched = false ; }
        }
        if (laboratoire && laboratoire !== doctorantLaboratoire) { matched = false ; }
        if (option && option !== doctorantOption) { matched = false ; }
        if (typeDoctorat && typeDoctorat !== doctorant.typeDoctorat) { matched = false ; }
        if (typeDiplome && typeDiplome !== doctorant.typeDiplome) { matched = false ; }
        
        if (matched) {
          count++;
          liste.push(doctorant)
          listeid.push(doctorant._id)
        }
      });
      
      exporter(listeid)

      res.json({ count , liste });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

module.exports = { InscritParY , statistiques , DocsParEncad , totalInscriParDoc , filtre }