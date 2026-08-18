import { action } from '@uibakery/data';

function deleteBlockedDate() {
  return action('deleteBlockedDate', 'SQL', {
    datasourceName: 'Nail Designer Booking DB',
    query: `
      DELETE FROM blocked_dates
      WHERE id = {{params.id}}::bigint;
    `,
  });
}

export default deleteBlockedDate;
