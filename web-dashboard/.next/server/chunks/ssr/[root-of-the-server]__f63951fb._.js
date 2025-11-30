module.exports=[93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},6032,a=>{a.n(a.i(77318))},79104,a=>{a.n(a.i(30730))},30188,a=>{a.n(a.i(7581))},42540,a=>{a.n(a.i(99116))},29789,a=>{a.n(a.i(16755))},5531,a=>{a.n(a.i(2287))},74857,a=>{"use strict";function b(a){return!!a&&("owner"===a||"manager"===a||"dispatcher"===a)}function c(a){return!!a&&("owner"===a||"manager"===a)}function d(a){return!!a&&("owner"===a||"manager"===a)}function e(a){return!!a&&("owner"===a||"manager"===a)}function f(a){return!!a&&"owner"===a}function g(a){return!!a&&"owner"===a}function h(a){return!!a&&("owner"===a||"manager"===a)}function i(a){return!!a&&("owner"===a||"manager"===a||"dispatcher"===a)}a.s(["canAssignJobs",()=>b,"canChangeMemberRoles",()=>g,"canManageMembers",()=>d,"canManageOrgSettings",()=>f,"canManageTeams",()=>c,"canRemoveMembers",()=>h,"canViewAllOrgBookings",()=>i,"canViewOrgEarnings",()=>e])},54040,a=>{"use strict";let b=(0,a.i(44322).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/cleanswift/web-dashboard/app/detailer/earnings/EarningsPageClient.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/cleanswift/web-dashboard/app/detailer/earnings/EarningsPageClient.tsx <module evaluation>","default");a.s(["default",0,b])},4039,a=>{"use strict";let b=(0,a.i(44322).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/cleanswift/web-dashboard/app/detailer/earnings/EarningsPageClient.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/cleanswift/web-dashboard/app/detailer/earnings/EarningsPageClient.tsx","default");a.s(["default",0,b])},47216,a=>{"use strict";a.i(54040);var b=a.i(4039);a.n(b)},1629,a=>{"use strict";var b=a.i(2813),c=a.i(54380),d=a.i(75557),e=a.i(14650),f=a.i(74857),g=a.i(47216);async function h(){await (0,c.requireDetailer)();let a=await (0,d.createClient)(),h=await (0,c.getDetailerMode)(),i="organization"===h?await (0,e.getDetailerOrganization)():null,j=i?await (0,e.getOrganizationRole)(i.id):null,k="organization"===h&&i&&j&&(0,f.canViewOrgEarnings)(j),{data:l}=await a.rpc("get_detailer_by_profile",{p_profile_id:null}),m=[],n=0,o=0,p=null,q=[],r=[];if(k&&i){let{data:b}=await a.from("bookings").select(`
        id,
        receipt_id,
        status,
        total_amount,
        service_price,
        completed_at,
        team_id,
        detailer_id,
        service:service_id (name),
        team:teams (id, name),
        detailer:detailers (id, full_name)
      `).eq("organization_id",i.id).eq("status","completed").order("completed_at",{ascending:!1}),c=b||[],d=c.reduce((a,b)=>a+(b.total_amount||b.service_price||0),0),e=.1*d;p={grossRevenue:d,netRevenue:d-e,platformFee:e,totalJobs:c.length};let f={};c.forEach(a=>{if(a.team_id&&a.team){let b=Array.isArray(a.team)?a.team[0]:a.team;f[a.team_id]||(f[a.team_id]={name:b?.name||"Unknown Team",revenue:0,jobs:0}),f[a.team_id].revenue+=a.total_amount||a.service_price||0,f[a.team_id].jobs+=1}}),q=Object.values(f);let{data:g}=await a.from("payout_batches").select("*").eq("organization_id",i.id).order("batch_date",{ascending:!1}).limit(10);r=g||[]}else if(l?.id){let{data:b}=await a.from("bookings").select(`
        id,
        receipt_id,
        status,
        total_amount,
        service_price,
        addons_total,
        tax_amount,
        completed_at,
        scheduled_date,
        service:service_id (name),
        user:user_id (full_name),
        car:car_id (make, model, year)
      `).eq("detailer_id",l.id).eq("status","completed").order("completed_at",{ascending:!1});o=.9*(n=(m=b||[]).reduce((a,b)=>a+(b.total_amount||b.service_price||0),0))}return(0,b.jsx)("div",{className:"min-h-screen bg-[#050B12] text-white",children:(0,b.jsxs)("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[(0,b.jsxs)("div",{className:"mb-8",children:[(0,b.jsx)("h1",{className:"text-3xl font-bold text-white mb-2",children:"Earnings"}),(0,b.jsx)("p",{className:"text-[#C6CFD9]",children:"View your earnings and payout history"})]}),(0,b.jsx)(g.default,{earningsData:m,totalEarnings:n,pendingPayouts:o,mode:h,orgEarnings:p,teamEarnings:q,payoutBatches:r})]})})}a.s(["default",()=>h])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__f63951fb._.js.map