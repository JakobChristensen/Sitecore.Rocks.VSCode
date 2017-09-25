import { CancellationToken, commands, Event, EventEmitter, ExtensionContext, ProviderResult, TextDocumentContentProvider, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri, window, workspace } from "vscode";
import * as vscode from "vscode";
import { DatabaseUri } from "./data/DatabaseUri";
import { ItemUri } from "./data/ItemUri";
import { ItemVersionUri } from "./data/ItemVersionUri";
import { SitecoreConnection } from "./data/SitecoreConnection";
import { SitecoreItem } from "./sitecore/SitecoreItem";
import { ConnectionTreeViewItem } from "./SitecoreExplorer/ConnectionTreeViewItem";
import { isDatabaseTreeViewItem } from "./SitecoreExplorer/DatabaseTreeViewItem";
import { isItemTreeViewItem, ItemTreeViewItem } from "./SitecoreExplorer/ItemTreeViewItem";
import { TreeViewItem } from "./SitecoreExplorer/TreeViewItem";
import { QuickPickSitecoreItem } from "./UI/QuickPickSitecoreItem";

export class SitecoreExplorerProvider implements TreeDataProvider<TreeViewItem> {

    public connections: SitecoreConnection[] = new Array<SitecoreConnection>();

    public onDidChangeTreeDataEmitter: EventEmitter<any> = new EventEmitter<any>();
    public readonly onDidChangeTreeData: Event<any> = this.onDidChangeTreeDataEmitter.event;

    private roots: TreeViewItem[] = [];

    public constructor(private context: vscode.ExtensionContext) {
        this.loadConnections();

        if (this.connections.length === 0) {
            const connection = SitecoreConnection.create("http://pathfinder", "sitecore\\admin", "b");
            this.connections.push(connection);
        }
    }

    public getTreeItem(treeViewItem: TreeViewItem): TreeItem {
        return treeViewItem.getTreeItem();
    }

    public getChildren(treeViewItem?: TreeViewItem): TreeViewItem[] | Thenable<TreeViewItem[]> {
        if (!treeViewItem) {
            this.roots = this.connections.map(connection => new ConnectionTreeViewItem(this, connection));
            return this.roots;
        }

        return treeViewItem.getChildren();
    }

    public find(uri: string): TreeViewItem | undefined {
        return this.findUri(this.roots, uri);
    }

    public addConnection() {
        vscode.window.showInputBox({ prompt: "Enter the host name of the website:", placeHolder: "http://www.website.com" }).then(host => {
            vscode.window.showInputBox({ prompt: "Username:", placeHolder: "sitecore\\johndoe" }).then(userName => {
                vscode.window.showInputBox({ prompt: "Password:", password: true }).then(password => {
                    const newConnection = SitecoreConnection.create(host, userName, password);
                    this.connections.push(newConnection);

                    this.saveConnections();
                    this.onDidChangeTreeDataEmitter.fire();
                });
            });
        });
    }

    public removeConnection(connectionTreeViewItem: ConnectionTreeViewItem) {
        vscode.window.showWarningMessage("Are you sure, you want to remove the connect?", "OK", "Cancel").then(response => {
            if (response !== "OK") {
                return;
            }

            const index = this.connections.indexOf(connectionTreeViewItem.connection);
            if (index < 0) {
                return;
            }

            this.connections.splice(index, 1);

            this.saveConnections();
            this.onDidChangeTreeDataEmitter.fire();
        });
    }

    public editItem(item: ItemTreeViewItem) {
        const previewUri = vscode.Uri.parse("sitecore-item://" + item.itemUri.toString());
        return vscode.commands.executeCommand("vscode.previewHtml", previewUri, undefined, item.item.displayName).then((success) => undefined, (reason) => vscode.window.showErrorMessage(reason));
    }

    public saveItem(item: SitecoreItem) {
        item.itemUri.websiteUri.connection.saveItems([item]);
    }

    public addItem(parentItem: ItemTreeViewItem) {
        parentItem.itemUri.websiteUri.connection.getTemplates(parentItem.itemUri.databaseUri).then(templates => {
            vscode.window.showQuickPick<QuickPickSitecoreItem>(templates.map(t => new QuickPickSitecoreItem(t)), { placeHolder: "Select template of the new item" }).then(templateItem => {
                vscode.window.showInputBox({ prompt: "Enter the name of the new item:", placeHolder: "http://www.website.com", value: templateItem.item.displayName }).then(newName => {
                    parentItem.itemUri.websiteUri.connection.addItem(parentItem.itemUri.databaseUri, parentItem.item.path, templateItem.item.id, newName).then(() => this.onDidChangeTreeDataEmitter.fire(parentItem));
                });
            });
        });
    }

    public deleteItem(itemTreeViewItem: ItemTreeViewItem) {
        vscode.window.showWarningMessage(`Are you sure, you want to delete this '${itemTreeViewItem.item.displayName}'?`, "OK", "Cancel").then(response => {
            if (response !== "OK") {
                return;
            }

            itemTreeViewItem.itemUri.websiteUri.connection.deleteItem(itemTreeViewItem.itemUri).then(() => this.onDidChangeTreeDataEmitter.fire(itemTreeViewItem.parent));
        });
    }

    public navigateTemplate(itemTreeViewItem: ItemTreeViewItem) {
        const templateUri = ItemUri.create(itemTreeViewItem.item.itemUri.databaseUri, itemTreeViewItem.item.templateId);

        templateUri.websiteUri.connection.getItem(templateUri).then(item => {
            const path: string[] = [];

            path.push(itemTreeViewItem.item.itemUri.websiteUri.toString());
            path.push(itemTreeViewItem.item.itemUri.databaseUri.toString());

            for (const id of item.longPath.split("/")) {
                if (!id) {
                    continue;
                }

                const itemUri = ItemUri.create(itemTreeViewItem.item.itemUri.databaseUri, id);
                path.push(itemUri.toString());
            }

            this.expand(path);
        });
    }

    public expand(itemUris: string[]) {
        const root = this.roots.find(r => r.getUri() === itemUris[0]);
        if (!root) {
            vscode.window.showErrorMessage(`Item not found`);
            return;
        }

        root.expand(itemUris.slice(1)).then(ok => {
            if (!ok) {
                vscode.window.showErrorMessage(`Item not found`);
            }
        });
    }

    public refresh(treeViewItem: TreeViewItem) {
        this.onDidChangeTreeDataEmitter.fire(treeViewItem);
    }

    private saveConnections() {
        const json = new Array<{ host: string, userName: string, password: string }>();

        for (const connection of this.connections) {
            json.push({ host: connection.host, userName: connection.userName, password: connection.password });
        }

        this.context.globalState.update("connections", json);
    }

    private loadConnections() {
        this.connections = new Array<SitecoreConnection>();

        const json = this.context.globalState.get<Array<{ host: string, userName: string, password: string }>>("connections");
        if (!json) {
            return;
        }

        for (const data of json) {
            const connection = SitecoreConnection.create(data.host, data.userName, data.password);
            this.connections.push(connection);
        }
    }

    private findUri(treeViewItems: TreeViewItem[], uri: string): TreeViewItem | undefined {
        for (const treeViewItem of treeViewItems) {
            if (uri === treeViewItem.getUri()) {
                return treeViewItem;
            }

            const i = this.findUri(treeViewItem.children, uri);
            if (i) {
                return i;
            }
        }

        return undefined;
    }
}
