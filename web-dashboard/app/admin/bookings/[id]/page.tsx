import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminBookingDetailPage({ params }: { params: { id: string } }) {
  const profile = await requireAdmin();
  const supabase = await createClient();

  // Get booking details
  const { data: bookings } = await supabase.rpc('get_all_bookings', {
    p_status_filter: null,
    p_date_from: null,
    p_date_to: null,
    p_limit: 1000,
    p_offset: 0,
  });

  const booking = bookings?.find((b: any) => b.id === params.id);

  if (!booking) {
    notFound();
  }

  // Get all detailers for assignment
  const { data: detailers } = await supabase.rpc('get_all_detailers');

  async function assignDetailer(formData: FormData) {
    'use server';
    const detailerId = formData.get('detailer_id') as string;
    if (detailerId) {
      const supabase = await createClient();
      await supabase.rpc('assign_detailer_to_booking', {
        p_booking_id: params.id,
        p_detailer_id: detailerId,
      });
      redirect(`/admin/bookings/${params.id}`);
    }
  }

  async function updateStatus(formData: FormData) {
    'use server';
    const newStatus = formData.get('status') as string;
    if (newStatus) {
      const supabase = await createClient();
      await supabase.rpc('update_booking_status', {
        p_booking_id: params.id,
        p_new_status: newStatus,
      });
      redirect(`/admin/bookings/${params.id}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#050B12] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/admin/bookings"
          className="text-[#6FF0C4] hover:text-[#32CE7A] mb-6 inline-block"
        >
          ← Back to Bookings
        </Link>

        <div className="bg-[#0A1A2F] border border-white/5 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Booking #{booking.receipt_id}</h1>
              <p className="text-[#C6CFD9]">Status: {booking.status}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#32CE7A] mb-2">${booking.total_amount || 0}</div>
              <div className="text-sm text-[#C6CFD9]">
                Payment: {booking.payment_status}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Customer</h2>
              <div className="space-y-2 text-[#C6CFD9]">
                <div>
                  <strong>Name:</strong> {booking.user?.full_name}
                </div>
                <div>
                  <strong>Email:</strong> {booking.user?.email}
                </div>
                <div>
                  <strong>Phone:</strong> {booking.user?.phone}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Service</h2>
              <div className="space-y-2 text-[#C6CFD9]">
                <div>
                  <strong>Service:</strong> {booking.service?.name}
                </div>
                <div>
                  <strong>Scheduled:</strong>{' '}
                  {new Date(booking.scheduled_date).toLocaleDateString()} at{' '}
                  {booking.scheduled_time_start}
                </div>
              </div>
            </div>
          </div>

          {/* Assign Detailer */}
          {!booking.detailer && (
            <div className="mb-6 p-4 bg-[#050B12] border border-white/5 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Assign Detailer</h3>
              <form action={assignDetailer}>
                <select
                  name="detailer_id"
                  required
                  className="w-full md:w-auto px-4 py-2 bg-[#0A1A2F] border border-white/10 rounded text-white mb-4 focus:outline-none focus:ring-2 focus:ring-[#6FF0C4]"
                >
                  <option value="">Select a detailer</option>
                  {detailers?.map((detailer: any) => (
                    <option key={detailer.id} value={detailer.id}>
                      {detailer.full_name} {detailer.is_active ? '' : '(Inactive)'}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="ml-4 bg-[#32CE7A] hover:bg-[#2AB869] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Assign
                </button>
              </form>
            </div>
          )}

          {/* Update Status */}
          <div className="p-4 bg-[#050B12] border border-white/5 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Update Status</h3>
            <form action={updateStatus}>
              <select
                name="status"
                defaultValue={booking.status}
                className="w-full md:w-auto px-4 py-2 bg-[#0A1A2F] border border-white/10 rounded text-white mb-4 focus:outline-none focus:ring-2 focus:ring-[#6FF0C4]"
              >
                <option value="pending">Pending</option>
                <option value="requires_payment">Requires Payment</option>
                <option value="paid">Paid</option>
                <option value="offered">Offered</option>
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
              <button
                type="submit"
                className="ml-4 bg-[#32CE7A] hover:bg-[#2AB869] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Update Status
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

