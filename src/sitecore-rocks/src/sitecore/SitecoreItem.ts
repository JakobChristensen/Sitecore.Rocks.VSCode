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

    constructor(host: string, data: Object) {
        Object.assign(this, data);
    }
}

