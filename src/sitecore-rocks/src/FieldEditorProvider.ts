import * as vscode from 'vscode';

export class FieldEditorProvider implements vscode.TextDocumentContentProvider {
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

    constructor(public absolutePath: string) {
    }

    public provideTextDocumentContent(uri: vscode.Uri): string {
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

            <script src="${this.absolutePath + 'field-editor.js'}"> </script>

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

