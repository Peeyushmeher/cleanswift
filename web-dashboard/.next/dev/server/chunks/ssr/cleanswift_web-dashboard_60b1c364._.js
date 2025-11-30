module.exports = [
"[project]/cleanswift/web-dashboard/lib/detailer/permissions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Permission utilities for role-based access control
 * Defines what each role can do in the organization
 */ __turbopack_context__.s([
    "OrganizationRole",
    ()=>OrganizationRole,
    "canAssignJobs",
    ()=>canAssignJobs,
    "canChangeMemberRoles",
    ()=>canChangeMemberRoles,
    "canCreatePayoutBatches",
    ()=>canCreatePayoutBatches,
    "canManageMembers",
    ()=>canManageMembers,
    "canManageOrgSettings",
    ()=>canManageOrgSettings,
    "canManageTeams",
    ()=>canManageTeams,
    "canRemoveMembers",
    ()=>canRemoveMembers,
    "canUpdateBookingStatus",
    ()=>canUpdateBookingStatus,
    "canViewAllOrgBookings",
    ()=>canViewAllOrgBookings,
    "canViewOrgEarnings",
    ()=>canViewOrgEarnings,
    "getRolePermissions",
    ()=>getRolePermissions
]);
var OrganizationRole = /*#__PURE__*/ function(OrganizationRole) {
    OrganizationRole["Owner"] = "owner";
    OrganizationRole["Manager"] = "manager";
    OrganizationRole["Dispatcher"] = "dispatcher";
    OrganizationRole["Detailer"] = "detailer";
    return OrganizationRole;
}({});
function canAssignJobs(role) {
    if (!role) return false;
    return role === "owner" || role === "manager" || role === "dispatcher";
}
function canManageTeams(role) {
    if (!role) return false;
    return role === "owner" || role === "manager";
}
function canManageMembers(role) {
    if (!role) return false;
    return role === "owner" || role === "manager";
}
function canViewOrgEarnings(role) {
    if (!role) return false;
    return role === "owner" || role === "manager";
}
function canManageOrgSettings(role) {
    if (!role) return false;
    return role === "owner";
}
function canChangeMemberRoles(role) {
    if (!role) return false;
    return role === "owner";
}
function canRemoveMembers(role) {
    if (!role) return false;
    return role === "owner" || role === "manager";
}
function canViewAllOrgBookings(role) {
    if (!role) return false;
    return role === "owner" || role === "manager" || role === "dispatcher";
}
function canUpdateBookingStatus(role) {
    if (!role) return false;
    return role === "owner" || role === "manager" || role === "dispatcher";
}
function canCreatePayoutBatches(role) {
    if (!role) return false;
    return role === "owner" || role === "manager";
}
function getRolePermissions(role) {
    return {
        canAssignJobs: canAssignJobs(role),
        canManageTeams: canManageTeams(role),
        canManageMembers: canManageMembers(role),
        canViewOrgEarnings: canViewOrgEarnings(role),
        canManageOrgSettings: canManageOrgSettings(role),
        canChangeMemberRoles: canChangeMemberRoles(role),
        canRemoveMembers: canRemoveMembers(role),
        canViewAllOrgBookings: canViewAllOrgBookings(role),
        canUpdateBookingStatus: canUpdateBookingStatus(role),
        canCreatePayoutBatches: canCreatePayoutBatches(role)
    };
}
}),
"[project]/cleanswift/web-dashboard/app/detailer/bookings/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"60a99119db695fbd12e3fb361d3ea7fb0228ee8bda":"assignJobToDetailer"},"",""] */ __turbopack_context__.s([
    "assignJobToDetailer",
    ()=>assignJobToDetailer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/lib/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$mode$2d$detection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/lib/detailer/mode-detection.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/lib/detailer/permissions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
