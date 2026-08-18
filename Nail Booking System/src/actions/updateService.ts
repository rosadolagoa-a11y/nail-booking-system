import { action } from '@uibakery/data';

function updateService() {
  return action('updateService', 'SQL', {
    datasourceName: 'Nail Designer Booking DB',
    query: `
      UPDATE services
      SET
        name = {{params.name}},
        description = {{params.description}},
        duration_minutes = {{params.durationMinutes}}::int,
        price = {{params.price}}::numeric,
        is_active = {{params.isActive}}::boolean,
        updated_at = NOW()
      WHERE id = {{params.id}}::bigint;
    `,
  });
}

export default updateService;
