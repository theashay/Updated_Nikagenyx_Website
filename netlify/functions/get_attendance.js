const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    const { emp_id } = JSON.parse(event.body);

    if (!emp_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing emp_id' })
      };
    }

    const result = await pool.query(
      `SELECT date, clock_in, clock_out
       FROM attendance
       WHERE emp_id = $1
       ORDER BY date DESC
       LIMIT 30`,
      [emp_id]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ records: result.rows })
    };

  } catch (err) {
    console.error("Error fetching attendance:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error", error: err.message })
    };
  }
};
