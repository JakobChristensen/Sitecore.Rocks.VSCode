import * as vscode from "vscode";
import { DatabaseUri } from "../data/DatabaseUri";
import { SitecoreConnection } from "../data/SitecoreConnection";
import { WebsiteUri } from "../data/WebsiteUri";
import { SitecoreExplorerProvider } from "../SitecoreExplorer";
import { DatabaseTreeViewItem } from "./DatabaseTreeViewItem";
import { SitecoreTreeItem } from "./SitecoreTreeItem";
import { TreeViewItem } from "./TreeViewItem";

export class ConnectionTreeViewItem extends TreeViewItem {

    constructor(sitecoreExplorer: SitecoreExplorerProvider, public connection: SitecoreConnection) {
        super(sitecoreExplorer, null);
    }

    public getTreeItem(): SitecoreTreeItem {
        this.treeItem = new SitecoreTreeItem(this, this.connection.host, vscode.TreeItemCollapsibleState.Collapsed, "connection");
        return this.treeItem;
    }

    public getChildren(): TreeViewItem[] | Thenable<TreeViewItem[]> {
        const websiteUri = WebsiteUri.createFromConnection(this.connection);

        return new Promise<TreeViewItem[]>((completed, error) => {
            this.connection.getDatabases(websiteUri).then(databases => {
                this.children = databases.map(database => new DatabaseTreeViewItem(this.sitecoreExplorer, this, DatabaseUri.create(websiteUri, database.name)));
                completed(this.children);
            }, (reason: any) => error(reason));
        });
    }

    public getUri(): string {
        return this.connection.host;
    }
}

export function isConnectionTreeViewItem(item: TreeViewItem): item is ConnectionTreeViewItem {
    return !!(item as any).connection;
}
