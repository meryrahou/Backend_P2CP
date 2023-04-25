const addLesEncadrantToDoctorant = (doctorantId, Encadrant, coEncadrant) => {
    return db.Doctorant.findByIdAndUpdate(
        doctorantId,
        { $push: { directeurPrincipal: Encadrant._id, coDirecteur: coEncadrant._id } },
        { new: true, useFindAndModify: false }
    );
}

module.exports = addLesEncadrantToDoctorant;