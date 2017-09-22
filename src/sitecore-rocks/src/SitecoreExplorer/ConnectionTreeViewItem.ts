import { TreeItem } from "vscode";
import * as vscode from "vscode";
import { DatabaseUri } from "../data/DatabaseUri";
import { SitecoreConnection } from "../data/SitecoreConnection";
import { WebsiteUri } from "../data/WebsiteUri";
import { DatabaseTreeViewItem } from "./DatabaseTreeViewItem";
import { SitecoreTreeItem } from "./SitecoreTreeItem";
import { TreeViewItem } from "./TreeViewItem";

export class ConnectionTreeViewItem extends TreeViewItem {

    constructor(public connection: SitecoreConnection) {
        super(null);
    }

    public getTreeItem(): SitecoreTreeItem {
        return {
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "connection",
            label: this.connection.host,
            treeViewItem: this,
        };
    }

    public getChildren(): TreeViewItem[] | Thenable<TreeViewItem[]> {
        const websiteUri = WebsiteUri.createFromConnection(this.connection);

        return new Promise<TreeViewItem[]>((completed, error) => {
            this.connection.getDatabases(websiteUri).then(databases => {
                completed(databases.map(database => new DatabaseTreeViewItem(this, DatabaseUri.create(websiteUri, database.name))));
            }, (reason: any) => error(reason));
        });
    }
}

export function isConnectionTreeViewItem(item: TreeViewItem): item is ConnectionTreeViewItem {
    return (item as any).connection != null;
}
