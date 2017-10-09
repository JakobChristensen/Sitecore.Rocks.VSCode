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
    <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">
    ${this.renderStyles()}
    <script src="https://ajax.aspnetcdn.com/ajax/knockout/knockout-3.4.2.js" type="application/javascript"> </script>
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
                        <div class="layout-renderings-devices">
                            <div class="layout-renderings-device">
                                <span data-bind="text: deviceName"></span> device
                            </div>

                            <div class="layout-renderings-device-layout">
                                Layout: <input type="text" data-bind="textInput: layoutName, event: {focus: $root.clearProperties}"> <a class="layout-renderings-device-layout-toolbar" href="#" data-bind="click: $root.pickLayout">Browse</a>
                            </div>

                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <th>&nbsp;Rendering</th>
                                    <th>Placeholder</th>
                                    <th>Data Source</th>
                                </tr>
                                <tbody data-bind="foreach: renderings">
                                    <tr class="table-row-hover">
                                        <td><input type="text" data-bind="textInput: renderingName, event: {focus: $root.setProperties}"></td>
                                        <td><input type="text" data-bind="textInput: placeholder, event: {focus: $root.setProperties}"></td>
                                        <td><input type="text" data-bind="textInput: datasource, event: {focus: $root.setProperties}"></td>
                                        <td class="table-row-toolbar-cell">
                                            <div class="table-row-toolbar-cell-buttons">
                                                <div class="dropdown">
                                                    <div class="dropdown-glyph">Actions</div>
                                                    <div class="dropdown-menu">
                                                        <a href="#" data-bind="click: $root.pickRendering">Browse Rendering</a>
                                                        <a href="#" data-bind="click: $root.moveRenderingUp">Move Up</a>
                                                        <a href="#" data-bind="click: $root.moveRenderingDown">Move Down</a>
                                                        <a href="#" data-bind="click: $root.removeRendering">Delete</a>
                                                    </div>
                                                </div
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <div class="layout-renderings-toolbar">
                                <a href="#" data-bind="click: $root.addRendering"><i class="fa fa-plus"></i> Add Rendering</a>
                            </div>
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
                    case "pickLayout":
                        currentDevice.layoutName(event.data.layoutName);
                        delete currentDevice;
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
                model.pickLayout = pickLayout;

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

            function pickLayout(device) {
                currentDevice = device;
                let args = { uri: "${editorUri.toString()}", host: "${item.itemUri.websiteUri.connection.host}", databaseName: "${item.itemUri.databaseUri.databaseName}" };
                let pickLayoutCommand = "command:extension.sitecore.pickLayout?" + encodeURIComponent(JSON.stringify(args));
                window.parent.postMessage({ command: "did-click-link", data: pickLayoutCommand }, "file://");
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
