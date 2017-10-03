import * as vscode from "vscode";
import { ItemUri } from "./data/ItemUri";
import { SitecoreItem } from "./sitecore/SitecoreItem";

export class LayoutDesignerProvider implements vscode.TextDocumentContentProvider {
    private onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();

    constructor(public absolutePath: string) {
    }

    public provideTextDocumentContent(uri: vscode.Uri): vscode.ProviderResult<string> {
        let model = {
            context: {
                pageEditing: false,
                site: {
                    name: "website",
                },
            },
            name: "Test",
            displayName: "Test",
            fields: {
                Title: {
                    value: "test item title",
                    editable: "test item title",
                },
                Text: {
                    value: "test item text",
                    editable: "test item text",
                },
            },
            placeholders: [
                {
                    name: "main",
                    path: "main",
                    elements: [
                        {
                            renderingName: "Header",
                            renderingParams: { Text: "Welcome to Sitecore", Title: "Sitecore" },
                            uid: "fa0f776f-15bf-4c1b-8fb1-0f6eda37c83c",
                        },
                        {
                            renderingName: "Body",
                            renderingParams: { Text: "Welcome to Sitecore", Title: "Sitecore" },
                            uid: "fa0f776f-15bf-4c1b-8fb1-0f6eda37c83b",
                            placeholders: [
                                {
                                    name: "body",
                                    path: "/main/body",
                                    elements: [
                                        {
                                            renderingName: "Image Component",
                                            renderingParams: {},
                                            uid: "60776439-144d-4c9e-ac68-5653502dad47",
                                            placeholders: [],
                                            name: "code",
                                            type: "data/json",
                                            contents: {
                                                Image: {
                                                    value: {
                                                        src: "/-/media/Experience-Explorer/Presets/Julie-128x128.ashx?h=128&amp;la=en&amp;w=128&amp;hash=2F9EA2943DAC7347510D2FB683222981C28DFE8F",
                                                        alt: "Julie",
                                                        width: "128",
                                                        height: "128",
                                                    },
                                                    editable: "",
                                                },
                                            },
                                            attributes: {
                                                type: "data/json",
                                            },
                                        },
                                    ],
                                },
                            ],
                            name: "code",
                            type: "data/json",
                            contents: null,
                            attributes: {
                                type: "data/json",
                            },
                        },
                    ],
                },
            ],
        };

        const uriString = uri.toString();
        if (uriString.substr(0, 24) === "sitecore-layout://file:/") {
            const rocks = (global as any).sitecoreRocks;
            const key = decodeURIComponent(uriString.substr(24));

            model = rocks[key];
            delete rocks[key];
        } else {
            // todo: get model from webservice
        }

        return new Promise((completed, error) => {
            completed(this.render(model));
        });
    }

    public get onDidChange(): vscode.Event<vscode.Uri> {
        return this.onDidChangeEmitter.event;
    }

    private render(model: any): string {
        return `
<html>
<head>
    <base href="">
    ${this.renderStyles()}
    <script src="https://ajax.aspnetcdn.com/ajax/knockout/knockout-3.4.2.js" type="application/javascript"> </script>

    <script type="text/html" id="placeholders">
        <div class="layout-placeholder" data-bind="foreach: $data">
            <div class="toolbar">
                <div class="toolbar-buttons">
                    <a href="#" data-bind="click: $root.addRendering"> Add </a>
                    <a href="#" data-bind="click: $root.removePlaceholder"> Delete </a>
                </div>
                <span class="placeholder">&nbsp;&nbsp;Placeholder</span>
                <input type="text" class="placeholder" data-bind="textInput: name, event: {focus: $root.clearProperties}">
            </div>

            <div class="layout-placeholder-indent" data-bind="foreach: elements">
                <div class="layout-placeholder-renderings">
                    <div class="toolbar">
                        <div class="toolbar-buttons">
                            <a href="#" data-bind="click: $root.moveRenderingUp"> Up </a>
                            <a href="#" data-bind="click: $root.moveRenderingDown"> Down </a>
                            <a href="#" data-bind="click: $root.addPlaceholder"> Add </a>
                            <a href="#" data-bind="click: $root.removeRendering"> Delete </a>
                        </div>
                        <span class="rendering">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" data-bind="click: $root.pickRendering">Rendering</a></span>
                        <input type="text" class="rendering" data-bind="textInput: renderingName, event: {focus: $root.setProperties}">
                    </div>
                </div>

                <div data-bind="if: placeholders().length > 0">
                    <div class="layout-placeholder-placeholders">
                        <div data-bind="template: { name: 'placeholders', data: placeholders }"></div>
                    </div>
                </div>
            </div>
        </div>
    </script>
</head>
<body>
    <div class="menu">
        <button>Save</button>
    </div>

    <h1>${model.displayName} layout<span data-bind="visible: isModified()">*</span></h1>

    <table class="layout">
        <tr>
            <td class="layout-renderings">
                <div class="layout-renderings-panel">
                    <div data-bind="template: { name: 'placeholders', data: placeholders }"></div>

                    <div class="layout-renderings-toolbar">
                        <a href="#" data-bind="click: $root.addRootPlaceholder">Add placeholder</a>
                    </div>
                </div>
            </td>

            <td class="layout-properties">
                <div class="layout-properties-panel">
                    <div data-bind="if: !selectedItem()">
                        <div class="layout-properties-noitems">
                            There are no properties to show.
                        </div>
                    </div>

                    <div data-bind="with: selectedItem()">
                        <div class="layout-properties-title">
                            <b><span data-bind="text: renderingName"></span> properties:</b>
                        </div>

                        <table class="layout-properties-table" cellpadding="0" cellspacing="0">
                            <tbody data-bind="foreach: parameters">
                                <tr class="layout-property">
                                    <td class="layout-property-toolbar-cell">
                                        <input type="text" data-bind="textInput: key">
                                    </td>
                                    <td class="layout-property-value-cell">
                                        <input type="text" data-bind="textInput: value">
                                    </td>
                                    <td class="layout-property-toolbar-cell">
                                        <div class="layout-property-toolbar-buttons">
                                            <a href="#" data-bind="click: $root.removeParameter">Delete</a>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="layout-properties-toolbar">
                            <a href="#" data-bind="click: $root.addParameter">Add property</a>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    </table>
    ${this.renderScript(model)}
</body>
</html>`;
    }

