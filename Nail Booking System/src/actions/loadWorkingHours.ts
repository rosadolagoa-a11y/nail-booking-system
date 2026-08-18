import { action } from '@uibakery/data';

function loadWorkingHours() {
  return action('loadWorkingHours', 'SQL', {
    datasourceName: 'Nail Designer Booking DB',
    query: `
      SELECT id, day_of_week, start_time, end_time, is_closed
      FROM working_hours
      ORDER BY day_of_week ASC;
    `,
  });
}

export default loadWorkingHours;
