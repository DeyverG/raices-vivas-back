const db = require('../../config/database');

class ExperiencesRepository {
  async findAll(filters = {}) {
    if (db.getIsPgConnected()) {
      let sql = `SELECT * FROM experiences WHERE 1=1`;
      const values = [];
      let counter = 1;

      if (filters.search) {
        sql += ` AND (LOWER(title) LIKE $${counter} OR LOWER(summary) LIKE $${counter})`;
        values.push(`%${filters.search.toLowerCase()}%`);
        counter++;
      }
      if (filters.region) {
        sql += ` AND region LIKE $${counter}`;
        values.push(`%${filters.region}%`);
        counter++;
      }
      if (filters.type) {
        sql += ` AND type = $${counter}`;
        values.push(filters.type);
        counter++;
      }
      if (filters.language) {
        sql += ` AND language = $${counter}`;
        values.push(filters.language);
        counter++;
      }
      if (filters.duration) {
        sql += ` AND duration = $${counter}`;
        values.push(filters.duration);
        counter++;
      }
      if (filters.status) {
        sql += ` AND status = $${counter}`;
        values.push(filters.status);
        counter++;
      }

      sql += ` ORDER BY created_at DESC`;
      const res = await db.query(sql, values);
      return res.rows;
    }

    // Memory fallback cross-filtering logic
    return db.memoryDb.experiences.filter(exp => {
      if (filters.status && exp.status !== filters.status) return false;
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const matches = exp.title.toLowerCase().includes(term) || exp.summary.toLowerCase().includes(term);
        if (!matches) return false;
      }
      if (filters.region && !exp.region.includes(filters.region)) return false;
      if (filters.type && exp.type !== filters.type) return false;
      if (filters.language && exp.language !== filters.language) return false;
      if (filters.duration && exp.duration !== filters.duration) return false;
      return true;
    });
  }

  async findById(id) {
    if (db.getIsPgConnected()) {
      const res = await db.query(`SELECT * FROM experiences WHERE id = $1`, [id]);
      return res.rows[0] || null;
    }
    return db.memoryDb.experiences.find(e => e.id === id) || null;
  }

  async create(expData) {
    const newExp = {
      id: `exp-${Date.now()}`,
      title: expData.title,
      region: expData.region,
      type: expData.type,
      duration: expData.duration,
      price: Number(expData.price),
      language: expData.language,
      max_capacity: Number(expData.maxCapacity || 10),
      summary: expData.summary,
      description: expData.description || expData.summary,
      includes: expData.includes || [],
      host_community: expData.hostCommunity,
      image_url: expData.imageUrl,
      status: 'pendiente', // HU-02-01 default pending status
      created_by: expData.createdBy || 'usr-community',
      created_at: new Date().toISOString()
    };

    if (db.getIsPgConnected()) {
      await db.query(
        `INSERT INTO experiences (id, title, region, type, duration, price, language, max_capacity, summary, description, includes, host_community, image_url, status, created_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          newExp.id,
          newExp.title,
          newExp.region,
          newExp.type,
          newExp.duration,
          newExp.price,
          newExp.language,
          newExp.max_capacity,
          newExp.summary,
          newExp.description,
          JSON.stringify(newExp.includes),
          newExp.host_community,
          newExp.image_url,
          newExp.status,
          newExp.created_by,
          newExp.created_at
        ]
      );
    } else {
      db.memoryDb.experiences.unshift(newExp);
    }
    return newExp;
  }

  async updateStatus(id, newStatus) {
    if (db.getIsPgConnected()) {
      const res = await db.query(`UPDATE experiences SET status = $1 WHERE id = $2 RETURNING *`, [newStatus, id]);
      return res.rows[0] ? { ...res.rows[0], status: newStatus } : null;
    } else {
      const found = db.memoryDb.experiences.find(e => e.id === id);
      if (found) {
        found.status = newStatus;
      }
      return found;
    }
  }


}

module.exports = new ExperiencesRepository();

