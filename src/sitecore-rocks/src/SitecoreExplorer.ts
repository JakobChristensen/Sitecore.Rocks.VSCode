import { CancellationToken, commands, Event, EventEmitter, ExtensionContext, ProviderResult, TextDocumentContentProvider, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri, window, workspace } from "vscode";
import * as vscode from "vscode";
import { DatabaseUri } from "./data/DatabaseUri";
import { ItemUri } from "./data/ItemUri";
import { ItemVersionUri } from "./data/ItemVersionUri";
import { SitecoreConnection } from "./data/SitecoreConnection";
import { SitecoreItem } from "./sitecore/SitecoreItem";
import { ConnectionTreeViewItem, isConnectionTreeViewItem } from "./SitecoreExplorer/ConnectionTreeViewItem";
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

    public removeConnection(item: ConnectionTreeViewItem | vscode.Uri | undefined) {
        if (!item || item instanceof vscode.Uri) {
            return;
        }

        vscode.window.showWarningMessage("Are you sure, you want to remove the connection?", "Yes").then(response => {
            if (response !== "Yes") {
                return;
            }

            const index = this.connections.indexOf(item.connection);
            if (index < 0) {
                return;
            }

            this.connections.splice(index, 1);

            this.saveConnections();
            this.onDidChangeTreeDataEmitter.fire();
        });
    }

    public addItem(parentItem: ItemTreeViewItem | vscode.Uri | undefined) {
        const itemUri = this.getSelectedItemUri(parentItem);
        if (!itemUri) {
            return;
        }

        itemUri.websiteUri.connection.getTemplates(itemUri.databaseUri).then(templates => {
            vscode.window.showQuickPick<QuickPickSitecoreItem>(templates.map(t => new QuickPickSitecoreItem(t)), { placeHolder: "Select template of the new item" }).then(templateItem => {
                if (!templateItem) {
                    return;
                }

                vscode.window.showInputBox({ prompt: "Enter the name of the new item:", placeHolder: "NewItem", value: templateItem.item.displayName }).then(newName => {
                    if (!newName) {
                        return;
                    }

                    itemUri.websiteUri.connection.addItem(itemUri, templateItem.item.id, newName).then(() => {
                        const treeViewItem = this.find(itemUri.toString());
                        if (treeViewItem) {
                            this.onDidChangeTreeDataEmitter.fire(treeViewItem);
                        }
                    });
                });
            });
        });
    }

    public deleteItem(item: ItemTreeViewItem | vscode.Uri | undefined) {
        const itemUri = this.getSelectedItemUri(item);
        if (!itemUri) {
            return;
        }

        let name = "this item";
        if (item instanceof ItemTreeViewItem) {
            name = "'" + item.item.displayName + "'";
        } else {
            const t = this.find(itemUri.toString());
            if (t) {
                name = "'" + t.treeItem.label + "'";
            }
        }

        vscode.window.showWarningMessage(`Are you sure, you want to delete ${name}?`, "OK").then(response => {
            if (response !== "OK") {
                return;
            }

            itemUri.websiteUri.connection.deleteItem(itemUri).then(() => {
                this.selectedTreeViewItem = undefined;
                const treeViewItem = this.find(itemUri.toString());

                if (treeViewItem) {
                    this.onDidChangeTreeDataEmitter.fire(treeViewItem.parent);
                }
            });
        });
    }

    public designLayout(item: ItemTreeViewItem | vscode.Uri | undefined) {
        const itemUri = this.getSelectedItemUri(item);
        if (!itemUri) {
            return;
        }

        let name = "Layout";
        if (item instanceof ItemTreeViewItem) {
            name = item.item.displayName + " layout";
        } else {
            const t = this.find(itemUri.toString());
            if (t) {
                name = t.treeItem.label + " layout";
            }
        }

        const previewUri = vscode.Uri.parse("sitecore-layout://" + itemUri.toString());
        return vscode.commands.executeCommand("vscode.previewHtml", previewUri, undefined, name).then((success) => undefined, (reason) => vscode.window.showErrorMessage(reason));
    }

    public editItem(item: ItemTreeViewItem | vscode.Uri | undefined) {
        const itemUri = this.getSelectedItemUri(item);
        if (!itemUri) {
            return;
        }

        let name = "Item";
        if (item instanceof ItemTreeViewItem) {
            name = item.item.displayName;
        } else {
            const t = this.find(itemUri.toString());
            if (t) {
                name = t.treeItem.label;
            }
        }

        const previewUri = vscode.Uri.parse("sitecore-item://" + itemUri.toString());
        return vscode.commands.executeCommand("vscode.previewHtml", previewUri, undefined, name).then((success) => undefined, (reason) => vscode.window.showErrorMessage(reason));
    }

    public insertItem(parentItem: ItemTreeViewItem | vscode.Uri | undefined) {
        const itemUri = this.getSelectedItemUri(parentItem);
        if (!itemUri) {
            return;
        }

        itemUri.websiteUri.connection.getInsertOptions(itemUri).then(insertOptions => {
            vscode.window.showQuickPick<QuickPickSitecoreItem>(insertOptions.map(t => new QuickPickSitecoreItem(t)), { placeHolder: "Select template of the new item" }).then(templateItem => {
                if (!templateItem) {
                    return;
                }

                vscode.window.showInputBox({ prompt: "Enter the name of the new item:", placeHolder: "NewItem", value: templateItem.item.displayName }).then(newName => {
                    if (!newName) {
                        return;
                    }

                    itemUri.websiteUri.connection.addItem(itemUri, templateItem.item.id, newName).then(() => {
                        const treeViewItem = this.find(itemUri.toString());
                        if (treeViewItem)  {
                            this.onDidChangeTreeDataEmitter.fire(treeViewItem);
                        }
                    });
                });
            });
        });
    }

    public navigateTemplate(item: ItemTreeViewItem | vscode.Uri | undefined) {
        const itemUri = this.getSelectedItemUri(item);
        if (!itemUri) {
            return;
        }

        itemUri.websiteUri.connection.getItem(itemUri).then(itm => {
            const path: string[] = [];

            path.push(itemUri.databaseUri.toString());

            for (const id of itm.longPath.split("/")) {
                if (!id) {
                    continue;
                }

                path.push(ItemUri.create(itemUri.databaseUri, id).toString());
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

    public refresh(item: TreeViewItem | vscode.Uri | undefined) {
        const selectedItem = item || this.selectedTreeViewItem;
        if (!selectedItem) {
            return;
        }

        this.onDidChangeTreeDataEmitter.fire(selectedItem);
    }

    public saveItem(item: SitecoreItem) {
        item.itemUri.websiteUri.connection.saveItems([item]);
    }

    public selectItem(treeViewItem: TreeViewItem | vscode.Uri | undefined) {
        if (treeViewItem instanceof vscode.Uri) {
            this.selectedTreeViewItem = undefined;
            return;
        }

        this.selectedTreeViewItem = treeViewItem;
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

            if (treeViewItem.children) {
                const i = this.findUri(treeViewItem.children, uri);
                if (i) {
                    return i;
                }
            }
        }

        return undefined;
    }

    private getSelectedItemUri(itemTreeViewItem: ItemTreeViewItem | vscode.Uri | undefined): ItemUri | undefined {
        if (itemTreeViewItem instanceof vscode.Uri) {
            return ItemUri.parse(decodeURIComponent(itemTreeViewItem.toString().substr(16)));
        }

        if (!itemTreeViewItem && isItemTreeViewItem(this.selectedTreeViewItem)) {
            itemTreeViewItem = this.selectedTreeViewItem;
        }

        if (itemTreeViewItem) {
            return itemTreeViewItem.itemUri;
        }

        vscode.window.showInformationMessage("Select an item in the Sitecore Explorer first");
        return undefined;
    }
}
