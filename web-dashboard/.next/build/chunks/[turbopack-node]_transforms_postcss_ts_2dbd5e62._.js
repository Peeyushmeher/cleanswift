module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/cleanswift/web-dashboard/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "chunks/0c9b8_835bdcde._.js",
  "chunks/[root-of-the-server]__be6551db._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/cleanswift/web-dashboard/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];