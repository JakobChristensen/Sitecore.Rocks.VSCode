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

        if (updateOriginalValue) {
            this.originalValue = this.value;
        }

        if (host) {
            this.host = host;
        }
    }
}