    private renderScript(model: any): string {
        return `
        <script type="application/javascript">
        (function() {
            let model = loadModel(${JSON.stringify(model)});
            ko.applyBindings(model);

            window.onkeyup = function(event) {
                if (event.keyCode == 83 && event.ctrlKey) {
                    event.preventDefault();
                    saveItem();
                    return false;
                }
            }

            function loadModel(model) {
                loadModelPlaceholders(model);

                model.isModified = ko.computed(getIsModified, model);
                model.selectedItem = ko.observable();
                model.clearProperties = clearProperties;
                model.setProperties = setProperties;
                model.addPlaceholder = addPlaceholder;
                model.addRootPlaceholder = addRootPlaceholder;
                model.removePlaceholder = removePlaceholder;
                model.addRendering = addRendering;
                model.removeRendering = removeRendering;
                model.moveRenderingUp = moveRenderingUp;
                model.moveRenderingDown = moveRenderingDown;
                model.addParameter = addParameter;
                model.removeParameter = removeParameter;
                model.pickRendering = pickRendering;

                return model;
            }

            function loadModelPlaceholders(item) {
                if (Array.isArray(item.placeholders)) {
                    for (var placeholder of item.placeholders) {
                        placeholder.name = ko.observable(placeholder.name);
                        placeholder.rendering = item;

                        for (var element of placeholder.elements) {
                            element.renderingName = ko.observable(element.renderingName)
                            element.placeholder = placeholder;

                            var parameters = [];
                            if (element.renderingParams) {
                                for (var key in element.renderingParams) {
                                    parameters.push({ key : ko.observable(key), value: ko.observable(element.renderingParams[key]), rendering: element });
                                }
                            }

                            element.parameters = ko.observableArray(parameters);

                            loadModelPlaceholders(element);
                        }

                        placeholder.elements = ko.observableArray(placeholder.elements);
                    }
                }

                item.placeholders = ko.observableArray(item.placeholders);
            }

            function addPlaceholder(rendering) {
                var placeholder = {
                    name: ko.observable("New"),
                    elements: ko.observableArray(),
                    rendering: rendering
                };

                rendering.placeholders.push(placeholder);
            }

            function addRootPlaceholder() {
                addPlaceholder(model);
            }

            function removePlaceholder(placeholder) {
                var index = placeholder.rendering.placeholders.indexOf(placeholder);
                placeholder.rendering.placeholders.splice(index, 1);
            }

            function addRendering(placeholder) {
                var rendering = {
                    renderingName: ko.observable("New"),
                    renderingParams: {},
                    parameters: ko.observableArray(),
                    placeholders: ko.observableArray(),
                    placeholder: placeholder
                };

                placeholder.elements.push(rendering);
            }

            function removeRendering(rendering) {
                var index = rendering.placeholder.elements.indexOf(rendering);
                rendering.placeholder.elements.splice(index, 1);
            }

            function moveRenderingUp(rendering) {
                var index = rendering.placeholder.elements.indexOf(rendering);
                if (index > 0) {
                    rendering.placeholder.elements.splice(index, 1);
                    rendering.placeholder.elements.splice(index - 1, 0, rendering);
                }
            }

            function moveRenderingDown(rendering) {
                var index = rendering.placeholder.elements.indexOf(rendering);
                if (index < rendering.placeholder.elements().length - 1) {
                    rendering.placeholder.elements.splice(index, 1);
                    rendering.placeholder.elements.splice(index + 1, 0, rendering);
                }
            }

            function addParameter(rendering) {
                rendering.parameters.push({ key: ko.observable("Property"), value: ko.observable("Value"), rendering: rendering });
            }

            function removeParameter(parameter) {
                var index = parameter.rendering.parameters.indexOf(parameter);
                parameter.rendering.parameters.splice(index, 1);
            }

            function saveItem() {
                var newModel = Object.assign({}, model);
                newModel.placeholders = saveModelPlaceholders(newModel);

                let args = { "layout": newModel };
                let saveLayoutCommand = "command:extension.sitecore.saveLayout?" + encodeURIComponent(JSON.stringify(args));
                window.parent.postMessage({ command: "did-click-link", data: saveLayoutCommand }, "file://");
            }

            function pickRendering() {
                global.sitecoreRocks["pickRenderingCallback"] = this;
                let args = { key: "pickRenderingCallback" };
                let pickRenderingCommand = "command:extension.sitecore.pickRendering?" + encodeURIComponent(JSON.stringify(args));
                window.parent.postMessage({ command: "did-click-link", data: pickRenderingCommand }, "file://");
            }

            function pickRenderingCallback(data) {
                console.log(data);
            }

            function saveModelPlaceholders(item) {
                var placeholders = [];
                for(var newPlaceholder of item.placeholders()) {
                    var placeholder = Object.assign({}, newPlaceholder);
                    delete placeholder.rendering;
                    placeholders.push(placeholder);

                    placeholder.name = placeholder.name();

                    var elements = [];
                    for (var newElement of placeholder.elements()) {
                        var element = Object.assign({}, newElement);
                        delete element.placeholder;
                        elements.push(element);

                        element.renderingName = element.renderingName();

                        var renderingParams = {};
                        var parameters = element.parameters();
                        for (var index in parameters) {
                            var pair = parameters[index];
                            renderingParams[pair.key()] = pair.value();
                        }

                        element.renderingParams = renderingParams;
                        element.placeholders = saveModelPlaceholders(element);
                    }

                    placeholder.elements = elements;
                }

                return placeholders;
            }

            function getIsModified() {
                return false;
            }

            function clearProperties() {
                model.selectedItem(undefined);
            }

            function setProperties(data) {
                model.selectedItem(data);
            }
        }());
        </script>
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
                border: none;
                outline: none;
                padding: 3px 4px;
                margin: 0;
            }

            .layout {
                width: 100%;
                box-sizing: border-box;
            }
            .layout-renderings {
                width: 50%;
                vertical-align: top;
            }

            .layout-renderings-panel {
                border: 1px solid #666666;
                background: #252526;
            }

            .layout-renderings-toolbar {
                margin: 4px 0 0 8px;
            }
            .layout-properties {
                width: 50%;
                vertical-align: top;
                padding-left: 8px
            }
            .layout-placeholder {
            }
            .layout-placeholder-indent {
            }
            .layout-placeholder-renderings {
            }
            .layout-placeholder-placeholders {
                margin-left: 48px;
                border-top: 1px solid #666666;
                border-left: 1px solid #666666;
                border-bottom: 1px solid #666666;
            }

            .layout-properties-panel {
            }

            .layout-properties-title {
                padding: 4px;
                border-bottom: 1px solid #666666;
            }

            .layout-properties-table {
                width: 100%;
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }

            .layout-properties-toolbar {
                padding: 2px 4px;
                border-top: 1px solid #666666;
            }

            .layout-properties-table td {
                margin: 0;
                padding: 4px;
            }

            .layout-property-value-cell {
                width: 100%;
                box-sizing: border-box;
            }

            .layout-property-value-cell input {
                width: 100%;
                box-sizing: border-box;
            }

            .layout-property-toolbar-cell {
                width: 150px;
            }

            .layout-properties-noitems {
                padding: 4px 8px;
            }

            .layout-property {
                padding: 4px;
            }
            .layout-property:hover {
                background: #303030;
            }

            .layout-property-toolbar-buttons {
                display: none;
            }

            .layout-property:hover .layout-property-toolbar-buttons {
                display: block;
                padding: 0 8px;
            }

            .toolbar {
                white-space: nowrap;
                padding: 4px 0;
            }

            .toolbar:hover {
                background: #303030;
            }

            .toolbar-buttons {
                display:none;
            }

            .toolbar:hover .toolbar-buttons {
                display: block;
                float: right;
                margin-right: 8px
            }

            body.vscode-dark {
                background: #1e1e1e;
            }

            .vscode-dark .layout-properties-panel {
                border: 1px solid #666666;
                background: #252526;
            }

            .vscode-dark .placeholder {
                color: #999999;
            }

            .vscode-dark .rendering {
                color: #ededed;
            }

            .vscode-dark input {
                background: transparent;
                color: #cccccc;
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

            .menu button {
                background: transparent;
                border: none;
                color: #666666;
            }
        </style>
        `;
    }
}
