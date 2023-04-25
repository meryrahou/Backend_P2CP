const Encadrant = require('../models/Encadrant');

const createEncadrant = (encadrant) => {
    return db.Encadrant.create(encadrant).then(docEncadrant => {
        console.log("\n>> Created Encadrant:\n", docEncadrant);
        return docEncadrant;
    });
};

module.exports = createEncadrant;