"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeViewItem_1 = require("./TreeViewItem");
const vscode = require("vscode");
const ItemUri_1 = require("../data/ItemUri");
class ItemTreeViewItem extends TreeViewItem_1.TreeViewItem {
    constructor(parent, itemUri, item) {
        super(parent);
        this.itemUri = itemUri;
        this.item = item;
    }
    getTreeItem() {
        return {
            treeViewItem: this,
            label: this.item.displayName,
            collapsibleState: this.item.childCount > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
        };
    }
    getChildren() {
        return new Promise((completed, error) => {
            this.itemUri.websiteUri.connection.getChildren(this.itemUri).then(items => {
                completed(items.map(item => new ItemTreeViewItem(this, ItemUri_1.ItemUri.create(this.itemUri.databaseUri, item.id), item)));
            });
        });
    }
}
exports.ItemTreeViewItem = ItemTreeViewItem;
//# sourceMappingURL=ItemTreeViewItem.js.map