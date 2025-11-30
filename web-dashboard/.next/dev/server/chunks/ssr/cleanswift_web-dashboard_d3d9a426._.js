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
"[project]/cleanswift/web-dashboard/app/detailer/members/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"6028be15458b9994fe185ed90031cf0d041b61eb22":"removeMember","60a446d426f2f65cea46c4dbb7faf5d0e0fb8e9767":"suspendMember","60ac567f52cdf60cae3ffb68e1cc50e927cf81aab6":"activateMember","703797e60fbb016fcd7e046529634bfa1142bd67fc":"updateMemberRole","70cf6a3cfbe6ca7139d4ac7a295622ae64a88301d6":"inviteMember"},"",""] */ __turbopack_context__.s([
    "activateMember",
    ()=>activateMember,
    "inviteMember",
    ()=>inviteMember,
    "removeMember",
    ()=>removeMember,
    "suspendMember",
    ()=>suspendMember,
    "updateMemberRole",
    ()=>updateMemberRole
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
async function inviteMember(organizationId, email, role) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireDetailer"])();
    // Check permissions
    const organization = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$mode$2d$detection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDetailerOrganization"])();
    if (!organization || organization.id !== organizationId) {
        throw new Error('Organization not found');
    }
    const userRole = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$mode$2d$detection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getOrganizationRole"])(organizationId);
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["canManageMembers"])(userRole)) {
        throw new Error('You do not have permission to invite members');
    }
    // Only owners can invite owners
    if (role === 'owner' && userRole !== 'owner') {
        throw new Error('Only owners can invite other owners');
    }
    // Call RPC function
    const { data, error } = await supabase.rpc('invite_member', {
        p_organization_id: organizationId,
        p_email: email,
        p_role: role
    });
    if (error) {
        throw new Error(error.message || 'Failed to invite member');
    }
    return data;
}
async function updateMemberRole(organizationId, profileId, newRole) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireDetailer"])();
    // Check permissions
    const userRole = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$mode$2d$detection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getOrganizationRole"])(organizationId);
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["canChangeMemberRoles"])(userRole)) {
        throw new Error('You do not have permission to change member roles');
    }
    // Call RPC function
    const { error } = await supabase.rpc('update_member_role', {
        p_organization_id: organizationId,
        p_profile_id: profileId,
        p_new_role: newRole
    });
    if (error) {
        throw new Error(error.message || 'Failed to update member role');
    }
    return {
        success: true
    };
}
async function suspendMember(organizationId, profileId) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireDetailer"])();
    // Check permissions
    const userRole = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$mode$2d$detection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getOrganizationRole"])(organizationId);
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["canRemoveMembers"])(userRole)) {
        throw new Error('You do not have permission to suspend members');
    }
    // Prevent suspending yourself
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id === profileId) {
        throw new Error('You cannot suspend yourself');
    }
    // Update member
    const { error } = await supabase.from('organization_members').update({
        is_active: false
    }).eq('organization_id', organizationId).eq('profile_id', profileId);
    if (error) {
        throw new Error('Failed to suspend member');
    }
    return {
        success: true
    };
}
async function activateMember(organizationId, profileId) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireDetailer"])();
    // Check permissions
    const userRole = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$mode$2d$detection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getOrganizationRole"])(organizationId);
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["canRemoveMembers"])(userRole)) {
        throw new Error('You do not have permission to activate members');
    }
    // Update member
    const { error } = await supabase.from('organization_members').update({
        is_active: true
    }).eq('organization_id', organizationId).eq('profile_id', profileId);
    if (error) {
        throw new Error('Failed to activate member');
    }
    return {
        success: true
    };
}
async function removeMember(organizationId, profileId) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireDetailer"])();
    // Check permissions
    const userRole = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$mode$2d$detection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getOrganizationRole"])(organizationId);
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["canRemoveMembers"])(userRole)) {
        throw new Error('You do not have permission to remove members');
    }
    // Prevent removing yourself
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id === profileId) {
        throw new Error('You cannot remove yourself');
    }
    // Call RPC function
    const { error } = await supabase.rpc('remove_member', {
        p_organization_id: organizationId,
        p_profile_id: profileId
    });
    if (error) {
        throw new Error(error.message || 'Failed to remove member');
    }
    return {
        success: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    inviteMember,
    updateMemberRole,
    suspendMember,
    activateMember,
    removeMember
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(inviteMember, "70cf6a3cfbe6ca7139d4ac7a295622ae64a88301d6", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateMemberRole, "703797e60fbb016fcd7e046529634bfa1142bd67fc", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(suspendMember, "60a446d426f2f65cea46c4dbb7faf5d0e0fb8e9767", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(activateMember, "60ac567f52cdf60cae3ffb68e1cc50e927cf81aab6", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(removeMember, "6028be15458b9994fe185ed90031cf0d041b61eb22", null);
}),
"[project]/cleanswift/web-dashboard/.next-internal/server/app/detailer/members/page/actions.js { ACTIONS_MODULE0 => \"[project]/cleanswift/web-dashboard/app/detailer/members/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$members$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/app/detailer/members/actions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
}),
"[project]/cleanswift/web-dashboard/.next-internal/server/app/detailer/members/page/actions.js { ACTIONS_MODULE0 => \"[project]/cleanswift/web-dashboard/app/detailer/members/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "6028be15458b9994fe185ed90031cf0d041b61eb22",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$members$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["removeMember"],
    "60a446d426f2f65cea46c4dbb7faf5d0e0fb8e9767",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$members$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["suspendMember"],
    "60ac567f52cdf60cae3ffb68e1cc50e927cf81aab6",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$members$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["activateMember"],
    "703797e60fbb016fcd7e046529634bfa1142bd67fc",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$members$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateMemberRole"],
    "70cf6a3cfbe6ca7139d4ac7a295622ae64a88301d6",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$members$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["inviteMember"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f2e$next$2d$internal$2f$server$2f$app$2f$detailer$2f$members$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$members$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/cleanswift/web-dashboard/.next-internal/server/app/detailer/members/page/actions.js { ACTIONS_MODULE0 => "[project]/cleanswift/web-dashboard/app/detailer/members/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$members$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/app/detailer/members/actions.ts [app-rsc] (ecmascript)");
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

//# sourceMappingURL=cleanswift_web-dashboard_d3d9a426._.js.map