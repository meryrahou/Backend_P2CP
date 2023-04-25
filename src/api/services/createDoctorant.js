const Doctorant = require('../models/Doctorant');

const createDoctorant = (doctorant) => {
    return Doctorant.create(doctorant).then((docDoctorant) => {
        console.log("\n>> Created Doctorant:\n", docDoctorant);
        return docDoctorant;
    })
}

module.exports = createDoctorant;