import { DatabaseUri } from "./DatabaseUri";
import { isString } from "./helpers";
import { WebsiteUri } from "./WebsiteUri";

export class ItemUri {
    public static readonly empty = new ItemUri(DatabaseUri.empty, "{00000000-0000-0000-0000-000000000000}");

    public static create(databaseUri: DatabaseUri , id: string): ItemUri {
        const key = databaseUri.toString() + "/" + id;

        let itemUri = ItemUri.cache[key];
        if (!itemUri) {
            itemUri = new ItemUri(databaseUri, id);
            ItemUri.cache[key] = itemUri;
        }

        return itemUri;
    }

    public static clearCache() {
        ItemUri.cache = {};
    }

    public static parse(s: ItemUri | string | { host: string, databaseName: string, id: string }): ItemUri {
        if (s instanceof ItemUri) {
            return s;
        }

        if (isString(s)) {
            const n = s.lastIndexOf("/");
            if (n < 0) {
                throw new Error("Invalid ItemUri: " + s);
            }

            const databaseUri = s.substr(0, n);
            const id = s.substr(n + 1);

            return ItemUri.create(DatabaseUri.parse(databaseUri), id);
        }

        if (s.host && s.databaseName && s.id) {
            return ItemUri.create(DatabaseUri.create(WebsiteUri.create(s.host), s.databaseName), s.id);
        }

        throw new Error("Invalid ItemUri: " + s);
    }

    private static cache: { [key: string]: ItemUri } = {};

    protected constructor(public readonly databaseUri: DatabaseUri, public readonly id: string) {
    }

    public get websiteUri(): WebsiteUri {
        return this.databaseUri.websiteUri;
    }

    public equals(itemUri: ItemUri) {
        return this.databaseUri.equals(itemUri.databaseUri) && itemUri.id === this.id;
    }

    public toString() {
        return this.databaseUri.toString() + "/" + this.id;
    }
}

export function isItemUri(a: any): a is ItemUri {
    return a instanceof ItemUri;
}
