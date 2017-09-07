import { ExtensionContext, TreeDataProvider, EventEmitter, TreeItem, Event, window, TreeItemCollapsibleState, Uri, commands, workspace, TextDocumentContentProvider, CancellationToken, ProviderResult } from 'vscode';
import { SitecoreItem } from "./sitecore/SitecoreItem";
import { SitecoreConnection } from './data/SitecoreConnection';
import { TreeViewItem } from './SitecoreExplorer/TreeViewItem';
import { ConnectionTreeViewItem } from './SitecoreExplorer/ConnectionTreeViewItem';

export class SitecoreExplorerProvider implements TreeDataProvider<TreeViewItem> {

    private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
    readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

    public connections: Array<SitecoreConnection> = new Array<SitecoreConnection>();

    constructor() {
        var connection = SitecoreConnection.create('http://pathfinder', 'sitecore\\admin', 'b');
        this.connections.push(connection);
    }

    public getTreeItem(treeViewItem: TreeViewItem): TreeItem {
        return treeViewItem.getTreeItem();
    }

    public getChildren(treeViewItem?: TreeViewItem): TreeViewItem[] | Thenable<TreeViewItem[]> {
        if (!treeViewItem) {
            return this.connections.map(connection => new ConnectionTreeViewItem(connection));
        }

        return treeViewItem.getChildren();
    }
}