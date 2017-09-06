"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const HttpClient_1 = require("typed-rest-client/HttpClient");
class SitecoreItem {
    constructor() {
        this.id = "";
        this.name = "";
        this.displayName = "";
        this.database = "";
        this.icon16x16 = "";
        this.icon32x32 = "";
        this.path = "";
        this.templateId = "";
        this.templateName = "";
        this.childCount = 0;
    }
}
exports.SitecoreItem = SitecoreItem;
class SitecoreConnection {
    constructor(host, userName, password) {
        this.host = host;
        this.userName = userName;
        this.password = password;
    }
    connect() {
        return new Promise((c, e) => {
            const client = new HttpClient_1.HttpClient('');
            c(client);
        });
    }
    get roots() {
        return this.connect().then(client => new Promise((completed, error) => {
            client.get(this.host + '/sitecore/get/master?username=' + this.userName + '&password=' + this.password).then(response => {
                response.readBody().then(body => {
                    const data = JSON.parse(body);
                    completed([data.root]);
                });
            });
        }));
    }
    getChildren(item) {
        return this.connect().then(client => new Promise((completed, error) => {
            client.get(this.host + '/sitecore/get/item/' + item.database + '/' + item.id + '?username=' + this.userName + '&password=' + this.password + '&children=1').then(response => {
                response.readBody().then(body => {
                    const data = JSON.parse(body);
                    completed(data.children);
                });
            });
        }));
    }
}
exports.SitecoreConnection = SitecoreConnection;
class SitecoreTreeDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    getTreeItem(item) {
        return {
            label: item.name,
            collapsibleState: item.childCount > 0 ? vscode_1.TreeItemCollapsibleState.Collapsed : void 0
        };
    }
    getChildren(element) {
        if (!element) {
            if (!this.connection) {
                this.connection = new SitecoreConnection('http://pathfinder', 'sitecore\\admin', 'b');
            }
            return this.connection.roots;
        }
        return this.connection.getChildren(element);
    }
}
exports.SitecoreTreeDataProvider = SitecoreTreeDataProvider;
//# sourceMappingURL=SitecoreExplorer.js.map