import * as vscode from "vscode";

export abstract class LayoutDesigner {

    protected renderProperties() {
        return `
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

                    <div data-bind="if: parameters().length == 0">
                        <div class="layout-properties-noparameters">
                            The rendering has no properties.
                        </div>
                    </div>

                    <table class="layout-properties-table" cellpadding="0" cellspacing="0">
                        <tbody data-bind="foreach: parameters">
                            <tr class="table-row-hover">
                                <td class="layout-property-toolbar-cell">
                                    <input type="text" data-bind="textInput: key">
                                </td>
                                <td class="layout-property-value-cell">
                                    <input type="text" data-bind="textInput: value">
                                </td>
                                <td class="table-row-toolbar-cell">
                                    <div class="table-row-toolbar-cell-buttons">
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
    `;
    }

    protected renderStyles(): string {
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
            table {
                width: 100%;
                box-sizing: border-box;
            }
            .table-row-hover {
                padding: 4px;
            }
            .table-row-hover:hover {
                background: #303030;
            }
            .table-row-toolbar-cell {
                width: 150px;
                white-space: nowrap;
            }
            .table-row-toolbar-cell-buttons {
                display: none;
            }
            .table-row-hover:hover .table-row-toolbar-cell-buttons {
                display: block;
                padding: 0 8px;
            }

            .dropdown-menu {
                display: none;
            }
            .dropdown:hover .dropdown-menu {
                border: 1px solid #999999;
                background: #383838;
                position: absolute;
                display: block;
            }
            .dropdown-menu a {
                text-decoration: none;
                display: block;
                padding: 4px 8px;
            }
            .dropdown-menu a:hover {
                background: #666666;
            }
            .dropdown-glyph {
                cursor: pointer;
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


            .layout-renderings {
                width: 50%;
                vertical-align: top;
            }

            .layout-renderings-panel {
                border: 1px solid #666666;
                background: #252526;
            }

            .layout-renderings-panel th {
                text-align: left;
            }

            .layout-renderings-devices {
                padding-bottom: 24px;
            }
            .layout-renderings-device {
                padding: 8px 8px 8px 4px;
                font-size: 20px;
            }
            .layout-renderings-device-layout {
                padding: 0px 0px 4px 4px;
            }
            .layout-renderings-device-layout-toolbar {
                display: none;
            }

            .layout-renderings-device-layout:hover .layout-renderings-device-layout-toolbar {
                display: inline;
            }

            .layout-renderings-toolbar {
                margin: 4px 0 0 4px;
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

            .layout-properties-noitems {
                padding: 4px 8px;
            }

            .layout-properties-noparameters {
                padding: 4px;
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

        </style>
        `;
    }
}
