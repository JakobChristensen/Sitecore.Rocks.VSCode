import { DatabaseUri } from "./DatabaseUri";
import { isString } from "./helpers";
import { ItemUri } from "./ItemUri";
import { ItemVersionUri } from "./ItemVersionUri";
import { WebsiteUri } from "./WebsiteUri";

export class FieldUri {
    public static readonly empty = new FieldUri(ItemVersionUri.empty, "{00000000-0000-0000-0000-000000000000}");

    public static create(itemVersionUri: ItemVersionUri, fieldId: string): FieldUri {
        const key = itemVersionUri.toString() + "/" + fieldId;

        let fieldUri = FieldUri.cache[key];
        if (!fieldUri) {
            fieldUri = new FieldUri(itemVersionUri, fieldId);
            FieldUri.cache[key] = fieldUri;
        }

        return fieldUri;
    }

    public static clearCache() {
        FieldUri.cache = {};
    }

    public static parse(s: FieldUri | string | { host: string, databaseName: string, id: string, language: string, version: number, fieldId: string }): FieldUri {
        if (s instanceof FieldUri) {
            return s;
        }

        if (isString(s)) {
            const n = s.lastIndexOf("/");
            if (n < 0) {
                throw new Error("Invalid FieldUri: " + s);
            }

            const itemVersionUri = s.substr(0, n);
            const fieldId = s.substr(n + 1);

            return FieldUri.create(ItemVersionUri.parse(itemVersionUri), fieldId);
        }

        if (s.host && s.databaseName && s.id && s.language && s.version && s.fieldId) {
            return FieldUri.create(ItemVersionUri.create(ItemUri.create(DatabaseUri.create(WebsiteUri.create(s.host), s.databaseName), s.id), s.language, s.version), s.fieldId);
        }

        throw new Error("Invalid FieldUri: " + s);
    }

    private static cache: { [key: string]: FieldUri } = {};

        protected constructor(public readonly itemVersionUri: ItemVersionUri, public readonly fieldId: string) {
    }

    public get databaseUri(): DatabaseUri {
        return this.itemVersionUri.databaseUri;
    }

    public get itemUri(): ItemUri {
        return this.itemVersionUri.itemUri;
    }

    public equals(fieldUri: FieldUri) {
        return this.itemVersionUri.equals(fieldUri.itemVersionUri) && fieldUri.fieldId === this.fieldId;
    }

    public toString() {
        return this.itemVersionUri.toString() + "/" + this.fieldId;
    }

    public toFieldUri() {
        return this.databaseUri.databaseName + "/" + this.itemUri.id + "/" + this.itemVersionUri.language + "/" + this.itemVersionUri.version + "/" + this.fieldId;
    }
}

export function isFieldUri(a: any): a is FieldUri {
    return a instanceof FieldUri;
}
