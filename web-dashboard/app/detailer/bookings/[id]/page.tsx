import { requireDetailer, getDetailerMode } from '@/lib/auth';
import { getDetailerOrganization, getOrganizationRole } from '@/lib/detailer/mode-detection';
import { canAssignJobs } from '@/lib/detailer/permissions';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BookingDetailClient from './BookingDetailClient';

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const profile = await requireDetailer();
  const supabase = await createClient();
  const mode = await getDetailerMode();
  const organization = mode === 'organization' ? await getDetailerOrganization() : null;
  const orgRole = organization ? await getOrganizationRole(organization.id) : null;

  // Get detailer record
  const { data: detailerData } = await supabase.rpc('get_detailer_by_profile', {
    p_profile_id: null,
  });

  // Build query based on mode and permissions
  let bookingQuery = supabase
    .from('bookings')
    .select(
      `
      *,
      service:service_id (*),
      car:car_id (*),
      user:user_id (*),
      detailer:detailers (id, full_name),
      team:teams (id, name)
    `
    )
    .eq('id', params.id);

  // Apply access control
  if (mode === 'organization' && organization && orgRole && canAssignJobs(orgRole)) {
    // Org managers/dispatchers/owners can see any org booking
    bookingQuery = bookingQuery.eq('organization_id', organization.id);
  } else {
    // Solo or detailer in org: only see own bookings
    bookingQuery = bookingQuery.eq('detailer_id', detailerData?.id);
  }

  const { data: booking, error } = await bookingQuery.single();

  if (error || !booking) {
    notFound();
  }

  // Get booking timeline
  const { data: timeline } = await supabase
    .from('booking_timeline')
    .select('*')
    .eq('booking_id', params.id)
    .order('changed_at', { ascending: true });

  // Get booking notes
  const { data: notes } = await supabase
    .from('booking_notes')
    .select('*')
    .eq('booking_id', params.id)
    .order('created_at', { ascending: false });

  // Get job photos
  const { data: photos } = await supabase
    .from('job_photos')
    .select('*')
    .eq('booking_id', params.id)
    .order('uploaded_at', { ascending: false });

  const canUpdateStatus =
    booking.status === 'accepted' || booking.status === 'in_progress' || booking.status === 'completed';
  const canReassign = mode === 'organization' && organization && orgRole && canAssignJobs(orgRole);

  return (
    <div className="min-h-screen bg-[#050B12] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/detailer/bookings"
          className="text-[#6FF0C4] hover:text-[#32CE7A] mb-6 inline-block"
        >
          ← Back to Bookings
        </Link>

        <BookingDetailClient
          booking={booking}
          timeline={timeline || []}
          notes={notes || []}
          photos={photos || []}
          canUpdateStatus={canUpdateStatus}
          canReassign={canReassign}
          organizationId={organization?.id}
        />
      </div>
    </div>
  );
}

