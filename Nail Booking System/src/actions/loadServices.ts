import { action } from '@uibakery/data';

function loadServices() {
  return action('loadServices', 'SQL', {
    datasourceName: 'Nail Designer Booking DB',
    query: `
      SELECT id, name, description, duration_minutes, price, is_active, created_at, updated_at
      FROM services
      ORDER BY name ASC;
    `,
  });
}

export default loadServices;
