"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SitecoreField {
    constructor(data) {
        this.id = "";
        this.name = "";
        this.displayName = "";
        this.value = "";
        Object.assign(this, data);
    }
}
exports.SitecoreField = SitecoreField;
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
        if (data.fields) {
            this.fields = new Array();
            for (let field of data.fields) {
                this.fields.push(new SitecoreField(field));
            }
        }
    }
}
exports.SitecoreItem = SitecoreItem;
//# sourceMappingURL=SitecoreItem.js.map