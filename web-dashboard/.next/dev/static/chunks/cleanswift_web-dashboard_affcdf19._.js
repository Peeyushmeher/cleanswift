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
"[project]/cleanswift/web-dashboard/components/ui/StatusBadge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StatusBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/lib/detailer/dashboard-utils.ts [app-client] (ecmascript)");
;
;
function StatusBadge({ status, className = '' }) {
    const colorClass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStatusColor"])(status);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `px-2 py-1 text-xs font-medium rounded-full border ${colorClass} ${className}`,
        children: status.replace('_', ' ')
    }, void 0, false, {
        fileName: "[project]/cleanswift/web-dashboard/components/ui/StatusBadge.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
_c = StatusBadge;
var _c;
__turbopack_context__.k.register(_c, "StatusBadge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/cleanswift/web-dashboard/components/ui/LoadingSpinner.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoadingSpinner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function LoadingSpinner({ size = 'md', className = '' }) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-center justify-center ${className}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `${sizeClasses[size]} border-4 border-[#0A1A2F] border-t-[#32CE7A] rounded-full animate-spin`,
            role: "status",
            "aria-label": "Loading",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "sr-only",
                children: "Loading..."
            }, void 0, false, {
                fileName: "[project]/cleanswift/web-dashboard/components/ui/LoadingSpinner.tsx",
                lineNumber: 20,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/cleanswift/web-dashboard/components/ui/LoadingSpinner.tsx",
            lineNumber: 15,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/cleanswift/web-dashboard/components/ui/LoadingSpinner.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_c = LoadingSpinner;
var _c;
__turbopack_context__.k.register(_c, "LoadingSpinner");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>JobsTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/lib/detailer/dashboard-utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$StatusBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/components/ui/StatusBadge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$LoadingSpinner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/components/ui/LoadingSpinner.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function JobsTable({ bookings, loading = false, pageSize = 10, showOrgColumns = false, onAssignClick }) {
    _s();
    const [currentPage, setCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const totalPages = Math.ceil(bookings.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedBookings = bookings.slice(startIndex, startIndex + pageSize);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-center items-center py-12",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$LoadingSpinner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                size: "lg"
            }, void 0, false, {
                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                lineNumber: 27,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
            lineNumber: 26,
            columnNumber: 7
        }, this);
    }
    if (bookings.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-12 text-[#C6CFD9]",
            children: "No jobs found"
        }, void 0, false, {
            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
            lineNumber: 34,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-x-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "w-full",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                className: "border-b border-white/5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                        children: "Booking ID"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                        lineNumber: 46,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                        children: "Time"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                        lineNumber: 49,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                        children: "Customer"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                        lineNumber: 52,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                        children: "Car"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                        lineNumber: 55,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                        children: "Location"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                        lineNumber: 58,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                        children: "Service"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                        lineNumber: 61,
                                        columnNumber: 15
                                    }, this),
                                    showOrgColumns && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                                children: "Assigned Detailer"
                                            }, void 0, false, {
                                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                lineNumber: 66,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                                children: "Team"
                                            }, void 0, false, {
                                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                lineNumber: 69,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                        children: "Status"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                        lineNumber: 74,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                        children: "Payment"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                        lineNumber: 77,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                        children: "Amount"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                        lineNumber: 80,
                                        columnNumber: 15
                                    }, this),
                                    showOrgColumns && onAssignClick && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                        children: "Actions"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                        lineNumber: 84,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                lineNumber: 45,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                            lineNumber: 44,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            className: "divide-y divide-white/5",
                            children: paginatedBookings.map((booking)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "hover:bg-white/5 transition-colors",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 whitespace-nowrap",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: `/detailer/bookings/${booking.id}`,
                                                className: "text-sm text-[#32CE7A] hover:text-[#6FF0C4] font-mono",
                                                children: booking.receipt_id
                                            }, void 0, false, {
                                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                lineNumber: 97,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                            lineNumber: 96,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 whitespace-nowrap text-sm text-white",
                                            children: booking.scheduled_date && booking.scheduled_time_start ? `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDate"])(booking.scheduled_date)} ${booking.scheduled_time_start.substring(0, 5)}` : booking.scheduled_start ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDate"])(booking.scheduled_start, 'short') : 'TBD'
                                        }, void 0, false, {
                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                            lineNumber: 104,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 whitespace-nowrap text-sm text-white",
                                            children: booking.user?.full_name || 'N/A'
                                        }, void 0, false, {
                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                            lineNumber: 111,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 whitespace-nowrap text-sm text-white",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            booking.car?.make,
                                                            " ",
                                                            booking.car?.model
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                        lineNumber: 116,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-[#C6CFD9]",
                                                        children: booking.car?.license_plate
                                                    }, void 0, false, {
                                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                        lineNumber: 117,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                lineNumber: 115,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                            lineNumber: 114,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 text-sm text-white",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: booking.address_line1
                                                    }, void 0, false, {
                                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                        lineNumber: 122,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-[#C6CFD9]",
                                                        children: [
                                                            booking.city,
                                                            ", ",
                                                            booking.province
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                        lineNumber: 123,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                lineNumber: 121,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                            lineNumber: 120,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 whitespace-nowrap text-sm text-white",
                                            children: booking.service?.name || 'N/A'
                                        }, void 0, false, {
                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                            lineNumber: 126,
                                            columnNumber: 17
                                        }, this),
                                        showOrgColumns && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3 whitespace-nowrap text-sm text-white",
                                                    children: booking.detailer?.full_name || /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[#C6CFD9] italic",
                                                        children: "Unassigned"
                                                    }, void 0, false, {
                                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                        lineNumber: 133,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                    lineNumber: 131,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3 whitespace-nowrap text-sm text-white",
                                                    children: booking.team?.name || '-'
                                                }, void 0, false, {
                                                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                    lineNumber: 136,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 whitespace-nowrap",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$StatusBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                status: booking.status
                                            }, void 0, false, {
                                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                lineNumber: 142,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                            lineNumber: 141,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 whitespace-nowrap",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `text-sm ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPaymentStatusColor"])(booking.payment_status)}`,
                                                children: booking.payment_status
                                            }, void 0, false, {
                                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                lineNumber: 145,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                            lineNumber: 144,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 whitespace-nowrap text-sm font-semibold text-white",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(booking.total_amount || booking.service_price || 0)
                                        }, void 0, false, {
                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                            lineNumber: 149,
                                            columnNumber: 17
                                        }, this),
                                        showOrgColumns && onAssignClick && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 whitespace-nowrap",
                                            children: !booking.detailer_id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: (e)=>{
                                                    e.stopPropagation();
                                                    onAssignClick(booking.id, booking.detailer_id);
                                                },
                                                className: "px-3 py-1 bg-[#32CE7A] hover:bg-[#2AB869] text-white text-xs font-semibold rounded transition-colors",
                                                children: "Assign"
                                            }, void 0, false, {
                                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                lineNumber: 155,
                                                columnNumber: 23
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: (e)=>{
                                                    e.stopPropagation();
                                                    onAssignClick(booking.id, booking.detailer_id);
                                                },
                                                className: "px-3 py-1 bg-[#0A1A2F] border border-white/5 hover:border-[#32CE7A]/40 text-white text-xs font-semibold rounded transition-colors",
                                                children: "Reassign"
                                            }, void 0, false, {
                                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                lineNumber: 165,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                            lineNumber: 153,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, booking.id, true, {
                                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                    lineNumber: 92,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                            lineNumber: 90,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                    lineNumber: 43,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this),
            totalPages > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-sm text-[#C6CFD9]",
                        children: [
                            "Showing ",
                            startIndex + 1,
                            " to ",
                            Math.min(startIndex + pageSize, bookings.length),
                            " of ",
                            bookings.length,
                            " jobs"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                        lineNumber: 186,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setCurrentPage((p)=>Math.max(1, p - 1)),
                                disabled: currentPage === 1,
                                className: "px-4 py-2 bg-[#0A1A2F] border border-white/5 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#32CE7A]/40 transition-colors",
                                children: "Previous"
                            }, void 0, false, {
                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                lineNumber: 190,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "px-4 py-2 text-[#C6CFD9]",
                                children: [
                                    "Page ",
                                    currentPage,
                                    " of ",
                                    totalPages
                                ]
                            }, void 0, true, {
                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                lineNumber: 197,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setCurrentPage((p)=>Math.min(totalPages, p + 1)),
                                disabled: currentPage === totalPages,
                                className: "px-4 py-2 bg-[#0A1A2F] border border-white/5 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#32CE7A]/40 transition-colors",
                                children: "Next"
                            }, void 0, false, {
                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                lineNumber: 200,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                        lineNumber: 189,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                lineNumber: 185,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
_s(JobsTable, "6xAUoJ2motYJ38x4zeUWisA+X/4=");
_c = JobsTable;
var _c;
__turbopack_context__.k.register(_c, "JobsTable");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/cleanswift/web-dashboard/components/ui/FilterDropdown.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FilterDropdown
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
function FilterDropdown({ label, options, value, onChange, multiple = false, className = '' }) {
    _s();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const selectedOption = options.find((opt)=>opt.value === value);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `relative ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsOpen(!isOpen),
                className: "w-full px-4 py-2 bg-[#050B12] border border-white/5 rounded-lg text-left text-white flex items-center justify-between hover:border-[#32CE7A]/40 transition-colors",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm",
                        children: selectedOption ? selectedOption.label : label
                    }, void 0, false, {
                        fileName: "[project]/cleanswift/web-dashboard/components/ui/FilterDropdown.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: `w-5 h-5 text-[#C6CFD9] transform transition-transform ${isOpen ? 'rotate-180' : ''}`,
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M19 9l-7 7-7-7"
                        }, void 0, false, {
                            fileName: "[project]/cleanswift/web-dashboard/components/ui/FilterDropdown.tsx",
                            lineNumber: 48,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/cleanswift/web-dashboard/components/ui/FilterDropdown.tsx",
                        lineNumber: 40,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/cleanswift/web-dashboard/components/ui/FilterDropdown.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 z-10",
                        onClick: ()=>setIsOpen(false)
                    }, void 0, false, {
                        fileName: "[project]/cleanswift/web-dashboard/components/ui/FilterDropdown.tsx",
                        lineNumber: 59,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute z-20 w-full mt-2 bg-[#0A1A2F] border border-white/5 rounded-lg shadow-xl max-h-60 overflow-y-auto",
                        children: options.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    onChange(option.value);
                                    if (!multiple) {
                                        setIsOpen(false);
                                    }
                                },
                                className: `
                  w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors
                  ${value === option.value ? 'bg-[#32CE7A]/20 text-[#32CE7A]' : 'text-white'}
                `,
                                children: option.label
                            }, option.value, false, {
                                fileName: "[project]/cleanswift/web-dashboard/components/ui/FilterDropdown.tsx",
                                lineNumber: 65,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/cleanswift/web-dashboard/components/ui/FilterDropdown.tsx",
                        lineNumber: 63,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/cleanswift/web-dashboard/components/ui/FilterDropdown.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
_s(FilterDropdown, "+sus0Lb0ewKHdwiUhiTAJFoFyQ0=");
_c = FilterDropdown;
var _c;
__turbopack_context__.k.register(_c, "FilterDropdown");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/cleanswift/web-dashboard/components/detailer/JobsFilters.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>JobsFilters
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$FilterDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/components/ui/FilterDropdown.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/lib/detailer/dashboard-utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const dateRangeOptions = [
    {
        value: 'all',
        label: 'All Time'
    },
    {
        value: 'today',
        label: 'Today'
    },
    {
        value: 'tomorrow',
        label: 'Tomorrow'
    },
    {
        value: 'this_week',
        label: 'This Week'
    }
];
const statusOptions = [
    {
        value: 'all',
        label: 'All Statuses'
    },
    {
        value: 'accepted',
        label: 'Accepted'
    },
    {
        value: 'in_progress',
        label: 'In Progress'
    },
    {
        value: 'completed',
        label: 'Completed'
    },
    {
        value: 'cancelled',
        label: 'Cancelled'
    }
];
const sortOptions = [
    {
        value: 'time',
        label: 'Start Time'
    },
    {
        value: 'price',
        label: 'Price'
    },
    {
        value: 'assignment',
        label: 'Assignment Time'
    }
];
function JobsFilters({ bookings, onFiltered, mode = 'solo', teams = [], detailers = [] }) {
    _s();
    const [dateRange, setDateRange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [sortBy, setSortBy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('time');
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [selectedDetailer, setSelectedDetailer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [selectedTeam, setSelectedTeam] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    // Apply filters
    const applyFilters = ()=>{
        let filtered = [
            ...bookings
        ];
        // Date range filter
        if (dateRange !== 'all') {
            filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["filterBookingsByDateRange"])(filtered, dateRange);
        }
        // Status filter
        if (status !== 'all') {
            filtered = filtered.filter((b)=>b.status === status);
        }
        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter((b)=>b.receipt_id.toLowerCase().includes(term) || b.user?.full_name?.toLowerCase().includes(term) || b.car?.license_plate?.toLowerCase().includes(term));
        }
        // Sort
        filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sortBookings"])(filtered, sortBy);
        onFiltered(filtered);
    };
    // Re-apply filters when any filter changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "JobsFilters.useEffect": ()=>{
            let filtered = [
                ...bookings
            ];
            // Date range filter
            if (dateRange !== 'all') {
                filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["filterBookingsByDateRange"])(filtered, dateRange);
            }
            // Status filter
            if (status !== 'all') {
                filtered = filtered.filter({
                    "JobsFilters.useEffect": (b)=>b.status === status
                }["JobsFilters.useEffect"]);
            }
            // Detailer filter (org mode only)
            if (mode === 'organization' && selectedDetailer !== 'all') {
                filtered = filtered.filter({
                    "JobsFilters.useEffect": (b)=>b.detailer_id === selectedDetailer
                }["JobsFilters.useEffect"]);
            }
            // Team filter (org mode only)
            if (mode === 'organization' && selectedTeam !== 'all') {
                filtered = filtered.filter({
                    "JobsFilters.useEffect": (b)=>b.team_id === selectedTeam
                }["JobsFilters.useEffect"]);
            }
            // Search filter
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                filtered = filtered.filter({
                    "JobsFilters.useEffect": (b)=>b.receipt_id.toLowerCase().includes(term) || b.user?.full_name?.toLowerCase().includes(term) || b.car?.license_plate?.toLowerCase().includes(term)
                }["JobsFilters.useEffect"]);
            }
            // Sort
            filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sortBookings"])(filtered, sortBy);
            onFiltered(filtered);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["JobsFilters.useEffect"], [
        dateRange,
        status,
        sortBy,
        searchTerm,
        selectedDetailer,
        selectedTeam,
        bookings,
        mode
    ]);
    const detailerOptions = [
        {
            value: 'all',
            label: 'All Detailers'
        },
        ...detailers.map((d)=>({
                value: d.profile_id,
                label: d.full_name
            }))
    ];
    const teamOptions = [
        {
            value: 'all',
            label: 'All Teams'
        },
        ...teams.map((t)=>({
                value: t.id,
                label: t.name
            }))
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-[#0A1A2F] border border-white/5 rounded-xl p-4 mb-6",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `grid grid-cols-1 ${mode === 'organization' ? 'md:grid-cols-6' : 'md:grid-cols-4'} gap-4`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: mode === 'organization' ? 'md:col-span-2' : 'md:col-span-2',
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        placeholder: "Search by booking ID, customer name, or license plate...",
                        value: searchTerm,
                        onChange: (e)=>setSearchTerm(e.target.value),
                        suppressHydrationWarning: true,
                        className: "w-full px-4 py-2 bg-[#050B12] border border-white/5 rounded-lg text-white placeholder-[#C6CFD9] focus:outline-none focus:border-[#32CE7A]/40"
                    }, void 0, false, {
                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsFilters.tsx",
                        lineNumber: 143,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsFilters.tsx",
                    lineNumber: 142,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$FilterDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    label: "Date Range",
                    options: dateRangeOptions,
                    value: dateRange,
                    onChange: (value)=>setDateRange(value)
                }, void 0, false, {
                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsFilters.tsx",
                    lineNumber: 154,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$FilterDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    label: "Status",
                    options: statusOptions,
                    value: status,
                    onChange: (value)=>setStatus(value)
                }, void 0, false, {
                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsFilters.tsx",
                    lineNumber: 162,
                    columnNumber: 9
                }, this),
                mode === 'organization' && detailers.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$FilterDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    label: "Detailer",
                    options: detailerOptions,
                    value: selectedDetailer,
                    onChange: (value)=>setSelectedDetailer(value)
                }, void 0, false, {
                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsFilters.tsx",
                    lineNumber: 171,
                    columnNumber: 11
                }, this),
                mode === 'organization' && teams.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$FilterDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    label: "Team",
                    options: teamOptions,
                    value: selectedTeam,
                    onChange: (value)=>setSelectedTeam(value)
                }, void 0, false, {
                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsFilters.tsx",
                    lineNumber: 181,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$FilterDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    label: "Sort By",
                    options: sortOptions,
                    value: sortBy,
                    onChange: (value)=>setSortBy(value)
                }, void 0, false, {
                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsFilters.tsx",
                    lineNumber: 190,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsFilters.tsx",
            lineNumber: 140,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsFilters.tsx",
        lineNumber: 139,
        columnNumber: 5
    }, this);
}
_s(JobsFilters, "8XqUPx68oreOYrKFDjHnAAzIuc8=");
_c = JobsFilters;
var _c;
__turbopack_context__.k.register(_c, "JobsFilters");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/cleanswift/web-dashboard/app/detailer/bookings/data:bfef98 [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"60a99119db695fbd12e3fb361d3ea7fb0228ee8bda":"assignJobToDetailer"},"cleanswift/web-dashboard/app/detailer/bookings/actions.ts",""] */ __turbopack_context__.s([
    "assignJobToDetailer",
    ()=>assignJobToDetailer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var assignJobToDetailer = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("60a99119db695fbd12e3fb361d3ea7fb0228ee8bda", __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "assignJobToDetailer"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcic7XG5cbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0AvbGliL3N1cGFiYXNlL3NlcnZlcic7XG5pbXBvcnQgeyByZXF1aXJlRGV0YWlsZXIsIGdldERldGFpbGVyTW9kZSB9IGZyb20gJ0AvbGliL2F1dGgnO1xuaW1wb3J0IHsgZ2V0RGV0YWlsZXJPcmdhbml6YXRpb24sIGdldE9yZ2FuaXphdGlvblJvbGUgfSBmcm9tICdAL2xpYi9kZXRhaWxlci9tb2RlLWRldGVjdGlvbic7XG5pbXBvcnQgeyBjYW5Bc3NpZ25Kb2JzIH0gZnJvbSAnQC9saWIvZGV0YWlsZXIvcGVybWlzc2lvbnMnO1xuXG4vKipcbiAqIEFzc2lnbiBhIGpvYiB0byBhIGRldGFpbGVyXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhc3NpZ25Kb2JUb0RldGFpbGVyKGJvb2tpbmdJZDogc3RyaW5nLCBkZXRhaWxlcklkOiBzdHJpbmcpIHtcbiAgY29uc3Qgc3VwYWJhc2UgPSBhd2FpdCBjcmVhdGVDbGllbnQoKTtcbiAgY29uc3QgcHJvZmlsZSA9IGF3YWl0IHJlcXVpcmVEZXRhaWxlcigpO1xuXG4gIC8vIEdldCBib29raW5nXG4gIGNvbnN0IHsgZGF0YTogYm9va2luZywgZXJyb3I6IGJvb2tpbmdFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAuZnJvbSgnYm9va2luZ3MnKVxuICAgIC5zZWxlY3QoJ2lkLCBvcmdhbml6YXRpb25faWQsIGRldGFpbGVyX2lkLCBzdGF0dXMnKVxuICAgIC5lcSgnaWQnLCBib29raW5nSWQpXG4gICAgLnNpbmdsZSgpO1xuXG4gIGlmIChib29raW5nRXJyb3IgfHwgIWJvb2tpbmcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Jvb2tpbmcgbm90IGZvdW5kJyk7XG4gIH1cblxuICAvLyBDaGVjayBwZXJtaXNzaW9uc1xuICBpZiAoYm9va2luZy5vcmdhbml6YXRpb25faWQpIHtcbiAgICBjb25zdCBtb2RlID0gYXdhaXQgZ2V0RGV0YWlsZXJNb2RlKCk7XG4gICAgaWYgKG1vZGUgPT09ICdvcmdhbml6YXRpb24nKSB7XG4gICAgICBjb25zdCBvcmdhbml6YXRpb24gPSBhd2FpdCBnZXREZXRhaWxlck9yZ2FuaXphdGlvbigpO1xuICAgICAgaWYgKG9yZ2FuaXphdGlvbikge1xuICAgICAgICBjb25zdCByb2xlID0gYXdhaXQgZ2V0T3JnYW5pemF0aW9uUm9sZShvcmdhbml6YXRpb24uaWQpO1xuICAgICAgICBpZiAoIWNhbkFzc2lnbkpvYnMocm9sZSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBkbyBub3QgaGF2ZSBwZXJtaXNzaW9uIHRvIGFzc2lnbiBqb2JzJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU29sbyBkZXRhaWxlciBjYW4gb25seSBhc3NpZ24gdG8gdGhlbXNlbHZlc1xuICAgICAgY29uc3QgeyBkYXRhOiBkZXRhaWxlckRhdGEgfSA9IGF3YWl0IHN1cGFiYXNlLnJwYygnZ2V0X2RldGFpbGVyX2J5X3Byb2ZpbGUnLCB7XG4gICAgICAgIHBfcHJvZmlsZV9pZDogbnVsbCxcbiAgICAgIH0pO1xuICAgICAgaWYgKGRldGFpbGVySWQgIT09IGRldGFpbGVyRGF0YT8uaWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTb2xvIGRldGFpbGVycyBjYW4gb25seSBiZSBhc3NpZ25lZCB0byB0aGVtc2VsdmVzJyk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIFNvbG8gYm9va2luZyAtIGRldGFpbGVyIGNhbiBvbmx5IGFzc2lnbiB0byB0aGVtc2VsdmVzXG4gICAgY29uc3QgeyBkYXRhOiBkZXRhaWxlckRhdGEgfSA9IGF3YWl0IHN1cGFiYXNlLnJwYygnZ2V0X2RldGFpbGVyX2J5X3Byb2ZpbGUnLCB7XG4gICAgICBwX3Byb2ZpbGVfaWQ6IG51bGwsXG4gICAgfSk7XG4gICAgaWYgKGRldGFpbGVySWQgIT09IGRldGFpbGVyRGF0YT8uaWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91IGNhbiBvbmx5IGFzc2lnbiBqb2JzIHRvIHlvdXJzZWxmJyk7XG4gICAgfVxuICB9XG5cbiAgLy8gVmVyaWZ5IGRldGFpbGVyIGV4aXN0cyBhbmQgaXMgaW4gdGhlIHNhbWUgb3JnYW5pemF0aW9uXG4gIGNvbnN0IHsgZGF0YTogZGV0YWlsZXIgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgLmZyb20oJ2RldGFpbGVycycpXG4gICAgLnNlbGVjdCgnaWQsIG9yZ2FuaXphdGlvbl9pZCcpXG4gICAgLmVxKCdpZCcsIGRldGFpbGVySWQpXG4gICAgLnNpbmdsZSgpO1xuXG4gIGlmICghZGV0YWlsZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0RldGFpbGVyIG5vdCBmb3VuZCcpO1xuICB9XG5cbiAgaWYgKGJvb2tpbmcub3JnYW5pemF0aW9uX2lkICYmIGRldGFpbGVyLm9yZ2FuaXphdGlvbl9pZCAhPT0gYm9va2luZy5vcmdhbml6YXRpb25faWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0RldGFpbGVyIGlzIG5vdCBpbiB0aGUgc2FtZSBvcmdhbml6YXRpb24nKTtcbiAgfVxuXG4gIC8vIFVwZGF0ZSBib29raW5nXG4gIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKCdib29raW5ncycpXG4gICAgLnVwZGF0ZSh7XG4gICAgICBkZXRhaWxlcl9pZDogZGV0YWlsZXJJZCxcbiAgICAgIHVwZGF0ZWRfYXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB9KVxuICAgIC5lcSgnaWQnLCBib29raW5nSWQpO1xuXG4gIGlmICh1cGRhdGVFcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGFzc2lnbiBqb2InKTtcbiAgfVxuXG4gIC8vIENyZWF0ZSB0aW1lbGluZSBlbnRyeVxuICBjb25zdCB7IGVycm9yOiB0aW1lbGluZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKCdib29raW5nX3RpbWVsaW5lJylcbiAgICAuaW5zZXJ0KHtcbiAgICAgIGJvb2tpbmdfaWQ6IGJvb2tpbmdJZCxcbiAgICAgIHN0YXR1c19mcm9tOiBib29raW5nLnN0YXR1cyxcbiAgICAgIHN0YXR1c190bzogYm9va2luZy5zdGF0dXMsIC8vIFN0YXR1cyBkb2Vzbid0IGNoYW5nZSwganVzdCBhc3NpZ25tZW50XG4gICAgICBjaGFuZ2VkX2J5OiBwcm9maWxlLmlkLFxuICAgICAgbm90ZXM6IGBKb2IgYXNzaWduZWQgdG8gZGV0YWlsZXJgLFxuICAgIH0pO1xuXG4gIGlmICh0aW1lbGluZUVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNyZWF0ZSB0aW1lbGluZSBlbnRyeTonLCB0aW1lbGluZUVycm9yKTtcbiAgICAvLyBEb24ndCB0aHJvdyAtIGFzc2lnbm1lbnQgc3VjY2VlZGVkXG4gIH1cblxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG59XG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoic1VBVXNCIn0=
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>JobAssignmentModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/lib/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$LoadingSpinner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/components/ui/LoadingSpinner.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$bookings$2f$data$3a$bfef98__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/app/detailer/bookings/data:bfef98 [app-client] (ecmascript) <text/javascript>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function JobAssignmentModal({ isOpen, onClose, bookingId, organizationId, currentDetailerId, onAssigned }) {
    _s();
    const [detailers, setDetailers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [assigning, setAssigning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedDetailerId, setSelectedDetailerId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [filterTeam, setFilterTeam] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [teams, setTeams] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "JobAssignmentModal.useEffect": ()=>{
            if (isOpen) {
                loadDetailers();
                loadTeams();
            }
        }
    }["JobAssignmentModal.useEffect"], [
        isOpen,
        organizationId
    ]);
    const loadTeams = async ()=>{
        const { data } = await supabase.from('teams').select('id, name').eq('organization_id', organizationId).eq('is_active', true);
        setTeams(data || []);
    };
    const loadDetailers = async ()=>{
        setLoading(true);
        try {
            // Get organization detailers
            const { data: members } = await supabase.rpc('get_organization_members', {
                p_organization_id: organizationId
            });
            const detailerMembers = (members || []).filter((m)=>m.role === 'detailer' && m.is_active);
            // Get detailer records with ratings
            const detailerIds = detailerMembers.map((m)=>m.profile_id);
            if (detailerIds.length === 0) {
                setDetailers([]);
                setLoading(false);
                return;
            }
            const { data: detailerRecords } = await supabase.from('detailers').select('id, full_name, rating, review_count').in('profile_id', detailerIds);
            // Get current job counts
            const { data: bookings } = await supabase.from('bookings').select('detailer_id').eq('organization_id', organizationId).in('status', [
                'accepted',
                'in_progress',
                'scheduled'
            ]);
            const jobCounts = {};
            bookings?.forEach((b)=>{
                if (b.detailer_id) {
                    jobCounts[b.detailer_id] = (jobCounts[b.detailer_id] || 0) + 1;
                }
            });
            // Combine data
            const detailersWithCounts = (detailerRecords || []).map((d)=>({
                    id: d.id,
                    full_name: d.full_name,
                    rating: d.rating || 0,
                    review_count: d.review_count || 0,
                    current_job_count: jobCounts[d.id] || 0,
                    is_available: true
                }));
            setDetailers(detailersWithCounts);
        } catch (error) {
            console.error('Error loading detailers:', error);
        } finally{
            setLoading(false);
        }
    };
    const handleAssign = async ()=>{
        if (!selectedDetailerId) return;
        setAssigning(true);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$bookings$2f$data$3a$bfef98__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["assignJobToDetailer"])(bookingId, selectedDetailerId);
            onAssigned();
            onClose();
        } catch (error) {
            console.error('Error assigning job:', error);
            alert('Failed to assign job. Please try again.');
        } finally{
            setAssigning(false);
        }
    };
    const filteredDetailers = detailers.filter((d)=>{
        const matchesSearch = d.full_name.toLowerCase().includes(searchTerm.toLowerCase());
        // TODO: Filter by team when team_id is available in detailer data
        return matchesSearch;
    });
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 backdrop-blur-sm",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                lineNumber: 142,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 w-full max-w-2xl mx-4 bg-[#0A1A2F] border border-white/5 rounded-xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-6 border-b border-white/5",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between items-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-2xl font-bold text-white",
                                    children: "Assign Job to Detailer"
                                }, void 0, false, {
                                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                    lineNumber: 152,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onClose,
                                    className: "text-[#C6CFD9] hover:text-white transition-colors",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-6 h-6",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M6 18L18 6M6 6l12 12"
                                        }, void 0, false, {
                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                            lineNumber: 158,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                        lineNumber: 157,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                    lineNumber: 153,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                            lineNumber: 151,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                        lineNumber: 150,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-y-auto p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-6 space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "Search detailers...",
                                        value: searchTerm,
                                        onChange: (e)=>setSearchTerm(e.target.value),
                                        className: "w-full px-4 py-2 bg-[#050B12] border border-white/5 rounded-lg text-white placeholder-[#C6CFD9] focus:outline-none focus:border-[#32CE7A]/40"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                        lineNumber: 168,
                                        columnNumber: 13
                                    }, this),
                                    teams.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: filterTeam,
                                        onChange: (e)=>setFilterTeam(e.target.value),
                                        className: "w-full px-4 py-2 bg-[#050B12] border border-white/5 rounded-lg text-white focus:outline-none focus:border-[#32CE7A]/40",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "all",
                                                children: "All Teams"
                                            }, void 0, false, {
                                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                                lineNumber: 181,
                                                columnNumber: 17
                                            }, this),
                                            teams.map((team)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: team.id,
                                                    children: team.name
                                                }, team.id, false, {
                                                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                                    lineNumber: 183,
                                                    columnNumber: 19
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                        lineNumber: 176,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                lineNumber: 167,
                                columnNumber: 11
                            }, this),
                            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-center py-12",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$LoadingSpinner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    size: "lg"
                                }, void 0, false, {
                                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                    lineNumber: 194,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                lineNumber: 193,
                                columnNumber: 13
                            }, this) : filteredDetailers.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-12 text-[#C6CFD9]",
                                children: "No detailers found"
                            }, void 0, false, {
                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                lineNumber: 197,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: filteredDetailers.map((detailer)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setSelectedDetailerId(detailer.id),
                                        className: `
                    w-full p-4 rounded-lg border transition-colors text-left
                    ${selectedDetailerId === detailer.id ? 'bg-[#32CE7A]/20 border-[#32CE7A]/40' : 'bg-[#050B12] border-white/5 hover:border-white/10'}
                    ${detailer.id === currentDetailerId ? 'opacity-50 cursor-not-allowed' : ''}
                  `,
                                        disabled: detailer.id === currentDetailerId,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-between items-start",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-3",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                    className: "font-semibold text-white",
                                                                    children: detailer.full_name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                                                    lineNumber: 220,
                                                                    columnNumber: 25
                                                                }, this),
                                                                detailer.id === currentDetailerId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-xs bg-[#32CE7A]/20 text-[#32CE7A] px-2 py-1 rounded",
                                                                    children: "Current"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                                                    lineNumber: 222,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                                            lineNumber: 219,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "mt-2 flex items-center gap-4 text-sm text-[#C6CFD9]",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: [
                                                                        "⭐ ",
                                                                        detailer.rating.toFixed(1),
                                                                        " (",
                                                                        detailer.review_count,
                                                                        " reviews)"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                                                    lineNumber: 228,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: [
                                                                        "📋 ",
                                                                        detailer.current_job_count,
                                                                        " active jobs"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                                                    lineNumber: 229,
                                                                    columnNumber: 25
                                                                }, this),
                                                                detailer.distance && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: [
                                                                        "📍 ",
                                                                        detailer.distance.toFixed(1),
                                                                        " km"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                                                    lineNumber: 230,
                                                                    columnNumber: 47
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                                            lineNumber: 227,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                                    lineNumber: 218,
                                                    columnNumber: 21
                                                }, this),
                                                selectedDetailerId === detailer.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "ml-4",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-5 h-5 rounded-full bg-[#32CE7A] flex items-center justify-center",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            className: "w-3 h-3 text-white",
                                                            fill: "currentColor",
                                                            viewBox: "0 0 20 20",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                fillRule: "evenodd",
                                                                d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                                                clipRule: "evenodd"
                                                            }, void 0, false, {
                                                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                                                lineNumber: 237,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                                            lineNumber: 236,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                                        lineNumber: 235,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                                    lineNumber: 234,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                            lineNumber: 217,
                                            columnNumber: 19
                                        }, this)
                                    }, detailer.id, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                        lineNumber: 203,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                lineNumber: 201,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                        lineNumber: 165,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-6 border-t border-white/5 flex justify-end gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                className: "px-4 py-2 bg-[#050B12] border border-white/5 rounded-lg text-white hover:border-white/10 transition-colors",
                                children: "Cancel"
                            }, void 0, false, {
                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                lineNumber: 251,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleAssign,
                                disabled: !selectedDetailerId || assigning,
                                className: "px-4 py-2 bg-[#32CE7A] hover:bg-[#2AB869] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                                children: assigning ? 'Assigning...' : 'Assign Job'
                            }, void 0, false, {
                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                                lineNumber: 257,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                        lineNumber: 250,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
                lineNumber: 148,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx",
        lineNumber: 140,
        columnNumber: 5
    }, this);
}
_s(JobAssignmentModal, "fplt0xLyzoqfa60nrTN7kDtRkVQ=");
_c = JobAssignmentModal;
var _c;
__turbopack_context__.k.register(_c, "JobAssignmentModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/cleanswift/web-dashboard/app/detailer/bookings/JobsPageClient.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>JobsPageClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$detailer$2f$JobsTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$detailer$2f$JobsFilters$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/components/detailer/JobsFilters.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$detailer$2f$JobAssignmentModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/components/detailer/JobAssignmentModal.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function JobsPageClient({ initialBookings, mode = 'solo', teams = [], detailers = [], organizationId }) {
    _s();
    const [filteredBookings, setFilteredBookings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialBookings);
    const [assignmentModalOpen, setAssignmentModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedBookingId, setSelectedBookingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [selectedCurrentDetailerId, setSelectedCurrentDetailerId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const handleAssignClick = (bookingId, currentDetailerId)=>{
        setSelectedBookingId(bookingId);
        setSelectedCurrentDetailerId(currentDetailerId || null);
        setAssignmentModalOpen(true);
    };
    const handleAssigned = ()=>{
        router.refresh();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$detailer$2f$JobsFilters$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                bookings: initialBookings,
                onFiltered: setFilteredBookings,
                mode: mode,
                teams: teams,
                detailers: detailers
            }, void 0, false, {
                fileName: "[project]/cleanswift/web-dashboard/app/detailer/bookings/JobsPageClient.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[#0A1A2F] border border-white/5 rounded-xl p-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$detailer$2f$JobsTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    bookings: filteredBookings,
                    showOrgColumns: mode === 'organization',
                    onAssignClick: mode === 'organization' && organizationId ? handleAssignClick : undefined
                }, void 0, false, {
                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/bookings/JobsPageClient.tsx",
                    lineNumber: 51,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/cleanswift/web-dashboard/app/detailer/bookings/JobsPageClient.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this),
            mode === 'organization' && organizationId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$detailer$2f$JobAssignmentModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: assignmentModalOpen,
                onClose: ()=>setAssignmentModalOpen(false),
                bookingId: selectedBookingId,
                organizationId: organizationId,
                currentDetailerId: selectedCurrentDetailerId,
                onAssigned: handleAssigned
            }, void 0, false, {
                fileName: "[project]/cleanswift/web-dashboard/app/detailer/bookings/JobsPageClient.tsx",
                lineNumber: 59,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
_s(JobsPageClient, "Mwzkyt3krCpYgEIn4aBRj02DiyU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = JobsPageClient;
var _c;
__turbopack_context__.k.register(_c, "JobsPageClient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=cleanswift_web-dashboard_affcdf19._.js.map