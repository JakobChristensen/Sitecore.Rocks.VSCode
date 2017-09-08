import { HttpClient } from 'typed-rest-client/HttpClient';
import { SitecoreItem } from "../sitecore/SitecoreItem";
import { DatabaseUri } from './DatabaseUri';
import { ItemUri } from './ItemUri';

export class SitecoreConnection {

    private static cache: { [key: string]: SitecoreConnection } = {};

    public static readonly empty = new SitecoreConnection('', '', '');

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

    public connect(): Thenable<HttpClient> {
        return new Promise((c, e) => {
            const client = new HttpClient('');
            c(client);
        });
    }

    public getRoot(databaseUri: DatabaseUri): Thenable<SitecoreItem[]> {
        return this.connect().then(client => new Promise((completed, error) => {
            client.get(this.host + '/sitecore/get/' + databaseUri.databaseName + '?username=' + this.userName + '&password=' + this.password).then(response => {
                response.readBody().then(body => {
                    const data = JSON.parse(body);
                    completed([new SitecoreItem(data.root, this.host)]);
                });
            });
        }));
    }

    public getChildren(itemUri: ItemUri): Thenable<SitecoreItem[]> {
        return this.connect().then(client => new Promise((completed, error) => {
            client.get(this.host + '/sitecore/get/item/' + itemUri.databaseUri.databaseName + '/' + itemUri.id + '?username=' + this.userName + '&password=' + this.password + '&children=1').then(response => {
                response.readBody().then(body => {
                    const data = JSON.parse(body);
                    const children = <Array<Object>>data.children;
                    const items = children.map(d => new SitecoreItem(d, this.host));

                    completed(items);
                });
            });
        }));
    }

    public getItem(itemUri: ItemUri): Thenable<SitecoreItem> {
        return this.connect().then(client => new Promise((completed, error) => {
            client.get(this.host + '/sitecore/get/item/' + itemUri.databaseUri.databaseName + '/' + itemUri.id + '?username=' + this.userName + '&password=' + this.password + "&fields=*&fieldinfo=true").then(response => {
                response.readBody().then(body => {
                    const data = JSON.parse(body);
                    completed(new SitecoreItem(data, this.host));
                });
            });
        }));
    }

    public saveItems(items: Array<SitecoreItem>): Thenable<void> {
        let data = "";
        let databaseName = "";
        for(let item of items) {
            for (let field of item.fields) {
                if (field.value !== field.originalValue) {
                    if (data.length > 0) {
                        data += "&";
                    }

                    data += field.uri + "=" + encodeURIComponent(field.value);
                    databaseName = item.database;
                }
            }
        }

        if (!databaseName) {
            return;
        }

        return this.connect().then(client => new Promise((completed, error) => {
            client.post(this.host + '/sitecore/put/items/' + databaseName + '?username=' + this.userName + '&password=' + this.password, data).then(response => {
                response.readBody().then(body => {
                    const data = JSON.parse(body);

                    for(let item of items) {
                        item.saved();
                    }

                    completed();
                });
            });
        }));
    }
}
