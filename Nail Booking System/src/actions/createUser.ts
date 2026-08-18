import { action } from '@uibakery/data';

function createUser() {
  return action('createUser', 'SQL', {
    datasourceName: 'Nail Designer Booking DB',
    query: `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ({{params.name}}, {{params.email}}, {{params.passwordHash}}, {{params.role}})
      RETURNING id, name, email, role, created_at;
    `,
  });
}

export default createUser;
