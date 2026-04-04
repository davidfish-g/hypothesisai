// Lazy-load Bun's SQL to avoid "Cannot find module 'bun'" during Next.js build
// (Next.js build runs under Node.js, but the app runs under Bun at runtime)

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const getSql = (): any => require("bun").sql;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sql: any = new Proxy(function () {}, {
  apply(_target, _thisArg, args) {
    return getSql()(...args);
  },
  get(_target, prop) {
    const instance = getSql();
    const value = instance[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
