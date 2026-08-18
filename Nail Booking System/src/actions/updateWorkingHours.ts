import { action } from '@uibakery/data';

function updateWorkingHours() {
  return action('updateWorkingHours', 'SQL', {
    datasourceName: 'Nail Designer Booking DB',
    query: `
      UPDATE working_hours
      SET
        start_time = {{params.startTime}}::time,
        end_time = {{params.endTime}}::time,
        is_closed = {{params.isClosed}}::boolean
      WHERE day_of_week = {{params.dayOfWeek}}::int;
    `,
  });
}

export default updateWorkingHours;
