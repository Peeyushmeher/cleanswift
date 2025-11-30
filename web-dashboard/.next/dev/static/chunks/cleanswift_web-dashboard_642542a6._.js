(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/cleanswift/web-dashboard/lib/detailer/dashboard-utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Utility functions for Detailer Dashboard
/**
 * Format a number as currency
 */ __turbopack_context__.s([
    "calculateDistance",
    ()=>calculateDistance,
    "calculateEarnings",
    ()=>calculateEarnings,
    "filterBookingsByDateRange",
    ()=>filterBookingsByDateRange,
    "formatCurrency",
    ()=>formatCurrency,
    "formatDate",
    ()=>formatDate,
    "formatDateTime",
    ()=>formatDateTime,
    "formatDistance",
    ()=>formatDistance,
    "getPaymentStatusColor",
    ()=>getPaymentStatusColor,
    "getStatusColor",
    ()=>getStatusColor,
    "sortBookings",
    ()=>sortBookings
]);
function formatCurrency(amount) {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
}
function formatDate(date, format = 'short') {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (format === 'time') {
        return d.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
    if (format === 'long') {
        return d.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}
function formatDateTime(date, time) {
    const dateObj = new Date(`${date}T${time}`);
    return formatDate(dateObj, 'long');
}
function calculateEarnings(bookings) {
    return bookings.reduce((sum, booking)=>{
        const amount = booking.total_amount || booking.service_price || 0;
        return sum + (typeof amount === 'string' ? parseFloat(amount) : amount);
    }, 0);
}
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
}
/**
 * Convert degrees to radians
 */ function toRad(degrees) {
    return degrees * (Math.PI / 180);
}
function formatDistance(km) {
    if (km < 1) {
        return `${Math.round(km * 1000)}m`;
    }
    return `${km}km`;
}
function getStatusColor(status) {
    switch(status){
        case 'accepted':
            return 'bg-[#1DA4F3]/20 border-[#1DA4F3]/40 text-[#1DA4F3]';
        case 'in_progress':
            return 'bg-[#6FF0C4]/20 border-[#6FF0C4]/40 text-[#6FF0C4]';
        case 'completed':
            return 'bg-[#32CE7A]/20 border-[#32CE7A]/40 text-[#32CE7A]';
        case 'cancelled':
        case 'no_show':
            return 'bg-red-500/20 border-red-500/40 text-red-400';
        case 'paid':
        case 'offered':
            return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400';
        default:
            return 'bg-[#C6CFD9]/20 border-[#C6CFD9]/40 text-[#C6CFD9]';
    }
}
function getPaymentStatusColor(status) {
    switch(status){
        case 'paid':
            return 'text-[#32CE7A]';
        case 'processing':
            return 'text-yellow-400';
        case 'failed':
        case 'refunded':
            return 'text-red-400';
        default:
            return 'text-[#C6CFD9]';
    }
}
function filterBookingsByDateRange(bookings, range) {
    if (range === 'all') return bookings;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return bookings.filter((booking)=>{
        const bookingDate = booking.scheduled_date ? new Date(booking.scheduled_date) : booking.scheduled_start ? new Date(booking.scheduled_start) : null;
        if (!bookingDate) return false;
        const bookingDateOnly = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
        switch(range){
            case 'today':
                return bookingDateOnly.getTime() === today.getTime();
            case 'tomorrow':
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                return bookingDateOnly.getTime() === tomorrow.getTime();
            case 'this_week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                return bookingDate >= weekStart && bookingDate <= weekEnd;
            case 'this_month':
                return bookingDate.getMonth() === today.getMonth() && bookingDate.getFullYear() === today.getFullYear();
            default:
                return true;
        }
    });
}
function sortBookings(bookings, sortBy) {
    const sorted = [
        ...bookings
    ];
    switch(sortBy){
        case 'time':
            return sorted.sort((a, b)=>{
                const dateA = a.scheduled_date || a.scheduled_start || '';
                const dateB = b.scheduled_date || b.scheduled_start || '';
                return new Date(dateA).getTime() - new Date(dateB).getTime();
            });
        case 'price':
            return sorted.sort((a, b)=>{
                const priceA = a.total_amount || a.service_price || 0;
                const priceB = b.total_amount || b.service_price || 0;
                return priceB - priceA;
            });
        case 'distance':
            // This would require current location
            return sorted;
        case 'rating':
            // This would require customer rating
            return sorted;
        case 'assignment':
            return sorted.sort((a, b)=>{
                const dateA = new Date(a.created_at || 0).getTime();
                const dateB = new Date(b.created_at || 0).getTime();
                return dateB - dateA;
            });
        default:
            return sorted;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/cleanswift/web-dashboard/components/detailer/EarningsChart.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EarningsChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
'use client';
;
function EarningsChart({ data, period }) {
    if (data.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-64 flex items-center justify-center text-[#C6CFD9]",
            children: "No earnings data available"
        }, void 0, false, {
            fileName: "[project]/cleanswift/web-dashboard/components/detailer/EarningsChart.tsx",
            lineNumber: 16,
            columnNumber: 7
        }, this);
    }
    const maxAmount = Math.max(...data.map((d)=>d.amount), 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-64 relative",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex items-end justify-between gap-1",
                children: data.map((item, index)=>{
                    const height = maxAmount > 0 ? item.amount / maxAmount * 100 : 0;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 flex flex-col items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-full bg-[#32CE7A] rounded-t transition-all hover:bg-[#6FF0C4] relative group",
                                style: {
                                    height: `${height}%`
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#0A1A2F] border border-white/5 rounded text-xs text-white opacity-0 group-hover:opacity-100 whitespace-nowrap",
                                    children: [
                                        "$",
                                        item.amount.toFixed(2)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/EarningsChart.tsx",
                                    lineNumber: 38,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/EarningsChart.tsx",
                                lineNumber: 34,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs text-[#C6CFD9] transform -rotate-45 origin-left whitespace-nowrap",
                                children: new Date(item.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                })
                            }, void 0, false, {
                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/EarningsChart.tsx",
                                lineNumber: 42,
                                columnNumber: 15
                            }, this)
                        ]
                    }, index, true, {
                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/EarningsChart.tsx",
                        lineNumber: 30,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/cleanswift/web-dashboard/components/detailer/EarningsChart.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-[#C6CFD9]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            "$",
                            maxAmount.toFixed(0)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/EarningsChart.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            "$",
                            Math.floor(maxAmount / 2).toFixed(0)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/EarningsChart.tsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "$0"
                    }, void 0, false, {
                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/EarningsChart.tsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/cleanswift/web-dashboard/components/detailer/EarningsChart.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/cleanswift/web-dashboard/components/detailer/EarningsChart.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
_c = EarningsChart;
var _c;
__turbopack_context__.k.register(_c, "EarningsChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/cleanswift/web-dashboard/app/detailer/earnings/EarningsPageClient.tsx [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/cleanswift/web-dashboard/app/detailer/earnings/EarningsPageClient.tsx'\n\nUnexpected token. Did you mean `{'}'}` or `&rbrace;`?");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
]);

//# sourceMappingURL=cleanswift_web-dashboard_642542a6._.js.map