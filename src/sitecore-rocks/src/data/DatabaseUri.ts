import { isString } from './helpers';
import { WebsiteUri } from './WebsiteUri';

export class DatabaseUri {
    private static cache: { [key: string]: DatabaseUri } = {};

    public static readonly empty = new DatabaseUri(WebsiteUri.empty, '');

    public static create(websiteUri: WebsiteUri, databaseName: string): DatabaseUri {
        const key = websiteUri.toString() + '/' + databaseName;

        let databaseUri = DatabaseUri.cache[key];

        if (!databaseUri) {
            databaseUri = new DatabaseUri(websiteUri, databaseName);
            DatabaseUri.cache[databaseName] = databaseUri;
        }

        return databaseUri;
    }

    public static clearCache() {
        DatabaseUri.cache = {};
    }

    public static parse(s: DatabaseUri | string | { host: string, databaseName: string }): DatabaseUri {
        if (s instanceof DatabaseUri) {
            return s;
        }

        if (isString(s)) {
            const n = s.lastIndexOf('/');
            if (n < 0) {
                throw 'Invalid DatabaseUri: ' + s;
            }

            const host = s.substr(0, n);
            const databaseName = s.substr(n + 1);

            return DatabaseUri.create(WebsiteUri.create(host), databaseName);
        }

        if (s.databaseName) {
            return DatabaseUri.create(WebsiteUri.create(s.host), s.databaseName);
        }

        throw 'Invalid DatabaseUri: ' + s;
    }

    protected constructor(public readonly websiteUri: WebsiteUri, public readonly databaseName: string) {
    }

    public equals(databaseUri: DatabaseUri) {
        return databaseUri.databaseName === this.databaseName;
    }

    public toString() {
        return this.websiteUri.toString() + '/' + this.databaseName;
    }
}

export function isDatabaseUri(a: any): a is DatabaseUri {
    return a instanceof DatabaseUri;
}
