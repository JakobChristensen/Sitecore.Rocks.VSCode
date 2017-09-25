import { DatabaseUri } from "../data/DatabaseUri";
import { ItemUri } from "../data/ItemUri";
import { WebsiteUri } from "../data/WebsiteUri";
import { SitecoreField } from "./SitecoreField";

export class SitecoreItem {
    public id: string = "";
    public uri: string = "";
    public name: string = "";
    public displayName: string = "";
    public database: string = "";
    public icon16x16: string = "";
    public icon32x32: string = "";
    public path: string = "";
    public longPath: string = "";
    public templateId: string = "";
    public templateName: string = "";
    public childCount: number = 0;

    public itemUri: ItemUri;
    public fields?: SitecoreField[];

    constructor(data: any, host: string, updateOriginalValue: boolean = true) {
        Object.assign(this, data);

        this.itemUri = ItemUri.create(DatabaseUri.create(WebsiteUri.create(host), this.database), this.id);

        if (data.fields) {
            this.fields = new Array<SitecoreField>();
            for (const field of data.fields) {
                this.fields.push(new SitecoreField(field, host, updateOriginalValue));
            }
        }
    }

    public saved() {
        if (!this.fields) {
            return;
        }

        for (const field of this.fields) {
            field.originalValue = field.value;
        }
    }
}
