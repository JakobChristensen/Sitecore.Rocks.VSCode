"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class QuickPickSitecoreItem {
    constructor(item) {
        this.item = item;
        this.label = item.displayName;
        this.description = "Template: " + item.templateName;
        this.detail = item.path;
    }
}
exports.QuickPickSitecoreItem = QuickPickSitecoreItem;
//# sourceMappingURL=QuickPickSitecoreItem.js.map