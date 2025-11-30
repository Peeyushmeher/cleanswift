import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminDetailersPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();

  // Get all detailers
  const { data: detailers } = await supabase.rpc('get_all_detailers');

  async function toggleDetailerStatus(formData: FormData) {
    'use server';
    const detailerId = formData.get('detailer_id') as string;
    if (detailerId) {
      const supabase = await createClient();
      // Get current detailer status
      const { data: detailer } = await supabase
        .from('detailers')
        .select('is_active')
        .eq('id', detailerId)
        .single();

      if (detailer) {
        await supabase
          .from('detailers')
          .update({ is_active: !detailer.is_active })
          .eq('id', detailerId);
      }
      redirect('/admin/detailers');
    }
  }

  return (
    <div className="min-h-screen bg-[#050B12] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Detailers Management</h1>
          <p className="text-[#C6CFD9]">Manage detailer accounts and status</p>
        </div>

        {/* Detailers Table */}
        {!detailers || detailers.length === 0 ? (
          <div className="bg-[#0A1A2F] border border-white/5 rounded-xl p-8 text-center">
            <p className="text-[#C6CFD9]">No detailers found</p>
          </div>
        ) : (
          <div className="bg-[#0A1A2F] border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#050B12] border-b border-white/10">
                  <tr>
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">Phone</th>
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">Rating</th>
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">Experience</th>
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">Bookings</th>
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {detailers.map((detailer: any) => (
                    <tr key={detailer.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-white text-sm">{detailer.full_name}</td>
                      <td className="py-3 px-4 text-white text-sm">
                        {detailer.profile?.email || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-white text-sm">
                        {detailer.profile?.phone || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-white text-sm">
                        {detailer.rating ? detailer.rating.toFixed(1) : 'N/A'} (
                        {detailer.review_count || 0} reviews)
                      </td>
                      <td className="py-3 px-4 text-white text-sm">
                        {detailer.years_experience || 0} years
                      </td>
                      <td className="py-3 px-4 text-white text-sm">
                        {detailer.booking_count || 0} total, {detailer.completed_count || 0} completed
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {detailer.is_active ? (
                          <span className="text-[#32CE7A]">Active</span>
                        ) : (
                          <span className="text-red-400">Inactive</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <form action={toggleDetailerStatus}>
                          <input type="hidden" name="detailer_id" value={detailer.id} />
                          <button
                            type="submit"
                            className={`text-sm font-semibold py-1 px-3 rounded transition-colors ${
                              detailer.is_active
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                : 'bg-[#32CE7A]/20 text-[#32CE7A] hover:bg-[#32CE7A]/30'
                            }`}
                          >
                            {detailer.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

