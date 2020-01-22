"use strict";

const logger = require('./logger');
const util = require('./util');
const names = require('./sts-element-names');

module.exports = stsToRe;

function stsToRe(stsObject) {
    var id = util.findElement(stsObject, [ names.objektType, names.uuidIdentifikator ]);
    if (!id) {
        logger.warn('unable to retrieve id from STS object: ', JSON.stringify(stsObject).substring(0, 100));
        return null;
    }
    var registrering = util.findElement(stsObject, names.registrering);
    var author = util.findElement(registrering, [ names.brugerRef, names.uuidIdentifikator ]);
    var tidspunkt = util.findElement(registrering, names.tidspunkt);
    var timestamp = util.stsTimetoIso(tidspunkt) || new Date().toISOString();

    var egenskaber = util.findElement(registrering, [ names.attributListe, names.egenskab ]);
    var gyldighedStatusKode = util.findElement(registrering, [
        names.tilstandListe, names.gyldighed, names.gyldighedStatusKode
    ]);
    var relationListe = util.findElement(registrering, names.relationListe);
    // Note, the virkning in egenskaber is the _only_ virkning we look at
    var virkning = util.findElement(egenskaber, names.virkning);
    var fraTidspunkt = util.findElement(virkning, [ names.fraTidspunkt, names.tidsstempelDatoTid ]);
    var activeFrom = util.stsTimetoIso(fraTidspunkt);

    var snapshot = {};
    gyldighedStatusKode && (snapshot[names.gyldighedStatusKode] = gyldighedStatusKode);

    addGeneral(virkning, snapshot, registrering);
    addEgenskaber(egenskaber, snapshot);
    addRelations(relationListe, snapshot);
    return {
        id: id,
        author: author,
        from: activeFrom,
        snapshot: snapshot,
        registration: { timestamp: timestamp }
    };
}

function addGeneral(virkning, snapshot, registrering) {
    var fraTidspunkt = util.findElement(virkning, [ names.fraTidspunkt, names.tidsstempelDatoTid ]);
    var tilTidspunkt = util.findElement(virkning, [ names.tilTidspunkt, names.tidsstempelDatoTid ]);
    var activeFrom = util.stsTimetoIso(fraTidspunkt);
    var activeTo = util.stsTimetoIso(tilTidspunkt);
    snapshot.RegistreringNoteTekst = util.findElement(registrering, names.noteTekst);
    snapshot.VirkningNoteTekst = util.findElement(virkning, names.noteTekst);
    snapshot[names.livscyklusKode] = util.findElement(registrering, names.livscyklusKode);
    snapshot[names.aktoerRef] = util.findElement(virkning, [ names.aktoerRef, names.uuidIdentifikator ]);
    snapshot[names.aktoerTypeKode] = util.findElement(virkning, names.aktoerTypeKode);
    snapshot.activeFrom = activeFrom;
    if (activeTo) {
        snapshot.activeTo = activeTo;
    }
}

function addEgenskaber(egenskaber, snapshot) {
    var ignorePattern = new RegExp(names.virkning);
    var namePattern = /AdresseTekst$|NavnTekst$/;
    Object.keys(egenskaber).forEach(function(key) {
        if (ignorePattern.test(key)) {
            return;
        }
        var value = (egenskaber[key] || [])[0];
        if (namePattern.test(key)) {
            snapshot.name = value;
        }
        var targetKey = (key.match(/[^:]+$/) || [])[0];
        if (targetKey) {
            snapshot[targetKey] = value;
        }
    });
}

function addRelations(relations, snapshot) {
    console.log('relations', relations);
}
