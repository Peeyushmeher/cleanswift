module.exports = [
"[project]/cleanswift/web-dashboard/lib/detailer/dashboard-utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/cleanswift/web-dashboard/components/ui/StatusBadge.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StatusBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/lib/detailer/dashboard-utils.ts [app-ssr] (ecmascript)");
;
;
function StatusBadge({ status, className = '' }) {
    const colorClass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStatusColor"])(status);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `px-2 py-1 text-xs font-medium rounded-full border ${colorClass} ${className}`,
        children: status.replace('_', ' ')
    }, void 0, false, {
        fileName: "[project]/cleanswift/web-dashboard/components/ui/StatusBadge.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
}),
"[project]/cleanswift/web-dashboard/components/ui/LoadingSpinner.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoadingSpinner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function LoadingSpinner({ size = 'md', className = '' }) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-center justify-center ${className}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `${sizeClasses[size]} border-4 border-[#0A1A2F] border-t-[#32CE7A] rounded-full animate-spin`,
            role: "status",
            "aria-label": "Loading",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
}),
"[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>JobsTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/lib/detailer/dashboard-utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$StatusBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/components/ui/StatusBadge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$LoadingSpinner$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/components/ui/LoadingSpinner.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
function JobsTable({ bookings, loading = false, pageSize = 10, showOrgColumns = false }) {
    const [currentPage, setCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const totalPages = Math.ceil(bookings.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedBookings = bookings.slice(startIndex, startIndex + pageSize);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-center items-center py-12",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$LoadingSpinner$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                size: "lg"
            }, void 0, false, {
                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                lineNumber: 26,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
            lineNumber: 25,
            columnNumber: 7
        }, this);
    }
    if (bookings.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-12 text-[#C6CFD9]",
            children: "No jobs found"
        }, void 0, false, {
            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
            lineNumber: 33,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-x-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "w-full",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                className: "border-b border-white/5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                        children: "Booking ID"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                        lineNumber: 45,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                        children: "Time"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                        lineNumber: 48,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                        children: "Customer"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                        lineNumber: 51,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                        children: "Car"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                        lineNumber: 54,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                        children: "Location"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                        lineNumber: 57,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                        children: "Service"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                        lineNumber: 60,
                                        columnNumber: 15
                                    }, this),
                                    showOrgColumns && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                                children: "Assigned Detailer"
                                            }, void 0, false, {
                                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                lineNumber: 65,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                                children: "Team"
                                            }, void 0, false, {
                                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                lineNumber: 68,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                        children: "Status"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                        lineNumber: 73,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                        children: "Payment"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                        lineNumber: 76,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-3 text-left text-xs font-semibold text-[#C6CFD9] uppercase tracking-wider",
                                        children: "Amount"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                        lineNumber: 79,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                lineNumber: 44,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                            lineNumber: 43,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            className: "divide-y divide-white/5",
                            children: paginatedBookings.map((booking)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "hover:bg-white/5 transition-colors",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 whitespace-nowrap",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                href: `/detailer/bookings/${booking.id}`,
                                                className: "text-sm text-[#32CE7A] hover:text-[#6FF0C4] font-mono",
                                                children: booking.receipt_id
                                            }, void 0, false, {
                                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                lineNumber: 91,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                            lineNumber: 90,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 whitespace-nowrap text-sm text-white",
                                            children: booking.scheduled_date && booking.scheduled_time_start ? `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDate"])(booking.scheduled_date)} ${booking.scheduled_time_start.substring(0, 5)}` : booking.scheduled_start ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDate"])(booking.scheduled_start, 'short') : 'TBD'
                                        }, void 0, false, {
                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                            lineNumber: 98,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 whitespace-nowrap text-sm text-white",
                                            children: booking.user?.full_name || 'N/A'
                                        }, void 0, false, {
                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                            lineNumber: 105,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 whitespace-nowrap text-sm text-white",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            booking.car?.make,
                                                            " ",
                                                            booking.car?.model
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                        lineNumber: 110,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-[#C6CFD9]",
                                                        children: booking.car?.license_plate
                                                    }, void 0, false, {
                                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                        lineNumber: 111,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                lineNumber: 109,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                            lineNumber: 108,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 text-sm text-white",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: booking.address_line1
                                                    }, void 0, false, {
                                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                        lineNumber: 116,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-[#C6CFD9]",
                                                        children: [
                                                            booking.city,
                                                            ", ",
                                                            booking.province
                                                        ]
                                                    }, void 0, true, {
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
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 whitespace-nowrap text-sm text-white",
                                            children: booking.service?.name || 'N/A'
                                        }, void 0, false, {
                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                            lineNumber: 120,
                                            columnNumber: 17
                                        }, this),
                                        showOrgColumns && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3 whitespace-nowrap text-sm text-white",
                                                    children: booking.detailer?.full_name || /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[#C6CFD9] italic",
                                                        children: "Unassigned"
                                                    }, void 0, false, {
                                                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                        lineNumber: 127,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                    lineNumber: 125,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3 whitespace-nowrap text-sm text-white",
                                                    children: booking.team?.name || '-'
                                                }, void 0, false, {
                                                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                    lineNumber: 130,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 whitespace-nowrap",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$StatusBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                status: booking.status
                                            }, void 0, false, {
                                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                lineNumber: 136,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                            lineNumber: 135,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 whitespace-nowrap",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `text-sm ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPaymentStatusColor"])(booking.payment_status)}`,
                                                children: booking.payment_status
                                            }, void 0, false, {
                                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                                lineNumber: 139,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                            lineNumber: 138,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 whitespace-nowrap text-sm font-semibold text-white",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCurrency"])(booking.total_amount || booking.service_price || 0)
                                        }, void 0, false, {
                                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                            lineNumber: 143,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, booking.id, true, {
                                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                    lineNumber: 86,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                            lineNumber: 84,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                    lineNumber: 42,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this),
            totalPages > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                        lineNumber: 155,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setCurrentPage((p)=>Math.max(1, p - 1)),
                                disabled: currentPage === 1,
                                className: "px-4 py-2 bg-[#0A1A2F] border border-white/5 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#32CE7A]/40 transition-colors",
                                children: "Previous"
                            }, void 0, false, {
                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                lineNumber: 159,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "px-4 py-2 text-[#C6CFD9]",
                                children: [
                                    "Page ",
                                    currentPage,
                                    " of ",
                                    totalPages
                                ]
                            }, void 0, true, {
                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                lineNumber: 166,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setCurrentPage((p)=>Math.min(totalPages, p + 1)),
                                disabled: currentPage === totalPages,
                                className: "px-4 py-2 bg-[#0A1A2F] border border-white/5 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#32CE7A]/40 transition-colors",
                                children: "Next"
                            }, void 0, false, {
                                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                                lineNumber: 169,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                        lineNumber: 158,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
                lineNumber: 154,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
}),
"[project]/cleanswift/web-dashboard/components/ui/FilterDropdown.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FilterDropdown
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
function FilterDropdown({ label, options, value, onChange, multiple = false, className = '' }) {
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const selectedOption = options.find((opt)=>opt.value === value);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `relative ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsOpen(!isOpen),
                className: "w-full px-4 py-2 bg-[#050B12] border border-white/5 rounded-lg text-left text-white flex items-center justify-between hover:border-[#32CE7A]/40 transition-colors",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm",
                        children: selectedOption ? selectedOption.label : label
                    }, void 0, false, {
                        fileName: "[project]/cleanswift/web-dashboard/components/ui/FilterDropdown.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: `w-5 h-5 text-[#C6CFD9] transform transition-transform ${isOpen ? 'rotate-180' : ''}`,
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
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
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 z-10",
                        onClick: ()=>setIsOpen(false)
                    }, void 0, false, {
                        fileName: "[project]/cleanswift/web-dashboard/components/ui/FilterDropdown.tsx",
                        lineNumber: 59,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute z-20 w-full mt-2 bg-[#0A1A2F] border border-white/5 rounded-lg shadow-xl max-h-60 overflow-y-auto",
                        children: options.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
}),
"[project]/cleanswift/web-dashboard/components/detailer/JobsFilters.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>JobsFilters
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$FilterDropdown$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/components/ui/FilterDropdown.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/lib/detailer/dashboard-utils.ts [app-ssr] (ecmascript)");
'use client';
;
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
    const [dateRange, setDateRange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('all');
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('all');
    const [sortBy, setSortBy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('time');
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [selectedDetailer, setSelectedDetailer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('all');
    const [selectedTeam, setSelectedTeam] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('all');
    // Apply filters
    const applyFilters = ()=>{
        let filtered = [
            ...bookings
        ];
        // Date range filter
        if (dateRange !== 'all') {
            filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterBookingsByDateRange"])(filtered, dateRange);
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
        filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sortBookings"])(filtered, sortBy);
        onFiltered(filtered);
    };
    // Re-apply filters when any filter changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let filtered = [
            ...bookings
        ];
        // Date range filter
        if (dateRange !== 'all') {
            filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterBookingsByDateRange"])(filtered, dateRange);
        }
        // Status filter
        if (status !== 'all') {
            filtered = filtered.filter((b)=>b.status === status);
        }
        // Detailer filter (org mode only)
        if (mode === 'organization' && selectedDetailer !== 'all') {
            filtered = filtered.filter((b)=>b.detailer_id === selectedDetailer);
        }
        // Team filter (org mode only)
        if (mode === 'organization' && selectedTeam !== 'all') {
            filtered = filtered.filter((b)=>b.team_id === selectedTeam);
        }
        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter((b)=>b.receipt_id.toLowerCase().includes(term) || b.user?.full_name?.toLowerCase().includes(term) || b.car?.license_plate?.toLowerCase().includes(term));
        }
        // Sort
        filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sortBookings"])(filtered, sortBy);
        onFiltered(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-[#0A1A2F] border border-white/5 rounded-xl p-4 mb-6",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `grid grid-cols-1 ${mode === 'organization' ? 'md:grid-cols-6' : 'md:grid-cols-4'} gap-4`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: mode === 'organization' ? 'md:col-span-2' : 'md:col-span-2',
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$FilterDropdown$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    label: "Date Range",
                    options: dateRangeOptions,
                    value: dateRange,
                    onChange: (value)=>setDateRange(value)
                }, void 0, false, {
                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsFilters.tsx",
                    lineNumber: 154,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$FilterDropdown$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    label: "Status",
                    options: statusOptions,
                    value: status,
                    onChange: (value)=>setStatus(value)
                }, void 0, false, {
                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsFilters.tsx",
                    lineNumber: 162,
                    columnNumber: 9
                }, this),
                mode === 'organization' && detailers.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$FilterDropdown$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    label: "Detailer",
                    options: detailerOptions,
                    value: selectedDetailer,
                    onChange: (value)=>setSelectedDetailer(value)
                }, void 0, false, {
                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsFilters.tsx",
                    lineNumber: 171,
                    columnNumber: 11
                }, this),
                mode === 'organization' && teams.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$FilterDropdown$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    label: "Team",
                    options: teamOptions,
                    value: selectedTeam,
                    onChange: (value)=>setSelectedTeam(value)
                }, void 0, false, {
                    fileName: "[project]/cleanswift/web-dashboard/components/detailer/JobsFilters.tsx",
                    lineNumber: 181,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$FilterDropdown$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
}),
"[project]/cleanswift/web-dashboard/app/detailer/bookings/JobsPageClient.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>JobsPageClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$detailer$2f$JobsTable$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/components/detailer/JobsTable.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$detailer$2f$JobsFilters$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/components/detailer/JobsFilters.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function JobsPageClient({ initialBookings, mode = 'solo', teams = [], detailers = [] }) {
    const [filteredBookings, setFilteredBookings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialBookings);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$detailer$2f$JobsFilters$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                bookings: initialBookings,
                onFiltered: setFilteredBookings,
                mode: mode,
                teams: teams,
                detailers: detailers
            }, void 0, false, {
                fileName: "[project]/cleanswift/web-dashboard/app/detailer/bookings/JobsPageClient.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[#0A1A2F] border border-white/5 rounded-xl p-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$detailer$2f$JobsTable$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    bookings: filteredBookings,
                    showOrgColumns: mode === 'organization'
                }, void 0, false, {
                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/bookings/JobsPageClient.tsx",
                    lineNumber: 33,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/cleanswift/web-dashboard/app/detailer/bookings/JobsPageClient.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
];

//# sourceMappingURL=cleanswift_web-dashboard_3c64adba._.js.map