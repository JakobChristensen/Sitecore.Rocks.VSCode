"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const WebsiteUri_1 = require("./WebsiteUri");
class DatabaseUri {
    constructor(websiteUri, databaseName) {
        this.websiteUri = websiteUri;
        this.databaseName = databaseName;
    }
    static create(websiteUri, databaseName) {
        const key = websiteUri.toString() + '/' + databaseName;
        let databaseUri = DatabaseUri.cache[key];
        if (!databaseUri) {
            databaseUri = new DatabaseUri(websiteUri, databaseName);
            DatabaseUri.cache[databaseName] = databaseUri;
        }
        return databaseUri;
    }
    static clearCache() {
        DatabaseUri.cache = {};
    }
    static parse(s) {
        if (s instanceof DatabaseUri) {
            return s;
        }
        if (helpers_1.isString(s)) {
            const n = s.lastIndexOf('/');
            if (n < 0) {
                throw 'Invalid DatabaseUri: ' + s;
            }
            const host = s.substr(0, n);
            const databaseName = s.substr(n + 1);
            return DatabaseUri.create(WebsiteUri_1.WebsiteUri.create(host), databaseName);
        }
        if (s.databaseName) {
            return DatabaseUri.create(WebsiteUri_1.WebsiteUri.create(s.host), s.databaseName);
        }
        throw 'Invalid DatabaseUri: ' + s;
    }
    equals(databaseUri) {
        return databaseUri.databaseName === this.databaseName;
    }
    toString() {
        return this.websiteUri.toString() + '/' + this.databaseName;
    }
}
DatabaseUri.cache = {};
DatabaseUri.empty = new DatabaseUri(WebsiteUri_1.WebsiteUri.empty, '');
exports.DatabaseUri = DatabaseUri;
function isDatabaseUri(a) {
    return a instanceof DatabaseUri;
}
exports.isDatabaseUri = isDatabaseUri;
//# sourceMappingURL=DatabaseUri.js.map