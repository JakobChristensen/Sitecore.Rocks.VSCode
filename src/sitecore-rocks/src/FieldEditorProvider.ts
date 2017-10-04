import * as vscode from "vscode";
import { ItemUri } from "./data/ItemUri";
import { SitecoreItem } from "./sitecore/SitecoreItem";

export class FieldEditorProvider implements vscode.TextDocumentContentProvider {
    private onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();

    constructor(public absolutePath: string) {
    }

    public provideTextDocumentContent(uri: vscode.Uri): vscode.ProviderResult<string> {
        const s = uri.toString().substr(16);
        const itemUri = ItemUri.parse(s);

        return new Promise((completed, error) => {
            itemUri.websiteUri.connection.getItem(itemUri).then(item => {
                completed(this.render(item));
            });
        });
    }

    public get onDidChange(): vscode.Event<vscode.Uri> {
        return this.onDidChangeEmitter.event;
    }

    private render(item: SitecoreItem): string {
        return `
<html>
<head>
    <base href="">
    ${this.renderStyles()}
    <script src="https://ajax.aspnetcdn.com/ajax/knockout/knockout-3.4.2.js" type="application/javascript"> </script>
</head>
<body>
    <div class="menu">
    <a href="#" data-bind="click: $root.saveItem" title="Ctrl+S">Save</a>
    </div>

    <h1>${item.displayName}<span data-bind="visible: isModified()">*</span></h1>

    <div>
    ${this.renderFields(item)}
    ${this.renderInformation()}
    </div>

    <script type="application/javascript">
        (function() {
            var model = loadModel();
            ko.applyBindings(model);

            window.onkeyup = function(event) {
                if (event.keyCode == 83 && event.ctrlKey) {
                    event.preventDefault();
                    saveItem();
                    return false;
                }
            }

            function loadModel() {
                var model = ${JSON.stringify(item)};

                for (let field of model.fields) {
                    field.value = ko.observable(field.value);
                    field.originalValue = ko.observable(field.originalValue);
                }

                model.isModified = ko.computed(getIsModified, model);
                model.showInformation = ko.observable(false);
                model.toggleInformation = toggleInformation;
                model.saveItem = saveItem;

                return model;
            }

            function saveItem() {
                let newItem = Object.assign({}, model);

                newItem.fields = [];
                for (let index = 0; index < model.fields.length; index++) {
                    let newField = Object.assign({}, model.fields[index])
                    newField.value = model.fields[index].value();
                    newField.originalValue = model.fields[index].originalValue();
                    newItem.fields.push(newField);
                }

                let args = { "data": newItem, "host": "${item.itemUri.websiteUri.connection.host}" };
                let saveItemCommand = "command:extension.sitecore.saveItem?" + encodeURIComponent(JSON.stringify(args));
                window.parent.postMessage({ command: "did-click-link", data: saveItemCommand }, "file://");

                for (let field of model.fields) {
                    field.originalValue(field.value());
                }
            }

            function getIsModified() {
                for(let field of this.fields) {
                    if (field.value() !== field.originalValue()) {
                        return true;
                    }
                }

                return false;
            }

            function toggleInformation() {
                model.showInformation(!model.showInformation());
            }
        }());
    </script>
</body>
</html>`;
    }

    private renderFields(item: SitecoreItem): string {
        return `
        <div data-bind="foreach: fields">
            <div class="field">
                <div>
                    <label><span data-bind="text: displayName"></span><span data-bind="visible: value() !== originalValue()">*</span></label>:
                </div>
                <div>
                    <input type="text" data-bind="textInput: value">
                </div>
            </div>
        </div>
        `;
    }

    private renderInformation(): string {
        return `
        <label><span style="display: inline-block"><a href="#" class="button" data-bind="css: {rotate: showInformation()}, click: toggleInformation">&rsaquo;</a></span> Item information:</label>
        <div class="panel" data-bind="visible: showInformation()">
            <table>
                <tr><td>Name:</td><td data-bind="text: name"></td></tr>
                <tr><td>Display Name:</td><td data-bind="text: displayName"></td></tr>
                <tr><td>Template:</td><td data-bind="text: templateName"></td></tr>
                <tr><td>Path:</td><td data-bind="text: path"></td></tr>
                <tr><td>Database:</td><td data-bind="text: database"></td></tr>
                <tr><td>ID:</td><td data-bind="text: id"></td></tr>
            </table>
        </div>
        `;
    }

    private renderStyles(): string {
        return `
        <style>
            body {
                font-size: 13px;
                line-height: 22px;
            }
            input[type=text] {
                width: 100%;
                padding: 6px 12px;
                box-sizing: border-box;
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
            .vscode-dark .panel {
                background: #252526;
                border: 1px solid #383838;
                color: #cccccc;
                padding: 6px 12px;
            }
            .vscode-dark a.button {
                color: #cccccc;
            }

            a.button {
                display:block;
                font-size: 24px;
                text-decoration: none;
                outline: none;
            }
            a.rotate {
                transform: translateY(4px) rotate(90deg);
            }

            .vscode-dark a {
                color: #cccccc;
                text-decoration: none;
            }
            .vscode-dark a:hover {
                color: #ffffff;
            }
            .menu {
                padding: 4px 0;
                border-bottom: 1px solid #666666;
            }
        </style>
        `;
    }
}
