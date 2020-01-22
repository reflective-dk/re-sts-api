"use strict";

const moment = require('moment');
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
    var registreringNoteTekst = util.findElement(registrering, names.noteTekst);
    var timestamp = (tidspunkt ? moment(tidspunkt + 'Z') : moment()).toISOString();
    var livscyklusKode = util.findElement(registrering, names.livscyklusKode);

    var egenskaber = util.findElement(registrering, [ names.attributListe, names.egenskab ]);
    var gyldighed = util.findElement(registrering, [ names.tilstandListe, names.gyldighedStatusKode ]);
    var relationListe = util.findElement(registrering, names.relationListe);
    // Note, the virkning in egenskaber is the _only_ virkning we look at
    var virkning = util.findElement(egenskaber, names.virkning);
    var activeFrom = util.findElement(virkning, names.fraTidspunkt);
    var activeTo = util.findElement(virkning, names.tilTidspunkt);

    console.log(id, registrering, virkning, egenskaber);
    var snapshot = {
        RegistreringNoteTekst: registreringNoteTekst,
        LivscyklusKode: livscyklusKode
    };
    Object.keys(stsObject).forEach(function(stsKey) {
        console.log('key', stsKey);
    });
    return {
        id: id,
        author: author,
        snapshot: snapshot,
        registration: { timestamp: timestamp }
    };
}
