import { HttpClient } from 'typed-rest-client/HttpClient';
import { SitecoreItem } from "../sitecore/SitecoreItem";
import { DatabaseUri } from './DatabaseUri';
import { ItemUri } from './ItemUri';

export class SitecoreConnection {

    private static cache: { [key: string]: SitecoreConnection } = {};

    public static readonly empty = new SitecoreConnection('', '', '');

    private client: HttpClient = new HttpClient('');

    public static create(host: string, userName: string, password: string): SitecoreConnection {
        let connection = SitecoreConnection.cache[host];
        if (!connection) {
            connection = new SitecoreConnection(host, userName, password);
            SitecoreConnection.cache[host] = connection;
        }

        return connection;
    }

    public static get(host: string): SitecoreConnection {
        return SitecoreConnection.cache[host];
    }

    public static clearCache() {
        SitecoreConnection.cache = {};
    }

    protected constructor(public host: string, public userName: string, public password: string) {
    }

    public getRoot(databaseUri: DatabaseUri): Thenable<SitecoreItem[]> {
        return new Promise((completed, error) => this.client.get(this.getUrl('/sitecore/get/' + databaseUri.databaseName)).then(response => {
            response.readBody().then(body => {
                const data = JSON.parse(body);
                completed([new SitecoreItem(data.root, this.host)]);
            });
        }));
    }

    public getChildren(itemUri: ItemUri): Thenable<SitecoreItem[]> {
        return new Promise((completed, error) => this.client.get(this.getUrl('/sitecore/get/item/' + itemUri.databaseUri.databaseName + '/' + itemUri.id + '?children=1')).then(response => {
            response.readBody().then(body => {
                const data = JSON.parse(body);
                const children = <Array<Object>>data.children;
                const items = children.map(d => new SitecoreItem(d, this.host));

                completed(items);
            });
        }));
    }

    public getItem(itemUri: ItemUri): Thenable<SitecoreItem> {
        return new Promise((completed, error) =>
            this.client.get(this.getUrl('/sitecore/get/item/' + itemUri.databaseUri.databaseName + '/' + itemUri.id + '?fields=*&fieldinfo=true')).then(response => {
                response.readBody().then(body => {
                    const data = JSON.parse(body);
                    completed(new SitecoreItem(data, this.host));
                });
            })
        );
    }

    public saveItems(items: Array<SitecoreItem>): Thenable<void> {
        let data = "";
        let databaseName = "";
        for (let item of items) {
            for (let field of item.fields) {
                if (field.value !== field.originalValue) {
                    data += (data.length > 0 ? '&' : '') + field.uri + "=" + encodeURIComponent(field.value);
                    databaseName = item.database;
                }
            }
        }

        if (!databaseName) {
            return;
        }

        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        return new Promise((completed, error) => this.client.post(this.getUrl('/sitecore/put/items/' + databaseName), data, headers).then(response => {
            response.readBody().then(body => {
                for (let item of items) {
                    item.saved();
                }

                completed();
            });
        })
        );
    }

    private getUrl(url: string) {
        return this.host + url + (url.indexOf('?') < 0 ? "?" : "&") + 'username=' + encodeURIComponent(this.userName) + '&password=' + encodeURIComponent(this.password);
    }

}
