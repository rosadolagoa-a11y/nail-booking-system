import { action } from '@uibakery/data';

function loadBookingsByDateRange() {
  return action('loadBookingsByDateRange', 'SQL', {
    datasourceName: 'Nail Designer Booking DB',
    query: `
      SELECT
        b.id, b.client_id, b.service_id, b.booking_date, b.start_time, b.end_time, b.status, b.created_at,
        u.name AS client_name, u.email AS client_email,
        s.name AS service_name, s.duration_minutes, s.price
      FROM bookings b
      JOIN users u ON u.id = b.client_id
      JOIN services s ON s.id = b.service_id
      WHERE b.booking_date >= {{params.startDate}}::date
        AND b.booking_date <= {{params.endDate}}::date
      ORDER BY b.booking_date ASC, b.start_time ASC;
    `,
  });
}

export default loadBookingsByDateRange;
