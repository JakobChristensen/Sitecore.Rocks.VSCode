import * as vscode from 'vscode';
import { SitecoreExplorerProvider } from './SitecoreExplorer';
import { commands, } from 'vscode';
import { FieldEditorProvider } from "./FieldEditorProvider";
import { SitecoreItem } from './sitecore/SitecoreItem';

export function activate(context: vscode.ExtensionContext) {
    // sitecore explorer
    const sitecoreExplorer = new SitecoreExplorerProvider();
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

    vscode.commands.registerCommand('extension.sitecore.saveItem', (args: { data: string }) =>  vscode.window.showInformationMessage("Save Item: " + args.data));
}

export function deactivate() {
}