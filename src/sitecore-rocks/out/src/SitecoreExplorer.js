"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const SitecoreConnection_1 = require("./data/SitecoreConnection");
const ConnectionTreeViewItem_1 = require("./SitecoreExplorer/ConnectionTreeViewItem");
const vscode = require("vscode");
class SitecoreExplorerProvider {
    constructor(context) {
        this.context = context;
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.connections = new Array();
        this.loadConnections();
        if (this.connections.length === 0) {
            const connection = SitecoreConnection_1.SitecoreConnection.create('http://pathfinder', 'sitecore\\admin', 'b');
            this.connections.push(connection);
        }
    }
    getTreeItem(treeViewItem) {
        return treeViewItem.getTreeItem();
    }
    getChildren(treeViewItem) {
        if (!treeViewItem) {
            return this.connections.map(connection => new ConnectionTreeViewItem_1.ConnectionTreeViewItem(connection));
        }
        return treeViewItem.getChildren();
    }
    addConnection() {
        vscode.window.showInputBox({ prompt: 'Enter the host name of the website:', placeHolder: 'http://www.website.com' }).then(host => {
            vscode.window.showInputBox({ prompt: 'Username:', placeHolder: 'sitecore\\johndoe' }).then(userName => {
                vscode.window.showInputBox({ prompt: 'Password:', password: true }).then(password => {
                    const newConnection = SitecoreConnection_1.SitecoreConnection.create(host, userName, password);
                    this.connections.push(newConnection);
                    this.saveConnections();
                    this._onDidChangeTreeData.fire();
                });
            });
        });
    }
    removeConnection(connectionTreeViewItem) {
        var index = this.connections.indexOf(connectionTreeViewItem.connection);
        if (index < 0) {
            return;
        }
        this.connections.splice(index, 1);
        this.saveConnections();
        this._onDidChangeTreeData.fire();
    }
    saveConnections() {
        let json = new Array();
        for (let connection of this.connections) {
            json.push({ host: connection.host, userName: connection.userName, password: connection.password });
        }
        this.context.globalState.update('connections', json);
    }
    loadConnections() {
        this.connections = new Array();
        let json = this.context.globalState.get("connections");
        if (!json) {
            return;
        }
        for (let data of json) {
            const connection = SitecoreConnection_1.SitecoreConnection.create(data.host, data.userName, data.password);
            this.connections.push(connection);
        }
    }
}
exports.SitecoreExplorerProvider = SitecoreExplorerProvider;
//# sourceMappingURL=SitecoreExplorer.js.map