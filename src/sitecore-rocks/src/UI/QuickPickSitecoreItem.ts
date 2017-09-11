import { QuickPickItem } from 'vscode';
import { SitecoreItem } from '../sitecore/SitecoreItem';

export class QuickPickSitecoreItem implements QuickPickItem {
    label: string;
    description: string;
    detail?: string;

    public constructor(public item: SitecoreItem) {
        this.label = item.displayName;
        this.description = 'Template: ' + item.templateName;
        this.detail = item.path;
    }
}