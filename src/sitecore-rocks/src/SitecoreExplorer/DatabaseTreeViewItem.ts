import { TreeViewItem } from './TreeViewItem';
import { TreeItem } from 'vscode';
import { SitecoreConnection } from '../data/SitecoreConnection';
import { SitecoreTreeItem } from './SitecoreTreeItem';
import * as vscode from 'vscode';
import { ItemTreeViewItem } from './ItemTreeViewItem';
import { DatabaseUri } from '../data/DatabaseUri';
import { ItemUri } from '../data/ItemUri';

export class DatabaseTreeViewItem extends TreeViewItem {
    constructor(parent: TreeViewItem, public databaseUri: DatabaseUri) {
        super(parent);
    }

    public getTreeItem(): SitecoreTreeItem {
        return {
            treeViewItem: this,
            label: this.databaseUri.databaseName,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: 'database'
        }
    }

    public getChildren(): TreeViewItem[] | Thenable<TreeViewItem[]> {
        return new Promise<TreeViewItem[]>((completed, error) => {
            this.databaseUri.websiteUri.connection.getRoots(this.databaseUri).then(items => {
                completed(items.map(item => new ItemTreeViewItem(this, ItemUri.create(this.databaseUri, item.id), item)));
            })
        });
    }
}