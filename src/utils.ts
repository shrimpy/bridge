export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function isSerializableShallow(this: any, obj: any): boolean {
    const objType = typeof obj;
    if (
        obj === null ||
        objType === "number" ||
        objType === "boolean" ||
        objType === "string" ||
        objType === "undefined"
    ) {
        return true;
    }

    // null check must be before below if statement, since "typeof null" also result in "object"
    if (objType === "object") {
        // internal flag to stop recursion
        if (arguments.length === 1) {
            for (const key in obj) {
                if (!isSerializableShallow.apply(this, [obj[key], {} /* internal flag to stop recursion */] as any)) {
                    return false;
                }
            }
        }

        return true;
    }

    return false;
}