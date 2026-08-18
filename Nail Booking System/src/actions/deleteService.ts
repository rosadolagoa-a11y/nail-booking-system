import { action } from '@uibakery/data';

function deleteService() {
  return action('deleteService', 'SQL', {
    datasourceName: 'Nail Designer Booking DB',
    query: `
      DELETE FROM services
      WHERE id = {{params.id}}::bigint;
    `,
  });
}

export default deleteService;
