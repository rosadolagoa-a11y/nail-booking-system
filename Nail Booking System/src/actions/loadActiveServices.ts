import { action } from '@uibakery/data';

function loadActiveServices() {
  return action('loadActiveServices', 'SQL', {
    datasourceName: 'Nail Designer Booking DB',
    query: `
      SELECT id, name, description, duration_minutes, price, is_active
      FROM services
      WHERE is_active = TRUE
      ORDER BY name ASC;
    `,
  });
}

export default loadActiveServices;
