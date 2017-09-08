export class SitecoreField {
    public id: string = "";
    public uri: string = "";
    public name: string = "";
    public displayName: string = "";
    public value: string = "";
    public originalValue: string = "";
    public host: string = "";

    constructor(data: any, host?: string, updateOriginalValue: boolean = true) {
        Object.assign(this, data);

        if (updateOriginalValue)
        {
            this.originalValue = this.value;
        }

        if (host) {
            this.host = host;
        }
    }
}

export class SitecoreItem {
    public id: string = "";
    public uri: string = "";
    public name: string = "";
    public displayName: string = "";
    public database: string = "";
    public icon16x16: string = "";
    public icon32x32: string = "";
    public path: string = "";
    public templateId: string = "";
    public templateName: string = "";
    public childCount: number = 0;

    public fields?: Array<SitecoreField>;
    public host: string = "";

    constructor(data: any, host?: string, updateOriginalValue: boolean = true) {
        Object.assign(this, data);

        if (host) {
            this.host = host;
        }

        if (data.fields) {
            this.fields = new Array<SitecoreField>();
            for (let field of data.fields) {
                this.fields.push(new SitecoreField(field, host, updateOriginalValue));
            }
        }
    }

    public saved() {
        if (!this.fields) {
            return;
        }

        for (let field of this.fields) {
            field.originalValue = field.value;
        }
    }
}

