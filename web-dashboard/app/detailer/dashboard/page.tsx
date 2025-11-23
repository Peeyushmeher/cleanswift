import { redirect } from 'next/navigation';
import { requireDetailer } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export default async function DetailerDashboardPage() {
  const profile = await requireDetailer();
  const supabase = await createClient();

  // Get detailer bookings
  const { data: detailerData } = await supabase.rpc('get_detailer_by_profile', {
    p_profile_id: null,
  });

  let myBookings: any[] = [];
  let stats = {
    upcoming: 0,
    inProgress: 0,
    completed: 0,
    totalEarnings: 0,
  };

  if (detailerData?.id) {
    const { data: bookings } = await supabase
      .from('bookings')
      .select(
        `
        *,
        service:service_id (name, price),
        car:car_id (make, model, year, license_plate),
        user:user_id (full_name, phone)
      `
      )
      .eq('detailer_id', detailerData.id)
      .in('status', ['accepted', 'in_progress', 'completed'])
      .order('scheduled_start', { ascending: true })
      .limit(10);

    myBookings = bookings || [];

    stats.upcoming = myBookings.filter((b) => b.status === 'accepted').length;
    stats.inProgress = myBookings.filter((b) => b.status === 'in_progress').length;
    stats.completed = myBookings.filter((b) => b.status === 'completed').length;
    stats.totalEarnings = myBookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + (b.service?.price || 0), 0);
  }

  return (
    <div className="min-h-screen bg-[#050B12] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-[#C6CFD9]">Welcome back, {profile.full_name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#0A1A2F] border border-white/5 rounded-xl p-6">
            <div className="text-[#C6CFD9] text-sm mb-2">Upcoming</div>
            <div className="text-3xl font-bold text-white">{stats.upcoming}</div>
          </div>
          <div className="bg-[#0A1A2F] border border-white/5 rounded-xl p-6">
            <div className="text-[#C6CFD9] text-sm mb-2">In Progress</div>
            <div className="text-3xl font-bold text-white">{stats.inProgress}</div>
          </div>
          <div className="bg-[#0A1A2F] border border-white/5 rounded-xl p-6">
            <div className="text-[#C6CFD9] text-sm mb-2">Completed</div>
            <div className="text-3xl font-bold text-white">{stats.completed}</div>
          </div>
          <div className="bg-[#0A1A2F] border border-white/5 rounded-xl p-6">
            <div className="text-[#C6CFD9] text-sm mb-2">Total Earnings</div>
            <div className="text-3xl font-bold text-[#32CE7A]">${stats.totalEarnings.toFixed(2)}</div>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-[#0A1A2F] border border-white/5 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Upcoming Bookings</h2>
          {myBookings.length === 0 ? (
            <p className="text-[#C6CFD9]">No upcoming bookings</p>
          ) : (
            <div className="space-y-4">
              {myBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-[#050B12] border border-white/5 rounded-lg p-4 hover:border-[#6FF0C4]/20 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-white">
                        {booking.car?.make} {booking.car?.model} {booking.car?.year}
                      </div>
                      <div className="text-sm text-[#C6CFD9] mt-1">
                        {booking.service?.name} - {booking.user?.full_name}
                      </div>
                      <div className="text-sm text-[#C6CFD9] mt-1">
                        {new Date(booking.scheduled_start).toLocaleDateString()} at{' '}
                        {new Date(booking.scheduled_start).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">${booking.service?.price || 0}</div>
                      <div className="text-xs text-[#C6CFD9] mt-1 capitalize">{booking.status}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

