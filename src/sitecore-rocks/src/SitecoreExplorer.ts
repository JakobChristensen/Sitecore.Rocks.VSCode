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
    public selectedTreeViewItem: TreeViewItem | undefined;

    public connections: SitecoreConnection[] = new Array<SitecoreConnection>();

    public onDidChangeTreeDataEmitter: EventEmitter<any> = new EventEmitter<any>();

    public readonly onDidChangeTreeData: Event<any> = this.onDidChangeTreeDataEmitter.event;

    private roots: TreeViewItem[] = [];

    public constructor(private context: vscode.ExtensionContext) {
        this.loadConnections();
        /*
        if (this.connections.length === 0) {
            const connection = SitecoreConnection.create("http://pathfinder", "sitecore\\admin", "b");
            this.connections.push(connection);
        }
        */
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
            if (!host) {
                return;
            }

            vscode.window.showInputBox({ prompt: "Username:", placeHolder: "sitecore\\johndoe" }).then(userName => {
                if (!userName) {
                    return;
                }

                vscode.window.showInputBox({ prompt: "Password:", password: true }).then(password => {
                    if (!password) {
                        return;
                    }

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
        const selectedItem = this.getSelectedItemTreeViewItem(item);
        if (!selectedItem) {
            return;
        }

        const previewUri = vscode.Uri.parse("sitecore-item://" + selectedItem.itemUri.toString());
        return vscode.commands.executeCommand("vscode.previewHtml", previewUri, undefined, selectedItem.item.displayName).then((success) => undefined, (reason) => vscode.window.showErrorMessage(reason));
    }

    public saveItem(item: SitecoreItem) {
        item.itemUri.websiteUri.connection.saveItems([item]);
    }

    public selectItem(treeViewItem: TreeViewItem) {
        this.selectedTreeViewItem = treeViewItem;
    }

    public addItem(parentItem: ItemTreeViewItem) {
        const selectedItem = this.getSelectedItemTreeViewItem(parentItem);
        if (!selectedItem) {
            return;
        }

        selectedItem.itemUri.websiteUri.connection.getTemplates(selectedItem.itemUri.databaseUri).then(templates => {
            vscode.window.showQuickPick<QuickPickSitecoreItem>(templates.map(t => new QuickPickSitecoreItem(t)), { placeHolder: "Select template of the new item" }).then(templateItem => {
                if (!templateItem) {
                    return;
                }

                vscode.window.showInputBox({ prompt: "Enter the name of the new item:", placeHolder: "NewItem", value: templateItem.item.displayName }).then(newName => {
                    if (!newName) {
                        return;
                    }

                    selectedItem.itemUri.websiteUri.connection.addItem(selectedItem.itemUri.databaseUri, selectedItem.item.path, templateItem.item.id, newName).then(() => this.onDidChangeTreeDataEmitter.fire(selectedItem));
                });
            });
        });
    }

    public insertItem(parentItem: ItemTreeViewItem) {
        const selectedItem = this.getSelectedItemTreeViewItem(parentItem);
        if (!selectedItem) {
            return;
        }

        selectedItem.itemUri.websiteUri.connection.getInsertOptions(selectedItem.itemUri).then(insertOptions => {
            vscode.window.showQuickPick<QuickPickSitecoreItem>(insertOptions.map(t => new QuickPickSitecoreItem(t)), { placeHolder: "Select template of the new item" }).then(templateItem => {
                if (!templateItem) {
                    return;
                }

                vscode.window.showInputBox({ prompt: "Enter the name of the new item:", placeHolder: "NewItem", value: templateItem.item.displayName }).then(newName => {
                    if (!newName) {
                        return;
                    }

                    selectedItem.itemUri.websiteUri.connection.addItem(selectedItem.itemUri.databaseUri, selectedItem.item.path, templateItem.item.id, newName).then(() => this.onDidChangeTreeDataEmitter.fire(selectedItem));
                });
            });
        });
    }

    public deleteItem(itemTreeViewItem: ItemTreeViewItem) {
        const selectedItem = this.getSelectedItemTreeViewItem(itemTreeViewItem);
        if (!selectedItem) {
            return;
        }

        vscode.window.showWarningMessage(`Are you sure, you want to delete '${selectedItem.item.displayName}'?`, "OK").then(response => {
            if (response !== "OK") {
                return;
            }

            selectedItem.itemUri.websiteUri.connection.deleteItem(selectedItem.itemUri).then(() => {
                this.selectedTreeViewItem = undefined;
                this.onDidChangeTreeDataEmitter.fire(selectedItem.parent);
            });
        });
    }

    public navigateTemplate(itemTreeViewItem: ItemTreeViewItem) {
        const selectedItem = this.getSelectedItemTreeViewItem(itemTreeViewItem);
        if (!selectedItem) {
            return;
        }

        const templateUri = ItemUri.create(selectedItem.item.itemUri.databaseUri, selectedItem.item.templateId);

        templateUri.websiteUri.connection.getItem(templateUri).then(item => {
            const path: string[] = [];

            path.push(selectedItem.item.itemUri.websiteUri.toString());
            path.push(selectedItem.item.itemUri.databaseUri.toString());

            for (const id of item.longPath.split("/")) {
                if (!id) {
                    continue;
                }

                const itemUri = ItemUri.create(selectedItem.item.itemUri.databaseUri, id);
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
        const selectedItem = treeViewItem || this.selectedTreeViewItem;
        if (!selectedItem) {
            return;
        }

        this.onDidChangeTreeDataEmitter.fire(selectedItem);
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

    private getSelectedItemTreeViewItem(itemTreeViewItem: ItemTreeViewItem): ItemTreeViewItem | undefined {
        if (!itemTreeViewItem && isItemTreeViewItem(this.selectedTreeViewItem)) {
            itemTreeViewItem = this.selectedTreeViewItem;
        }

        if (!itemTreeViewItem) {
            vscode.window.showInformationMessage("Select an item in the Sitecore Explorer first");
            return undefined;
        }

        return itemTreeViewItem;
    }
}
