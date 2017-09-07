"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeViewItem_1 = require("./TreeViewItem");
const vscode = require("vscode");
const DatabaseTreeViewItem_1 = require("./DatabaseTreeViewItem");
const WebsiteUri_1 = require("../data/WebsiteUri");
const DatabaseUri_1 = require("../data/DatabaseUri");
class ConnectionTreeViewItem extends TreeViewItem_1.TreeViewItem {
    constructor(connection) {
        super(null);
        this.connection = connection;
    }
    getTreeItem() {
        return {
            treeViewItem: this,
            label: this.connection.host,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: 'connection'
        };
    }
    getChildren() {
        const websiteUri = WebsiteUri_1.WebsiteUri.createFromConnection(this.connection);
        let items = new Array();
        items.push(new DatabaseTreeViewItem_1.DatabaseTreeViewItem(this, DatabaseUri_1.DatabaseUri.create(websiteUri, 'core')));
        items.push(new DatabaseTreeViewItem_1.DatabaseTreeViewItem(this, DatabaseUri_1.DatabaseUri.create(websiteUri, 'master')));
        items.push(new DatabaseTreeViewItem_1.DatabaseTreeViewItem(this, DatabaseUri_1.DatabaseUri.create(websiteUri, 'web')));
        return items;
    }
}
exports.ConnectionTreeViewItem = ConnectionTreeViewItem;
function isConnectionTreeViewItem(item) {
    return item.connection != null;
}
exports.isConnectionTreeViewItem = isConnectionTreeViewItem;
//# sourceMappingURL=ConnectionTreeViewItem.js.map