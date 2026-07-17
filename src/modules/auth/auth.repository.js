const db = require('../../config/db');

const userColumns = 'id, email, role, created_at, updated_at';

const findByEmail = async (email) => {
  const result = await db.query(
    `SELECT id, email, role, password_hash, created_at, updated_at FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
};

const findById = async (id) => {
  const result = await db.query(
    `SELECT ${userColumns} FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const createUser = async ({ email, passwordHash, role = 'user' }) => {
  const result = await db.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, $3)
     RETURNING ${userColumns}`,
    [email, passwordHash, role]
  );
  return result.rows[0];
};

module.exports = {
  findByEmail,
  findById,
  createUser,
};
