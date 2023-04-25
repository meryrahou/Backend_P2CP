const addEncadrantToDoctorant = (doctorantId, Encadrant) => {
    return db.Doctorant.findByIdAndUpdate(
        doctorantId,
        { $push: { directeurPrincipal: Encadrant._id } },
        { new: true, useFindAndModify: false }
    );
}

module.exports = addEncadrantToDoctorant;