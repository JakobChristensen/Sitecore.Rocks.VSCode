"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const DatabaseUri_1 = require("../data/DatabaseUri");
const WebsiteUri_1 = require("../data/WebsiteUri");
const DatabaseTreeViewItem_1 = require("./DatabaseTreeViewItem");
const TreeViewItem_1 = require("./TreeViewItem");
class ConnectionTreeViewItem extends TreeViewItem_1.TreeViewItem {
    constructor(connection) {
        super(null);
        this.connection = connection;
    }
    getTreeItem() {
        return {
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "connection",
            label: this.connection.host,
            treeViewItem: this,
        };
    }
    getChildren() {
        const websiteUri = WebsiteUri_1.WebsiteUri.createFromConnection(this.connection);
        return new Promise((completed, error) => {
            this.connection.getDatabases(websiteUri).then(databases => {
                completed(databases.map(database => new DatabaseTreeViewItem_1.DatabaseTreeViewItem(this, DatabaseUri_1.DatabaseUri.create(websiteUri, database.name))));
            }, (reason) => error(reason));
        });
    }
}
exports.ConnectionTreeViewItem = ConnectionTreeViewItem;
function isConnectionTreeViewItem(item) {
    return item.connection != null;
}
exports.isConnectionTreeViewItem = isConnectionTreeViewItem;
//# sourceMappingURL=ConnectionTreeViewItem.js.map