"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const SitecoreConnection_1 = require("./data/SitecoreConnection");
const ConnectionTreeViewItem_1 = require("./SitecoreExplorer/ConnectionTreeViewItem");
class SitecoreExplorerProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.connections = new Array();
        var connection = SitecoreConnection_1.SitecoreConnection.create('http://pathfinder', 'sitecore\\admin', 'b');
        this.connections.push(connection);
    }
    getTreeItem(treeViewItem) {
        return treeViewItem.getTreeItem();
    }
    getChildren(treeViewItem) {
        if (!treeViewItem) {
            return this.connections.map(connection => new ConnectionTreeViewItem_1.ConnectionTreeViewItem(connection));
        }
        return treeViewItem.getChildren();
    }
}
exports.SitecoreExplorerProvider = SitecoreExplorerProvider;
//# sourceMappingURL=SitecoreExplorer.js.map