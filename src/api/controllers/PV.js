var PV = require('../models/PV');
const exceljs = require('exceljs');

const PVDBXL = async ( req , res ) => {
    try {

        const PVs = await PV.find();


        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('PVs');
        worksheet.columns = [
            {header: '_id', key: '_id', width: 10},
            {header: 'code', key: 'code', width: 10},
            {header: 'url', key: 'url', width: 10},
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

module.exports = { PVDBXL }