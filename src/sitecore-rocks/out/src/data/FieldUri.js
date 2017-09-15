"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseUri_1 = require("./DatabaseUri");
const helpers_1 = require("./helpers");
const ItemUri_1 = require("./ItemUri");
const ItemVersionUri_1 = require("./ItemVersionUri");
const WebsiteUri_1 = require("./WebsiteUri");
class FieldUri {
    constructor(itemVersionUri, fieldId) {
        this.itemVersionUri = itemVersionUri;
        this.fieldId = fieldId;
    }
    static create(itemVersionUri, fieldId) {
        const key = itemVersionUri.toString() + "/" + fieldId;
        let fieldUri = FieldUri.cache[key];
        if (!fieldUri) {
            fieldUri = new FieldUri(itemVersionUri, fieldId);
            FieldUri.cache[key] = fieldUri;
        }
        return fieldUri;
    }
    static clearCache() {
        FieldUri.cache = {};
    }
    static parse(s) {
        if (s instanceof FieldUri) {
            return s;
        }
        if (helpers_1.isString(s)) {
            const n = s.lastIndexOf("/");
            if (n < 0) {
                throw new Error("Invalid FieldUri: " + s);
            }
            const itemVersionUri = s.substr(0, n);
            const fieldId = s.substr(n + 1);
            return FieldUri.create(ItemVersionUri_1.ItemVersionUri.parse(itemVersionUri), fieldId);
        }
        if (s.host && s.databaseName && s.id && s.language && s.version && s.fieldId) {
            return FieldUri.create(ItemVersionUri_1.ItemVersionUri.create(ItemUri_1.ItemUri.create(DatabaseUri_1.DatabaseUri.create(WebsiteUri_1.WebsiteUri.create(s.host), s.databaseName), s.id), s.language, s.version), s.fieldId);
        }
        throw new Error("Invalid FieldUri: " + s);
    }
    get databaseUri() {
        return this.itemVersionUri.databaseUri;
    }
    get itemUri() {
        return this.itemVersionUri.itemUri;
    }
    equals(fieldUri) {
        return this.itemVersionUri.equals(fieldUri.itemVersionUri) && fieldUri.fieldId === this.fieldId;
    }
    toString() {
        return this.itemVersionUri.toString() + "/" + this.fieldId;
    }
}
FieldUri.empty = new FieldUri(ItemVersionUri_1.ItemVersionUri.empty, "{00000000-0000-0000-0000-000000000000}");
FieldUri.cache = {};
exports.FieldUri = FieldUri;
function isFieldUri(a) {
    return a instanceof FieldUri;
}
exports.isFieldUri = isFieldUri;
//# sourceMappingURL=FieldUri.js.map