import { TreeViewItem } from './TreeViewItem';
import { TreeItem } from 'vscode';
import { SitecoreConnection } from '../data/SitecoreConnection';
import { SitecoreTreeItem } from './SitecoreTreeItem';
import * as vscode from 'vscode';
import { SitecoreItem } from '../sitecore/SitecoreItem';
import { ItemUri } from '../data/ItemUri';

export class ItemTreeViewItem extends TreeViewItem {
    constructor(parent: TreeViewItem, public itemUri: ItemUri, public item: SitecoreItem) {
        super(parent);
    }

    public getTreeItem(): SitecoreTreeItem {
        return {
            treeViewItem: this,
            label: this.item.displayName,
            collapsibleState: this.item.childCount > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
            contextValue: 'item'
        }
    }

    public getChildren(): TreeViewItem[] | Thenable<TreeViewItem[]> {
        return new Promise<TreeViewItem[]>((completed, error) => {
            this.itemUri.websiteUri.connection.getChildren(this.itemUri).then(items => {
                completed(items.map(item => new ItemTreeViewItem(this, ItemUri.create(this.itemUri.databaseUri, item.id), item)));
            })
        });
    }
}