import * as vscode from "vscode";
import { DatabaseUri } from "../data/DatabaseUri";
import { ItemUri } from "../data/ItemUri";
import { SitecoreConnection } from "../data/SitecoreConnection";
import { SitecoreExplorerProvider } from "../SitecoreExplorer";
import { ItemTreeViewItem } from "./ItemTreeViewItem";
import { SitecoreTreeItem } from "./SitecoreTreeItem";
import { TreeViewItem } from "./TreeViewItem";

export class DatabaseTreeViewItem extends TreeViewItem {
    constructor(sitecoreExplorer: SitecoreExplorerProvider, parent: TreeViewItem, public databaseUri: DatabaseUri) {
        super(sitecoreExplorer, parent);
    }

    public getTreeItem(): SitecoreTreeItem {
        this.treeItem = new SitecoreTreeItem(this, this.databaseUri.databaseName, vscode.TreeItemCollapsibleState.Collapsed, "database");
        return this.treeItem;
    }

    public getChildren(): TreeViewItem[] | Thenable<TreeViewItem[]> {
        return new Promise<TreeViewItem[]>((completed, error) => {
            this.databaseUri.websiteUri.connection.getRoots(this.databaseUri).then(items => {
                this.children = items.map(item => new ItemTreeViewItem(this.sitecoreExplorer, this, ItemUri.create(this.databaseUri, item.id), item));
                completed(this.children);
            });
        });
    }

    public getUri(): string {
        return this.databaseUri.toString();
    }
}

export function isDatabaseTreeViewItem(item: TreeViewItem | undefined): item is DatabaseTreeViewItem {
    return !!item && !!(item as any).databaseUri;
}
