"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const ItemUri_1 = require("../data/ItemUri");
const SitecoreTreeItem_1 = require("./SitecoreTreeItem");
const TreeViewItem_1 = require("./TreeViewItem");
class ItemTreeViewItem extends TreeViewItem_1.TreeViewItem {
    constructor(sitecoreExplorer, parent, itemUri, item) {
        super(sitecoreExplorer, parent);
        this.itemUri = itemUri;
        this.item = item;
    }
    getTreeItem() {
        this.treeItem = new SitecoreTreeItem_1.SitecoreTreeItem(this, this.item.displayName, this.item.childCount > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None, "item");
        return this.treeItem;
    }
    getChildren() {
        return new Promise((completed, error) => {
            this.itemUri.websiteUri.connection.getChildren(this.itemUri).then(items => {
                this.children = items.map(item => new ItemTreeViewItem(this.sitecoreExplorer, this, ItemUri_1.ItemUri.create(this.itemUri.databaseUri, item.id), item));
                completed(this.children);
                console.log("getchildren");
            });
        });
    }
    getUri() {
        return this.itemUri.toString();
    }
}
exports.ItemTreeViewItem = ItemTreeViewItem;
function isItemTreeViewItem(item) {
    return !!item.itemUri;
}
exports.isItemTreeViewItem = isItemTreeViewItem;
//# sourceMappingURL=ItemTreeViewItem.js.map