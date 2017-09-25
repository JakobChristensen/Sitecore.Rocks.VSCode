"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseUri_1 = require("../data/DatabaseUri");
const ItemUri_1 = require("../data/ItemUri");
const WebsiteUri_1 = require("../data/WebsiteUri");
const SitecoreField_1 = require("./SitecoreField");
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
        this.longPath = "";
        this.templateId = "";
        this.templateName = "";
        this.childCount = 0;
        Object.assign(this, data);
        this.itemUri = ItemUri_1.ItemUri.create(DatabaseUri_1.DatabaseUri.create(WebsiteUri_1.WebsiteUri.create(host), this.database), this.id);
        if (data.fields) {
            this.fields = new Array();
            for (const field of data.fields) {
                this.fields.push(new SitecoreField_1.SitecoreField(field, host, updateOriginalValue));
            }
        }
    }
    saved() {
        if (!this.fields) {
            return;
        }
        for (const field of this.fields) {
            field.originalValue = field.value;
        }
    }
}
exports.SitecoreItem = SitecoreItem;
//# sourceMappingURL=SitecoreItem.js.map