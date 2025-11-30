import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const statusFilter = searchParams.status || null;

  // Get all bookings
  const { data: bookings } = await supabase.rpc('get_all_bookings', {
    p_status_filter: statusFilter,
    p_date_from: null,
    p_date_to: null,
    p_limit: 100,
    p_offset: 0,
  });

  return (
    <div className="min-h-screen bg-[#050B12] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Bookings Management</h1>
          <p className="text-[#C6CFD9]">View and manage all bookings</p>
        </div>

        {/* Filters */}
        <div className="bg-[#0A1A2F] border border-white/5 rounded-xl p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/admin/bookings"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !statusFilter
                  ? 'bg-[#32CE7A] text-white'
                  : 'bg-[#050B12] text-[#C6CFD9] hover:bg-white/5'
              }`}
            >
              All
            </Link>
            {['pending', 'paid', 'offered', 'accepted', 'in_progress', 'completed', 'cancelled'].map(
              (status) => (
                <Link
                  key={status}
                  href={`/admin/bookings?status=${status}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    statusFilter === status
                      ? 'bg-[#32CE7A] text-white'
                      : 'bg-[#050B12] text-[#C6CFD9] hover:bg-white/5'
                  }`}
                >
                  {status.replace('_', ' ')}
                </Link>
              )
            )}
          </div>
        </div>

        {/* Bookings Table */}
        {!bookings || bookings.length === 0 ? (
          <div className="bg-[#0A1A2F] border border-white/5 rounded-xl p-8 text-center">
            <p className="text-[#C6CFD9]">No bookings found</p>
          </div>
        ) : (
          <div className="bg-[#0A1A2F] border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#050B12] border-b border-white/10">
                  <tr>
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">Customer</th>
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">Service</th>
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">Detailer</th>
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking: any) => (
                    <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-white text-sm">{booking.receipt_id}</td>
                      <td className="py-3 px-4 text-white text-sm">
                        {booking.user?.full_name || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-white text-sm">{booking.service?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-white text-sm">
                        {booking.detailer?.full_name || 'Unassigned'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="capitalize text-[#C6CFD9]">{booking.status}</span>
                      </td>
                      <td className="py-3 px-4 text-white text-sm">${booking.total_amount || 0}</td>
                      <td className="py-3 px-4 text-[#C6CFD9] text-sm">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className="text-[#6FF0C4] hover:text-[#32CE7A] text-sm"
                        >
                          View
                        </Link>
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

