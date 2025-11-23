import { requireDetailer } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function DetailerBookingsPage() {
  const profile = await requireDetailer();
  const supabase = await createClient();

  // Get detailer record
  const { data: detailerData } = await supabase.rpc('get_detailer_by_profile', {
    p_profile_id: null,
  });

  let myBookings: any[] = [];

  if (detailerData?.id) {
    const { data: bookings } = await supabase
      .from('bookings')
      .select(
        `
        id,
        receipt_id,
        status,
        payment_status,
        scheduled_start,
        scheduled_end,
        total_amount,
        created_at,
        service:service_id (id, name, price),
        car:car_id (id, make, model, year, license_plate),
        user:user_id (id, full_name, phone, email),
        address:address_id (address_line1, city, province, postal_code)
      `
      )
      .eq('detailer_id', detailerData.id)
      .order('scheduled_start', { ascending: true });

    myBookings = bookings || [];
  }

  return (
    <div className="min-h-screen bg-[#050B12] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-[#C6CFD9]">View and manage your assigned bookings</p>
        </div>

        {myBookings.length === 0 ? (
          <div className="bg-[#0A1A2F] border border-white/5 rounded-xl p-8 text-center">
            <p className="text-[#C6CFD9]">No bookings assigned yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/detailer/bookings/${booking.id}`}
                className="block bg-[#0A1A2F] border border-white/5 rounded-xl p-6 hover:border-[#6FF0C4]/20 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {booking.car?.make} {booking.car?.model} {booking.car?.year}
                      </h3>
                      <span className="px-2 py-1 text-xs rounded-full bg-[#32CE7A]/20 text-[#32CE7A] capitalize">
                        {booking.status}
                      </span>
                    </div>
                    <div className="text-[#C6CFD9] space-y-1">
                      <div>
                        <strong>Service:</strong> {booking.service?.name}
                      </div>
                      <div>
                        <strong>Customer:</strong> {booking.user?.full_name} ({booking.user?.phone})
                      </div>
                      <div>
                        <strong>Location:</strong>{' '}
                        {booking.address
                          ? `${booking.address.address_line1}, ${booking.address.city}, ${booking.address.province}`
                          : 'N/A'}
                      </div>
                      <div>
                        <strong>Scheduled:</strong>{' '}
                        {new Date(booking.scheduled_start).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <div className="text-2xl font-bold text-[#32CE7A]">
                      ${booking.service?.price || booking.total_amount || 0}
                    </div>
                    <div className="text-sm text-[#C6CFD9] mt-2">
                      {booking.payment_status === 'paid' ? (
                        <span className="text-[#32CE7A]">Paid</span>
                      ) : (
                        <span className="text-yellow-400">Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

