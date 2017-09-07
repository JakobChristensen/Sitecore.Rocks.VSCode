import { ExtensionContext, TreeDataProvider, EventEmitter, TreeItem, Event, window, TreeItemCollapsibleState, Uri, commands, workspace, TextDocumentContentProvider, CancellationToken, ProviderResult } from 'vscode';
import { SitecoreItem } from "./sitecore/SitecoreItem";
import { SitecoreConnection } from './data/SitecoreConnection';
import { TreeViewItem } from './SitecoreExplorer/TreeViewItem';
import { ConnectionTreeViewItem } from './SitecoreExplorer/ConnectionTreeViewItem';
import * as vscode from 'vscode';

export class SitecoreExplorerProvider implements TreeDataProvider<TreeViewItem> {

    private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
    readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

    public connections: Array<SitecoreConnection> = new Array<SitecoreConnection>();

    public constructor(private context: vscode.ExtensionContext) {
        this.loadConnections();

        if (this.connections.length === 0) {
            const connection = SitecoreConnection.create('http://pathfinder', 'sitecore\\admin', 'b');
            this.connections.push(connection);
        }
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

    public addConnection() {
        vscode.window.showInputBox({ prompt: 'Enter the host name of the website:', placeHolder: 'http://www.website.com' }).then(host => {
            vscode.window.showInputBox({ prompt: 'Username:', placeHolder: 'sitecore\\johndoe' }).then(userName => {
                vscode.window.showInputBox({ prompt: 'Password:', password: true }).then(password => {
                    const newConnection = SitecoreConnection.create(host, userName, password);
                    this.connections.push(newConnection);

                    this.saveConnections();
                    this._onDidChangeTreeData.fire();
                });
            });
        });
    }

    public removeConnection(connectionTreeViewItem: ConnectionTreeViewItem) {
        var index = this.connections.indexOf(connectionTreeViewItem.connection);
        if (index < 0) {
            return;
        }

        this.connections.splice(index, 1);

        this.saveConnections();
        this._onDidChangeTreeData.fire();
    }

    private saveConnections() {
        let json = new Array<{ host: string, userName: string, password: string }>();

        for (let connection of this.connections) {
            json.push({ host: connection.host, userName: connection.userName, password: connection.password });
        }

        this.context.globalState.update('connections', json);
    }

    private loadConnections() {
        this.connections = new Array<SitecoreConnection>();

        let json = this.context.globalState.get<Array<{ host: string, userName: string, password: string }>>("connections");
        if (!json) {
            return;
        }

        for (let data of json) {
            const connection = SitecoreConnection.create(data.host, data.userName, data.password);
            this.connections.push(connection);
        }
    }
}