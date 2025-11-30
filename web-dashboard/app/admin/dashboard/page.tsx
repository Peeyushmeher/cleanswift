import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();

  // Get dashboard stats
  const { data: stats } = await supabase.rpc('get_dashboard_stats');

  // Get recent bookings
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select(
      `
      id,
      receipt_id,
      status,
      payment_status,
      scheduled_start,
      total_amount,
      created_at,
      user:user_id (full_name, email),
      detailer:detailer_id (full_name),
      service:service_id (name)
    `
    )
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-[#050B12] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-[#C6CFD9]">Welcome back, {profile.full_name}</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#0A1A2F] border border-white/5 rounded-xl p-6">
              <div className="text-[#C6CFD9] text-sm mb-2">Total Bookings</div>
              <div className="text-3xl font-bold text-white">{stats.total_bookings}</div>
            </div>
            <div className="bg-[#0A1A2F] border border-white/5 rounded-xl p-6">
              <div className="text-[#C6CFD9] text-sm mb-2">Active Bookings</div>
              <div className="text-3xl font-bold text-white">{stats.active_bookings}</div>
            </div>
            <div className="bg-[#0A1A2F] border border-white/5 rounded-xl p-6">
              <div className="text-[#C6CFD9] text-sm mb-2">Total Revenue</div>
              <div className="text-3xl font-bold text-[#32CE7A]">${stats.total_revenue.toFixed(2)}</div>
            </div>
            <div className="bg-[#0A1A2F] border border-white/5 rounded-xl p-6">
              <div className="text-[#C6CFD9] text-sm mb-2">Total Users</div>
              <div className="text-3xl font-bold text-white">{stats.total_users}</div>
            </div>
          </div>
        )}

        {/* Recent Bookings */}
        <div className="bg-[#0A1A2F] border border-white/5 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Bookings</h2>
          {!recentBookings || recentBookings.length === 0 ? (
            <p className="text-[#C6CFD9]">No recent bookings</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">Customer</th>
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">Service</th>
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-[#C6CFD9] text-sm font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking: any) => (
                    <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-white text-sm">{booking.receipt_id}</td>
                      <td className="py-3 px-4 text-white text-sm">{booking.user?.full_name || 'N/A'}</td>
                      <td className="py-3 px-4 text-white text-sm">{booking.service?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="capitalize text-[#C6CFD9]">{booking.status}</span>
                      </td>
                      <td className="py-3 px-4 text-white text-sm">${booking.total_amount || 0}</td>
                      <td className="py-3 px-4 text-[#C6CFD9] text-sm">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

