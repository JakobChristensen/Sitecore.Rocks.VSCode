"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const ItemUri_1 = require("./data/ItemUri");
class FieldEditorProvider {
    constructor(absolutePath) {
        this.absolutePath = absolutePath;
        this.onDidChangeEmitter = new vscode.EventEmitter();
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
        return this.onDidChangeEmitter.event;
    }
    render(item) {
        const output = `
<html>
<head>
    <base href="">
    ${this.renderStyles()}
    <script src="https://ajax.aspnetcdn.com/ajax/knockout/knockout-3.4.2.js" type="application/javascript"> </script>
</head>
<body>
    <h1>${item.displayName}<span data-bind="visible: isModified()">*</span></h1>
    <div>
    ${this.renderFields(item)}
    </div>

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

    <script type="application/javascript">
        (function() {
            var item = loadItem(${JSON.stringify(item)});

            ko.applyBindings(item);

            window.onkeyup = function(event) {
                if (event.keyCode == 83 && event.ctrlKey) {
                    event.preventDefault();
                    saveItem();
                    return false;
                }
            }

            function loadItem(data) {
                for (let field of data.fields) {
                    field.value = ko.observable(field.value);
                    field.originalValue = ko.observable(field.originalValue);
                }

                data.isModified = ko.computed(getIsModified, data);
                data.showInformation = ko.observable(false);
                data.toggleInformation = toggleInformation;

                return data;
            }

            function saveItem() {
                let newItem = Object.assign({}, item);
                newItem.fields = [];
                for (let index = 0; index < item.fields.length; index++) {
                    let newField = Object.assign({}, item.fields[index])
                    newField.value = item.fields[index].value();
                    newField.originalValue = item.fields[index].originalValue();
                    newItem.fields.push(newField);
                }

                let args = { "data": newItem, "host": "${item.itemUri.websiteUri.connection.host}" };
                let saveItemCommand = "command:extension.sitecore.saveItem?" + encodeURIComponent(JSON.stringify(args));
                window.parent.postMessage({ command: "did-click-link", data: saveItemCommand }, "file://");

                for (let field of item.fields) {
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
                item.showInformation(!item.showInformation());
            }
        }());
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
                    <label><span data-bind="text: displayName"></span><span data-bind="visible: value() !== originalValue()">*</span></label>:
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
        </style>
        `;
    }
}
exports.FieldEditorProvider = FieldEditorProvider;
//# sourceMappingURL=FieldEditorProvider.js.map