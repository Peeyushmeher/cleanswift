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
"[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ReviewsPageClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/lib/detailer/dashboard-utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$FilterDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/components/ui/FilterDropdown.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const ratingOptions = [
    {
        value: 'all',
        label: 'All Ratings'
    },
    {
        value: '5',
        label: '5 Stars'
    },
    {
        value: '4',
        label: '4 Stars'
    },
    {
        value: '3',
        label: '3 Stars'
    },
    {
        value: '2',
        label: '2 Stars'
    },
    {
        value: '1',
        label: '1 Star'
    }
];
function ReviewsPageClient({ initialReviews, mode = 'solo', orgRating = 0, detailers = [], teams = [] }) {
    _s();
    const [ratingFilter, setRatingFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [sortBy, setSortBy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('date');
    const [detailerFilter, setDetailerFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [teamFilter, setTeamFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const filteredReviews = initialReviews.filter((r)=>{
        if (ratingFilter !== 'all' && r.rating !== parseInt(ratingFilter)) return false;
        if (mode === 'organization' && detailerFilter !== 'all') {
            const bookingDetailerId = r.booking?.detailer_id;
            if (!bookingDetailerId) return false;
            // Need to match detailer_id to profile_id
            // For now, we'll filter by checking if detailer exists in the filter list
            return true; // TODO: Implement proper detailer filtering
        }
        if (mode === 'organization' && teamFilter !== 'all') {
            const bookingTeamId = r.booking?.team_id;
            return bookingTeamId === teamFilter;
        }
        return true;
    }).sort((a, b)=>{
        if (sortBy === 'rating') {
            return b.rating - a.rating;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    const averageRating = mode === 'organization' && orgRating > 0 ? orgRating : initialReviews.length > 0 ? initialReviews.reduce((sum, r)=>sum + r.rating, 0) / initialReviews.length : 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[#0A1A2F] border border-white/5 rounded-xl p-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-2xl font-bold text-white mb-2",
                                    children: [
                                        averageRating.toFixed(1),
                                        " ⭐"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                                    lineNumber: 72,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[#C6CFD9]",
                                    children: [
                                        "Based on ",
                                        initialReviews.length,
                                        " review",
                                        initialReviews.length !== 1 ? 's' : ''
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                                    lineNumber: 75,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                            lineNumber: 71,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-4 flex-wrap",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$FilterDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    label: "Filter by Rating",
                                    options: ratingOptions,
                                    value: ratingFilter,
                                    onChange: setRatingFilter
                                }, void 0, false, {
                                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                                    lineNumber: 80,
                                    columnNumber: 13
                                }, this),
                                mode === 'organization' && detailers.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$FilterDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    label: "Detailer",
                                    options: [
                                        {
                                            value: 'all',
                                            label: 'All Detailers'
                                        },
                                        ...detailers.map((d)=>({
                                                value: d.profile_id,
                                                label: d.full_name
                                            }))
                                    ],
                                    value: detailerFilter,
                                    onChange: setDetailerFilter
                                }, void 0, false, {
                                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                                    lineNumber: 87,
                                    columnNumber: 15
                                }, this),
                                mode === 'organization' && teams.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$FilterDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    label: "Team",
                                    options: [
                                        {
                                            value: 'all',
                                            label: 'All Teams'
                                        },
                                        ...teams.map((t)=>({
                                                value: t.id,
                                                label: t.name
                                            }))
                                    ],
                                    value: teamFilter,
                                    onChange: setTeamFilter
                                }, void 0, false, {
                                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                                    lineNumber: 98,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$components$2f$ui$2f$FilterDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    label: "Sort By",
                                    options: [
                                        {
                                            value: 'date',
                                            label: 'Newest First'
                                        },
                                        {
                                            value: 'rating',
                                            label: 'Highest Rated'
                                        }
                                    ],
                                    value: sortBy,
                                    onChange: (v)=>setSortBy(v)
                                }, void 0, false, {
                                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                                    lineNumber: 108,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                            lineNumber: 79,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                    lineNumber: 70,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[#0A1A2F] border border-white/5 rounded-xl p-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-semibold text-white mb-4",
                        children: "All Reviews"
                    }, void 0, false, {
                        fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                        lineNumber: 123,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: filteredReviews.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center py-12 text-[#C6CFD9]",
                            children: "No reviews found"
                        }, void 0, false, {
                            fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                            lineNumber: 126,
                            columnNumber: 13
                        }, this) : filteredReviews.map((review)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: `/detailer/reviews/${review.id}`,
                                className: "block bg-[#050B12] border border-white/5 rounded-lg p-6 hover:border-[#6FF0C4]/20 transition-colors",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-between items-start mb-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2 mb-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex",
                                                            children: [
                                                                ...Array(5)
                                                            ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: `text-xl ${i < review.rating ? 'text-yellow-400' : 'text-[#C6CFD9]'}`,
                                                                    children: "★"
                                                                }, i, false, {
                                                                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                                                                    lineNumber: 141,
                                                                    columnNumber: 27
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                                                            lineNumber: 139,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm text-[#C6CFD9]",
                                                            children: review.user?.full_name || 'Anonymous'
                                                        }, void 0, false, {
                                                            fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                                                            lineNumber: 151,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                                                    lineNumber: 138,
                                                    columnNumber: 21
                                                }, this),
                                                review.review_text && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-white mb-2",
                                                    children: review.review_text
                                                }, void 0, false, {
                                                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                                                    lineNumber: 156,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm text-[#C6CFD9]",
                                                    children: [
                                                        review.booking?.service?.name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                "Service: ",
                                                                review.booking.service.name,
                                                                " • "
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                                                            lineNumber: 160,
                                                            columnNumber: 25
                                                        }, this),
                                                        mode === 'organization' && review.booking?.detailer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                "Detailer: ",
                                                                review.booking.detailer.full_name,
                                                                " • "
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                                                            lineNumber: 163,
                                                            columnNumber: 25
                                                        }, this),
                                                        mode === 'organization' && review.booking?.team && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                "Team: ",
                                                                review.booking.team.name,
                                                                " • "
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                                                            lineNumber: 166,
                                                            columnNumber: 25
                                                        }, this),
                                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$dashboard$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDate"])(review.created_at, 'long')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                                                    lineNumber: 158,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                                            lineNumber: 137,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-sm text-[#C6CFD9]",
                                            children: [
                                                "Job #",
                                                review.booking?.receipt_id || 'N/A'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                                            lineNumber: 171,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                                    lineNumber: 136,
                                    columnNumber: 17
                                }, this)
                            }, review.id, false, {
                                fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                                lineNumber: 131,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                        lineNumber: 124,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
                lineNumber: 122,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx",
        lineNumber: 67,
        columnNumber: 5
    }, this);
}
_s(ReviewsPageClient, "LGcMJz2EEQKzhzoa043o0FZ1PTQ=");
_c = ReviewsPageClient;
var _c;
__turbopack_context__.k.register(_c, "ReviewsPageClient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=cleanswift_web-dashboard_46b8ab5e._.js.map