async function assignJobToDetailer(bookingId, detailerId) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const profile = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireDetailer"])();
    // Get booking
    const { data: booking, error: bookingError } = await supabase.from('bookings').select('id, organization_id, detailer_id, status').eq('id', bookingId).single();
    if (bookingError || !booking) {
        throw new Error('Booking not found');
    }
    // Check permissions
    if (booking.organization_id) {
        const mode = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDetailerMode"])();
        if (mode === 'organization') {
            const organization = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$mode$2d$detection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDetailerOrganization"])();
            if (organization) {
                const role = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$mode$2d$detection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getOrganizationRole"])(organization.id);
                if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["canAssignJobs"])(role)) {
                    throw new Error('You do not have permission to assign jobs');
                }
            }
        } else {
            // Solo detailer can only assign to themselves
            const { data: detailerData } = await supabase.rpc('get_detailer_by_profile', {
                p_profile_id: null
            });
            if (detailerId !== detailerData?.id) {
                throw new Error('Solo detailers can only be assigned to themselves');
            }
        }
    } else {
        // Solo booking - detailer can only assign to themselves
        const { data: detailerData } = await supabase.rpc('get_detailer_by_profile', {
            p_profile_id: null
        });
        if (detailerId !== detailerData?.id) {
            throw new Error('You can only assign jobs to yourself');
        }
    }
    // Verify detailer exists and is in the same organization
    const { data: detailer } = await supabase.from('detailers').select('id, organization_id').eq('id', detailerId).single();
    if (!detailer) {
        throw new Error('Detailer not found');
    }
    if (booking.organization_id && detailer.organization_id !== booking.organization_id) {
        throw new Error('Detailer is not in the same organization');
    }
    // Update booking
    const { error: updateError } = await supabase.from('bookings').update({
        detailer_id: detailerId,
        updated_at: new Date().toISOString()
    }).eq('id', bookingId);
    if (updateError) {
        throw new Error('Failed to assign job');
    }
    // Create timeline entry
    const { error: timelineError } = await supabase.from('booking_timeline').insert({
        booking_id: bookingId,
        status_from: booking.status,
        status_to: booking.status,
        changed_by: profile.id,
        notes: `Job assigned to detailer`
    });
    if (timelineError) {
        console.error('Failed to create timeline entry:', timelineError);
    // Don't throw - assignment succeeded
    }
    return {
        success: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    assignJobToDetailer
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(assignJobToDetailer, "60a99119db695fbd12e3fb361d3ea7fb0228ee8bda", null);
}),
"[project]/cleanswift/web-dashboard/.next-internal/server/app/detailer/bookings/page/actions.js { ACTIONS_MODULE0 => \"[project]/cleanswift/web-dashboard/app/detailer/bookings/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$bookings$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/app/detailer/bookings/actions.ts [app-rsc] (ecmascript)");
;
}),
"[project]/cleanswift/web-dashboard/.next-internal/server/app/detailer/bookings/page/actions.js { ACTIONS_MODULE0 => \"[project]/cleanswift/web-dashboard/app/detailer/bookings/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "60a99119db695fbd12e3fb361d3ea7fb0228ee8bda",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$bookings$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assignJobToDetailer"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f2e$next$2d$internal$2f$server$2f$app$2f$detailer$2f$bookings$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$bookings$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/cleanswift/web-dashboard/.next-internal/server/app/detailer/bookings/page/actions.js { ACTIONS_MODULE0 => "[project]/cleanswift/web-dashboard/app/detailer/bookings/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$bookings$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/app/detailer/bookings/actions.ts [app-rsc] (ecmascript)");
}),
"[project]/cleanswift/web-dashboard/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/* eslint-disable import/no-extraneous-dependencies */ Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "registerServerReference", {
    enumerable: true,
    get: function() {
        return _server.registerServerReference;
    }
});
const _server = __turbopack_context__.r("[project]/cleanswift/web-dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)"); //# sourceMappingURL=server-reference.js.map
}),
"[project]/cleanswift/web-dashboard/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// This function ensures that all the exported values are valid server actions,
// during the runtime. By definition all actions are required to be async
// functions, but here we can only check that they are functions.
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ensureServerEntryExports", {
    enumerable: true,
    get: function() {
        return ensureServerEntryExports;
    }
});
function ensureServerEntryExports(actions) {
    for(let i = 0; i < actions.length; i++){
        const action = actions[i];
        if (typeof action !== 'function') {
            throw Object.defineProperty(new Error(`A "use server" file can only export async functions, found ${typeof action}.\nRead more: https://nextjs.org/docs/messages/invalid-use-server-value`), "__NEXT_ERROR_CODE", {
                value: "E352",
                enumerable: false,
                configurable: true
            });
        }
    }
} //# sourceMappingURL=action-validate.js.map
}),
];

//# sourceMappingURL=cleanswift_web-dashboard_60b1c364._.js.map