import { action } from '@uibakery/data';

function createService() {
  return action('createService', 'SQL', {
    datasourceName: 'Nail Designer Booking DB',
    query: `
      INSERT INTO services (name, description, duration_minutes, price, is_active)
      VALUES ({{params.name}}, {{params.description}}, {{params.durationMinutes}}::int, {{params.price}}::numeric, {{params.isActive}}::boolean)
      RETURNING id;
    `,
  });
}

export default createService;
