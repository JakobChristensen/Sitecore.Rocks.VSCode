"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpClient_1 = require("typed-rest-client/HttpClient");
const vscode = require("vscode");
const SitecoreItem_1 = require("../sitecore/SitecoreItem");
class SitecoreConnection {
    constructor(host, userName, password) {
        this.host = host;
        this.userName = userName;
        this.password = password;
        this.client = new HttpClient_1.HttpClient("");
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
    addItem(databaseUri, path, templateId, name) {
        return new Promise((completed, error) => this.client.get(this.getUrl("/sitecore/put/item/" + databaseUri.databaseName + path + "/" + name + "?template=" + encodeURIComponent(templateId))).then(response => {
            response.readBody().then(body => {
                const data = JSON.parse(body);
                completed(new SitecoreItem_1.SitecoreItem(data.item, this.host));
            });
        }));
    }
    deleteItem(itemUri) {
        return new Promise((completed, error) => this.client.get(this.getUrl("/sitecore/delete/items/" + itemUri.databaseUri.databaseName + "/" + itemUri.id)).then(response => {
            response.readBody().then(body => {
                completed();
            });
        }));
    }
    getChildren(itemUri) {
        return new Promise((completed, error) => this.client.get(this.getUrl("/sitecore/get/item/" + itemUri.databaseUri.databaseName + "/" + itemUri.id + "?children=1")).then(response => {
            response.readBody().then(body => {
                const data = JSON.parse(body);
                const children = data.children;
                const items = children.map(d => new SitecoreItem_1.SitecoreItem(d, this.host));
                completed(items);
            });
        }));
    }
    getDatabases(websiteUri) {
        return new Promise((completed, error) => this.client.get(this.getUrl("/sitecore/get/databases")).then(response => {
            response.readBody().then(body => {
                const data = JSON.parse(body);
                completed(data.databases);
            }).catch(reason => this.handleError(reason, error));
        }).catch(reason => this.handleError(reason, error)));
    }
    getItem(itemUri) {
        return new Promise((completed, error) => this.client.get(this.getUrl("/sitecore/get/item/" + itemUri.databaseUri.databaseName + "/" + itemUri.id + "?fields=*&fieldinfo=true")).then(response => {
            response.readBody().then(body => {
                const data = JSON.parse(body);
                completed(new SitecoreItem_1.SitecoreItem(data, this.host));
            });
        }));
    }
    getRoots(databaseUri) {
        return new Promise((completed, error) => this.client.get(this.getUrl("/sitecore/get/" + databaseUri.databaseName)).then(response => {
            response.readBody().then(body => {
                const data = JSON.parse(body);
                const children = data.roots;
                const items = children.map(d => new SitecoreItem_1.SitecoreItem(d, this.host));
                completed(items);
            });
        }));
    }
    getTemplates(databaseUri) {
        return new Promise((completed, error) => this.client.get(this.getUrl("/sitecore/get/templates/" + databaseUri.databaseName)).then(response => {
            response.readBody().then(body => {
                const data = JSON.parse(body);
                const templates = data.templates;
                const items = templates.map(d => new SitecoreItem_1.SitecoreItem(d, this.host));
                completed(items);
            });
        }));
    }
    saveItems(items) {
        let data = "";
        let databaseName = "";
        for (const item of items) {
            for (const field of item.fields) {
                if (field.value !== field.originalValue) {
                    data += (data.length > 0 ? "&" : "") + field.uri + "=" + encodeURIComponent(field.value);
                    databaseName = item.database;
                }
            }
        }
        if (!databaseName) {
            return;
        }
        const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
        };
        return new Promise((completed, error) => this.client.post(this.getUrl("/sitecore/put/items/" + databaseName), data, headers).then(response => {
            response.readBody().then(body => {
                for (const item of items) {
                    item.saved();
                }
                completed();
            });
        }));
    }
    getUrl(url) {
        return this.host + url + (url.indexOf("?") < 0 ? "?" : "&") + "username=" + encodeURIComponent(this.userName) + "&password=" + encodeURIComponent(this.password);
    }
    handleError(reason, error) {
        vscode.window.showErrorMessage("Failed to connect to Sitecore website - is the Sitecore.ContentDelivery.zip package installed?", "Download package").then((button) => {
            if (button === "Download package") {
                vscode.commands.executeCommand("vscode.open", vscode.Uri.parse("https://ci.appveyor.com/project/JakobChristensen/sitecore-contentdelivery/build/artifacts"));
            }
        });
        error();
    }
}
SitecoreConnection.empty = new SitecoreConnection("", "", "");
SitecoreConnection.cache = {};
exports.SitecoreConnection = SitecoreConnection;
//# sourceMappingURL=SitecoreConnection.js.map