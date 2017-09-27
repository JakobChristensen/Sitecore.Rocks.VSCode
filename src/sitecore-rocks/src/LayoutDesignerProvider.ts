import * as vscode from "vscode";
import { ItemUri } from "./data/ItemUri";
import { SitecoreItem } from "./sitecore/SitecoreItem";

export class LayoutDesignerProvider implements vscode.TextDocumentContentProvider {
    private onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();

    constructor(public absolutePath: string) {
    }

    public provideTextDocumentContent(uri: vscode.Uri): vscode.ProviderResult<string> {
        const s = uri.toString().substr(18);
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

    <script type="text/html" id="placeholders">
        <div data-bind="foreach: $data" style="border:1px solid #252526; padding:0">
            <input type="text" class="placeholder" onfocus="$root.clearProperties()" data-bind="textInput: name"><span class="placeholder"> - Placeholder</span>
            <div style="padding:4px 0 4px 8px">
                <div data-bind="foreach: elements" style="padding-left:24px">
                    <input type="text" class="rendering" onfocus="$root.setProperties($data)" data-bind="textInput: renderingName"><span class="rendering"> - Rendering</span>
                    <div data-bind="if: placeholders && placeholders.length > 0">
                        <div data-bind="template: { name: 'placeholders', data: placeholders }" style="padding-left:24px"></div>
                    </div>
                </div>
            </div>
        </div>
    </script>
</head>
<body>
    <h1>${item.displayName}<span data-bind="visible: isModified()">*</span></h1>

    <table>
        <tr>
            <td style="vertical-align:top">
                <div data-bind="template: { name: 'placeholders', data: placeholders }"></div>
            </td>

            <td style="vertical-align:top" data-bind="with:selectedItem()">
                <div>
                    Properties:
                </div>
                <table data-bind="foreach: {data: Object.keys(renderingParams), as: 'propertyName'}">
                    <tr>
                        <td>
                            <input type="text" data-bind="textInput: propertyName">
                        </td>
                        <td>
                            <input type="text" data-bind="textInput: $root.selectedItem().renderingParams[propertyName]">
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

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
                var model = {
                    "context": {
                        "pageEditing": false,
                        "site": {
                            "name": "website"
                        }
                    },
                    "name": "Test",
                    "displayName": "Test",
                    "fields": {
                        "Title": {
                            "value": "test item title",
                            "editable": "test item title"
                        },
                        "Text": {
                            "value": "test item text",
                            "editable": "test item text"
                        }
                    },
                    "placeholders": [
                        {
                            "name": "main",
                            "path": "main",
                            "elements": [
                                {
                                    "renderingName": "Header",
                                    "renderingParams": { "Text": "Welcome to Sitecore", "Title": "Sitecore" },
                                    "uid": "fa0f776f-15bf-4c1b-8fb1-0f6eda37c83c",
                                },
                                {
                                    "renderingName": "Body",
                                    "renderingParams": { "Text": "Welcome to Sitecore", "Title": "Sitecore" },
                                    "uid": "fa0f776f-15bf-4c1b-8fb1-0f6eda37c83b",
                                    "placeholders": [
                                        {
                                            "name": "body",
                                            "path": "/main/body",
                                            "elements": [
                                                {
                                                    "renderingName": "Image Component",
                                                    "renderingParams": {},
                                                    "uid": "60776439-144d-4c9e-ac68-5653502dad47",
                                                    "placeholders": [],
                                                    "name": "code",
                                                    "type": "data/json",
                                                    "contents": {
                                                        "Image": {
                                                            "value": {
                                                                "src": "/-/media/Experience-Explorer/Presets/Julie-128x128.ashx?h=128&amp;la=en&amp;w=128&amp;hash=2F9EA2943DAC7347510D2FB683222981C28DFE8F",
                                                                "alt": "Julie",
                                                                "width": "128",
                                                                "height": "128"
                                                            },
                                                            "editable": ""
                                                        }
                                                    },
                                                    "attributes": {
                                                        "type": "data/json"
                                                    }
                                                }
                                            ]
                                        }
                                    ],
                                    "name": "code",
                                    "type": "data/json",
                                    "contents": null,
                                    "attributes": {
                                        "type": "data/json"
                                    }
                                }
                            ]
                        }
                    ]
                };

                model.isModified = ko.computed(getIsModified, model);
                model.selectedItem = ko.observable();
                model.clearProperties = clearProperties;
                model.setProperties = setProperties;

                return model;
            }

            function saveItem() {
            }

            function selectItem(item) {
                console.log(item);
                model.selectedItem(item);
            }

            function getIsModified() {
                return false;
            }

            function clearProperties() {
                model.selectItem(undefined);
            }

            function setProperties(data) {
                model.selectItem(data);
            }
        }());
    </script>
</body>
</html>`;
    }

    private renderStyles(): string {
        return `
        <style>
            body {
                font-size: 13px;
                line-height: 22px;
            }
            input[type=text] {
                border: none;
                outline: none;
                padding: 2px 4px;
                margin: 0;
            }

            body.vscode-dark {
                background: #1e1e1e;
            }

            .vscode-dark .placeholder {
                color: #999999;
            }

            .vscode-dark .rendering {
                color: #ededed;
            }

            .vscode-dark input {
                background: #252526;
                color: #cccccc;
            }
            .vscode-dark a {
                color: #cccccc;
                text-decoration: none;
            }
        </style>
        `;
    }
}
