import { QuickPickItem } from "vscode";
import { SitecoreItem } from "../sitecore/SitecoreItem";

export class QuickPickSitecoreItem implements QuickPickItem {
    public label: string;
    public description: string;
    public detail?: string;

    public constructor(public item: SitecoreItem) {
        this.label = item.displayName;
        this.description = "Template: " + item.templateName;
        this.detail = item.path;
    }
}
