import { requireDetailer } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const profile = await requireDetailer();
  const supabase = await createClient();

  // Get detailer record
  const { data: detailerData } = await supabase.rpc('get_detailer_by_profile', {
    p_profile_id: null,
  });

  // Get booking details
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(
      `
      *,
      service:service_id (*),
      car:car_id (*),
      user:user_id (*),
      address:address_id (*)
    `
    )
    .eq('id', params.id)
    .eq('detailer_id', detailerData?.id)
    .single();

  if (error || !booking) {
    notFound();
  }

  const canUpdateStatus =
    booking.status === 'accepted' || booking.status === 'in_progress' || booking.status === 'completed';

  return (
    <div className="min-h-screen bg-[#050B12] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/detailer/bookings"
          className="text-[#6FF0C4] hover:text-[#32CE7A] mb-6 inline-block"
        >
          ← Back to Bookings
        </Link>

        <div className="bg-[#0A1A2F] border border-white/5 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {booking.car?.make} {booking.car?.model} {booking.car?.year}
              </h1>
              <p className="text-[#C6CFD9]">Booking #{booking.receipt_id}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#32CE7A] mb-2">
                ${booking.service?.price || booking.total_amount || 0}
              </div>
              <span className="px-3 py-1 text-sm rounded-full bg-[#32CE7A]/20 text-[#32CE7A] capitalize">
                {booking.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Service Details</h2>
              <div className="space-y-2 text-[#C6CFD9]">
                <div>
                  <strong>Service:</strong> {booking.service?.name}
                </div>
                <div>
                  <strong>Description:</strong> {booking.service?.description || 'N/A'}
                </div>
                <div>
                  <strong>Scheduled:</strong>{' '}
                  {new Date(booking.scheduled_start).toLocaleString()}
                </div>
                {booking.scheduled_end && (
                  <div>
                    <strong>End Time:</strong> {new Date(booking.scheduled_end).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Customer Information</h2>
              <div className="space-y-2 text-[#C6CFD9]">
                <div>
                  <strong>Name:</strong> {booking.user?.full_name}
                </div>
                <div>
                  <strong>Phone:</strong> {booking.user?.phone}
                </div>
                <div>
                  <strong>Email:</strong> {booking.user?.email}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Vehicle Information</h2>
              <div className="space-y-2 text-[#C6CFD9]">
                <div>
                  <strong>Make/Model:</strong> {booking.car?.make} {booking.car?.model}
                </div>
                <div>
                  <strong>Year:</strong> {booking.car?.year}
                </div>
                <div>
                  <strong>License Plate:</strong> {booking.car?.license_plate}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Location</h2>
              <div className="space-y-2 text-[#C6CFD9]">
                {booking.address ? (
                  <>
                    <div>{booking.address.address_line1}</div>
                    <div>
                      {booking.address.city}, {booking.address.province} {booking.address.postal_code}
                    </div>
                  </>
                ) : (
                  <div>Address not available</div>
                )}
              </div>
            </div>
          </div>

          {canUpdateStatus && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">Update Status</h2>
              <form action={async () => {
                'use server';
                const supabase = await createClient();
                if (booking.status === 'accepted') {
                  await supabase.rpc('update_booking_status', {
                    p_booking_id: booking.id,
                    p_new_status: 'in_progress',
                  });
                } else if (booking.status === 'in_progress') {
                  await supabase.rpc('update_booking_status', {
                    p_booking_id: booking.id,
                    p_new_status: 'completed',
                  });
                }
              }}>
                {booking.status === 'accepted' && (
                  <button
                    type="submit"
                    className="bg-[#32CE7A] hover:bg-[#2AB869] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                  >
                    Start Service
                  </button>
                )}
                {booking.status === 'in_progress' && (
                  <button
                    type="submit"
                    className="bg-[#32CE7A] hover:bg-[#2AB869] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

