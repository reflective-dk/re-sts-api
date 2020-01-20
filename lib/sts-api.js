"use strict";

const Promise = require('bluebird');
const _ = require('lodash');
const defaultRequestLib = require('request');

const logger = require('./logger');
const stsConstants = require('./sts-constants');
const util = require('./util');

module.exports = StsApi;

function StsApi(options) {
    options = options || {};
    if (!options.stsHost) {
        throw new Error('STS host not supplied');
    }
    this.requestLib = options.request || defaultRequestLib;
}

/* API */

/* Reads the latest snapshot for each of the supplied object ids. The result is
 * returned as a map of { id => object } */
StsApi.prototype.readAddresses = function(ids) {
    return readObjects(ids, 'Organisation', 'Adresse', this);
};

/* Reads the latest snapshot for each of the supplied object ids. The result is
 * returned as a map of { id => object } */
StsApi.prototype.readAuthorities = function(ids) {
    return readObjects(ids, 'Organisation', 'Myndighed', this);
};

/* Reads the latest snapshot for each of the supplied object ids. The result is
 * returned as a map of { id => object } */
StsApi.prototype.readBusinesses = function(ids) {
    return readObjects(ids, 'Organisation', 'Virksomhed', this);
};

/* Reads the latest snapshot for each of the supplied object ids. The result is
 * returned as a map of { id => object } */
StsApi.prototype.readInterestGroups = function(ids) {
    return readObjects(ids, 'Organisation', 'Interessefaellesskab', this);
};

/* Reads the latest snapshot for each of the supplied object ids. The result is
 * returned as a map of { id => object } */
StsApi.prototype.readITSystems = function(ids) {
    return readObjects(ids, 'Organisation', 'ItSystem', this);
};

/* Reads the latest snapshot for each of the supplied object ids. The result is
 * returned as a map of { id => object } */
StsApi.prototype.readOrganizations = function(ids) {
    return readObjects(ids, 'Organisation', 'Organisation', this);
};

/* Reads the latest snapshot for each of the supplied object ids. The result is
 * returned as a map of { id => object } */
StsApi.prototype.readOrgFunctions = function(ids) {
    return readObjects(ids, 'Organisation', 'OrganisationFunktion', this);
};

/* Reads the latest snapshot for each of the supplied object ids. The result is
 * returned as a map of { id => object } */
StsApi.prototype.readOrgUnits = function(ids) {
    return readObjects(ids, 'Organisation', 'OrganisationEnhed', this);
};

/* Reads the latest snapshot for each of the supplied object ids. The result is
 * returned as a map of { id => object } */
StsApi.prototype.readPeople = function(ids) {
    return readObjects(ids, 'Organisation', 'Person', this);
};

/* Reads the latest snapshot for each of the supplied object ids. The result is
 * returned as a map of { id => object } */
StsApi.prototype.readUsers = function(ids) {
    return readObjects(ids, 'Organisation', 'Bruger', this);
};

/* IMPLEMENTATION */

function readObjects(objectIds, domain, objectType, stsApi) {
    objectIds = objectIds || [];
    if (!objectIds.length) {
        if (logger.debug()) {
            logger.debug('no object ids supplied, returning empty object map');
        }
        return Promise.resolve({});
    }
    if (logger.debug()) {
        logger.debug('about to read ' + objectIds.length + ' STS objects of type: ' + objectType);
    }
    return stsOpList(objectIds, domain, objectType, stsApi.requestLib)
        .then(function(stsObjects) {
            if (logger.debug()) {
                logger.debug('found ' + stsObjects.length + ' STS objects');
            }
            return _.keyBy(stsObjects.map(util.stsToReObject), 'id');
        });
}

function stsOpList(objectIds, domain, objectType, requestLibrary) {
    return Promise.resolve([]);
}
