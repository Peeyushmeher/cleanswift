module.exports=[93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},6032,a=>{a.n(a.i(77318))},79104,a=>{a.n(a.i(30730))},30188,a=>{a.n(a.i(7581))},42540,a=>{a.n(a.i(99116))},29789,a=>{a.n(a.i(16755))},5531,a=>{a.n(a.i(2287))},74857,a=>{"use strict";function b(a){return!!a&&("owner"===a||"manager"===a||"dispatcher"===a)}function c(a){return!!a&&("owner"===a||"manager"===a)}function d(a){return!!a&&("owner"===a||"manager"===a)}function e(a){return!!a&&("owner"===a||"manager"===a)}function f(a){return!!a&&"owner"===a}function g(a){return!!a&&"owner"===a}function h(a){return!!a&&("owner"===a||"manager"===a)}function i(a){return!!a&&("owner"===a||"manager"===a||"dispatcher"===a)}a.s(["canAssignJobs",()=>b,"canChangeMemberRoles",()=>g,"canManageMembers",()=>d,"canManageOrgSettings",()=>f,"canManageTeams",()=>c,"canRemoveMembers",()=>h,"canViewAllOrgBookings",()=>i,"canViewOrgEarnings",()=>e])},89870,a=>{"use strict";let b=(0,a.i(44322).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/cleanswift/web-dashboard/app/detailer/schedule/SchedulePageClient.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/cleanswift/web-dashboard/app/detailer/schedule/SchedulePageClient.tsx <module evaluation>","default");a.s(["default",0,b])},797,a=>{"use strict";let b=(0,a.i(44322).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/cleanswift/web-dashboard/app/detailer/schedule/SchedulePageClient.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/cleanswift/web-dashboard/app/detailer/schedule/SchedulePageClient.tsx","default");a.s(["default",0,b])},30575,a=>{"use strict";a.i(89870);var b=a.i(797);a.n(b)},22582,a=>{"use strict";var b=a.i(2813),c=a.i(54380),d=a.i(75557),e=a.i(14650),f=a.i(74857),g=a.i(30575);async function h(){await (0,c.requireDetailer)();let a=await (0,d.createClient)(),h=await (0,c.getDetailerMode)(),i="organization"===h?await (0,e.getDetailerOrganization)():null,j=i?await (0,e.getOrganizationRole)(i.id):null,k="organization"===h&&i&&j&&(0,f.canViewAllOrgBookings)(j),{data:l}=await a.rpc("get_detailer_by_profile",{p_profile_id:null}),m=[],n=[],o=[],p=[],q=[],r=[];if(k&&i){let{data:b}=await a.from("bookings").select(`
        id,
        receipt_id,
        status,
        scheduled_date,
        scheduled_time_start,
        scheduled_time_end,
        scheduled_start,
        total_amount,
        team_id,
        detailer_id,
        service:service_id (id, name, price, duration_minutes),
        car:car_id (id, make, model, year, license_plate),
        user:user_id (id, full_name, phone, email),
        team:teams (id, name),
        detailer:detailers (id, full_name),
        address_line1,
        city,
        province,
        postal_code
      `).eq("organization_id",i.id).in("status",["accepted","in_progress","completed","scheduled"]).order("scheduled_date",{ascending:!0}).order("scheduled_time_start",{ascending:!0});n=b||[];let{data:c}=await a.from("teams").select("id, name").eq("organization_id",i.id).eq("is_active",!0);q=c||[];let{data:d}=await a.rpc("get_organization_members",{p_organization_id:i.id});r=(d||[]).filter(a=>"detailer"===a.role)}else if(l?.id){let{data:b}=await a.from("bookings").select(`
        id,
        receipt_id,
        status,
        scheduled_date,
        scheduled_time_start,
        scheduled_time_end,
        scheduled_start,
        total_amount,
        service:service_id (id, name, price, duration_minutes),
        car:car_id (id, make, model, year, license_plate),
        user:user_id (id, full_name, phone, email),
        address_line1,
        city,
        province,
        postal_code
      `).eq("detailer_id",l.id).in("status",["accepted","in_progress","completed"]).order("scheduled_date",{ascending:!0}).order("scheduled_time_start",{ascending:!0});m=b||[];let{data:c}=await a.from("detailer_availability").select("*").eq("detailer_id",l.id).eq("is_active",!0);o=c||[],p=m}return(0,b.jsx)("div",{className:"min-h-screen bg-[#050B12] text-white",children:(0,b.jsxs)("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[(0,b.jsxs)("div",{className:"mb-8",children:[(0,b.jsx)("h1",{className:"text-3xl font-bold text-white mb-2",children:"Schedule"}),(0,b.jsx)("p",{className:"text-[#C6CFD9]",children:k?"View and manage organization schedule":"View and manage your job schedule"})]}),(0,b.jsx)(g.default,{bookings:k?n:p,mode:h,teams:q,detailers:r,availabilitySlots:o})]})})}a.s(["default",()=>h])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__12638d40._.js.map