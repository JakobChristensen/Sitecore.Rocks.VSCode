import { TreeItem } from 'vscode';
import { isConnectionTreeViewItem } from './ConnectionTreeViewItem';

export abstract class TreeViewItem {

    constructor(public parent: TreeViewItem) {
    }

    public abstract getTreeItem(): TreeItem;

    public abstract getChildren(): TreeViewItem[] | Thenable<TreeViewItem[]>;
}