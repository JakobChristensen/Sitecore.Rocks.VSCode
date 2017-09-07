import * as vscode from 'vscode';
import { SitecoreExplorerProvider } from './SitecoreExplorer';
import { commands, } from 'vscode';
import { FieldEditorProvider } from "./FieldEditorProvider";
import { SitecoreItem } from './sitecore/SitecoreItem';
import { ConnectionTreeViewItem } from './SitecoreExplorer/ConnectionTreeViewItem';

export function activate(context: vscode.ExtensionContext) {
    // sitecore explorer
    const sitecoreExplorer = new SitecoreExplorerProvider(context);
    vscode.window.registerTreeDataProvider('sitecoreExplorer', sitecoreExplorer);

    // sitecore field editor
    let provider = new FieldEditorProvider(context.asAbsolutePath("src/"));
    vscode.workspace.registerTextDocumentContentProvider('sitecore-item', provider);

    // commands
    vscode.commands.registerCommand('extension.sitecore.editItem', (item: SitecoreItem) => {
        let previewUri = vscode.Uri.parse('sitecore-item://pathfinder/' + item.database + "/" + item.id);

        return vscode.commands.executeCommand('vscode.previewHtml', previewUri, undefined, item.name).then((success) => {
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
    });

    vscode.commands.registerCommand('extension.sitecore.saveItem', (args: { data: string }) => vscode.window.showInformationMessage("Save Item: " + args.data));

    vscode.commands.registerCommand('extension.sitecore.addConnection', () => sitecoreExplorer.addConnection());
    vscode.commands.registerCommand('extension.sitecore.removeConnection', (connectionTreeViewItem: ConnectionTreeViewItem) => sitecoreExplorer.removeConnection(connectionTreeViewItem));
}

export function deactivate() {
}