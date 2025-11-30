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
"[project]/cleanswift/web-dashboard/app/detailer/teams/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40818020bd46baf457f11ead61a43c0a5eb6a72a6c":"deleteTeam","7c3b50b01530e1c9b0fbe935d1c44fa0b6c274044b":"createTeam","7ca37a6007a6dbc124d74e0760defede774851b4c7":"updateTeam"},"",""] */ __turbopack_context__.s([
    "createTeam",
    ()=>createTeam,
    "deleteTeam",
    ()=>deleteTeam,
    "updateTeam",
    ()=>updateTeam
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
async function createTeam(organizationId, name, description, serviceArea, detailerIds) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireDetailer"])();
    // Check permissions
    const organization = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$mode$2d$detection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDetailerOrganization"])();
    if (!organization || organization.id !== organizationId) {
        throw new Error('Organization not found');
    }
    const userRole = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$mode$2d$detection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getOrganizationRole"])(organizationId);
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["canManageTeams"])(userRole)) {
        throw new Error('You do not have permission to create teams');
    }
    // Create team
    const { data: team, error: teamError } = await supabase.from('teams').insert({
        organization_id: organizationId,
        name,
        description,
        service_area: serviceArea,
        is_active: true
    }).select().single();
    if (teamError || !team) {
        throw new Error('Failed to create team');
    }
    // Add team members
    if (detailerIds.length > 0) {
        const { error: membersError } = await supabase.from('team_members').insert(detailerIds.map((detailerId)=>({
                team_id: team.id,
                detailer_id: detailerId
            })));
        if (membersError) {
            console.error('Failed to add team members:', membersError);
        // Don't throw - team was created
        }
    }
    return team;
}
async function updateTeam(teamId, name, description, serviceArea, detailerIds) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireDetailer"])();
    // Get team to verify organization
    const { data: team } = await supabase.from('teams').select('organization_id').eq('id', teamId).single();
    if (!team) {
        throw new Error('Team not found');
    }
    // Check permissions
    const userRole = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$mode$2d$detection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getOrganizationRole"])(team.organization_id);
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["canManageTeams"])(userRole)) {
        throw new Error('You do not have permission to update teams');
    }
    // Update team
    const { error: updateError } = await supabase.from('teams').update({
        name,
        description,
        service_area: serviceArea
    }).eq('id', teamId);
    if (updateError) {
        throw new Error('Failed to update team');
    }
    // Update team members
    // Remove all existing members
    await supabase.from('team_members').delete().eq('team_id', teamId);
    // Add new members
    if (detailerIds.length > 0) {
        const { error: membersError } = await supabase.from('team_members').insert(detailerIds.map((detailerId)=>({
                team_id: teamId,
                detailer_id: detailerId
            })));
        if (membersError) {
            console.error('Failed to update team members:', membersError);
        }
    }
    return {
        success: true
    };
}
async function deleteTeam(teamId) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireDetailer"])();
    // Get team to verify organization
    const { data: team } = await supabase.from('teams').select('organization_id').eq('id', teamId).single();
    if (!team) {
        throw new Error('Team not found');
    }
    // Check permissions
    const userRole = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$mode$2d$detection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getOrganizationRole"])(team.organization_id);
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$lib$2f$detailer$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["canManageTeams"])(userRole)) {
        throw new Error('You do not have permission to delete teams');
    }
    // Soft delete
    const { error } = await supabase.from('teams').update({
        is_active: false
    }).eq('id', teamId);
    if (error) {
        throw new Error('Failed to delete team');
    }
    return {
        success: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    createTeam,
    updateTeam,
    deleteTeam
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createTeam, "7c3b50b01530e1c9b0fbe935d1c44fa0b6c274044b", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateTeam, "7ca37a6007a6dbc124d74e0760defede774851b4c7", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteTeam, "40818020bd46baf457f11ead61a43c0a5eb6a72a6c", null);
}),
"[project]/cleanswift/web-dashboard/.next-internal/server/app/detailer/teams/page/actions.js { ACTIONS_MODULE0 => \"[project]/cleanswift/web-dashboard/app/detailer/teams/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$teams$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/app/detailer/teams/actions.ts [app-rsc] (ecmascript)");
;
;
;
}),
"[project]/cleanswift/web-dashboard/.next-internal/server/app/detailer/teams/page/actions.js { ACTIONS_MODULE0 => \"[project]/cleanswift/web-dashboard/app/detailer/teams/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "40818020bd46baf457f11ead61a43c0a5eb6a72a6c",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$teams$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteTeam"],
    "7c3b50b01530e1c9b0fbe935d1c44fa0b6c274044b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$teams$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createTeam"],
    "7ca37a6007a6dbc124d74e0760defede774851b4c7",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$teams$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateTeam"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f2e$next$2d$internal$2f$server$2f$app$2f$detailer$2f$teams$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$teams$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/cleanswift/web-dashboard/.next-internal/server/app/detailer/teams/page/actions.js { ACTIONS_MODULE0 => "[project]/cleanswift/web-dashboard/app/detailer/teams/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$cleanswift$2f$web$2d$dashboard$2f$app$2f$detailer$2f$teams$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cleanswift/web-dashboard/app/detailer/teams/actions.ts [app-rsc] (ecmascript)");
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

//# sourceMappingURL=cleanswift_web-dashboard_30427665._.js.map