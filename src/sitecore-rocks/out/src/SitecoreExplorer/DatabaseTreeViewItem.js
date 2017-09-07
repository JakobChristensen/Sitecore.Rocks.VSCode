"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeViewItem_1 = require("./TreeViewItem");
const vscode = require("vscode");
const ItemTreeViewItem_1 = require("./ItemTreeViewItem");
const ItemUri_1 = require("../data/ItemUri");
class DatabaseTreeViewItem extends TreeViewItem_1.TreeViewItem {
    constructor(parent, databaseUri) {
        super(parent);
        this.databaseUri = databaseUri;
    }
    getTreeItem() {
        return {
            treeViewItem: this,
            label: this.databaseUri.databaseName,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: 'database'
        };
    }
    getChildren() {
        return new Promise((completed, error) => {
            this.databaseUri.websiteUri.connection.getRoot(this.databaseUri).then(items => {
                completed(items.map(item => new ItemTreeViewItem_1.ItemTreeViewItem(this, ItemUri_1.ItemUri.create(this.databaseUri, item.id), item)));
            });
        });
    }
}
exports.DatabaseTreeViewItem = DatabaseTreeViewItem;
//# sourceMappingURL=DatabaseTreeViewItem.js.map