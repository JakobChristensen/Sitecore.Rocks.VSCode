"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const SitecoreConnection_1 = require("./data/SitecoreConnection");
const ConnectionTreeViewItem_1 = require("./SitecoreExplorer/ConnectionTreeViewItem");
const vscode = require("vscode");
const QuickPickSitecoreItem_1 = require("./UI/QuickPickSitecoreItem");
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
        vscode.window.showWarningMessage("Are you sure, you want to remove the connect?", "OK", "Cancel").then(response => {
            if (response != "OK") {
                return;
            }
            var index = this.connections.indexOf(connectionTreeViewItem.connection);
            if (index < 0) {
                return;
            }
            this.connections.splice(index, 1);
            this.saveConnections();
            this._onDidChangeTreeData.fire();
        });
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
    editItem(item) {
        let previewUri = vscode.Uri.parse('sitecore-item://' + item.itemUri.toString());
        return vscode.commands.executeCommand('vscode.previewHtml', previewUri, undefined, item.item.displayName).then((success) => { }, (reason) => vscode.window.showErrorMessage(reason));
    }
    saveItem(item) {
        let connection = SitecoreConnection_1.SitecoreConnection.get(item.host);
        connection.saveItems([item]);
    }
    addItem(parentItem) {
        parentItem.itemUri.websiteUri.connection.getTemplates(parentItem.itemUri.databaseUri).then(templates => {
            vscode.window.showQuickPick(templates.map(t => new QuickPickSitecoreItem_1.QuickPickSitecoreItem(t)), { placeHolder: 'Select template of the new item' }).then(templateItem => {
                vscode.window.showInputBox({ prompt: 'Enter the name of the new item:', placeHolder: 'http://www.website.com', value: templateItem.item.displayName }).then(newName => {
                    parentItem.itemUri.websiteUri.connection.addItem(parentItem.itemUri.databaseUri, parentItem.item.path, templateItem.item.id, newName).then(() => this._onDidChangeTreeData.fire(parentItem));
                });
            });
        });
    }
    deleteItem(itemTreeViewItem) {
        vscode.window.showWarningMessage(`Are you sure, you want to delete this '${itemTreeViewItem.item.displayName}'?`, "OK", "Cancel").then(response => {
            if (response != "OK") {
                return;
            }
            itemTreeViewItem.itemUri.websiteUri.connection.deleteItem(itemTreeViewItem.itemUri).then(() => this._onDidChangeTreeData.fire(itemTreeViewItem.parent));
        });
    }
}
exports.SitecoreExplorerProvider = SitecoreExplorerProvider;
//# sourceMappingURL=SitecoreExplorer.js.map