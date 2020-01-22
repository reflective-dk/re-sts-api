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
    var namePattern = /AdresseTekst$|Navn$|NavnTekst$/;
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
    relations = relations || [];
    Object.keys(relations).forEach(function(key) {
        var targetKey = (key.match(/[^:]+$/) || [])[0];
        switch (true) {
        case /Adresser$/.test(key):
            // Note: Adresser is the only relation in Organisation that uses the
            // role/index mechanism from SagDokument/Ydelse
            var adresser = snapshot.Adresser = {};
            var adresseRoller = snapshot.AdresseRoller = {};
            var adresseTyper = snapshot.AdresseTyper = {};
            (relations[key] || []).forEach(function(relation) {
                var index = util.findElement(relation, names.indeks);
                var ref = util.findElement(relation, [ names.referenceId, names.uuidIdentifikator ]);
                adresser[index] = ref ? { id: ref } : null;
                adresseRoller[index] = util.findElement(relation, [ names.rolle, names.uuidIdentifikator ]);
                adresseTyper[index] = util.findElement(relation, [ names.type, names.uuidIdentifikator ]);
            });
            return;
        case /Branche$/.test(key):
        case /Enhedstype$/.test(key):
        case /Funktionstype$/.test(key):
        case /Interessefaellesskabstype$/.test(key):
        case /Myndighed$/.test(key):
        case /Myndighedstype$/.test(key):
        case /Organisationstype$/.test(key):
        case /Overordnet$/.test(key):
        case /Produktionsenhed$/.test(key):
        case /Skatteenhed$/.test(key):
        case /Tilhoerer$/.test(key):
        case /Virksomhed$/.test(key):
        case /Virksomhedstype$/.test(key):
            // Single-relations
            (relations[key] || []).forEach(function(relation) {
                var ref = util.findElement(relation, [ names.referenceId, names.uuidIdentifikator ]);
                snapshot[targetKey] = ref ? { id: ref } : null;
            });
            return;
        case /Ansatte$/.test(key):
        case /Opgaver$/.test(key):
        case /BrugerTyper$/.test(key):
        case /SystemTyper$/.test(key):
        case /TilknyttedeBrugere$/.test(key):
        case /TilknyttedeEnheder$/.test(key):
        case /TilknyttedeFunktioner$/.test(key):
        case /TilknyttedeInteressefaellesskaber$/.test(key):
        case /TilknyttedeItSystemer$/.test(key):
        case /TilknyttedeOrganisationer$/.test(key):
        case /TilknyttedePersoner$/.test(key):
        case /Tilknyttede$/.test(key):
            // Many-relations
            var collection = snapshot[targetKey] = {};
            (relations[key] || []).forEach(function(relation) {
                var ref = util.findElement(relation, [ names.referenceId, names.uuidIdentifikator ]);
                if (ref) {
                    collection[ref] = { id: ref };
                }
            });
            return;
        default:
        }
    });
}
