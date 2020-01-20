"use strict";

global.global_logger = { debug: arg => arg ? console.log(arg) : true };
var Promise = require('bluebird');
var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;

var fs = require('fs');
var path = require('path');
var stsTestDataDir = 'test-data/sts';
var stsTestTemplateDir = 'xml-templates';
var stsObjects = {};
fs.readdirSync(stsTestDataDir)
    .map(fn => fs.readFileSync(path.join(stsTestDataDir, fn), 'utf-8'))
    .forEach(function(xml) {
        var id = /<sd:UUIDIdentifikator>(.+)<\/sd:UUIDIdentifikator>/.exec(xml)[1];
        var registration = /<.+:Registrering>[\s\S]+<\/.+:Registrering>/.exec(xml)[0];
        stsObjects[id] = { id: id, registration: registration };
    });

var templates = {};
fs.readdirSync(stsTestTemplateDir)
    .forEach(function(fn) {
        var template = fs.readFileSync(path.join(stsTestTemplateDir, fn), 'utf-8');
        templates[path.basename(fn, '.xml')] = template;
    });

var StsApi = require('../lib/sts-api');
var stsApi = new StsApi({
    stsHost: 'http://mock-sts-host',
    request: mockRequestLib()
});

describe('Read operations', function() {
    describe('readAddresses', function() {
        it('should return addresses', function(done) {
            expect(stsApi.readAddresses([
                'address0', 'address1', 'unknown-object'
            ]))
            .to.eventually.deep.equal({
            })
            .notify(done);
        });
    });

    describe('readAuthorities', function() {
        it('should return authorities', function(done) {
            expect(stsApi.readAuthorities([
                'authority0', 'authority1', 'unknown-object'
            ]))
            .to.eventually.deep.equal({
            })
            .notify(done);
        });
    });

    describe('readBusinesses', function() {
        it('should return businesses', function(done) {
            expect(stsApi.readBusinesses([
                'business0', 'business1', 'unknown-object'
            ]))
            .to.eventually.deep.equal({
            })
            .notify(done);
        });
    });

    describe('readInterestGroups', function() {
        it('should return interest groups', function(done) {
            expect(stsApi.readInterestGroups([
                'intgroup0', 'intgroup1', 'unknown-object'
            ]))
            .to.eventually.deep.equal({
            })
            .notify(done);
        });
    });

    describe('readITSystems', function() {
        it('should return IT systems', function(done) {
            expect(stsApi.readITSystems([
                'itsystem0', 'itsystem1', 'unknown-object'
            ]))
            .to.eventually.deep.equal({
            })
            .notify(done);
        });
    });

    describe('readOrganizations', function() {
        it('should return organizations', function(done) {
            expect(stsApi.readOrganizations([
                'organization0', 'organization1', 'unknown-object'
            ]))
            .to.eventually.deep.equal({
            })
            .notify(done);
        });
    });

    describe('readOrgFunctions', function() {
        it('should return org functions', function(done) {
            expect(stsApi.readOrgFunctions([
                'orgfun0', 'orgfun1', 'unknown-object'
            ]))
            .to.eventually.deep.equal({
            })
            .notify(done);
        });
    });

    describe('readOrgUnits', function() {
        it('should return org units', function(done) {
            expect(stsApi.readOrgUnits([
                'orgunit0', 'orgunit1', 'unknown-object'
            ]))
            .to.eventually.deep.equal({
            })
            .notify(done);
        });
    });

    describe('readPeople', function() {
        it('should return people', function(done) {
            expect(stsApi.readPeople([
                'person0', 'person1', 'unknown-object'
            ]))
            .to.eventually.deep.equal({
            })
            .notify(done);
        });
    });

    describe('readUsers', function() {
        it('should return users', function(done) {
            expect(stsApi.readUsers([
                'user0', 'user1', 'unknown-object'
            ]))
            .to.eventually.deep.equal({
            })
            .notify(done);
        });
    });

});

function mockRequestLib() {
}
