"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debouncedFunctions = {};
function debounce(func, delay = 400) {
    const a = func;
    if (debouncedFunctions[a]) {
        clearTimeout(debouncedFunctions[a]);
        delete debouncedFunctions[a];
    }
    debouncedFunctions[a] = setTimeout(() => {
        delete debouncedFunctions[a];
        func();
    }, delay);
}
exports.debounce = debounce;
function isNumber(n) {
    return typeof n === "number";
}
exports.isNumber = isNumber;
function isString(s) {
    return typeof s === "string";
}
exports.isString = isString;
function deepEqual(x, y) {
    if ((typeof x === "object" && x != null) && (typeof y === "object" && y != null)) {
        if (Object.keys(x).length !== Object.keys(y).length) {
            return false;
        }
        for (const prop in x) {
            if (y.hasOwnProperty(prop)) {
                if (!deepEqual(x[prop], y[prop])) {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        return true;
    }
    else if (x !== y) {
        return false;
    }
    return true;
}
exports.deepEqual = deepEqual;
//# sourceMappingURL=helpers.js.map