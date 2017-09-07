const debouncedFunctions: any = {};

export function debounce(func: () => void, delay: number = 400) {
    const a = <any>func;
    if (debouncedFunctions[a]) {
        clearTimeout(debouncedFunctions[a]);
        delete debouncedFunctions[a];
    }

    debouncedFunctions[a] = setTimeout(() => {
        delete debouncedFunctions[a];
        func();
    }, delay);
}

export function isNumber(n: any): n is number {
    return typeof n === 'number';
}

export function isString(s: any): s is string {
    return typeof s === 'string';
}

export function deepEqual(x: any, y: any): boolean {
    if ((typeof x === 'object' && x != null) && (typeof y === 'object' && y != null)) {
        if (Object.keys(x).length !== Object.keys(y).length) {
            return false;
        }

        for (const prop in x) {
            if (y.hasOwnProperty(prop)) {
                if (!deepEqual(x[prop], y[prop])) {
                    return false;
                }
            }
            else {
                return false;
            }
        }

        return true;
    }
    else if (x !== y) {
        return false;
    }

    return true;
}