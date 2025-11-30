module.exports=[93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},6032,a=>{a.n(a.i(77318))},79104,a=>{a.n(a.i(30730))},30188,a=>{a.n(a.i(7581))},42540,a=>{a.n(a.i(99116))},29789,a=>{a.n(a.i(16755))},5531,a=>{a.n(a.i(2287))},96511,a=>{"use strict";let b=(0,a.i(44322).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/cleanswift/web-dashboard/app/detailer/teams/TeamsPageClient.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/cleanswift/web-dashboard/app/detailer/teams/TeamsPageClient.tsx <module evaluation>","default");a.s(["default",0,b])},10889,a=>{"use strict";let b=(0,a.i(44322).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/cleanswift/web-dashboard/app/detailer/teams/TeamsPageClient.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/cleanswift/web-dashboard/app/detailer/teams/TeamsPageClient.tsx","default");a.s(["default",0,b])},79251,a=>{"use strict";a.i(96511);var b=a.i(10889);a.n(b)},86073,a=>{"use strict";var b=a.i(2813),c=a.i(54380),d=a.i(75557),e=a.i(14650);a.i(37104);var f=a.i(22971),g=a.i(79251);async function h(){await (0,c.requireDetailer)(),"solo"===await (0,c.getDetailerMode)()&&(0,f.redirect)("/detailer/dashboard");let a=await (0,d.createClient)(),h=await (0,e.getDetailerOrganization)();h||(0,f.redirect)("/detailer/dashboard");let i=h.id,j=await (0,e.getOrganizationRole)(i),{data:k}=await a.from("teams").select(`
      *,
      team_members (
        id,
        detailer:detailers (
          id,
          full_name,
          profile:profiles (
            email
          )
        )
      )
    `).eq("organization_id",i).eq("is_active",!0).order("created_at",{ascending:!0});return(0,b.jsx)("div",{className:"min-h-screen bg-[#050B12] text-white",children:(0,b.jsxs)("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[(0,b.jsxs)("div",{className:"mb-8",children:[(0,b.jsx)("h1",{className:"text-3xl font-bold text-white mb-2",children:"Teams"}),(0,b.jsx)("p",{className:"text-[#C6CFD9]",children:"Manage teams within your organization"})]}),(0,b.jsx)(g.default,{initialTeams:k||[],organizationId:i,canManageTeams:"owner"===j||"manager"===j})]})})}a.s(["default",()=>h])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__7ad151ee._.js.map