import { ExtensionContext, TreeDataProvider, EventEmitter, TreeItem, Event, window, TreeItemCollapsibleState, Uri, commands, workspace, TextDocumentContentProvider, CancellationToken, ProviderResult } from 'vscode';
import { HttpClient } from 'typed-rest-client/HttpClient';

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
}

export class SitecoreConnection {

    constructor(private host: string, private userName: string, private password: string) {
    }

    public connect(): Thenable<HttpClient> {
        return new Promise((c, e) => {
            const client = new HttpClient('');
            c(client);
        });
    }

    public get roots(): Thenable<SitecoreItem[]> {
        return this.connect().then(client => new Promise((completed, error) => {
            client.get(this.host + '/sitecore/get/master?username=' + this.userName + '&password=' + this.password).then(response => {
                response.readBody().then(body => {
                    const data = JSON.parse(body);
                    completed([data.root]);
                });
            });
        }));
    }

    public getChildren(item: SitecoreItem): Thenable<SitecoreItem[]> {
        return this.connect().then(client => new Promise((completed, error) => {
            client.get(this.host + '/sitecore/get/item/' + item.database + '/' + item.id + '?username=' + this.userName + '&password=' + this.password + '&children=1').then(response => {
                response.readBody().then(body => {
                    const data = JSON.parse(body);
                    completed(data.children);
                });
            });
        }));
    }
}

export class SitecoreTreeDataProvider implements TreeDataProvider<SitecoreItem> {

    private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
    readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

    private connection: SitecoreConnection;

    public getTreeItem(item: SitecoreItem): TreeItem {
        return {
            label: item.name,
            collapsibleState: item.childCount > 0 ? TreeItemCollapsibleState.Collapsed : void 0
        };
    }

    public getChildren(element?: SitecoreItem): SitecoreItem[] | Thenable<SitecoreItem[]> {
        if (!element) {
            if (!this.connection) {
                this.connection = new SitecoreConnection('http://pathfinder', 'sitecore\\admin', 'b');
            }

            return this.connection.roots;
        }

        return this.connection.getChildren(element);
    }
}