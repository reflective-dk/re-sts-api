"use strict";

global.global_logger = { debug: arg => arg ? console.log(arg) : true };
var Promise = require('bluebird');
var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;

var Handlebars = require('handlebars');
var fs = require('fs');
var path = require('path');
var requireyml = require('require-yml');

var reflectiveTestDataDir = 'test-data/reflective';
var reflectiveSnapshots = requireyml(reflectiveTestDataDir);

var stsTestDataDir = 'test-data/sts';
var stsObjects = {};
fs.readdirSync(stsTestDataDir)
    .map(fn => fs.readFileSync(path.join(stsTestDataDir, fn), 'utf-8'))
    .forEach(function(xml) {
        var id = /<sd:UUIDIdentifikator>(.+)<\/sd:UUIDIdentifikator>/.exec(xml)[1];
        var registration = /<.+:Registrering>[\s\S]+<\/.+:Registrering>/.exec(xml)[0];
        stsObjects[id] = { id: id, registration: registration };
    });

var stsTestTemplateDir = 'xml-templates';
var templates = {};
fs.readdirSync(stsTestTemplateDir)
    .forEach(function(fn) {
        var template = fs.readFileSync(path.join(stsTestTemplateDir, fn), 'utf-8');
        templates[path.basename(fn, '.xml')] = template;
    });

var StsApi = require('../lib/sts-api');
var stsApi = new StsApi({
    stsHost: 'http://mock-sts-host',
    request: mockRequestPromiseLib()
});

describe('Read operations', function() {
    describe('readAddresses', function() {
        it('should return addresses', function(done) {
            expect(stsApi.readAddresses([
                'address-0', 'address-1', 'unknown-object'
            ]))
            .to.eventually.deep.equal({
                'address-0': reflectiveSnapshots['address-0'],
                'address-1': reflectiveSnapshots['address-1']
            })
            .notify(done);
        });
    });

    describe('readAuthorities', function() {
        it('should return authorities', function(done) {
            expect(stsApi.readAuthorities([
                'authority-0', 'authority-1', 'unknown-object'
            ]))
            .to.eventually.deep.equal({
                'authority-0': reflectiveSnapshots['authority-0'],
                'authority-1': reflectiveSnapshots['authority-1']
            })
            .notify(done);
        });
    });

    describe('readBusinesses', function() {
        it('should return businesses', function(done) {
            expect(stsApi.readBusinesses([
                'business-0', 'business-1', 'unknown-object'
            ]))
            .to.eventually.deep.equal({
                'business-0': reflectiveSnapshots['business-0'],
                'business-1': reflectiveSnapshots['business-1']
            })
            .notify(done);
        });
    });

    describe('readInterestGroups', function() {
        it('should return interest groups', function(done) {
            expect(stsApi.readInterestGroups([
                'interest-group-0', 'interest-group-1', 'unknown-object'
            ]))
            .to.eventually.deep.equal({
                'interest-group-0': reflectiveSnapshots['interest-group-0'],
                'interest-group-1': reflectiveSnapshots['interest-group-1']
            })
            .notify(done);
        });
    });

    describe('readITSystems', function() {
        it('should return IT systems', function(done) {
            expect(stsApi.readITSystems([
                'it-system-0', 'it-system-1', 'unknown-object'
            ]))
            .to.eventually.deep.equal({
                'it-system-0': reflectiveSnapshots['it-system-0'],
                'it-system-1': reflectiveSnapshots['it-system-1']
            })
            .notify(done);
        });
    });

    describe('readOrganizations', function() {
        it('should return organizations', function(done) {
            expect(stsApi.readOrganizations([
                'organization-0', 'organization-1', 'unknown-object'
            ]))
            .to.eventually.deep.equal({
                'organization-0': reflectiveSnapshots['organization-0'],
                'organization-1': reflectiveSnapshots['organization-1']
            })
            .notify(done);
        });
    });

    describe('readOrgFunctions', function() {
        it('should return org functions', function(done) {
            expect(stsApi.readOrgFunctions([
                'org-function-0', 'org-function-1', 'unknown-object'
            ]))
            .to.eventually.deep.equal({
                'org-function-0': reflectiveSnapshots['org-function-0'],
                'org-function-1': reflectiveSnapshots['org-function-1']
            })
            .notify(done);
        });
    });

    describe('readOrgUnits', function() {
        it('should return org units', function(done) {
            expect(stsApi.readOrgUnits([
                'org-unit-0', 'org-unit-1', 'unknown-object'
            ]))
            .to.eventually.deep.equal({
                'org-unit-0': reflectiveSnapshots['org-unit-0'],
                'org-unit-1': reflectiveSnapshots['org-unit-1']
            })
            .notify(done);
        });
    });

    describe('readPeople', function() {
        it('should return people', function(done) {
            expect(stsApi.readPeople([
                'person-0', 'person-1', 'unknown-object'
            ]))
            .to.eventually.deep.equal({
                'person-0': reflectiveSnapshots['person-0'],
                'person-1': reflectiveSnapshots['person-1']
            })
            .notify(done);
        });
    });

    describe('readUsers', function() {
        it('should return users', function(done) {
            expect(stsApi.readUsers([
                'user-0', 'user-1', 'unknown-object'
            ]))
            .to.eventually.deep.equal({
                'user-0': reflectiveSnapshots['user-0'],
                'user-1': reflectiveSnapshots['user-1']
            })
            .notify(done);
        });
    });

});

function mockRequestPromiseLib() {
    return function(options) {
        options = options || {};
        if ((options.method || '').toLowerCase() != 'post') {
            return Promise.reject('invalid method: ' + options.method);
        }
        var ids;
        try {
            ids = options.body ? JSON.parse(options.body) : [];
        } catch(e) {
            return Promise.reject(e);
        };
        var template = compileTemplate(options.uri);
        var objects = ids.map(id => stsObjects[id]).filter(o => o);
        return Promise.resolve(template(objects));
    };
}

function compileTemplate(uri) {
    return Handlebars.compile(templates[/[^/]+$/.exec(uri)[0] + 'ListOutput']);
}
