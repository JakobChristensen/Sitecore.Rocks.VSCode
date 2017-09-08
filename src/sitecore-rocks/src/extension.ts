import * as vscode from 'vscode';
import { SitecoreExplorerProvider } from './SitecoreExplorer';
import { commands, } from 'vscode';
import { FieldEditorProvider } from "./FieldEditorProvider";
import { SitecoreItem } from './sitecore/SitecoreItem';
import { ConnectionTreeViewItem } from './SitecoreExplorer/ConnectionTreeViewItem';
import { ItemTreeViewItem } from './SitecoreExplorer/ItemTreeViewItem';

export function activate(context: vscode.ExtensionContext) {
    // sitecore explorer
    const sitecoreExplorer = new SitecoreExplorerProvider(context);
    vscode.window.registerTreeDataProvider('sitecoreExplorer', sitecoreExplorer);

    // sitecore field editor
    let provider = new FieldEditorProvider(context.asAbsolutePath("src/"));
    vscode.workspace.registerTextDocumentContentProvider('sitecore-item', provider);

    // commands
    vscode.commands.registerCommand('extension.sitecore.editItem', (item: ItemTreeViewItem) => sitecoreExplorer.editItem(item));
    vscode.commands.registerCommand('extension.sitecore.saveItem', (args: { data: any }) => sitecoreExplorer.saveItem(new SitecoreItem(args.data, undefined, false)));
    vscode.commands.registerCommand('extension.sitecore.addConnection', () => sitecoreExplorer.addConnection());
    vscode.commands.registerCommand('extension.sitecore.removeConnection', (connectionTreeViewItem: ConnectionTreeViewItem) => sitecoreExplorer.removeConnection(connectionTreeViewItem));
}

export function deactivate() {
}