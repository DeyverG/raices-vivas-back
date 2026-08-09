const db = require('../../config/database');

class AuthRepository {
  async findByEmail(email) {
    if (db.getIsPgConnected()) {
      const res = await db.query(`SELECT * FROM users WHERE LOWER(email) = LOWER($1)`, [email]);
      return res.rows[0] || null;
    }
    return db.memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findById(id) {
    if (db.getIsPgConnected()) {
      const res = await db.query(`SELECT * FROM users WHERE id = $1`, [id]);
      return res.rows[0] || null;
    }
    return db.memoryDb.users.find(u => u.id === id) || null;
  }

  async createUser({ id, fullName, email, passwordHash, role, communityName, dataConsent, consentTimestamp }) {
    const newUser = {
      id,
      full_name: fullName,
      email,
      password_hash: passwordHash,
      role,
      community_name: communityName || '',
      data_consent: !!dataConsent,
      consent_timestamp: consentTimestamp || new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    if (db.getIsPgConnected()) {
      await db.query(
        `INSERT INTO users (id, full_name, email, password_hash, role, community_name, data_consent, consent_timestamp, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          newUser.id,
          newUser.full_name,
          newUser.email,
          newUser.password_hash,
          newUser.role,
          newUser.community_name,
          newUser.data_consent,
          newUser.consent_timestamp,
          newUser.created_at
        ]
      );
    } else {
      db.memoryDb.users.push(newUser);
    }
    return newUser;
  }

}

module.exports = new AuthRepository();

