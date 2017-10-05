import * as vscode from "vscode";
import { ItemUri, ItemVersionUri } from "./data/index";
import { LayoutDesigner } from "./LayoutDesigner";
import { SitecoreItem } from "./sitecore/index";

export class LayoutDesignerProvider extends LayoutDesigner implements vscode.TextDocumentContentProvider {
    private onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();

    constructor(public absolutePath: string) {
        super();
    }

    public provideTextDocumentContent(uri: vscode.Uri): vscode.ProviderResult<string> {
        const s = decodeURIComponent(uri.toString().substr(18));
        const itemUri = ItemUri.parse(s);

        const itemVersionUri = ItemVersionUri.create(itemUri, "en", 0);

        return new Promise((completed, error) => {
            itemUri.websiteUri.connection.getLayout(itemVersionUri).then(item => {
                if (!item) {
                    error("Item not found");
                    return;
                }

                const layout = (item.fields as any)[0].value;
                if (!layout) {
                    error("__Rendering field not found");
                    return;
                }

                completed(this.render(uri, item));
            });
        });
    }

    public get onDidChange(): vscode.Event<vscode.Uri> {
        return this.onDidChangeEmitter.event;
    }

    protected render(editorUri: vscode.Uri, item: SitecoreItem): string {
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
                            <a href="#" data-bind="click: $root.pickRendering"> Browse </a>
                            <a href="#" data-bind="click: $root.moveRenderingUp"> Up </a>
                            <a href="#" data-bind="click: $root.moveRenderingDown"> Down </a>
                            <a href="#" data-bind="click: $root.addPlaceholder"> Add </a>
                            <a href="#" data-bind="click: $root.removeRendering"> Delete </a>
                        </div>
                        <span class="rendering">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Rendering</span>
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
        <a href="#" data-bind="click: $root.saveLayout" title="Ctrl+S">Save</a>
    </div>

    <h1>${item.displayName} layout<span data-bind="visible: isModified()">*</span></h1>

    <table class="layout">
        <tr>
            <td class="layout-renderings">
                <div class="layout-renderings-panel">
                    <div data-bind="foreach: layout">
                        <div>
                            &nbsp;<strong><span data-bind="text: deviceName"></span> device</strong>
                        </div>

                        <table cellpadding="0" cellspacing="0">
                            <tr>
                                <td>&nbsp;Rendering</td>
                                <td>Placeholder</td>
                                <td>Data Source</td>
                            </tr>
                            <tbody data-bind="foreach: renderings">
                                <tr class="table-row-hover">
                                    <td><input type="text" data-bind="textInput: renderingName"></td>
                                    <td><input type="text" data-bind="textInput: placeholder"></td>
                                    <td><input type="text" data-bind="textInput: datasource"></td>
                                    <td class="table-row-toolbar-cell">
                                        <div class="table-row-toolbar-cell-buttons">
                                            <a href="#" data-bind="click: $root.removeParameter">Browse</a>
                                            <a href="#" data-bind="click: $root.removeParameter">Delete</a>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="layout-renderings-toolbar">
                            <a href="#" data-bind="click: $root.addRendering">Add Rendering</a>
                        </div>
                    </div>
                </div>
            </td>
            ${this.renderProperties()}
        </tr>
    </table>
    ${this.renderScript(editorUri, item)}
</body>
</html>`;
    }

    protected renderScript(editorUri: vscode.Uri, item: SitecoreItem): string {
        return `
        <script type="application/javascript">
        (function() {
            let currentRendering = undefined;

            let model = loadModel(${JSON.stringify(item)});
            ko.applyBindings(model);

            window.onkeyup = function(event) {
                if (event.keyCode == 83 && event.ctrlKey) {
                    event.preventDefault();
                    saveLayout();
                    return false;
                }
            }

            window.addEventListener("message", (event) => {
                switch(event.data.type) {
                    case "pickRendering":
                        currentRendering.renderingName(event.data.renderingName);
                        delete currentRendering;
                        break;
                }
            });

            function loadModel(model) {
                model.layout = ko.observableArray();

                let layout = JSON.parse(model.fields[0].value);

                for (let d of layout.devices) {
                    var device = {
                        deviceName: ko.observable(d.deviceName),
                        deviceId: ko.observable(d.deviceId),
                        layoutName: ko.observable(d.layoutName),
                        layoutId: ko.observable(d.layoutId),
                        renderings: ko.observableArray(),
                    };

                    for (let r of d.renderings) {
                        var rendering = {
                            renderingName: ko.observable(r.renderingName),
                            renderingId: ko.observable(r.renderingId),
                            placeholder: ko.observable(r.placeholder),
                            datasource: ko.observable(r.datasource),
                            parameters: ko.observableArray(),
                            device: device
                        };

                        if (r.renderings) {
                            for (let p of r.parameters) {
                                var parameter = {
                                    key: ko.observable(p.key),
                                    value: ko.observable(p.value),
                                    rendering: rendering
                                };

                                rendering.parameters.push(parameter);
                            }
                        }

                        device.renderings.push(rendering);
                    }

                    model.layout.push(device);
                }

                model.isModified = ko.computed(getIsModified, model);
                model.selectedItem = ko.observable();
                model.clearProperties = clearProperties;
                model.setProperties = setProperties;
                model.saveLayout = saveLayout;
                model.addRendering = addRendering;
                model.removeRendering = removeRendering;
                model.moveRenderingUp = moveRenderingUp;
                model.moveRenderingDown = moveRenderingDown;
                model.addParameter = addParameter;
                model.removeParameter = removeParameter;
                model.pickRendering = pickRendering;

                return model;
            }

            function addRendering(device) {
                var rendering = {
                    renderingName: ko.observable("New"),
                    placeholder: ko.observable(),
                    datasource: ko.observable(),
                    parameters: ko.observableArray(),
                    device: device,
                };

                device.renderings.push(rendering);
            }

            function removeRendering(rendering) {
                var index = rendering.device.renderings.indexOf(rendering);
                rendering.device.renderings.splice(index, 1);
            }

            function moveRenderingUp(rendering) {
                var index = rendering.device.renderings.indexOf(rendering);
                if (index > 0) {
                    rendering.device.renderings.splice(index, 1);
                    rendering.device.renderings.splice(index - 1, 0, rendering);
                }
            }

            function moveRenderingDown(rendering) {
                var index = rendering.device.renderings.indexOf(rendering);
                if (index < rendering.device.renderings().length - 1) {
                    rendering.device.renderings.splice(index, 1);
                    rendering.device.renderings.splice(index + 1, 0, rendering);
                }
            }

            function addParameter(rendering) {
                rendering.parameters.push({ key: ko.observable("Property"), value: ko.observable("Value"), rendering: rendering });
            }

            function removeParameter(parameter) {
                var index = parameter.rendering.parameters.indexOf(parameter);
                parameter.rendering.parameters.splice(index, 1);
            }

            function pickRendering(rendering) {
                currentRendering = rendering;
                let args = { uri: "${editorUri.toString()}", host: "${item.itemUri.websiteUri.connection.host}", databaseName: "${item.itemUri.databaseUri.databaseName}" };
                let pickRenderingCommand = "command:extension.sitecore.pickRendering?" + encodeURIComponent(JSON.stringify(args));
                window.parent.postMessage({ command: "did-click-link", data: pickRenderingCommand }, "file://");
            }

            function saveLayout() {
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
}
