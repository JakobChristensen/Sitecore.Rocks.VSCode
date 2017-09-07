import { TreeViewItem } from './TreeViewItem';
import { TreeItem } from 'vscode';
import { SitecoreConnection } from '../data/SitecoreConnection';
import { SitecoreTreeItem } from './SitecoreTreeItem';
import * as vscode from 'vscode';
import { DatabaseTreeViewItem } from './DatabaseTreeViewItem';
import { WebsiteUri } from '../data/WebsiteUri';
import { DatabaseUri } from '../data/DatabaseUri';

export class ConnectionTreeViewItem extends TreeViewItem {

    constructor(public connection: SitecoreConnection) {
        super(null);
    }

    public getTreeItem(): SitecoreTreeItem {
        return {
            treeViewItem: this,
            label: this.connection.host,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: 'connection'
        }
    }

    public getChildren(): TreeViewItem[] | Thenable<TreeViewItem[]> {
        const websiteUri = WebsiteUri.createFromConnection(this.connection);

        let items = new Array<TreeViewItem>();

        items.push(new DatabaseTreeViewItem(this, DatabaseUri.create(websiteUri, 'core')));
        items.push(new DatabaseTreeViewItem(this, DatabaseUri.create(websiteUri, 'master')));
        items.push(new DatabaseTreeViewItem(this, DatabaseUri.create(websiteUri, 'web')));

        return items;
    }
}

export function isConnectionTreeViewItem(item: TreeViewItem): item is ConnectionTreeViewItem {
    return (<any>item).connection != null;
}