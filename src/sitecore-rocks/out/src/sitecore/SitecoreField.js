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
//# sourceMappingURL=SitecoreField.js.map