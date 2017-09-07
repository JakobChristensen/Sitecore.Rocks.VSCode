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


    protected constructor(public host: string, private userName: string, private password: string) {
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
                    completed([new SitecoreItem(this.host, data.root)]);
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
                    const items = children.map(d => new SitecoreItem(this.host, d));

                    completed(items);
                });
            });
        }));
    }
}
