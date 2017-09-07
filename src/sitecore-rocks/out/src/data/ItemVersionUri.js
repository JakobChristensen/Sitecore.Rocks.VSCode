"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const DatabaseUri_1 = require("./DatabaseUri");
const ItemUri_1 = require("./ItemUri");
const WebsiteUri_1 = require("./WebsiteUri");
class ItemVersionUri {
    constructor(itemUri, language, version) {
        this.itemUri = itemUri;
        this.language = language;
        this.version = version;
    }
    static create(itemUri, language, version) {
        const key = itemUri.toString() + '/' + language + '/' + version;
        let itemVersionUri = ItemVersionUri.cache[key];
        if (!itemVersionUri) {
            itemVersionUri = new ItemVersionUri(itemUri, language, version);
            ItemVersionUri.cache[key] = itemVersionUri;
        }
        return itemVersionUri;
    }
    static clearCache() {
        ItemVersionUri.cache = {};
    }
    static parse(s) {
        if (s instanceof ItemVersionUri) {
            return s;
        }
        if (helpers_1.isString(s)) {
            const n = s.lastIndexOf('/');
            const o = s.lastIndexOf('/', n - 1);
            if (n < 0 || o < 0) {
                throw 'Invalid ItemVersionUri: ' + s;
            }
            const itemUri = s.substr(0, o);
            const language = s.substring(o + 1, n);
            const version = s.substring(n + 1);
            return ItemVersionUri.create(ItemUri_1.ItemUri.parse(itemUri), language, parseInt(version, 10));
        }
        if (s.host && s.databaseName && s.id && s.language && s.version) {
            return ItemVersionUri.create(ItemUri_1.ItemUri.create(DatabaseUri_1.DatabaseUri.create(WebsiteUri_1.WebsiteUri.create(s.host), s.databaseName), s.id), s.language, s.version);
        }
        console.log(new Error().stack);
        throw new Error('Invalid ItemVersionUri: ' + s);
    }
    get databaseUri() {
        return this.itemUri.databaseUri;
    }
    equals(itemVersionUri) {
        return this.itemUri.equals(itemVersionUri.itemUri) && itemVersionUri.language === this.language && itemVersionUri.version === this.version;
    }
    toString() {
        return this.itemUri.toString() + '/' + this.language + '/' + (this.version === -1 ? '-' : this.version);
    }
}
ItemVersionUri.cache = {};
ItemVersionUri.empty = new ItemVersionUri(ItemUri_1.ItemUri.empty, '', 0);
exports.ItemVersionUri = ItemVersionUri;
function isItemVersionUri(a) {
    return a instanceof ItemVersionUri;
}
exports.isItemVersionUri = isItemVersionUri;
//# sourceMappingURL=ItemVersionUri.js.map