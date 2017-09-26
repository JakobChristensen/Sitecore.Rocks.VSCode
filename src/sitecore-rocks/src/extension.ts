import * as vscode from "vscode";
import { FieldEditorProvider } from "./FieldEditorProvider";
import { SitecoreItem } from "./sitecore/SitecoreItem";
import { SitecoreExplorerProvider } from "./SitecoreExplorer";
import { ConnectionTreeViewItem } from "./SitecoreExplorer/ConnectionTreeViewItem";
import { ItemTreeViewItem } from "./SitecoreExplorer/ItemTreeViewItem";
import { TreeViewItem } from "./SitecoreExplorer/TreeViewItem";

export function activate(context: vscode.ExtensionContext) {
    // sitecore explorer
    const sitecoreExplorer = new SitecoreExplorerProvider(context);
    vscode.window.registerTreeDataProvider("sitecoreExplorer", sitecoreExplorer);

    // sitecore field editor
    const provider = new FieldEditorProvider(context.asAbsolutePath("src/"));
    vscode.workspace.registerTextDocumentContentProvider("sitecore-item", provider);

    // commands
    vscode.commands.registerCommand("extension.sitecore.addConnection", () => sitecoreExplorer.addConnection());
    vscode.commands.registerCommand("extension.sitecore.addItem", (item: ItemTreeViewItem) => sitecoreExplorer.addItem(item));
    vscode.commands.registerCommand("extension.sitecore.deleteItem", (item: ItemTreeViewItem) => sitecoreExplorer.deleteItem(item));
    vscode.commands.registerCommand("extension.sitecore.editItem", (item: ItemTreeViewItem) => sitecoreExplorer.editItem(item));
    vscode.commands.registerCommand("extension.sitecore.insertItem", (item: ItemTreeViewItem) => sitecoreExplorer.insertItem(item));
    vscode.commands.registerCommand("extension.sitecore.navigateTemplate", (item: ItemTreeViewItem) => sitecoreExplorer.navigateTemplate(item));
    vscode.commands.registerCommand("extension.sitecore.refresh", (item: ItemTreeViewItem) => sitecoreExplorer.refresh(item));
    vscode.commands.registerCommand("extension.sitecore.removeConnection", (connectionTreeViewItem: ConnectionTreeViewItem) => sitecoreExplorer.removeConnection(connectionTreeViewItem));
    vscode.commands.registerCommand("extension.sitecore.selectItem", (treeViewItem: TreeViewItem) => sitecoreExplorer.selectItem(treeViewItem));
    vscode.commands.registerCommand("extension.sitecore.saveItem", (args: { data: any, host: string }) => sitecoreExplorer.saveItem(new SitecoreItem(args.data, args.host, false)));
}

export function deactivate() {
    return;
}
