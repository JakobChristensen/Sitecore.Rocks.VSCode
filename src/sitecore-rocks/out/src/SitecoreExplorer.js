"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const vscode = require("vscode");
const ItemUri_1 = require("./data/ItemUri");
const SitecoreConnection_1 = require("./data/SitecoreConnection");
const ConnectionTreeViewItem_1 = require("./SitecoreExplorer/ConnectionTreeViewItem");
const QuickPickSitecoreItem_1 = require("./UI/QuickPickSitecoreItem");
class SitecoreExplorerProvider {
    constructor(context) {
        this.context = context;
        this.connections = new Array();
        this.onDidChangeTreeDataEmitter = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;
        this.roots = [];
        this.loadConnections();
        if (this.connections.length === 0) {
            const connection = SitecoreConnection_1.SitecoreConnection.create("http://pathfinder", "sitecore\\admin", "b");
            this.connections.push(connection);
        }
    }
    getTreeItem(treeViewItem) {
        return treeViewItem.getTreeItem();
    }
    getChildren(treeViewItem) {
        if (!treeViewItem) {
            this.roots = this.connections.map(connection => new ConnectionTreeViewItem_1.ConnectionTreeViewItem(this, connection));
            return this.roots;
        }
        return treeViewItem.getChildren();
    }
    find(uri) {
        return this.findUri(this.roots, uri);
    }
    addConnection() {
        vscode.window.showInputBox({ prompt: "Enter the host name of the website:", placeHolder: "http://www.website.com" }).then(host => {
            vscode.window.showInputBox({ prompt: "Username:", placeHolder: "sitecore\\johndoe" }).then(userName => {
                vscode.window.showInputBox({ prompt: "Password:", password: true }).then(password => {
                    const newConnection = SitecoreConnection_1.SitecoreConnection.create(host, userName, password);
                    this.connections.push(newConnection);
                    this.saveConnections();
                    this.onDidChangeTreeDataEmitter.fire();
                });
            });
        });
    }
    removeConnection(connectionTreeViewItem) {
        vscode.window.showWarningMessage("Are you sure, you want to remove the connect?", "OK", "Cancel").then(response => {
            if (response !== "OK") {
                return;
            }
            const index = this.connections.indexOf(connectionTreeViewItem.connection);
            if (index < 0) {
                return;
            }
            this.connections.splice(index, 1);
            this.saveConnections();
            this.onDidChangeTreeDataEmitter.fire();
        });
    }
    editItem(item) {
        const previewUri = vscode.Uri.parse("sitecore-item://" + item.itemUri.toString());
        return vscode.commands.executeCommand("vscode.previewHtml", previewUri, undefined, item.item.displayName).then((success) => undefined, (reason) => vscode.window.showErrorMessage(reason));
    }
    saveItem(item) {
        item.itemUri.websiteUri.connection.saveItems([item]);
    }
    addItem(parentItem) {
        parentItem.itemUri.websiteUri.connection.getTemplates(parentItem.itemUri.databaseUri).then(templates => {
            vscode.window.showQuickPick(templates.map(t => new QuickPickSitecoreItem_1.QuickPickSitecoreItem(t)), { placeHolder: "Select template of the new item" }).then(templateItem => {
                vscode.window.showInputBox({ prompt: "Enter the name of the new item:", placeHolder: "http://www.website.com", value: templateItem.item.displayName }).then(newName => {
                    parentItem.itemUri.websiteUri.connection.addItem(parentItem.itemUri.databaseUri, parentItem.item.path, templateItem.item.id, newName).then(() => this.onDidChangeTreeDataEmitter.fire(parentItem));
                });
            });
        });
    }
    deleteItem(itemTreeViewItem) {
        vscode.window.showWarningMessage(`Are you sure, you want to delete this '${itemTreeViewItem.item.displayName}'?`, "OK", "Cancel").then(response => {
            if (response !== "OK") {
                return;
            }
            itemTreeViewItem.itemUri.websiteUri.connection.deleteItem(itemTreeViewItem.itemUri).then(() => this.onDidChangeTreeDataEmitter.fire(itemTreeViewItem.parent));
        });
    }
    navigateTemplate(itemTreeViewItem) {
        const templateUri = ItemUri_1.ItemUri.create(itemTreeViewItem.item.itemUri.databaseUri, itemTreeViewItem.item.templateId);
        templateUri.websiteUri.connection.getItem(templateUri).then(item => {
            const path = [];
            path.push(itemTreeViewItem.item.itemUri.websiteUri.toString());
            path.push(itemTreeViewItem.item.itemUri.databaseUri.toString());
            for (const id of item.longPath.split("/")) {
                if (!id) {
                    continue;
                }
                const itemUri = ItemUri_1.ItemUri.create(itemTreeViewItem.item.itemUri.databaseUri, id);
                path.push(itemUri.toString());
            }
            this.expand(path);
        });
    }
    expand(itemUris) {
        const root = this.roots.find(r => r.getUri() === itemUris[0]);
        if (!root) {
            vscode.window.showErrorMessage(`Item not found`);
            return;
        }
        root.expand(itemUris.slice(1)).then(ok => {
            if (!ok) {
                vscode.window.showErrorMessage(`Item not found`);
            }
        });
    }
    refresh(treeViewItem) {
        this.onDidChangeTreeDataEmitter.fire(treeViewItem);
    }
    saveConnections() {
        const json = new Array();
        for (const connection of this.connections) {
            json.push({ host: connection.host, userName: connection.userName, password: connection.password });
        }
        this.context.globalState.update("connections", json);
    }
    loadConnections() {
        this.connections = new Array();
        const json = this.context.globalState.get("connections");
        if (!json) {
            return;
        }
        for (const data of json) {
            const connection = SitecoreConnection_1.SitecoreConnection.create(data.host, data.userName, data.password);
            this.connections.push(connection);
        }
    }
    findUri(treeViewItems, uri) {
        for (const treeViewItem of treeViewItems) {
            if (uri === treeViewItem.getUri()) {
                return treeViewItem;
            }
            const i = this.findUri(treeViewItem.children, uri);
            if (i) {
                return i;
            }
        }
        return undefined;
    }
}
exports.SitecoreExplorerProvider = SitecoreExplorerProvider;
//# sourceMappingURL=SitecoreExplorer.js.map