"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpClient_1 = require("typed-rest-client/HttpClient");
const SitecoreItem_1 = require("../sitecore/SitecoreItem");
class SitecoreConnection {
    constructor(host, userName, password) {
        this.host = host;
        this.userName = userName;
        this.password = password;
    }
    static create(host, userName, password) {
        let connection = SitecoreConnection.cache[host];
        if (!connection) {
            connection = new SitecoreConnection(host, userName, password);
            SitecoreConnection.cache[host] = connection;
        }
        return connection;
    }
    static get(host) {
        return SitecoreConnection.cache[host];
    }
    static clearCache() {
        SitecoreConnection.cache = {};
    }
    connect() {
        return new Promise((c, e) => {
            const client = new HttpClient_1.HttpClient('');
            c(client);
        });
    }
    getRoot(databaseUri) {
        return this.connect().then(client => new Promise((completed, error) => {
            client.get(this.host + '/sitecore/get/' + databaseUri.databaseName + '?username=' + this.userName + '&password=' + this.password).then(response => {
                response.readBody().then(body => {
                    const data = JSON.parse(body);
                    completed([new SitecoreItem_1.SitecoreItem(data.root, this.host)]);
                });
            });
        }));
    }
    getChildren(itemUri) {
        return this.connect().then(client => new Promise((completed, error) => {
            client.get(this.host + '/sitecore/get/item/' + itemUri.databaseUri.databaseName + '/' + itemUri.id + '?username=' + this.userName + '&password=' + this.password + '&children=1').then(response => {
                response.readBody().then(body => {
                    const data = JSON.parse(body);
                    const children = data.children;
                    const items = children.map(d => new SitecoreItem_1.SitecoreItem(d, this.host));
                    completed(items);
                });
            });
        }));
    }
    getItem(itemUri) {
        return this.connect().then(client => new Promise((completed, error) => {
            client.get(this.host + '/sitecore/get/item/' + itemUri.databaseUri.databaseName + '/' + itemUri.id + '?username=' + this.userName + '&password=' + this.password + "&fields=*&fieldinfo=true").then(response => {
                response.readBody().then(body => {
                    const data = JSON.parse(body);
                    completed(new SitecoreItem_1.SitecoreItem(data, this.host));
                });
            });
        }));
    }
    saveItems(items) {
        let data = "";
        let databaseName = "";
        for (let item of items) {
            for (let field of item.fields) {
                if (field.value !== field.originalValue) {
                    if (data.length > 0) {
                        data += "&";
                    }
                    data += field.uri + "=" + encodeURIComponent(field.value);
                    databaseName = item.database;
                }
            }
        }
        if (!databaseName) {
            return;
        }
        return this.connect().then(client => new Promise((completed, error) => {
            client.post(this.host + '/sitecore/put/items/' + databaseName + '?username=' + this.userName + '&password=' + this.password, data).then(response => {
                response.readBody().then(body => {
                    const data = JSON.parse(body);
                    for (let item of items) {
                        item.saved();
                    }
                    completed();
                });
            });
        }));
    }
}
SitecoreConnection.cache = {};
SitecoreConnection.empty = new SitecoreConnection('', '', '');
exports.SitecoreConnection = SitecoreConnection;
//# sourceMappingURL=SitecoreConnection.js.map