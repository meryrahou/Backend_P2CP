
const addCoEncadrantToDoctorant = (doctorantId, Encadrant) => {
    return db.Doctorant.findByIdAndUpdate(
        doctorantId,
        { $push: { coDirecteur: Encadrant._id } },
        { new: true, useFindAndModify: false }
    );
}

module.exports = addCoEncadrantToDoctorant;