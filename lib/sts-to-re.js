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
    var registreringNoteTekst = util.findElement(registrering, names.noteTekst);
    var timestamp = util.stsTimetoIso(tidspunkt);
    var livscyklusKode = util.findElement(registrering, names.livscyklusKode);

    var egenskaber = util.findElement(registrering, [ names.attributListe, names.egenskab ]);
    var gyldighed = util.findElement(registrering, [ names.tilstandListe, names.gyldighedStatusKode ]);
    var relationListe = util.findElement(registrering, names.relationListe);

    // Note, the virkning in egenskaber is the _only_ virkning we look at
    var virkning = util.findElement(egenskaber, names.virkning);
    var virkningNoteTekst = util.findElement(virkning, names.noteTekst);
    var fraTidspunkt = util.findElement(virkning, [ names.fraTidspunkt, names.tidsstempelDatoTid ]);
    var tilTidspunkt = util.findElement(virkning, [ names.tilTidspunkt, names.tidsstempelDatoTid ]);
    var aktoerRef = util.findElement(virkning, [ names.aktoerRef, names.uuidIdentifikator ]);
    var aktoerTypeKode = util.findElement(virkning, names.aktoerTypeKode);
    var activeFrom = util.stsTimetoIso(fraTidspunkt);
    var activeTo = util.stsTimetoIso(tilTidspunkt);

    var brugervendtNoegleTekst = util.findElement(egenskaber, names.brugervendtNoegleTekst);

    console.log(id, registrering, virkning, egenskaber);
    var snapshot = {
        RegistreringNoteTekst: registreringNoteTekst,
        LivscyklusKode: livscyklusKode,
        VirkningNoteTekst: virkningNoteTekst,
        AktoerRef: aktoerRef,
        AktoerTypeKode: aktoerTypeKode,
        activeFrom: activeFrom,
        activeTo: activeTo,
        BrugervendtNoegleTekst: brugervendtNoegleTekst
    };
    Object.keys(stsObject).forEach(function(stsKey) {
        console.log('key', stsKey);
    });
    return {
        id: id,
        author: author,
        from: activeFrom,
        snapshot: snapshot,
        registration: { timestamp: timestamp }
    };
}
