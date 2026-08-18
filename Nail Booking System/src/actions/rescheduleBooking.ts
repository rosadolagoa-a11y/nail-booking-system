import { action } from '@uibakery/data';

function rescheduleBooking() {
  return action('rescheduleBooking', 'SQL', {
    datasourceName: 'Nail Designer Booking DB',
    query: `
      UPDATE bookings
      SET
        booking_date = {{params.bookingDate}}::date,
        start_time = {{params.startTime}}::time,
        end_time = {{params.endTime}}::time,
        status = 'confirmed',
        updated_at = NOW()
      WHERE id = {{params.id}}::bigint;
    `,
  });
}

export default rescheduleBooking;
