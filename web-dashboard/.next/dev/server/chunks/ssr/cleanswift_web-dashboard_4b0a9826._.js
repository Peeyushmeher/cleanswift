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
"[project]/cleanswift/web-dashboard/lib/services/bookings.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"405e6412727bfe589613ef19f203be6a15580adee8":"getBookings","4067208e704f0ec2ab68d6e42ec0bc30edcfabfa4d":"getBookingById","406e037be188feba1435f00ab1f956e5c6b6270682":"acceptBooking","40a58f3c7f7abea6b6cf7b4a6080e3ee5e87397f7e":"cancelBooking","60d0b4de1d4824edc01ab010860fa8a8f09a1c2078":"updateBookingStatus","60ffb47529a6531ed0a49f6e8ca1406dda9eaca466":"assignBookingToDetailer"},"",""] */ __turbopack_context__.s([
    "acceptBooking",
    ()=>acceptBooking,
    "assignBookingToDetailer",
    ()=>assignBookingToDetailer,
    "cancelBooking",
    ()=>cancelBooking,
    "getBookingById",
    ()=>getBookingById,
    "getBookings",
    ()=>getBookings,
    "updateBookingStatus",
    ()=>updateBookingStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
const BOOKING_DETAIL_SELECT = `
  id,
  receipt_id,
  status,
  payment_status,
  scheduled_date,
  scheduled_time_start,
  scheduled_time_end,
  scheduled_start,
  scheduled_end,
  total_amount,
  service_price,
  addons_total,
  tax_amount,
  detailer_id,
  organization_id,
  team_id,
  address_line1,
  city,
  province,
  postal_code,
  latitude,
  longitude,
  location_notes,
  created_at,
  updated_at,
  completed_at,
  service:service_id (id, name, price, duration_minutes),
  car:car_id (id, make, model, year, license_plate),
  user:user_id (id, full_name, phone, email),
  detailer:detailer_id (id, full_name),
  team:team_id (id, name)
`;
function asArray(value) {
    if (value === undefined || value === null) {
        return undefined;
    }
    return Array.isArray(value) ? value : [
        value
    ];
}
function formatError(action, message) {
    return new Error(message ? `Failed to ${action}: ${message}` : `Failed to ${action}`);
}
async function getBookings(filters = {}) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { status, detailerId, organizationId, fromDate, toDate, limit = 200, orderBy = 'scheduled_date', ascending = true } = filters;
    let query = supabase.from('bookings').select(BOOKING_DETAIL_SELECT).order(orderBy, {
        ascending
    }).order('scheduled_time_start', {
        ascending: true,
        nullsFirst: false
    }).limit(limit);
    const statusArray = asArray(status);
    if (statusArray?.length) {
        query = query.in('status', statusArray);
    }
    if (detailerId) {
        query = query.eq('detailer_id', detailerId);
    }
    if (organizationId) {
        query = query.eq('organization_id', organizationId);
    }
    if (fromDate) {
        query = query.gte('scheduled_date', fromDate);
    }
    if (toDate) {
        query = query.lte('scheduled_date', toDate);
    }
    const { data, error } = await query.returns();
    if (error) {
        throw formatError('fetch bookings', error.message);
    }
    return data ?? [];
}
async function getBookingById(bookingId) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data, error } = await supabase.from('bookings').select(BOOKING_DETAIL_SELECT).eq('id', bookingId).single();
    if (error || !data) {
        throw formatError('fetch booking', error?.message);
    }
    return data;
}
async function updateBookingStatus(bookingId, newStatus) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data, error } = await supabase.rpc('update_booking_status', {
        p_booking_id: bookingId,
        p_new_status: newStatus
    });
    if (error || !data) {
        throw formatError('update booking status', error?.message);
    }
    return data;
}
async function assignBookingToDetailer(bookingId, detailerId) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data, error } = await supabase.rpc('assign_detailer_to_booking', {
        p_booking_id: bookingId,
        p_detailer_id: detailerId
    });
    if (error || !data) {
        throw formatError('assign booking to detailer', error?.message);
    }
    return data;
}
async function acceptBooking(bookingId) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data, error } = await supabase.rpc('accept_booking', {
        p_booking_id: bookingId
    });
    if (error || !data) {
        throw formatError('accept booking', error?.message);
    }
    return data;
}
async function cancelBooking(bookingId) {
    return updateBookingStatus(bookingId, 'cancelled');
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getBookings,
    getBookingById,
    updateBookingStatus,
    assignBookingToDetailer,
    acceptBooking,
    cancelBooking
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getBookings, "405e6412727bfe589613ef19f203be6a15580adee8", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getBookingById, "4067208e704f0ec2ab68d6e42ec0bc30edcfabfa4d", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateBookingStatus, "60d0b4de1d4824edc01ab010860fa8a8f09a1c2078", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(assignBookingToDetailer, "60ffb47529a6531ed0a49f6e8ca1406dda9eaca466", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(acceptBooking, "406e037be188feba1435f00ab1f956e5c6b6270682", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(cancelBooking, "40a58f3c7f7abea6b6cf7b4a6080e3ee5e87397f7e", null);
}),
"[project]/cleanswift/web-dashboard/app/detailer/bookings/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"60a99119db695fbd12e3fb361d3ea7fb0228ee8bda":"assignJobToDetailer"},"",""] */ __turbopack_context__.s([
    "assignJobToDetailer",
    ()=>assignJobToDetailer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/lib/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$mode$2d$detection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/lib/detailer/mode-detection.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/lib/detailer/permissions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$services$2f$bookings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/lib/services/bookings.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
async function assignJobToDetailer(bookingId, detailerId) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireDetailer"])();
    const mode = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDetailerMode"])();
    if (mode === 'organization') {
        const organization = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$mode$2d$detection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDetailerOrganization"])();
        if (organization) {
            const role = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$mode$2d$detection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getOrganizationRole"])(organization.id);
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["canAssignJobs"])(role)) {
                throw new Error('You do not have permission to assign jobs');
            }
        }
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$services$2f$bookings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assignBookingToDetailer"])(bookingId, detailerId);
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
"[project]/cleanswift/web-dashboard/.next-internal/server/app/detailer/bookings/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/cleanswift/web-dashboard/app/detailer/bookings/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$bookings$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/app/detailer/bookings/actions.ts [app-rsc] (ecmascript)");
;
}),
"[project]/cleanswift/web-dashboard/.next-internal/server/app/detailer/bookings/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/cleanswift/web-dashboard/app/detailer/bookings/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "60a99119db695fbd12e3fb361d3ea7fb0228ee8bda",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$bookings$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assignJobToDetailer"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f2e$next$2d$internal$2f$server$2f$app$2f$detailer$2f$bookings$2f5b$id$5d2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$bookings$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/cleanswift/web-dashboard/.next-internal/server/app/detailer/bookings/[id]/page/actions.js { ACTIONS_MODULE0 => "[project]/cleanswift/web-dashboard/app/detailer/bookings/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
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

//# sourceMappingURL=cleanswift_web-dashboard_4b0a9826._.js.map