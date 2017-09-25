"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const SitecoreConnection_1 = require("./SitecoreConnection");
class WebsiteUri {
    constructor(connection) {
        this.connection = connection;
    }
    static create(host) {
        let websiteUri = WebsiteUri.cache[host];
        if (!websiteUri) {
            const connection = SitecoreConnection_1.SitecoreConnection.get(host);
            if (!connection) {
                throw new Error("Unknown connection: " + host);
            }
            websiteUri = new WebsiteUri(connection);
            WebsiteUri.cache[connection.host] = websiteUri;
        }
        return websiteUri;
    }
    static createFromConnection(connection) {
        let websiteUri = WebsiteUri.cache[connection.host];
        if (!websiteUri) {
            websiteUri = new WebsiteUri(connection);
            WebsiteUri.cache[connection.host] = websiteUri;
        }
        return websiteUri;
    }
    static clearCache() {
        WebsiteUri.cache = {};
    }
    static parse(s) {
        if (s instanceof WebsiteUri) {
            return s;
        }
        if (helpers_1.isString(s)) {
            return WebsiteUri.create(s);
        }
        if (s.host) {
            return WebsiteUri.create(s.host);
        }
        throw new Error("Invalid WebsiteUri: " + s);
    }
    equals(websiteUri) {
        return websiteUri.connection === this.connection;
    }
    toString() {
        return this.connection.host;
    }
}
WebsiteUri.empty = new WebsiteUri(SitecoreConnection_1.SitecoreConnection.empty);
WebsiteUri.cache = {};
exports.WebsiteUri = WebsiteUri;
function isWebsiteUri(a) {
    return a instanceof WebsiteUri;
}
exports.isWebsiteUri = isWebsiteUri;
//# sourceMappingURL=WebsiteUri.js.map