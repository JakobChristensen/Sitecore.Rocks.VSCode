"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const ItemUri_1 = require("./data/ItemUri");
class FieldEditorProvider {
    constructor(absolutePath) {
        this.absolutePath = absolutePath;
        this._onDidChange = new vscode.EventEmitter();
    }
    provideTextDocumentContent(uri) {
        const s = uri.toString().substr(16);
        const itemUri = ItemUri_1.ItemUri.parse(s);
        return new Promise((completed, error) => {
            itemUri.websiteUri.connection.getItem(itemUri).then(item => {
                completed(this.render(item));
            });
        });
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    render(item) {
        let output = `
        <html>
        <head>
            <base href="">
            ${this.renderStyles()}
            <script src="https://ajax.aspnetcdn.com/ajax/knockout/knockout-3.4.2.js" type="application/javascript"> </script>
        </head>
        <body>
            <h1>${item.displayName}</h1>
            <div>
            ${this.renderFields(item)}
            </div>
            <script type="application/javascript">
                var item = ${JSON.stringify(item)};
                ko.applyBindings(item);

                window.onkeyup = function(event) {
                    if (event.keyCode == 83 && event.ctrlKey) {
                        event.preventDefault();
                        saveItem();
                        return false;
                    }
                }

                function saveItem() {
                    let args = { "data": item };
                    let saveItemCommand = "command:extension.sitecore.saveItem?" + encodeURIComponent(JSON.stringify(args));
                    window.parent.postMessage({ command: "did-click-link", data: saveItemCommand }, "file://");
                }
            </script>
        </body>
        </html>`;
        return output;
    }
    renderFields(item) {
        return `
        <div data-bind="foreach: fields">
            <div class="field">
                <div>
                    <label data-bind="text: displayName"></label>:
                </div>
                <div>
                    <input type="text" data-bind="textInput: value">
                </div>
            </div>
        </div>
        `;
    }
    renderStyles() {
        return `
        <style>
            body {
                font-size: 13px;
                line-height: 22px;
            }
            input[type=text] {
                width: 100%;
                padding: 6px 12px;
                box-sizing : border-box;
            }
            .field {
                margin-bottom: 8px;
            }

            body.vscode-dark {
                background: #1e1e1e;
            }

            .vscode-dark input {
                background: #252526;
                border: 1px solid #383838;
                color: #cccccc;
            }
        </style>
        `;
    }
}
exports.FieldEditorProvider = FieldEditorProvider;
//# sourceMappingURL=FieldEditorProvider.js.map