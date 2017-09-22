import { HttpClient } from "typed-rest-client/HttpClient";
import * as vscode from "vscode";
import { SitecoreItem } from "../sitecore/SitecoreItem";
import { DatabaseUri } from "./DatabaseUri";
import { ItemUri } from "./ItemUri";
import { WebsiteUri } from "./WebsiteUri";

export class SitecoreConnection {

    public static readonly empty = new SitecoreConnection("", "", "");

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

    private static cache: { [key: string]: SitecoreConnection } = {};

    private client: HttpClient = new HttpClient("");

    protected constructor(public host: string, public userName: string, public password: string) {
    }

    public addItem(databaseUri: DatabaseUri, path: string, templateId: string, name: string): Thenable<SitecoreItem> {
        return new Promise((completed, error) => this.client.get(this.getUrl("/sitecore/put/item/" + databaseUri.databaseName + path + "/" + name + "?template=" + encodeURIComponent(templateId))).then(response => {
            response.readBody().then(body => {
                const data = JSON.parse(body);
                completed(new SitecoreItem(data.item, this.host));
            });
        }));
    }

    public deleteItem(itemUri: ItemUri): Thenable<void> {
        return new Promise((completed, error) => this.client.get(this.getUrl("/sitecore/delete/items/" + itemUri.databaseUri.databaseName + "/" + itemUri.id)).then(response => {
            response.readBody().then(body => {
                completed();
            });
        }));
    }

    public getChildren(itemUri: ItemUri): Thenable<SitecoreItem[]> {
        return new Promise((completed, error) => this.client.get(this.getUrl("/sitecore/get/item/" + itemUri.databaseUri.databaseName + "/" + itemUri.id + "?children=1")).then(response => {
            response.readBody().then(body => {
                const data = JSON.parse(body);
                const children = data.children as object[];
                const items = children.map(d => new SitecoreItem(d, this.host));

                completed(items);
            });
        }));
    }

    public getDatabases(websiteUri: WebsiteUri): Thenable<Array<{ name: string }>> {
        return new Promise((completed, error) => this.client.get(this.getUrl("/sitecore/get/databases")).then(response => {
            response.readBody().then(body => {
                const data = JSON.parse(body);
                completed(data.databases);
            }).catch(reason => this.handleError(reason, error));
        }).catch(reason => this.handleError(reason, error)));
    }

    public getItem(itemUri: ItemUri): Thenable<SitecoreItem> {
        return new Promise((completed, error) =>
            this.client.get(this.getUrl("/sitecore/get/item/" + itemUri.databaseUri.databaseName + "/" + itemUri.id + "?fields=*&fieldinfo=true")).then(response => {
                response.readBody().then(body => {
                    const data = JSON.parse(body);
                    completed(new SitecoreItem(data, this.host));
                });
            }));
    }

    public getRoots(databaseUri: DatabaseUri): Thenable<SitecoreItem[]> {
        return new Promise((completed, error) => this.client.get(this.getUrl("/sitecore/get/" + databaseUri.databaseName)).then(response => {
            response.readBody().then(body => {
                const data = JSON.parse(body);
                const children = data.roots as object[];
                const items = children.map(d => new SitecoreItem(d, this.host));

                completed(items);
            });
        }));
    }

    public getTemplates(databaseUri: DatabaseUri): Thenable<SitecoreItem[]> {
        return new Promise((completed, error) => this.client.get(this.getUrl("/sitecore/get/templates/" + databaseUri.databaseName)).then(response => {
            response.readBody().then(body => {
                const data = JSON.parse(body);
                const templates = data.templates as object[];
                const items = templates.map(d => new SitecoreItem(d, this.host));

                completed(items);
            });
        }));
    }

    public saveItems(items: SitecoreItem[]): Thenable<void> {
        let data = "";
        let databaseName = "";
        for (const item of items) {
            for (const field of item.fields) {
                if (field.value !== field.originalValue) {
                    data += (data.length > 0 ? "&" : "") + field.uri + "=" + encodeURIComponent(field.value);
                    databaseName = item.database;
                }
            }
        }

        if (!databaseName) {
            return;
        }

        const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
        };

        return new Promise((completed, error) => this.client.post(this.getUrl("/sitecore/put/items/" + databaseName), data, headers).then(response => {
            response.readBody().then(body => {
                for (const item of items) {
                    item.saved();
                }

                completed();
            });
        }));
    }

    private getUrl(url: string) {
        return this.host + url + (url.indexOf("?") < 0 ? "?" : "&") + "username=" + encodeURIComponent(this.userName) + "&password=" + encodeURIComponent(this.password);
    }

    private handleError(reason: any, error: () => void) {
        vscode.window.showErrorMessage("Failed to connect to Sitecore website - is the Sitecore.ContentDelivery.zip package installed?", "Download package").then((button: string) => {
            if (button === "Download package") {
                vscode.commands.executeCommand("vscode.open", vscode.Uri.parse("https://ci.appveyor.com/project/JakobChristensen/sitecore-contentdelivery/build/artifacts"));
            }
        });

        error();
    }
}
