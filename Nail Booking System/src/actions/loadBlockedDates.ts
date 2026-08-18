import { action } from '@uibakery/data';

function loadBlockedDates() {
  return action('loadBlockedDates', 'SQL', {
    datasourceName: 'Nail Designer Booking DB',
    query: `
      SELECT id, blocked_date, reason, created_at
      FROM blocked_dates
      ORDER BY blocked_date ASC;
    `,
  });
}

export default loadBlockedDates;
