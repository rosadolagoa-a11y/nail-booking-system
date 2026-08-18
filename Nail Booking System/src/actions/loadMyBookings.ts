import { action } from '@uibakery/data';

function loadMyBookings() {
  return action('loadMyBookings', 'SQL', {
    datasourceName: 'Nail Designer Booking DB',
    query: `
      SELECT
        b.id, b.service_id, b.booking_date, b.start_time, b.end_time, b.status, b.created_at,
        s.name AS service_name, s.duration_minutes, s.price
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      WHERE b.client_id = {{params.clientId}}::bigint
      ORDER BY b.booking_date DESC, b.start_time DESC;
    `,
  });
}

export default loadMyBookings;
