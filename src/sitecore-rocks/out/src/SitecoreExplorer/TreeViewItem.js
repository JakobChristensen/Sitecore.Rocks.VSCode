"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class TreeViewItem {
    constructor(sitecoreExplorer, parent) {
        this.sitecoreExplorer = sitecoreExplorer;
        this.parent = parent;
    }
    expand(itemUris) {
        return new Promise((completed, error) => {
            const itemUri = itemUris[0];
            this.expandTreeItem().then(isExpanded => {
                if (!this.children) {
                    completed(false);
                    return;
                }
                const treeViewItem = this.children.find(i => i.getUri() === itemUri);
                if (treeViewItem) {
                    if (itemUris.length > 2) {
                        treeViewItem.expand(itemUris.slice(1)).then(ok => completed(ok));
                    }
                    else {
                        completed(true);
                    }
                }
                else {
                    completed(false);
                }
            });
        });
    }
    expandTreeItem() {
        return new Promise((completed, error) => {
            if (this.treeItem.collapsibleState === vscode_1.TreeItemCollapsibleState.Expanded) {
                completed(true);
                return;
            }
            // todo: this does not work
            this.treeItem.collapsibleState = vscode_1.TreeItemCollapsibleState.Expanded;
            const pollChildren = () => {
                if (!this.children) {
                    setTimeout(pollChildren, 1);
                }
                else {
                    completed(true);
                }
            };
            pollChildren();
        });
    }
}
exports.TreeViewItem = TreeViewItem;
//# sourceMappingURL=TreeViewItem.js.map