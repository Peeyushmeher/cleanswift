module.exports = [
"[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CalendarView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
'use client';
;
;
;
const DAY_NAMES = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat'
];
const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];
function CalendarView({ bookings }) {
    const [currentDate, setCurrentDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Date());
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    // Get first day of month and number of days
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    // Navigate months
    const goToPreviousMonth = ()=>{
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };
    const goToNextMonth = ()=>{
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };
    const goToToday = ()=>{
        setCurrentDate(new Date());
    };
    // Group bookings by date
    const bookingsByDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const grouped = {};
        bookings.forEach((booking)=>{
            const dateKey = booking.scheduled_date || (booking.scheduled_start ? new Date(booking.scheduled_start).toISOString().split('T')[0] : '');
            if (dateKey) {
                if (!grouped[dateKey]) {
                    grouped[dateKey] = [];
                }
                grouped[dateKey].push(booking);
            }
        });
        return grouped;
    }, [
        bookings
    ]);
    // Get bookings for a specific date
    const getBookingsForDate = (day)=>{
        const date = new Date(currentYear, currentMonth, day);
        const dateKey = date.toISOString().split('T')[0];
        return bookingsByDate[dateKey] || [];
    };
    // Get status color
    const getStatusColor = (status)=>{
        switch(status){
            case 'accepted':
                return 'bg-[#1DA4F3]/20 border-[#1DA4F3]/40 text-[#1DA4F3]';
            case 'in_progress':
                return 'bg-[#6FF0C4]/20 border-[#6FF0C4]/40 text-[#6FF0C4]';
            case 'completed':
                return 'bg-[#32CE7A]/20 border-[#32CE7A]/40 text-[#32CE7A]';
            default:
                return 'bg-[#C6CFD9]/20 border-[#C6CFD9]/40 text-[#C6CFD9]';
        }
    };
    // Generate calendar days
    const calendarDays = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const days = [];
        // Add empty cells for days before month starts
        for(let i = 0; i < firstDayOfMonth; i++){
            days.push({
                day: 0,
                isCurrentMonth: false,
                isToday: false
            });
        }
        // Add days of the month
        const today = new Date();
        for(let day = 1; day <= daysInMonth; day++){
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
            days.push({
                day,
                isCurrentMonth: true,
                isToday
            });
        }
        // Fill remaining cells to complete 6 weeks (42 cells total)
        const totalCells = 42;
        const remainingCells = totalCells - days.length;
        for(let i = 0; i < remainingCells; i++){
            days.push({
                day: 0,
                isCurrentMonth: false,
                isToday: false
            });
        }
        return days;
    }, [
        firstDayOfMonth,
        daysInMonth,
        currentMonth,
        currentYear
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: goToPreviousMonth,
                                className: "p-2 hover:bg-white/5 rounded-lg transition-colors",
                                "aria-label": "Previous month",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "w-5 h-5 text-[#C6CFD9]",
                                    fill: "none",
                                    stroke: "currentColor",
                                    viewBox: "0 0 24 24",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        strokeWidth: 2,
                                        d: "M15 19l-7-7 7-7"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                                        lineNumber: 153,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                                    lineNumber: 147,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                                lineNumber: 142,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xl font-semibold text-white",
                                children: [
                                    MONTH_NAMES[currentMonth],
                                    " ",
                                    currentYear
                                ]
                            }, void 0, true, {
                                fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                                lineNumber: 161,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: goToNextMonth,
                                className: "p-2 hover:bg-white/5 rounded-lg transition-colors",
                                "aria-label": "Next month",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "w-5 h-5 text-[#C6CFD9]",
                                    fill: "none",
                                    stroke: "currentColor",
                                    viewBox: "0 0 24 24",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        strokeWidth: 2,
                                        d: "M9 5l7 7-7 7"
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                                        lineNumber: 175,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                                    lineNumber: 169,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                                lineNumber: 164,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                        lineNumber: 141,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: goToToday,
                        className: "px-4 py-2 bg-[#1DA4F3]/20 hover:bg-[#1DA4F3]/30 border border-[#1DA4F3]/40 text-[#1DA4F3] rounded-lg transition-colors text-sm font-medium",
                        children: "Today"
                    }, void 0, false, {
                        fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                        lineNumber: 184,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                lineNumber: 140,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-7 gap-2",
                children: [
                    DAY_NAMES.map((day)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center text-sm font-semibold text-[#C6CFD9] py-2",
                            children: day
                        }, day, false, {
                            fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                            lineNumber: 196,
                            columnNumber: 11
                        }, this)),
                    calendarDays.map(({ day, isCurrentMonth, isToday }, index)=>{
                        const bookingsForDay = day > 0 ? getBookingsForDate(day) : [];
                        const hasBookings = bookingsForDay.length > 0;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `min-h-[100px] p-2 border border-white/5 rounded-lg ${isCurrentMonth ? 'bg-[#050B12]' : 'bg-[#0A1A2F]/50 opacity-50'} ${isToday ? 'ring-2 ring-[#6FF0C4]/50' : ''}`,
                            children: day > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `text-sm font-medium mb-1 ${isToday ? 'text-[#6FF0C4]' : isCurrentMonth ? 'text-white' : 'text-[#C6CFD9]'}`,
                                        children: day
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                                        lineNumber: 218,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1",
                                        children: [
                                            bookingsForDay.slice(0, 2).map((booking)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    href: `/detailer/bookings/${booking.id}`,
                                                    className: `block text-xs p-1.5 rounded border ${getStatusColor(booking.status)} hover:opacity-80 transition-opacity truncate`,
                                                    title: `${booking.service?.name || 'Service'} - ${booking.user?.full_name || 'Customer'} at ${booking.scheduled_time_start?.substring(0, 5) || ''}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "font-medium truncate",
                                                            children: booking.scheduled_time_start?.substring(0, 5) || ''
                                                        }, void 0, false, {
                                                            fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                                                            lineNumber: 239,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "truncate",
                                                            children: booking.service?.name || 'Service'
                                                        }, void 0, false, {
                                                            fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                                                            lineNumber: 242,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, booking.id, true, {
                                                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                                                    lineNumber: 231,
                                                    columnNumber: 23
                                                }, this)),
                                            bookingsForDay.length > 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-[#C6CFD9] px-1.5 py-1",
                                                children: [
                                                    "+",
                                                    bookingsForDay.length - 2,
                                                    " more"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                                                lineNumber: 248,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                                        lineNumber: 229,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true)
                        }, index, false, {
                            fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                            lineNumber: 210,
                            columnNumber: 13
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                lineNumber: 193,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-6 flex items-center gap-6 text-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-3 h-3 rounded bg-[#1DA4F3]/20 border border-[#1DA4F3]/40"
                            }, void 0, false, {
                                fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                                lineNumber: 263,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[#C6CFD9]",
                                children: "Accepted"
                            }, void 0, false, {
                                fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                                lineNumber: 264,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                        lineNumber: 262,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-3 h-3 rounded bg-[#6FF0C4]/20 border border-[#6FF0C4]/40"
                            }, void 0, false, {
                                fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                                lineNumber: 267,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[#C6CFD9]",
                                children: "In Progress"
                            }, void 0, false, {
                                fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                                lineNumber: 268,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                        lineNumber: 266,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-3 h-3 rounded bg-[#32CE7A]/20 border border-[#32CE7A]/40"
                            }, void 0, false, {
                                fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                                lineNumber: 271,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[#C6CFD9]",
                                children: "Completed"
                            }, void 0, false, {
                                fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                                lineNumber: 272,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                        lineNumber: 270,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
                lineNumber: 261,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/cleanswift/web-dashboard/app/detailer/dashboard/CalendarView.tsx",
        lineNumber: 138,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=cleanswift_web-dashboard_app_detailer_dashboard_CalendarView_tsx_4987ef6b._.js.map