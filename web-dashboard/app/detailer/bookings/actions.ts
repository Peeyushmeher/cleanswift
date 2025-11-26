'use server';

import { createClient } from '@/lib/supabase/server';
import { requireDetailer, getDetailerMode } from '@/lib/auth';
import { getDetailerOrganization, getOrganizationRole } from '@/lib/detailer/mode-detection';
import { canAssignJobs } from '@/lib/detailer/permissions';

/**
 * Assign a job to a detailer
 */
export async function assignJobToDetailer(bookingId: string, detailerId: string) {
  const supabase = await createClient();
  const profile = await requireDetailer();

  // Get booking
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, organization_id, detailer_id, status')
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) {
    throw new Error('Booking not found');
  }

  // Check permissions
  if (booking.organization_id) {
    const mode = await getDetailerMode();
    if (mode === 'organization') {
      const organization = await getDetailerOrganization();
      if (organization) {
        const role = await getOrganizationRole(organization.id);
        if (!canAssignJobs(role)) {
          throw new Error('You do not have permission to assign jobs');
        }
      }
    } else {
      // Solo detailer can only assign to themselves
      const { data: detailerData } = await supabase.rpc('get_detailer_by_profile', {
        p_profile_id: null,
      });
      if (detailerId !== detailerData?.id) {
        throw new Error('Solo detailers can only be assigned to themselves');
      }
    }
  } else {
    // Solo booking - detailer can only assign to themselves
    const { data: detailerData } = await supabase.rpc('get_detailer_by_profile', {
      p_profile_id: null,
    });
    if (detailerId !== detailerData?.id) {
      throw new Error('You can only assign jobs to yourself');
    }
  }

  // Verify detailer exists and is in the same organization
  const { data: detailer } = await supabase
    .from('detailers')
    .select('id, organization_id')
    .eq('id', detailerId)
    .single();

  if (!detailer) {
    throw new Error('Detailer not found');
  }

  if (booking.organization_id && detailer.organization_id !== booking.organization_id) {
    throw new Error('Detailer is not in the same organization');
  }

  // Update booking
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      detailer_id: detailerId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId);

  if (updateError) {
    throw new Error('Failed to assign job');
  }

  // Create timeline entry
  const { error: timelineError } = await supabase
    .from('booking_timeline')
    .insert({
      booking_id: bookingId,
      status_from: booking.status,
      status_to: booking.status, // Status doesn't change, just assignment
      changed_by: profile.id,
      notes: `Job assigned to detailer`,
    });

  if (timelineError) {
    console.error('Failed to create timeline entry:', timelineError);
    // Don't throw - assignment succeeded
  }

  return { success: true };
}

