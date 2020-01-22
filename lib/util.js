"use strict";

module.exports = {
    findElement: findElement,
    findElementArray: findElementArray
};

function findElement(object, sfx) {
    if (Array.isArray(sfx)) {
        return sfx.reduce((current, sfx1) => findElement(current, sfx1), object);
    }
    return findElementArray(object, sfx)[0];
}

function findElementArray(object, sfx) {
    object = object || {};
    var foundKey = null;
    Object.keys(object).some(function(key) {
        return foundKey = (key.match('.+' + sfx + '$')||[])[0];
    });
    var elements = object[foundKey];
    return Array.isArray(elements) ? elements : elements ? [ elements ] : [];
}
