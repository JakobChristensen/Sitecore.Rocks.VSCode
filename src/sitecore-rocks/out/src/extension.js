"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const SitecoreExplorer_1 = require("./SitecoreExplorer");
const FieldEditorProvider_1 = require("./FieldEditorProvider");
function activate(context) {
    // sitecore explorer
    const sitecoreExplorer = new SitecoreExplorer_1.SitecoreExplorerProvider();
    vscode.window.registerTreeDataProvider('sitecoreExplorer', sitecoreExplorer);
    // sitecore field editor
    let provider = new FieldEditorProvider_1.FieldEditorProvider(context.asAbsolutePath("src/"));
    vscode.workspace.registerTextDocumentContentProvider('sitecore-item', provider);
    // commands
    vscode.commands.registerCommand('extension.sitecore.editItem', (item) => {
        let previewUri = vscode.Uri.parse('sitecore-item://pathfinder/' + item.database + "/" + item.id);
        return vscode.commands.executeCommand('vscode.previewHtml', previewUri, undefined, item.name).then((success) => {
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
    });
    vscode.commands.registerCommand('extension.sitecore.saveItem', (args) => vscode.window.showInformationMessage("Save Item: " + args.data));
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map