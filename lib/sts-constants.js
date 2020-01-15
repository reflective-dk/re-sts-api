"use strict";

// TODO: Replace with correct uuids
module.exports = {
    addressTypeId: 'address-type-uuid',
    authorityTypeId: 'authority-type-uuid',
    businessTypeId: 'business-type-uuid',
    interestGroupTypeId: 'interestGroup-type-uuid',
    itSystemTypeId: 'it-system-type-uuid',
    organizationTypeId: 'organization-type-uuid',
    orgFunctionTypeId: 'org-function-type-uuid',
    orgUnitTypeId: 'org-unit-type-uuid',
    personTypeId: 'person-type-uuid',
    userTypeId: 'user-type-uuid',
    nameOfTypeId: function(id) {
        return Object.keys(module.exports)
            .reduce((name, key) => id === module.exports[key] ? key : name);
    }
};
