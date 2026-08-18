import { action } from '@uibakery/data';

function createBooking() {
  return action('createBooking', 'SQL', {
    datasourceName: 'Nail Designer Booking DB',
    query: `
      INSERT INTO bookings (client_id, service_id, booking_date, start_time, end_time, status)
      VALUES ({{params.clientId}}::bigint, {{params.serviceId}}::bigint, {{params.bookingDate}}::date, {{params.startTime}}::time, {{params.endTime}}::time, 'confirmed')
      RETURNING id;
    `,
  });
}

export default createBooking;
