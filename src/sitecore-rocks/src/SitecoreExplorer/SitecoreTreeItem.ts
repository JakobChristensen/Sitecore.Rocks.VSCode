import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { TreeViewItem } from "./TreeViewItem";

export class SitecoreTreeItem extends TreeItem {
    constructor(public treeViewItem: TreeViewItem, label: string, collapsibleState: TreeItemCollapsibleState, contextValue: string) {
        super(label, collapsibleState);
        this.contextValue = contextValue;
    }
}
