"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SitecoreItem {
    constructor(host, data) {
        this.id = "";
        this.name = "";
        this.displayName = "";
        this.database = "";
        this.icon16x16 = "";
        this.icon32x32 = "";
        this.path = "";
        this.templateId = "";
        this.templateName = "";
        this.childCount = 0;
        Object.assign(this, data);
    }
}
exports.SitecoreItem = SitecoreItem;
//# sourceMappingURL=SitecoreItem.js.map