"use strict";
const consoleSimulator = {
    stdout: document.getElementById("console"),
    stdin: document.getElementById("code"),
    add(el) {
        this.stdout.append(el);
        el.style.height = `${el.scrollHeight}px`;
        this.stdin.scrollIntoView();
    },
    log(msg) {
        if (isPrimitive(msg) || RuntimeProductObj.specialProviders(msg)) {
            const output = Object.assign(document.createElement("textarea"), {
                className: "line log",
                readOnly: true,
                // "String" -> String
                // Could only be protected if it was a property access
                value: prefix(msg, false, false) + (isPrimitive(msg) || RuntimeProductObj.specialProviders(msg) ? "" : " { ... }"),
            });
            this.add(output);
        } else {
            // Complex format
            const output = Object.assign(document.createElement("textarea"), {
                className: "line log",
                readOnly: true,
                value: new RuntimeProductObj(msg).toString(),
            });
            this.add(output);
            // const product = new RuntimeProductObj(msg);
            // const details = product.details();
            // details.prepend(product.summary());
            // this.add(details);
        }
    },
    // dirxml() does html representation
    dir(msg) {
        if (isPrimitive(msg)) {
            const output = Object.assign(document.createElement("textarea"), {
                className: "line log",
                readOnly: true,
                // "String" -> String
                value: prefix(msg, true, false) + (isPrimitive(msg) || RuntimeProductObj.specialProviders(msg) ? "" : " { ... }"),
            });
            this.add(output);
        } else {
            const output = Object.assign(document.createElement("textarea"), {
                className: "line log",
                readOnly: true,
                value: new RuntimeProductObj(msg).toString(true),
            });
            this.add(output);
            // const product = new RuntimeProductObj(msg);
            // const details = product.details();
            // // Don't allow special cases (<a></a> => [object HTMLAnchorElement])
            // details.prepend(product.summary(true));
            // this.add(details);
        }
    },
    error(msg) {
        if (isPrimitive(msg) || RuntimeProductObj.specialProviders(msg)) {
            const output = Object.assign(document.createElement("textarea"), {
                className: "line error",
                readOnly: true,
                // "String" -> String
                value: prefix(msg, false, false) + (isPrimitive(msg) || RuntimeProductObj.specialProviders(msg) ? "" : " { ... }"),
            });
            this.add(output);
        } else {
            // Complex format
            const output = Object.assign(document.createElement("textarea"), {
                className: "line error",
                readOnly: true,
                value: new RuntimeProductObj(msg).toString(),
            });
            this.add(output);
            // const product = new RuntimeProductObj(msg);
            // const details = product.details();
            // details.prepend(product.summary());
            // this.add(details);
        }
    },
    warn(msg) {
        if (isPrimitive(msg) || RuntimeProductObj.specialProviders(msg)) {
            const output = Object.assign(document.createElement("textarea"), {
                className: "line warn",
                readOnly: true,
                // "String" -> String
                value: prefix(msg, false, false) + (isPrimitive(msg) || RuntimeProductObj.specialProviders(msg) ? "" : " { ... }"),
            });
            this.add(output);
        } else {
            // Complex format
            const output = Object.assign(document.createElement("textarea"), {
                className: "line warn",
                readOnly: true,
                value: new RuntimeProductObj(msg).toString(),
            });
            this.add(output);
            // const product = new RuntimeProductObj(msg);
            // const details = product.details();
            // details.prepend(product.summary());
            // this.add(details);
        }
    },
    clear() {
        this.stdout.replaceChildren();
    }
}
const consoleInterceptor = {
    get(target, key, reciever) {
        if (Object.hasOwn(consoleSimulator, key)) {
            return consoleSimulator[key];
        }
        return Reflect.get(...arguments);
    }
}
const console = new Proxy(window.console, consoleInterceptor);
let $_;
const onSubmit = (event) => {
    event.preventDefault();
    const code = event.target.code.value;
    try {
        console.add(Object.assign(document.createElement("textarea"), {
            className: "line input",
            readOnly: true,
            value: code,
        }));
        const product = new RuntimeProductObj($_ = eval?.(code));
        if (product.isPrimitive()) {
            console.add(Object.assign(document.createElement("textarea"), {
                className: "line output",
                readOnly: true,
                value: product.toString(),
            }));
        } else {
            console.add(Object.assign(document.createElement("textarea"), {
                className: "line output",
                readOnly: true,
                value: product.toString(),
            }));
            // const details = product.details();
            // details.prepend(product.summary());
            // console.add(details);
        }
    } catch (e) {
        console.error(`Uncaught ${e.constructor.name} { ${reprStr(e.message)} }`);
    }
    event.target.code.value = "";
}
const onKeyDown = (event) => {
    if (event.key === "Enter" && event.target.value) {
        event.preventDefault();
        console.stdin.value = event.target.value;
        console.stdin.style.height = `${console.stdin.scrollHeight}px`
        console.stdin.focus();
    }
}
const onDoubleClick = (event) => {
    event.target.style.height = event.target.style.minHeight;
}