"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class SitecoreTreeItem extends vscode_1.TreeItem {
    constructor(treeViewItem, label, collapsibleState, contextValue) {
        super(label, collapsibleState);
        this.treeViewItem = treeViewItem;
        this.contextValue = contextValue;
        this.command = {
            arguments: [this.treeViewItem],
            command: "extension.sitecore.selectItem",
            title: "Select Item",
        };
    }
}
exports.SitecoreTreeItem = SitecoreTreeItem;
//# sourceMappingURL=SitecoreTreeItem.js.map