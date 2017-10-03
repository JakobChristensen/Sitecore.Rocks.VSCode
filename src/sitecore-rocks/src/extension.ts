import * as vscode from "vscode";
import { FieldEditorProvider } from "./FieldEditorProvider";
import { LayoutDesignerProvider } from "./LayoutDesignerProvider";
import { SitecoreItem } from "./sitecore/SitecoreItem";
import { SitecoreExplorerProvider } from "./SitecoreExplorer";
import { ConnectionTreeViewItem } from "./SitecoreExplorer/ConnectionTreeViewItem";
import { ItemTreeViewItem } from "./SitecoreExplorer/ItemTreeViewItem";
import { TreeViewItem } from "./SitecoreExplorer/TreeViewItem";

export function activate(context: vscode.ExtensionContext) {
    (global as any).sitecoreRocks = {};

    // sitecore explorer
    const sitecoreExplorer = new SitecoreExplorerProvider(context);
    vscode.window.registerTreeDataProvider("sitecoreExplorer", sitecoreExplorer);

    // sitecore field editor
    const fieldEditorProvider = new FieldEditorProvider(context.asAbsolutePath("src/"));
    vscode.workspace.registerTextDocumentContentProvider("sitecore-item", fieldEditorProvider);

    // sitecore layout designer
    const layoutDesignerProvider = new LayoutDesignerProvider(context.asAbsolutePath("src/"));
    vscode.workspace.registerTextDocumentContentProvider("sitecore-layout", layoutDesignerProvider);

    // commands
    vscode.commands.registerCommand("extension.sitecore.addConnection", () => sitecoreExplorer.addConnection());
    vscode.commands.registerCommand("extension.sitecore.addItem", (item: ItemTreeViewItem | vscode.Uri | undefined) => sitecoreExplorer.addItem(item));
    vscode.commands.registerCommand("extension.sitecore.deleteItem", (item: ItemTreeViewItem | vscode.Uri | undefined) => sitecoreExplorer.deleteItem(item));
    vscode.commands.registerCommand("extension.sitecore.designLayout", (item: ItemTreeViewItem | vscode.Uri | undefined) => sitecoreExplorer.designLayout(item));
    vscode.commands.registerCommand("extension.sitecore.editItem", (item: ItemTreeViewItem | vscode.Uri | undefined) => sitecoreExplorer.editItem(item));
    vscode.commands.registerCommand("extension.sitecore.insertItem", (item: ItemTreeViewItem | vscode.Uri | undefined) => sitecoreExplorer.insertItem(item));
    vscode.commands.registerCommand("extension.sitecore.navigateTemplate", (item: ItemTreeViewItem | vscode.Uri | undefined) => sitecoreExplorer.navigateTemplate(item));
    vscode.commands.registerCommand("extension.sitecore.openLayout", (file: any) => sitecoreExplorer.openLayout(file));
    vscode.commands.registerCommand("extension.sitecore.pickRendering", (args: { key: string }) => sitecoreExplorer.pickRendering(key));
    vscode.commands.registerCommand("extension.sitecore.refresh", (item: ItemTreeViewItem | vscode.Uri | undefined) => sitecoreExplorer.refresh(item));
    vscode.commands.registerCommand("extension.sitecore.removeConnection", (connectionTreeViewItem: ConnectionTreeViewItem | vscode.Uri | undefined) => sitecoreExplorer.removeConnection(connectionTreeViewItem));
    vscode.commands.registerCommand("extension.sitecore.saveItem", (args: { data: any, host: string }) => sitecoreExplorer.saveItem(new SitecoreItem(args.data, args.host, false)));
    vscode.commands.registerCommand("extension.sitecore.saveLayout", (args: { layout: any }) => sitecoreExplorer.saveLayout(args.layout));
    vscode.commands.registerCommand("extension.sitecore.selectItem", (treeViewItem: TreeViewItem | vscode.Uri | undefined) => sitecoreExplorer.selectItem(treeViewItem));
}

export function deactivate() {
    return;
}
