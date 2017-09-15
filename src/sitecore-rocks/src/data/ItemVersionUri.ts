import { DatabaseUri } from "./DatabaseUri";
import { isString } from "./helpers";
import { ItemUri } from "./ItemUri";
import { WebsiteUri } from "./WebsiteUri";

export class ItemVersionUri {
    public static readonly empty = new ItemVersionUri(ItemUri.empty, "", 0);

    public static create(itemUri: ItemUri, language: string, version: number): ItemVersionUri {
        const key = itemUri.toString() + "/" + language + "/" + version;

        let itemVersionUri = ItemVersionUri.cache[key];
        if (!itemVersionUri) {
            itemVersionUri = new ItemVersionUri(itemUri, language, version);
            ItemVersionUri.cache[key] = itemVersionUri;
        }

        return itemVersionUri;
    }

    public static clearCache() {
        ItemVersionUri.cache = {};
    }

    public static parse(s: ItemVersionUri | string | { host: string, databaseName: string, id: string, language: string, version: number }): ItemVersionUri {
        if (s instanceof ItemVersionUri) {
            return s;
        }

        if (isString(s)) {
            const n = s.lastIndexOf("/");
            const o = s.lastIndexOf("/", n - 1);
            if (n < 0 || o < 0) {
                throw new Error("Invalid ItemVersionUri: " + s);
            }

            const itemUri = s.substr(0, o);
            const language = s.substring(o + 1, n);
            const version = s.substring(n + 1);

            return ItemVersionUri.create(ItemUri.parse(itemUri), language, parseInt(version, 10));
        }

        if (s.host && s.databaseName && s.id && s.language && s.version) {
            return ItemVersionUri.create(ItemUri.create(DatabaseUri.create(WebsiteUri.create(s.host), s.databaseName), s.id), s.language, s.version);
        }

        console.log(new Error().stack);
        throw new Error("Invalid ItemVersionUri: " + s);
    }

    private static cache: { [key: string]: ItemVersionUri } = {};

    protected constructor(public readonly itemUri: ItemUri, public readonly language: string, public readonly version: number) {
    }

    public get databaseUri(): DatabaseUri {
        return this.itemUri.databaseUri;
    }

    public equals(itemVersionUri: ItemVersionUri) {
        return this.itemUri.equals(itemVersionUri.itemUri) && itemVersionUri.language === this.language && itemVersionUri.version === this.version;
    }

    public toString() {
        return this.itemUri.toString() + "/" + this.language + "/" + (this.version === -1 ? "-" : this.version);
    }
}

export function isItemVersionUri(a: any): a is ItemVersionUri {
    return a instanceof ItemVersionUri;
}
