import { ExtensionContext, TreeDataProvider, EventEmitter, TreeItem, Event, window, TreeItemCollapsibleState, Uri, commands, workspace, TextDocumentContentProvider, CancellationToken, ProviderResult } from 'vscode';
import { SitecoreItem } from "./sitecore/SitecoreItem";
import { SitecoreConnection } from './data/SitecoreConnection';
import { TreeViewItem } from './SitecoreExplorer/TreeViewItem';
import { ConnectionTreeViewItem } from './SitecoreExplorer/ConnectionTreeViewItem';
import * as vscode from 'vscode';
import { ItemTreeViewItem } from './SitecoreExplorer/ItemTreeViewItem';
import { ItemUri } from './data/ItemUri';
import { ItemVersionUri } from './data/ItemVersionUri';
import { QuickPickSitecoreItem } from './UI/QuickPickSitecoreItem';

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
        vscode.window.showWarningMessage("Are you sure, you want to remove the connect?", "OK", "Cancel").then(response => {
            if (response != "OK") {
                return;
            }

            var index = this.connections.indexOf(connectionTreeViewItem.connection);
            if (index < 0) {
                return;
            }

            this.connections.splice(index, 1);

            this.saveConnections();
            this._onDidChangeTreeData.fire();
        });
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

    public editItem(item: ItemTreeViewItem) {
        let previewUri = vscode.Uri.parse('sitecore-item://' + item.itemUri.toString());
        return vscode.commands.executeCommand('vscode.previewHtml', previewUri, undefined, item.item.displayName).then((success) => { }, (reason) => vscode.window.showErrorMessage(reason));
    }

    public saveItem(item: SitecoreItem) {
        let connection = SitecoreConnection.get(item.host);
        connection.saveItems([item]);
    }

    public addItem(parentItem: ItemTreeViewItem) {
        parentItem.itemUri.websiteUri.connection.getTemplates(parentItem.itemUri.databaseUri).then(templates => {
            vscode.window.showQuickPick<QuickPickSitecoreItem>(templates.map(t => new QuickPickSitecoreItem(t)), { placeHolder: 'Select template of the new item' }).then(templateItem => {
                vscode.window.showInputBox({ prompt: 'Enter the name of the new item:', placeHolder: 'http://www.website.com', value: templateItem.item.displayName }).then(newName => {
                    parentItem.itemUri.websiteUri.connection.addItem(parentItem.itemUri.databaseUri, parentItem.item.path, templateItem.item.id, newName).then(() => this._onDidChangeTreeData.fire(parentItem))
                });
            });
        });
    }

    public deleteItem(itemTreeViewItem: ItemTreeViewItem) {
        vscode.window.showWarningMessage(`Are you sure, you want to delete this '${itemTreeViewItem.item.displayName}'?`, "OK", "Cancel").then(response => {
            if (response != "OK") {
                return;
            }

            itemTreeViewItem.itemUri.websiteUri.connection.deleteItem(itemTreeViewItem.itemUri).then(() => this._onDidChangeTreeData.fire(itemTreeViewItem.parent));
        });
    }
}