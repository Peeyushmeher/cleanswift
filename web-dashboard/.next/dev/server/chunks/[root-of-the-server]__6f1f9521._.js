module.exports = [
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/lib/incremental-cache/tags-manifest.external.js [external] (next/dist/server/lib/incremental-cache/tags-manifest.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/lib/incremental-cache/tags-manifest.external.js", () => require("next/dist/server/lib/incremental-cache/tags-manifest.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/cleanswift/web-dashboard/proxy.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "proxy",
    ()=>proxy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/@supabase/ssr/dist/module/index.js [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/@supabase/ssr/dist/module/createServerClient.js [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/server.js [middleware] (ecmascript)");
;
;
async function proxy(request) {
    const supabaseUrl = ("TURBOPACK compile-time value", "https://nxxjpstkgbyaazmcybsf.supabase.co");
    const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54eGpwc3RrZ2J5YWF6bWN5YnNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyOTc2NjgsImV4cCI6MjA3ODg3MzY2OH0.x_iyPwOhvLWrqD1Cm0fHNVqTtIYRLhydbywxQZlfxTU");
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    let supabaseResponse = __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next({
        request: {
            headers: request.headers
        }
    });
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["createServerClient"])(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll () {
                return request.cookies.getAll();
            },
            setAll (cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options })=>request.cookies.set(name, value));
                supabaseResponse = __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next({
                    request
                });
                cookiesToSet.forEach(({ name, value, options })=>supabaseResponse.cookies.set(name, value, options));
            }
        }
    });
    // Use getUser() instead of getSession() for more reliable authentication
    // getSession() reads from cookies which may not be immediately updated after login
    const { data: { user } } = await supabase.auth.getUser();
    // Get session separately for role checks
    const { data: { session } } = await supabase.auth.getSession();
    const { pathname } = request.nextUrl;
    // Protect detailer routes
    if (pathname.startsWith('/detailer')) {
        if (!user || !session) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/auth/login', request.url));
        }
        // Check user role
        const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profileError || !profile || profile.role !== 'detailer' && profile.role !== 'admin') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/auth/login', request.url));
        }
    }
    // Protect admin routes
    if (pathname.startsWith('/admin')) {
        if (!user || !session) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/auth/login', request.url));
        }
        // Check user role
        const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profileError || !profile || profile.role !== 'admin') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/auth/login', request.url));
        }
    }
    // Redirect authenticated users away from login page
    if (pathname.startsWith('/auth/login') && user && session) {
        const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        // Only redirect if we successfully got the profile
        // If there's an error, let the login page handle it (might be RLS issue)
        if (profile && !profileError) {
            if (profile.role === 'admin') {
                return __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/admin/dashboard', request.url));
            } else if (profile.role === 'detailer') {
                return __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/detailer/dashboard', request.url));
            }
        }
    // If profile query failed, don't redirect - let user stay on login page
    // This prevents redirect loops when RLS blocks the query
    }
    return supabaseResponse;
}
const config = {
    matcher: [
        /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */ '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
    ]
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6f1f9521._.js.map