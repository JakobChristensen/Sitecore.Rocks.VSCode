"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const DatabaseUri_1 = require("../data/DatabaseUri");
const WebsiteUri_1 = require("../data/WebsiteUri");
const DatabaseTreeViewItem_1 = require("./DatabaseTreeViewItem");
const SitecoreTreeItem_1 = require("./SitecoreTreeItem");
const TreeViewItem_1 = require("./TreeViewItem");
class ConnectionTreeViewItem extends TreeViewItem_1.TreeViewItem {
    constructor(sitecoreExplorer, connection) {
        super(sitecoreExplorer, null);
        this.connection = connection;
    }
    getTreeItem() {
        this.treeItem = new SitecoreTreeItem_1.SitecoreTreeItem(this, this.connection.host, vscode.TreeItemCollapsibleState.Collapsed, "connection");
        return this.treeItem;
    }
    getChildren() {
        const websiteUri = WebsiteUri_1.WebsiteUri.createFromConnection(this.connection);
        return new Promise((completed, error) => {
            this.connection.getDatabases(websiteUri).then(databases => {
                this.children = databases.map(database => new DatabaseTreeViewItem_1.DatabaseTreeViewItem(this.sitecoreExplorer, this, DatabaseUri_1.DatabaseUri.create(websiteUri, database.name)));
                completed(this.children);
            }, (reason) => error(reason));
        });
    }
    getUri() {
        return this.connection.host;
    }
}
exports.ConnectionTreeViewItem = ConnectionTreeViewItem;
function isConnectionTreeViewItem(item) {
    return !!item.connection;
}
exports.isConnectionTreeViewItem = isConnectionTreeViewItem;
//# sourceMappingURL=ConnectionTreeViewItem.js.map