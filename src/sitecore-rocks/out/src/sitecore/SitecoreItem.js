"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SitecoreField {
    constructor(data, host, updateOriginalValue = true) {
        this.id = "";
        this.uri = "";
        this.name = "";
        this.displayName = "";
        this.value = "";
        this.originalValue = "";
        this.host = "";
        Object.assign(this, data);
        if (updateOriginalValue) {
            this.originalValue = this.value;
        }
        if (host) {
            this.host = host;
        }
    }
}
exports.SitecoreField = SitecoreField;
class SitecoreItem {
    constructor(data, host, updateOriginalValue = true) {
        this.id = "";
        this.uri = "";
        this.name = "";
        this.displayName = "";
        this.database = "";
        this.icon16x16 = "";
        this.icon32x32 = "";
        this.path = "";
        this.templateId = "";
        this.templateName = "";
        this.childCount = 0;
        this.host = "";
        Object.assign(this, data);
        if (host) {
            this.host = host;
        }
        if (data.fields) {
            this.fields = new Array();
            for (let field of data.fields) {
                this.fields.push(new SitecoreField(field, host, updateOriginalValue));
            }
        }
    }
    saved() {
        if (!this.fields) {
            return;
        }
        for (let field of this.fields) {
            field.originalValue = field.value;
        }
    }
}
exports.SitecoreItem = SitecoreItem;
//# sourceMappingURL=SitecoreItem.js.map