"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseUri_1 = require("./DatabaseUri");
const helpers_1 = require("./helpers");
const WebsiteUri_1 = require("./WebsiteUri");
class ItemUri {
    constructor(databaseUri, id) {
        this.databaseUri = databaseUri;
        this.id = id;
    }
    static create(databaseUri, id) {
        const key = databaseUri.toString() + "/" + id;
        let itemUri = ItemUri.cache[key];
        if (!itemUri) {
            itemUri = new ItemUri(databaseUri, id);
            ItemUri.cache[key] = itemUri;
        }
        return itemUri;
    }
    static clearCache() {
        ItemUri.cache = {};
    }
    static parse(s) {
        if (s instanceof ItemUri) {
            return s;
        }
        if (helpers_1.isString(s)) {
            const n = s.lastIndexOf("/");
            if (n < 0) {
                throw new Error("Invalid ItemUri: " + s);
            }
            const databaseUri = s.substr(0, n);
            const id = s.substr(n + 1);
            return ItemUri.create(DatabaseUri_1.DatabaseUri.parse(databaseUri), id);
        }
        if (s.host && s.databaseName && s.id) {
            return ItemUri.create(DatabaseUri_1.DatabaseUri.create(WebsiteUri_1.WebsiteUri.create(s.host), s.databaseName), s.id);
        }
        throw new Error("Invalid ItemUri: " + s);
    }
    get websiteUri() {
        return this.databaseUri.websiteUri;
    }
    equals(itemUri) {
        return this.databaseUri.equals(itemUri.databaseUri) && itemUri.id === this.id;
    }
    toString() {
        return this.databaseUri.toString() + "/" + this.id;
    }
}
ItemUri.empty = new ItemUri(DatabaseUri_1.DatabaseUri.empty, "{00000000-0000-0000-0000-000000000000}");
ItemUri.cache = {};
exports.ItemUri = ItemUri;
function isItemUri(a) {
    return a instanceof ItemUri;
}
exports.isItemUri = isItemUri;
//# sourceMappingURL=ItemUri.js.map