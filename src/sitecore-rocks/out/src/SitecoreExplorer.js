"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const vscode = require("vscode");
const ItemUri_1 = require("./data/ItemUri");
const SitecoreConnection_1 = require("./data/SitecoreConnection");
const ConnectionTreeViewItem_1 = require("./SitecoreExplorer/ConnectionTreeViewItem");
const ItemTreeViewItem_1 = require("./SitecoreExplorer/ItemTreeViewItem");
const QuickPickSitecoreItem_1 = require("./UI/QuickPickSitecoreItem");
class SitecoreExplorerProvider {
    constructor(context) {
        this.context = context;
        this.connections = new Array();
        this.onDidChangeTreeDataEmitter = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;
        this.roots = [];
        this.loadConnections();
        /*
        if (this.connections.length === 0) {
            const connection = SitecoreConnection.create("http://pathfinder", "sitecore\\admin", "b");
            this.connections.push(connection);
        }
        */
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
            if (!host) {
                return;
            }
            vscode.window.showInputBox({ prompt: "Username:", placeHolder: "sitecore\\johndoe" }).then(userName => {
                if (!userName) {
                    return;
                }
                vscode.window.showInputBox({ prompt: "Password:", password: true }).then(password => {
                    if (!password) {
                        return;
                    }
                    const newConnection = SitecoreConnection_1.SitecoreConnection.create(host, userName, password);
                    this.connections.push(newConnection);
                    this.saveConnections();
                    this.onDidChangeTreeDataEmitter.fire();
                });
            });
        });
    }
    removeConnection(item) {
        if (!item || item instanceof vscode.Uri) {
            return;
        }
        vscode.window.showWarningMessage("Are you sure, you want to remove the connection?", "Yes").then(response => {
            if (response !== "Yes") {
                return;
            }
            const index = this.connections.indexOf(item.connection);
            if (index < 0) {
                return;
            }
            this.connections.splice(index, 1);
            this.saveConnections();
            this.onDidChangeTreeDataEmitter.fire();
        });
    }
    editItem(item) {
        const itemUri = this.getSelectedItemUri(item);
        if (!itemUri) {
            return;
        }
        let name = "Item";
        if (item instanceof ItemTreeViewItem_1.ItemTreeViewItem) {
            name = item.item.displayName;
        }
        else {
            const t = this.find(itemUri.toString());
            if (t) {
                name = t.treeItem.label;
            }
        }
        const previewUri = vscode.Uri.parse("sitecore-item://" + itemUri.toString());
        return vscode.commands.executeCommand("vscode.previewHtml", previewUri, undefined, name).then((success) => undefined, (reason) => vscode.window.showErrorMessage(reason));
    }
    saveItem(item) {
        item.itemUri.websiteUri.connection.saveItems([item]);
    }
    selectItem(treeViewItem) {
        if (treeViewItem instanceof vscode.Uri) {
            this.selectedTreeViewItem = undefined;
            return;
        }
        this.selectedTreeViewItem = treeViewItem;
    }
    addItem(parentItem) {
        const itemUri = this.getSelectedItemUri(parentItem);
        if (!itemUri) {
            return;
        }
        itemUri.websiteUri.connection.getTemplates(itemUri.databaseUri).then(templates => {
            vscode.window.showQuickPick(templates.map(t => new QuickPickSitecoreItem_1.QuickPickSitecoreItem(t)), { placeHolder: "Select template of the new item" }).then(templateItem => {
                if (!templateItem) {
                    return;
                }
                vscode.window.showInputBox({ prompt: "Enter the name of the new item:", placeHolder: "NewItem", value: templateItem.item.displayName }).then(newName => {
                    if (!newName) {
                        return;
                    }
                    itemUri.websiteUri.connection.addItem(itemUri, templateItem.item.id, newName).then(() => {
                        const treeViewItem = this.find(itemUri.toString());
                        if (treeViewItem) {
                            this.onDidChangeTreeDataEmitter.fire(treeViewItem);
                        }
                    });
                });
            });
        });
    }
    insertItem(parentItem) {
        const itemUri = this.getSelectedItemUri(parentItem);
        if (!itemUri) {
            return;
        }
        itemUri.websiteUri.connection.getInsertOptions(itemUri).then(insertOptions => {
            vscode.window.showQuickPick(insertOptions.map(t => new QuickPickSitecoreItem_1.QuickPickSitecoreItem(t)), { placeHolder: "Select template of the new item" }).then(templateItem => {
                if (!templateItem) {
                    return;
                }
                vscode.window.showInputBox({ prompt: "Enter the name of the new item:", placeHolder: "NewItem", value: templateItem.item.displayName }).then(newName => {
                    if (!newName) {
                        return;
                    }
                    itemUri.websiteUri.connection.addItem(itemUri, templateItem.item.id, newName).then(() => {
                        const treeViewItem = this.find(itemUri.toString());
                        if (treeViewItem) {
                            this.onDidChangeTreeDataEmitter.fire(treeViewItem);
                        }
                    });
                });
            });
        });
    }
    deleteItem(item) {
        const itemUri = this.getSelectedItemUri(item);
        if (!itemUri) {
            return;
        }
        let name = "this item";
        if (item instanceof ItemTreeViewItem_1.ItemTreeViewItem) {
            name = "'" + item.item.displayName + "'";
        }
        else {
            const t = this.find(itemUri.toString());
            if (t) {
                name = "'" + t.treeItem.label + "'";
            }
        }
        vscode.window.showWarningMessage(`Are you sure, you want to delete ${name}?`, "OK").then(response => {
            if (response !== "OK") {
                return;
            }
            itemUri.websiteUri.connection.deleteItem(itemUri).then(() => {
                this.selectedTreeViewItem = undefined;
                const treeViewItem = this.find(itemUri.toString());
                if (treeViewItem) {
                    this.onDidChangeTreeDataEmitter.fire(treeViewItem.parent);
                }
            });
        });
    }
    navigateTemplate(item) {
        const itemUri = this.getSelectedItemUri(item);
        if (!itemUri) {
            return;
        }
        itemUri.websiteUri.connection.getItem(itemUri).then(itm => {
            const path = [];
            path.push(itemUri.databaseUri.toString());
            for (const id of itm.longPath.split("/")) {
                if (!id) {
                    continue;
                }
                path.push(ItemUri_1.ItemUri.create(itemUri.databaseUri, id).toString());
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
    refresh(item) {
        const selectedItem = item || this.selectedTreeViewItem;
        if (!selectedItem) {
            return;
        }
        this.onDidChangeTreeDataEmitter.fire(selectedItem);
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
            if (treeViewItem.children) {
                const i = this.findUri(treeViewItem.children, uri);
                if (i) {
                    return i;
                }
            }
        }
        return undefined;
    }
    getSelectedItemUri(itemTreeViewItem) {
        if (itemTreeViewItem instanceof vscode.Uri) {
            return ItemUri_1.ItemUri.parse(decodeURIComponent(itemTreeViewItem.toString().substr(16)));
        }
        if (!itemTreeViewItem && ItemTreeViewItem_1.isItemTreeViewItem(this.selectedTreeViewItem)) {
            itemTreeViewItem = this.selectedTreeViewItem;
        }
        if (itemTreeViewItem) {
            return itemTreeViewItem.itemUri;
        }
        vscode.window.showInformationMessage("Select an item in the Sitecore Explorer first");
        return undefined;
    }
}
exports.SitecoreExplorerProvider = SitecoreExplorerProvider;
//# sourceMappingURL=SitecoreExplorer.js.map