'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const SitecoreExplorer_1 = require("./SitecoreExplorer");
class TextDocumentContentProvider {
    constructor() {
        this._onDidChange = new vscode.EventEmitter();
    }
    provideTextDocumentContent(uri) {
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
    get onDidChange() {
        return this._onDidChange.event;
    }
}
function activate(context) {
    const sitecoreExplorer = new SitecoreExplorer_1.SitecoreTreeDataProvider();
    vscode.window.registerTreeDataProvider('sitecoreExplorer', sitecoreExplorer);
    let disposable = vscode.commands.registerCommand('extension.sitecore.editItem', (item) => {
        let previewUri = vscode.Uri.parse('sitecore-item://pathfinder/' + item.database + "/" + item.id);
        return vscode.commands.executeCommand('vscode.previewHtml', previewUri, undefined, item.name).then((success) => {
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
    });
    context.subscriptions.push(disposable);
    vscode.commands.registerCommand('extension.sitecore.saveItem', (args) => {
        vscode.window.showInformationMessage("Save Item: " + args.data);
    });
    let provider = new TextDocumentContentProvider();
    provider.fieldEditorPath = context.asAbsolutePath("src/field-editor.js");
    let registration = vscode.workspace.registerTextDocumentContentProvider('sitecore-item', provider);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map