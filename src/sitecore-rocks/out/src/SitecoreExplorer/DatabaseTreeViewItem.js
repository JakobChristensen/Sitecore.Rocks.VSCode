"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const ItemUri_1 = require("../data/ItemUri");
const ItemTreeViewItem_1 = require("./ItemTreeViewItem");
const SitecoreTreeItem_1 = require("./SitecoreTreeItem");
const TreeViewItem_1 = require("./TreeViewItem");
class DatabaseTreeViewItem extends TreeViewItem_1.TreeViewItem {
    constructor(sitecoreExplorer, parent, databaseUri) {
        super(sitecoreExplorer, parent);
        this.databaseUri = databaseUri;
    }
    getTreeItem() {
        this.treeItem = new SitecoreTreeItem_1.SitecoreTreeItem(this, this.databaseUri.databaseName, vscode.TreeItemCollapsibleState.Collapsed, "database");
        return this.treeItem;
    }
    getChildren() {
        return new Promise((completed, error) => {
            this.databaseUri.websiteUri.connection.getRoots(this.databaseUri).then(items => {
                this.children = items.map(item => new ItemTreeViewItem_1.ItemTreeViewItem(this.sitecoreExplorer, this, ItemUri_1.ItemUri.create(this.databaseUri, item.id), item));
                completed(this.children);
            });
        });
    }
    getUri() {
        return this.databaseUri.toString();
    }
}
exports.DatabaseTreeViewItem = DatabaseTreeViewItem;
function isDatabaseTreeViewItem(item) {
    return !!item.databaseUri;
}
exports.isDatabaseTreeViewItem = isDatabaseTreeViewItem;
//# sourceMappingURL=DatabaseTreeViewItem.js.map