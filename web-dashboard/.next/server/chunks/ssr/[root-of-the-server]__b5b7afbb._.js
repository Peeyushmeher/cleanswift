module.exports=[93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},6032,a=>{a.n(a.i(77318))},79104,a=>{a.n(a.i(30730))},30188,a=>{a.n(a.i(7581))},42540,a=>{a.n(a.i(99116))},29789,a=>{a.n(a.i(16755))},5531,a=>{a.n(a.i(2287))},41449,a=>{"use strict";let b=(0,a.i(44322).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx <module evaluation>","default");a.s(["default",0,b])},41189,a=>{"use strict";let b=(0,a.i(44322).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/cleanswift/web-dashboard/app/detailer/reviews/ReviewsPageClient.tsx","default");a.s(["default",0,b])},16690,a=>{"use strict";a.i(41449);var b=a.i(41189);a.n(b)},33369,a=>{"use strict";var b=a.i(2813),c=a.i(54380),d=a.i(75557),e=a.i(14650),f=a.i(16690);async function g(){await (0,c.requireDetailer)();let a=await (0,d.createClient)(),g=await (0,c.getDetailerMode)(),h="organization"===g?await (0,e.getDetailerOrganization)():null,i=h?await (0,e.getOrganizationRole)(h.id):null,{data:j}=await a.rpc("get_detailer_by_profile",{p_profile_id:null}),k=[],l=[],m=[],n=0;if("organization"===g&&h&&i&&["owner","manager"].includes(i)){let{data:b}=await a.from("bookings").select("id").eq("organization_id",h.id),c=b?.map(a=>a.id)||[];if(c.length>0){let{data:b}=await a.from("reviews").select(`
          *,
          user:user_id (full_name),
          booking:booking_id (
            receipt_id,
            service:service_id (name),
            team_id,
            detailer_id,
            team:teams (id, name),
            detailer:detailers (id, full_name)
          )
        `).in("booking_id",c).order("created_at",{ascending:!1});(k=b||[]).length>0&&(n=k.reduce((a,b)=>a+b.rating,0)/k.length);let{data:d}=await a.rpc("get_organization_members",{p_organization_id:h.id});l=(d||[]).filter(a=>"detailer"===a.role);let{data:e}=await a.from("teams").select("id, name").eq("organization_id",h.id).eq("is_active",!0);m=e||[]}}else if(j?.id){let{data:b}=await a.from("reviews").select(`
        *,
        user:user_id (full_name),
        booking:booking_id (
          receipt_id,
          service:service_id (name)
        )
      `).eq("detailer_id",j.id).order("created_at",{ascending:!1});k=b||[]}return(0,b.jsx)("div",{className:"min-h-screen bg-[#050B12] text-white",children:(0,b.jsxs)("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[(0,b.jsxs)("div",{className:"mb-8",children:[(0,b.jsx)("h1",{className:"text-3xl font-bold text-white mb-2",children:"Reviews"}),(0,b.jsx)("p",{className:"text-[#C6CFD9]",children:"View customer reviews and ratings"})]}),(0,b.jsx)(f.default,{initialReviews:k,mode:g,orgRating:n,detailers:l,teams:m})]})})}a.s(["default",()=>g])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__b5b7afbb._.js.map