import { action } from '@uibakery/data';

function findUserByEmail() {
  return action('findUserByEmail', 'SQL', {
    datasourceName: 'Nail Designer Booking DB',
    query: `
      SELECT id, name, email, password_hash, role, created_at
      FROM users
      WHERE email = {{ params.email }};
    `,
  });
}

export default findUserByEmail;
