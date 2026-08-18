import { action } from '@uibakery/data';

function updateBookingStatus() {
  return action('updateBookingStatus', 'SQL', {
    datasourceName: 'Nail Designer Booking DB',
    query: `
      UPDATE bookings
      SET status = {{params.status}}, updated_at = NOW()
      WHERE id = {{params.id}}::bigint;
    `,
  });
}

export default updateBookingStatus;
