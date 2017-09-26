import * as vscode from "vscode";
import { ItemUri } from "../data/ItemUri";
import { SitecoreConnection } from "../data/SitecoreConnection";
import { SitecoreItem } from "../sitecore/SitecoreItem";
import { SitecoreExplorerProvider } from "../SitecoreExplorer";
import { SitecoreTreeItem } from "./SitecoreTreeItem";
import { TreeViewItem } from "./TreeViewItem";

export class ItemTreeViewItem extends TreeViewItem {
    constructor(sitecoreExplorer: SitecoreExplorerProvider, parent: TreeViewItem, public itemUri: ItemUri, public item: SitecoreItem) {
        super(sitecoreExplorer, parent);
    }

    public getTreeItem(): SitecoreTreeItem {
        this.treeItem = new SitecoreTreeItem(this, this.item.displayName, this.item.childCount > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None, "item");
        return this.treeItem;
    }

    public getChildren(): TreeViewItem[] | Thenable<TreeViewItem[]> {
        return new Promise<TreeViewItem[]>((completed, error) => {
            this.itemUri.websiteUri.connection.getChildren(this.itemUri).then(items => {
                this.children = items.map(item => new ItemTreeViewItem(this.sitecoreExplorer, this, ItemUri.create(this.itemUri.databaseUri, item.id), item));
                completed(this.children);
            });
        });
    }

    public getUri(): string {
        return this.itemUri.toString();
    }
}

export function isItemTreeViewItem(item: TreeViewItem | undefined): item is ItemTreeViewItem {
    return !!item && !!(item as any).itemUri;
}
