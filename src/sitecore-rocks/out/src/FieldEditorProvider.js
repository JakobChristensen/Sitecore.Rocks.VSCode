"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class FieldEditorProvider {
    constructor(absolutePath) {
        this.absolutePath = absolutePath;
        this._onDidChange = new vscode.EventEmitter();
    }
    provideTextDocumentContent(uri) {
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
    get onDidChange() {
        return this._onDidChange.event;
    }
}
exports.FieldEditorProvider = FieldEditorProvider;
//# sourceMappingURL=FieldEditorProvider.js.map