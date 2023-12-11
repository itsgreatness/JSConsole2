"use strict";
const reprStr = (str) => {
    const escape = (str, quotes) => {
        return str.replace(/\\/g, "\\\\").replace(new RegExp("([" + quotes + "])", "g"), "\\$1");
    }
    const suitable = (str) => {
        let quotes = "'";
        if (!!~str.indexOf(quotes)) quotes = '"';
        if (!!~str.indexOf(quotes)) quotes = "`";
        return quotes;
    }
    const quotes = suitable(str);
    return quotes + escape(str, quotes) + quotes;
}
const indent = (level, str) => {
    return str.replace(/^(?!$)/gm, " ".repeat(level));
}
const getType = (obj) => {
    let type = "[object Object]";
    try {
        type = Object.prototype.toString.call(obj);
    } catch { }
    return type;
}
const getPrototypeProps = (obj) => {
    if (Object.getPrototypeOf(obj) !== null) {
        return Object.getOwnPropertyNames(obj).concat(getPrototypeProps(Object.getPrototypeOf(obj)));
    } else {
        return Object.getOwnPropertyNames(obj);
    }
}
const prefix = (obj, forceExpansion = false, strings = true) => {
    if (obj === null) return "null";
    if (typeof obj === "undefined") return "undefined";
    const type = getType(obj);
    switch (type) {
        case "[object Number]": return "" + obj;
        case "[object Boolean]": return obj ? "true" : "false";
        case "[object Function]": return Function.prototype.toString.call(obj);
        case "[object String]": return strings ? reprStr(obj) : "" + obj;
    }
    let root;
    // Not a console.dir call and a special preview provider is present
    if ((root = RuntimeProductObj.specialProviders(obj)) && !forceExpansion) return root;
    root = type;
    // Iterables are special: they are not special cases nor normal object prefixes
    if (obj[Symbol.iterator]) {
        if (obj instanceof Array) {
            root = `(${obj.length}) [${obj.join(", ")}]`;
        } else {
            try {
                const arrayLike = Array.from(obj);
                root = `${getType(obj)}(${arrayLike.length}) {${arrayLike.join(", ")}}`;
            } catch (e) {
                if (e instanceof TypeError) root = `${getType(obj)}(0) {}`; else throw e;
            }
        }
    }
    return root;
}
const isPrimitive = (obj) => {
    if (obj === null) return true;
    if (typeof obj === "undefined") return true;
    switch (getType(obj)) {
        case "[object Number]":
        case "[object Boolean]":
        case "[object Function]":
        case "[object String]": return true;
        default: return false;
    }
}
class RuntimeProductObj {
    static specialProviders(obj) {
        if (obj instanceof HTMLElement) return obj.outerHTML;
        if (obj instanceof Error) return `${obj.constructor.name} { ${reprStr(obj.message)} }`;
        return false;
    }
    constructor(obj) {
        this.src = obj;
    }
    isPrimitive() {
        return isPrimitive(this.src);
    }
    summary(forceExpansion = false) {
        return Object.assign(document.createElement("summary"), {
            textContent: prefix(this.src, forceExpansion),
        });
    }
    details() {
        return Object.assign(document.createElement("details"), {
            className: "line",
        });
    }
    static getImmediateTree(src) {
        let tree = prefix(src);
        if (isPrimitive(src) || RuntimeProductObj.specialProviders(src)) {
            return tree;
        } else {
            // Obtain properties of object, and if object is an HTMLElement, include prototype properties because original
            // JavaScript developers were weird.
            const props = Object.getOwnPropertyNames(src).concat(
                src instanceof HTMLElement ? Object.getOwnPropertyNames(Object.getPrototypeOf(src)) : []
            );
            // Begin tree
            tree += " {\n";
            for (const key of props) {
                let value = "( ... )";
                try {
                    value = prefix(src[key]) + (isPrimitive(src[key]) || RuntimeProductObj.specialProviders(src[key]) ? "" : " { ... }");
                } catch {
                    // Value is protected...?
                }
                // Add to tree
                tree += indent(2, `${key}: ${value}\n`);
            }
            // One of many protected internal properties
            // accessible only by use of Object static methods
            let value = "null";
            try {
                value = prefix(Object.getPrototypeOf(src)) + (isPrimitive(Object.getPrototypeOf(src)) || RuntimeProductObj.specialProviders(Object.getPrototypeOf(src)) ? "" : " { ... }");
            } catch { };
            tree += indent(2, `[[Prototype]]: ${value}\n`);
            // Done. Close tree.
            tree += "}";
            return tree;
        }
    }
    /**
     * @param {boolean} forceExpansion - DO NOT allow special cases to take precedence
     *                                 - does not apply to properties of the object
     *                                 - console.dir() forces expansion while log() does not
     */
    toString(forceExpansion = false) {
        let tree = prefix(this.src, forceExpansion);
        if (this.isPrimitive() || (RuntimeProductObj.specialProviders(this.src) && !forceExpansion)) {
            return tree;
        } else {
            // Obtain properties of object, and if object is an HTMLElement, include prototype properties because original
            // JavaScript developers were weird.
            const props = Object.getOwnPropertyNames(this.src).concat(
                this.src instanceof HTMLElement ? Object.getOwnPropertyNames(Object.getPrototypeOf(this.src)) : []
            );
            // Begin tree
            tree += " {\n";
            for (const key of props) {
                let value = "( ... )";
                try {
                    value = prefix(this.src[key]) + (isPrimitive(this.src[key]) || RuntimeProductObj.specialProviders(this.src[key]) ? "" : " { ... }");
                } catch {
                    // Value is protected...?
                }
                // Add to tree
                tree += indent(2, `${key}: ${value}\n`);
            }
            let value = "null";
            try {
                value = RuntimeProductObj.getImmediateTree(Object.getPrototypeOf(this.src));
            } catch { };
            // One of many protected internal properties
            // accessible only by use of Object static methods
            tree += indent(2, `[[Prototype]]: ${value}\n`);
            // Done. Close tree.
            tree += "}";
            return tree;
        }
    }
}