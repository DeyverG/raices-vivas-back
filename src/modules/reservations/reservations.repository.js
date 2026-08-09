const db = require('../../config/database');

class ReservationsRepository {
  async findAll(user = null) {
    if (db.getIsPgConnected()) {
      let sql = `SELECT * FROM reservations`;
      const values = [];
      if (user && user.role === 'Visitante') {
        sql += ` WHERE visitor_id = $1`;
        values.push(user.id);
      }
      sql += ` ORDER BY created_at DESC`;
      const res = await db.query(sql, values);
      return res.rows;
    }

    if (user && user.role === 'Visitante') {
      return db.memoryDb.reservations.filter(r => r.visitor_id === user.id || r.visitor_email === user.email);
    }
    return db.memoryDb.reservations;
  }

  async findById(id) {
    if (db.getIsPgConnected()) {
      const res = await db.query(`SELECT * FROM reservations WHERE id = $1`, [id]);
      return res.rows[0] || null;
    }
    return db.memoryDb.reservations.find(r => r.id === id) || null;
  }

  async create(resData) {
    const resId = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRes = {
      id: resId,
      experience_id: resData.experienceId,
      experience_title: resData.experienceTitle,
      visitor_id: resData.visitorId,
      visitor_name: resData.visitorName,
      visitor_email: resData.visitorEmail,
      host_community: resData.hostCommunity,
      visit_date: resData.visitDate,
      travelers_count: Number(resData.travelersCount),
      total_price: Number(resData.totalPrice),
      special_requests: resData.specialRequests || '',
      status: 'pendiente',
      created_at: new Date().toISOString()
    };

    if (db.getIsPgConnected()) {
      await db.query(
        `INSERT INTO reservations (id, experience_id, visitor_id, visitor_name, visitor_email, host_community, visit_date, travelers_count, total_price, special_requests, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          newRes.id,
          newRes.experience_id,
          newRes.visitor_id,
          newRes.visitor_name,
          newRes.visitor_email,
          newRes.host_community,
          newRes.visit_date,
          newRes.travelers_count,
          newRes.total_price,
          newRes.special_requests,
          newRes.status,
          newRes.created_at
        ]
      );
    } else {
      db.memoryDb.reservations.unshift(newRes);
    }
    return newRes;
  }

  async updateStatus(id, newStatus) {
    if (db.getIsPgConnected()) {
      const res = await db.query(`UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *`, [newStatus, id]);
      return res.rows[0] ? { ...res.rows[0], status: newStatus } : null;
    } else {
      const found = db.memoryDb.reservations.find(r => r.id === id);
      if (found) {
        found.status = newStatus;
      }
      return found;
    }
  }


}

module.exports = new ReservationsRepository();

