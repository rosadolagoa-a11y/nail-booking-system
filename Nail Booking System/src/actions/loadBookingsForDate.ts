import { action } from '@uibakery/data';

function loadBookingsForDate() {
  return action('loadBookingsForDate', 'SQL', {
    datasourceName: 'Nail Designer Booking DB',
    query: `
      SELECT id, service_id, booking_date, start_time, end_time, status
      FROM bookings
      WHERE booking_date = {{params.bookingDate}}::date
        AND status != 'cancelled';
    `,
  });
}

export default loadBookingsForDate;
