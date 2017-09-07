export class SitecoreField {
    public id: string = "";
    public name: string = "";
    public displayName: string = "";
    public value: string = "";

    constructor(data: any) {
        Object.assign(this, data);
    }
}

export class SitecoreItem {
    public id: string = "";
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

    constructor(host: string, data: any) {
        Object.assign(this, data);

        if (data.fields) {
            this.fields = new Array<SitecoreField>();
            for(let field of data.fields) {
                this.fields.push(new SitecoreField(field));
            }
        }
    }
}

