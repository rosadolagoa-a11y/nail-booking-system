import { action } from '@uibakery/data';

function createBlockedDate() {
  return action('createBlockedDate', 'SQL', {
    datasourceName: 'Nail Designer Booking DB',
    query: `
      INSERT INTO blocked_dates (blocked_date, reason)
      VALUES ({{params.blockedDate}}::date, {{params.reason}})
      ON CONFLICT (blocked_date) DO NOTHING
      RETURNING id;
    `,
  });
}

export default createBlockedDate;
