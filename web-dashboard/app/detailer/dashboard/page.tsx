import { requireDetailer } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import CalendarView from './CalendarView';

export default async function DetailerDashboardPage() {
  const profile = await requireDetailer();
  const supabase = await createClient();

  // Get detailer record
  const { data: detailerData } = await supabase.rpc('get_detailer_by_profile', {
    p_profile_id: null,
  });

  let myBookings: any[] = [];
  let availabilitySlots: any[] = [];
  let filteredBookings: any[] = [];
  let stats = {
    upcoming: 0,
    inProgress: 0,
    completed: 0,
    totalEarnings: 0,
  };

  if (detailerData?.id) {
    // Get all bookings assigned to this detailer
    const { data: bookings } = await supabase
      .from('bookings')
      .select(
        `
        id,
        receipt_id,
        status,
        payment_status,
        scheduled_date,
        scheduled_time_start,
        scheduled_time_end,
        scheduled_start,
        scheduled_end,
        total_amount,
        service:service_id (id, name, price, duration_minutes),
        car:car_id (id, make, model, year, license_plate),
        user:user_id (id, full_name, phone, email),
        address_line1,
        city,
        province,
        postal_code
      `
      )
      .eq('detailer_id', detailerData.id)
      .in('status', ['accepted', 'in_progress', 'completed'])
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time_start', { ascending: true });

    myBookings = bookings || [];

    // Get detailer availability
    const { data: availability } = await supabase
      .from('detailer_availability')
      .select('*')
      .eq('detailer_id', detailerData.id)
      .eq('is_active', true);

    availabilitySlots = availability || [];

    // Filter bookings to only show those within availability windows
    filteredBookings = myBookings.filter((booking) => {
      if (!booking.scheduled_date || !booking.scheduled_time_start) return false;

      // Get day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
      const bookingDate = new Date(booking.scheduled_date);
      const dayOfWeek = bookingDate.getDay();

      // Find matching availability slot
      const matchingSlot = availabilitySlots.find(
        (slot) => slot.day_of_week === dayOfWeek
      );

      if (!matchingSlot) return false;

      // Check if booking time falls within availability window
      const bookingStartTime = booking.scheduled_time_start;
      const bookingEndTime = booking.scheduled_time_end || booking.scheduled_time_start;

      // Compare times (format: HH:MM:SS)
      const slotStart = matchingSlot.start_time;
      const slotEnd = matchingSlot.end_time;

      // Convert to comparable format
      const bookingStart = bookingStartTime.substring(0, 5); // HH:MM
      const bookingEnd = bookingEndTime.substring(0, 5); // HH:MM
      const slotStartTime = slotStart.substring(0, 5); // HH:MM
      const slotEndTime = slotEnd.substring(0, 5); // HH:MM

      // Check if booking time is within availability window
      return bookingStart >= slotStartTime && bookingEnd <= slotEndTime;
    });

    // Calculate stats from filtered bookings
    stats.upcoming = filteredBookings.filter((b) => b.status === 'accepted').length;
    stats.inProgress = filteredBookings.filter((b) => b.status === 'in_progress').length;
    stats.completed = filteredBookings.filter((b) => b.status === 'completed').length;
    stats.totalEarnings = filteredBookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + (b.service?.price || b.total_amount || 0), 0);
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

        {/* Calendar View */}
        <div className="bg-[#0A1A2F] border border-white/5 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Calendar</h2>
          <CalendarView bookings={filteredBookings} />
        </div>

        {/* Upcoming Bookings List */}
        <div className="bg-[#0A1A2F] border border-white/5 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Upcoming Bookings</h2>
          {filteredBookings.length === 0 ? (
            <p className="text-[#C6CFD9]">No upcoming bookings in your availability window</p>
          ) : (
            <div className="space-y-4">
              {filteredBookings.slice(0, 10).map((booking) => (
                <Link
                  key={booking.id}
                  href={`/detailer/bookings/${booking.id}`}
                  className="block bg-[#050B12] border border-white/5 rounded-lg p-4 hover:border-[#6FF0C4]/20 transition-colors"
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
                        {booking.scheduled_date && booking.scheduled_time_start
                          ? `${new Date(booking.scheduled_date).toLocaleDateString()} at ${booking.scheduled_time_start.substring(0, 5)}`
                          : booking.scheduled_start
                          ? new Date(booking.scheduled_start).toLocaleString()
                          : 'Date TBD'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">${booking.service?.price || booking.total_amount || 0}</div>
                      <div className="text-xs text-[#C6CFD9] mt-1 capitalize">{booking.status}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

