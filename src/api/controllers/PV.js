var PV = require('../models/PV');
const exceljs = require('exceljs');


/* table page PV 
    GET  */
const allPV = async ( req , res ) => {
    try {
        const PVs = await PV.find();
        res.json(PVs);
      } catch (error) {
        res.send({status:400 , success:false , msg:error.message});
      }
    }

/* ajout d'un PV
    POST  */
const ajouter = async ( req , res ) => {
    try {
        const { code , url , date , ordreDuJour } = req.body;
        const pv = await PV.findOne({ code , url , date , ordreDuJour });
    
        if (pv) {
          return res.status(409).json({ message: 'PV already exists' , PV: pv });
        }else {
          const newPV = new PV({ code, url, date , ordreDuJour });
          await newPV.save();
    
          res.status(201).json({ message: 'PV created successfully' , PV: newPV });
        } 
      } catch (error) {
        res.send({status:400 , success:false , msg:error.message});
      }
    }

/* function exporter tous les PV
    GET  */
const exporter = async ( req , res ) => {
    try {

        const PVs = await PV.find();

        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('PVs');
        worksheet.columns = [
            {header: '_id', key: '_id', width: 10},
            {header: 'code', key: 'code', width: 10},
            {header: 'url', key: 'url', width: 10},
            {header: 'ordreDuJour', key: 'ordreDuJour', width: 10},
            {header: 'date', key: 'date', width: 10},
        ];
        let count = 1;
        PVs.forEach( PV => {
            worksheet.addRow(PV);
            count += 1;
        });
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = {bold: true};
        });
        const data = await workbook.xlsx.writeFile('PVsData.xlsx')
        res.send('Base de donne exporter sous fichier: "PVsData.xlsx"');

    } catch (error) {
        res.send({status:400 , success:false , msg:error.message});
    }
    }

module.exports = { exporter , allPV , ajouter }