"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const FieldEditorProvider_1 = require("./FieldEditorProvider");
const SitecoreItem_1 = require("./sitecore/SitecoreItem");
const SitecoreExplorer_1 = require("./SitecoreExplorer");
function activate(context) {
    // sitecore explorer
    const sitecoreExplorer = new SitecoreExplorer_1.SitecoreExplorerProvider(context);
    vscode.window.registerTreeDataProvider("sitecoreExplorer", sitecoreExplorer);
    // sitecore field editor
    const provider = new FieldEditorProvider_1.FieldEditorProvider(context.asAbsolutePath("src/"));
    vscode.workspace.registerTextDocumentContentProvider("sitecore-item", provider);
    // commands
    vscode.commands.registerCommand("extension.sitecore.addConnection", () => sitecoreExplorer.addConnection());
    vscode.commands.registerCommand("extension.sitecore.addItem", (item) => sitecoreExplorer.addItem(item));
    vscode.commands.registerCommand("extension.sitecore.deleteItem", (item) => sitecoreExplorer.deleteItem(item));
    vscode.commands.registerCommand("extension.sitecore.editItem", (item) => sitecoreExplorer.editItem(item));
    vscode.commands.registerCommand("extension.sitecore.insertItem", (item) => sitecoreExplorer.insertItem(item));
    vscode.commands.registerCommand("extension.sitecore.navigateTemplate", (item) => sitecoreExplorer.navigateTemplate(item));
    vscode.commands.registerCommand("extension.sitecore.refresh", (item) => sitecoreExplorer.refresh(item));
    vscode.commands.registerCommand("extension.sitecore.removeConnection", (connectionTreeViewItem) => sitecoreExplorer.removeConnection(connectionTreeViewItem));
    vscode.commands.registerCommand("extension.sitecore.selectItem", (treeViewItem) => sitecoreExplorer.selectItem(treeViewItem));
    vscode.commands.registerCommand("extension.sitecore.saveItem", (args) => sitecoreExplorer.saveItem(new SitecoreItem_1.SitecoreItem(args.data, args.host, false)));
}
exports.activate = activate;
function deactivate() {
    return;
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map