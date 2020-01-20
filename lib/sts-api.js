"use strict";

const Promise = require('bluebird');
const _ = require('lodash');
const parseXml = require('xml2js').parseStringPromise;
const defaultRequestPromiseLib = require('request-promise');

const logger = require('./logger');
const stsConstants = require('./sts-constants');
const util = require('./util');

const defaultPaths = {
    address: 'Organisation/Adresse',
    authority: 'Organisation/Myndighed',
    business: 'Organisation/Virksomhed',
    interestGroup: 'Organisation/Interessefaellesskab',
    itSystem: 'Organisation/ItSystem',
    organization: 'Organisation/Organisation',
    orgFunction: 'Organisation/OrganisationFunktion',
    orgUnit: 'Organisation/OrganisationEnhed',
    person: 'Organisation/Person',
    user: 'Organisation/Bruger'
};

module.exports = StsApi;

function StsApi(options) {
    options = options || {};
    if (!options.stsHost) {
        throw new Error('STS host not supplied');
    }
    this.stsHost = options.stsHost;
    this.paths = options.paths || defaultPaths;
    this.request = options.request || defaultRequestPromiseLib;
}

/* API */

/* Reads the latest snapshot for each of the supplied object ids. The result is
 * returned as a map of { id => object } */
StsApi.prototype.readAddresses = function(ids) {
    return readObjects(ids, 'address', this);
};

/* Reads the latest snapshot for each of the supplied object ids. The result is
 * returned as a map of { id => object } */
StsApi.prototype.readAuthorities = function(ids) {
    return readObjects(ids, 'authority', this);
};

/* Reads the latest snapshot for each of the supplied object ids. The result is
 * returned as a map of { id => object } */
StsApi.prototype.readBusinesses = function(ids) {
    return readObjects(ids, 'business', this);
};

/* Reads the latest snapshot for each of the supplied object ids. The result is
 * returned as a map of { id => object } */
StsApi.prototype.readInterestGroups = function(ids) {
    return readObjects(ids, 'interestGroup', this);
};

/* Reads the latest snapshot for each of the supplied object ids. The result is
 * returned as a map of { id => object } */
StsApi.prototype.readITSystems = function(ids) {
    return readObjects(ids, 'itSystem', this);
};

/* Reads the latest snapshot for each of the supplied object ids. The result is
 * returned as a map of { id => object } */
StsApi.prototype.readOrganizations = function(ids) {
    return readObjects(ids, 'organization', this);
};

/* Reads the latest snapshot for each of the supplied object ids. The result is
 * returned as a map of { id => object } */
StsApi.prototype.readOrgFunctions = function(ids) {
    return readObjects(ids, 'orgFunction', this);
};

/* Reads the latest snapshot for each of the supplied object ids. The result is
 * returned as a map of { id => object } */
StsApi.prototype.readOrgUnits = function(ids) {
    return readObjects(ids, 'orgUnit', this);
};

/* Reads the latest snapshot for each of the supplied object ids. The result is
 * returned as a map of { id => object } */
StsApi.prototype.readPeople = function(ids) {
    return readObjects(ids, 'person', this);
};

/* Reads the latest snapshot for each of the supplied object ids. The result is
 * returned as a map of { id => object } */
StsApi.prototype.readUsers = function(ids) {
    return readObjects(ids, 'user', this);
};

/* IMPLEMENTATION */

function readObjects(objectIds, objectType, stsApi) {
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
    return stsOpList(objectIds, objectType, stsApi)
    .then(function(stsObjects) {
        if (logger.debug()) {
            logger.debug('found ' + stsObjects.length + ' STS objects');
        }
        return _.keyBy(stsObjects.map(util.stsToReObject), 'id');
    });
}

function stsOpList(objectIds, objectType, stsApi) {
    var path = stsApi.paths[objectType];
    if (!path) {
        throw new Error('path not found for object type: ' + objectType);
    }
    return stsApi.request({
        method: 'post',
        uri: stsApi.stsHost + '/' + path,
        headers: {},
        body: JSON.stringify(objectIds)
    })
    .then(parseXml)
    .then(function(result) {
        var output = result['adresse:ListOutput'];
        var status = _.get(output, [ 'sd:StandardRetur', 'sd:StatusKode' ]);
        var message = _.get(output, [ 'sd:StandardRetur', 'sd:FejlbeskedTekst' ]);
        if (status) {
            return Promise.reject('StatusKode: ' + status + ', message: ' + message);
        }
        var snapshotKey = Object.keys(output).filter(k => /FiltreretOejebliksbillede$/.exec(k));
        return output[snapshotKey];
    });
}
