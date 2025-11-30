(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AvailabilityPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/lib/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const DAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];
// Permission-related error messages from the RPC function
const PERMISSION_ERRORS = [
    'Only detailers and admins can view availability',
    'Only detailers can set availability',
    'Not authenticated',
    'User profile not found',
    'Detailer profile not found'
];
function AvailabilityPage() {
    _s();
    const [availability, setAvailability] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isAdmin, setIsAdmin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hasDetailerRecord, setHasDetailerRecord] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    // Check if error is permission-related
    const isPermissionError = (errorMessage)=>{
        return PERMISSION_ERRORS.some((permError)=>errorMessage.toLowerCase().includes(permError.toLowerCase()));
    };
    // Verify user authentication and role
    const verifyUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AvailabilityPage.useCallback[verifyUser]": async ()=>{
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                router.push('/auth/login');
                return null;
            }
            const { data: profile } = await supabase.from('profiles').select('id, role').eq('id', session.user.id).single();
            if (!profile) {
                router.push('/auth/login');
                return null;
            }
            // Check if user has permission to access this page
            if (profile.role !== 'detailer' && profile.role !== 'admin') {
                router.push('/auth/login');
                return null;
            }
            setIsAdmin(profile.role === 'admin');
            return profile;
        }
    }["AvailabilityPage.useCallback[verifyUser]"], [
        supabase,
        router
    ]);
    // Check if detailer record exists for this user
    const checkDetailerRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AvailabilityPage.useCallback[checkDetailerRecord]": async (profileId)=>{
            const { data } = await supabase.from('detailers').select('id').eq('profile_id', profileId).single();
            return !!data;
        }
    }["AvailabilityPage.useCallback[checkDetailerRecord]"], [
        supabase
    ]);
    const fetchAvailability = (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AvailabilityPage.useCallback[fetchAvailability]": async ()=>{
            try {
                setLoading(true);
                setError(null);
                // First verify the user
                const profile = await verifyUser();
                if (!profile) return;
                // Check if detailer record exists
                const hasRecord = await checkDetailerRecord(profile.id);
                setHasDetailerRecord(hasRecord);
                // If admin without detailer record, show empty state (not an error)
                if (profile.role === 'admin' && !hasRecord) {
                    setAvailability([]);
                    setLoading(false);
                    return;
                }
                // Fetch availability
                const { data, error: fetchError } = await supabase.rpc('get_detailer_availability');
                if (fetchError) {
                    // Handle permission errors by redirecting
                    if (isPermissionError(fetchError.message)) {
                        router.push('/auth/login');
                        return;
                    }
                    throw fetchError;
                }
                setAvailability(data || []);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load availability';
                // Check for permission errors and redirect
                if (isPermissionError(errorMessage)) {
                    router.push('/auth/login');
                    return;
                }
                setError(errorMessage);
            } finally{
                setLoading(false);
            }
        }
    }["AvailabilityPage.useCallback[fetchAvailability]"], [
        supabase,
        router,
        verifyUser,
        checkDetailerRecord
    ]);
    // Load availability on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AvailabilityPage.useEffect": ()=>{
            fetchAvailability();
        }
    }["AvailabilityPage.useEffect"], [
        fetchAvailability
    ]);
    const handleToggleDay = async (dayOfWeek)=>{
        try {
            setSaving(true);
            setError(null);
            const existingSlot = availability.find((slot)=>slot.day_of_week === dayOfWeek);
            if (existingSlot) {
                // Toggle existing slot
                const { error: updateError } = await supabase.rpc('set_detailer_availability', {
                    p_day_of_week: dayOfWeek,
                    p_start_time: existingSlot.start_time,
                    p_end_time: existingSlot.end_time,
                    p_is_active: !existingSlot.is_active
                });
                if (updateError) {
                    if (isPermissionError(updateError.message)) {
                        router.push('/auth/login');
                        return;
                    }
                    throw updateError;
                }
            } else {
                // Create new slot with default hours (9 AM - 5 PM)
                const { error: createError } = await supabase.rpc('set_detailer_availability', {
                    p_day_of_week: dayOfWeek,
                    p_start_time: '09:00:00',
                    p_end_time: '17:00:00',
                    p_is_active: true
                });
                if (createError) {
                    if (isPermissionError(createError.message)) {
                        router.push('/auth/login');
                        return;
                    }
                    throw createError;
                }
            }
            await fetchAvailability();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update availability';
            if (isPermissionError(errorMessage)) {
                router.push('/auth/login');
                return;
            }
            setError(errorMessage);
        } finally{
            setSaving(false);
        }
    };
    const handleTimeChange = async (dayOfWeek, field, value)=>{
        try {
            setSaving(true);
            setError(null);
            const existingSlot = availability.find((slot)=>slot.day_of_week === dayOfWeek);
            const timeValue = value.includes(':') && value.split(':').length === 2 ? `${value}:00` : value;
            const { error: updateError } = await supabase.rpc('set_detailer_availability', {
                p_day_of_week: dayOfWeek,
                p_start_time: field === 'start_time' ? timeValue : existingSlot?.start_time || '09:00:00',
                p_end_time: field === 'end_time' ? timeValue : existingSlot?.end_time || '17:00:00',
                p_is_active: existingSlot?.is_active ?? true
            });
            if (updateError) {
                if (isPermissionError(updateError.message)) {
                    router.push('/auth/login');
                    return;
                }
                throw updateError;
            }
            await fetchAvailability();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update time';
            if (isPermissionError(errorMessage)) {
                router.push('/auth/login');
                return;
            }
            setError(errorMessage);
        } finally{
            setSaving(false);
        }
    };
    const getSlotForDay = (dayOfWeek)=>{
        return availability.find((slot)=>slot.day_of_week === dayOfWeek);
    };
    const formatTime = (time)=>{
        return time.substring(0, 5); // HH:mm
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-[#050B12] text-white flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-[#C6CFD9]",
                children: "Loading availability..."
            }, void 0, false, {
                fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                lineNumber: 242,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
            lineNumber: 241,
            columnNumber: 7
        }, this);
    }
    // Admin without detailer record - show informative message
    if (isAdmin && !hasDetailerRecord) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-[#050B12] text-white",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl font-bold text-white mb-2",
                                children: "Availability Management"
                            }, void 0, false, {
                                fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                                lineNumber: 253,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[#C6CFD9]",
                                children: "Set your weekly availability schedule"
                            }, void 0, false, {
                                fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                                lineNumber: 254,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                        lineNumber: 252,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-[#0A1A2F] border border-white/5 rounded-xl p-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center py-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-[#C6CFD9] mb-4",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-16 h-16 mx-auto mb-4 opacity-50",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 1.5,
                                            d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        }, void 0, false, {
                                            fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                                            lineNumber: 261,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                                        lineNumber: 260,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                                    lineNumber: 259,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-lg font-medium text-white mb-2",
                                    children: "Admin Account"
                                }, void 0, false, {
                                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                                    lineNumber: 264,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[#C6CFD9] text-sm max-w-md mx-auto",
                                    children: "As an admin, you don't have personal availability to manage. To manage a detailer's availability, please access their profile directly."
                                }, void 0, false, {
                                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                                    lineNumber: 265,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                            lineNumber: 258,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                        lineNumber: 257,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                lineNumber: 251,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
            lineNumber: 250,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-[#050B12] text-white",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-3xl font-bold text-white mb-2",
                            children: "Availability Management"
                        }, void 0, false, {
                            fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                            lineNumber: 280,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[#C6CFD9]",
                            children: "Set your weekly availability schedule"
                        }, void 0, false, {
                            fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                            lineNumber: 281,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                    lineNumber: 279,
                    columnNumber: 9
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-6",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                    lineNumber: 285,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-[#0A1A2F] border border-white/5 rounded-xl p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4",
                            children: DAY_NAMES.map((dayName, index)=>{
                                const slot = getSlotForDay(index);
                                const isActive = slot?.is_active ?? false;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between p-4 bg-[#050B12] border border-white/5 rounded-lg",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex items-center gap-3 cursor-pointer",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "checkbox",
                                                        checked: isActive,
                                                        onChange: ()=>handleToggleDay(index),
                                                        disabled: saving,
                                                        className: "w-5 h-5 rounded border-white/20 bg-[#0A1A2F] text-[#32CE7A] focus:ring-[#32CE7A]"
                                                    }, void 0, false, {
                                                        fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                                                        lineNumber: 303,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-white font-medium w-24",
                                                        children: dayName
                                                    }, void 0, false, {
                                                        fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                                                        lineNumber: 310,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                                                lineNumber: 302,
                                                columnNumber: 21
                                            }, this),
                                            isActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "time",
                                                        value: slot ? formatTime(slot.start_time) : '09:00',
                                                        onChange: (e)=>handleTimeChange(index, 'start_time', e.target.value),
                                                        disabled: saving,
                                                        className: "px-3 py-2 bg-[#0A1A2F] border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FF0C4]"
                                                    }, void 0, false, {
                                                        fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                                                        lineNumber: 315,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[#C6CFD9]",
                                                        children: "to"
                                                    }, void 0, false, {
                                                        fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                                                        lineNumber: 322,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "time",
                                                        value: slot ? formatTime(slot.end_time) : '17:00',
                                                        onChange: (e)=>handleTimeChange(index, 'end_time', e.target.value),
                                                        disabled: saving,
                                                        className: "px-3 py-2 bg-[#0A1A2F] border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6FF0C4]"
                                                    }, void 0, false, {
                                                        fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                                                        lineNumber: 323,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                                                lineNumber: 314,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                                        lineNumber: 301,
                                        columnNumber: 19
                                    }, this)
                                }, index, false, {
                                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                                    lineNumber: 297,
                                    columnNumber: 17
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                            lineNumber: 291,
                            columnNumber: 11
                        }, this),
                        saving && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-4 text-[#C6CFD9] text-sm",
                            children: "Saving changes..."
                        }, void 0, false, {
                            fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                            lineNumber: 339,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
                    lineNumber: 290,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
            lineNumber: 278,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/cleanswift/web-dashboard/app/detailer/availability/page.tsx",
        lineNumber: 277,
        columnNumber: 5
    }, this);
}
_s(AvailabilityPage, "ebTijwY1MePIc98IQCqpV1FZtqU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = AvailabilityPage;
var _c;
__turbopack_context__.k.register(_c, "AvailabilityPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=cleanswift_web-dashboard_app_detailer_availability_page_tsx_12888577._.js.map