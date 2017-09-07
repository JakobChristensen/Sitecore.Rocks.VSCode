import { isString } from './helpers';
import { SitecoreConnection } from './SitecoreConnection';

export class WebsiteUri {
    private static cache: { [key: string]: WebsiteUri } = {};

    public static readonly empty = new WebsiteUri(SitecoreConnection.empty);

    public static create(host: string): WebsiteUri {
        let websiteUri = WebsiteUri.cache[host];

        if (!websiteUri) {
            const connection = SitecoreConnection.get(host);
            if (!connection) {
                throw 'Unknown connection: ' + host;
            }

            websiteUri = new WebsiteUri(connection);
            WebsiteUri.cache[connection.host] = websiteUri;
        }

        return websiteUri;
    }

    public static createFromConnection(connection: SitecoreConnection): WebsiteUri {
        let websiteUri = WebsiteUri.cache[connection.host];

        if (!websiteUri) {
            websiteUri = new WebsiteUri(connection);
            WebsiteUri.cache[connection.host] = websiteUri;
        }

        return websiteUri;
    }

    public static clearCache() {
        WebsiteUri.cache = {};
    }

    public static parse(s: WebsiteUri | string | { host: string }): WebsiteUri {
        if (s instanceof WebsiteUri) {
            return s;
        }

        if (isString(s)) {
            return WebsiteUri.create(s);
        }

        if (s.host) {
            return WebsiteUri.create(s.host);
        }

        throw 'Invalid WebsiteUri: ' + s;
    }

    protected constructor(public readonly connection: SitecoreConnection) {
    }

    public equals(websiteUri: WebsiteUri) {
        return websiteUri.connection === this.connection;
    }

    public toString() {
        return this.connection.host;
    }
}

export function isWebsiteUri(a: any): a is WebsiteUri {
    return a instanceof WebsiteUri;
}
