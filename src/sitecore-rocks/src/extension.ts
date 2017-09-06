'use strict';

import * as vscode from 'vscode';
import { SitecoreTreeDataProvider, SitecoreItem } from './SitecoreExplorer';
import { commands, } from 'vscode';


class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
    public fieldEditorPath: string;
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

    public provideTextDocumentContent(uri: vscode.Uri): string {
        console.log(this.fieldEditorPath);
        return `
        <html>
        <head>
            <base href="">
        </head>
        <body>
            <h1>Sitecore Item</h1>
            ${uri.toString()}
            <div><label>Title:</label></div>
            <div><input type="text"></div>
            <div><label>Text:</label></div>
            <div><input type="text"></div>
            <div><button onclick="helloWorld()">Hello</button></div>
            <div><a href="#" onclick="saveItem()">Save</a></div>

            <script src="${this.fieldEditorPath}"> </script>

            <script>
                function saveItem() {
                    let args = { "data": "It Works"};
                    let saveItemCommand = "command:extension.sitecore.saveItem?" + encodeURIComponent(JSON.stringify(args));

                    window.parent.postMessage({ command: "did-click-link", data: saveItemCommand }, "file://");
                }
            </script>
        </body>
        </html>
        `;
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }
}

export function activate(context: vscode.ExtensionContext) {
    const sitecoreExplorer = new SitecoreTreeDataProvider();
    vscode.window.registerTreeDataProvider('sitecoreExplorer', sitecoreExplorer);

    let disposable = vscode.commands.registerCommand('extension.sitecore.editItem', (item: SitecoreItem) => {
        let previewUri = vscode.Uri.parse('sitecore-item://pathfinder/' + item.database + "/" + item.id);

        return vscode.commands.executeCommand('vscode.previewHtml', previewUri, undefined, item.name).then((success) => {
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
    });

    context.subscriptions.push(disposable);

    vscode.commands.registerCommand('extension.sitecore.saveItem', (args: { data: string }) => {
        vscode.window.showInformationMessage("Save Item: " + args.data);
    });

    let provider = new TextDocumentContentProvider();
    provider.fieldEditorPath = context.asAbsolutePath("src/field-editor.js");
	let registration = vscode.workspace.registerTextDocumentContentProvider('sitecore-item', provider);
}

export function deactivate() {
}