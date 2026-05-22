const pool = require('../config/db');

const getTotalPutusan = async (req, res) => {
  try {
    const query = `
      WITH latest_year AS (
        SELECT EXTRACT(YEAR FROM MAX(court_date::date)) as max_year 
        FROM cases 
        WHERE court_date IS NOT NULL
      )
      SELECT 
        COUNT(CASE WHEN EXTRACT(YEAR FROM court_date::date) = max_year THEN 1 END)::int as cases_current,
        COUNT(CASE WHEN EXTRACT(YEAR FROM court_date::date) = max_year - 1 THEN 1 END)::int as cases_previous
      FROM cases, latest_year;
    `;
    
    const result = await pool.query(query);
    const { cases_current, cases_previous } = result.rows[0];

    let percentageChange = 0;
    let isTrendingDown = true; 

    if (cases_previous > 0) {
      const diff = cases_current - cases_previous;
      percentageChange = (Math.abs(diff) / cases_previous) * 100;
      isTrendingDown = diff < 0; 
    } else if (cases_current > 0) {
      percentageChange = 100;
      isTrendingDown = false;
    }

    res.json({
      totalCurrentYear: cases_current || 0,
      totalPrevYear: cases_previous || 0,
      percentage: percentageChange.toFixed(1),
      isTrendingDown 
    });

  } catch (err) {
    console.error("Error pada getTotalPutusan:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getTotalPutusan,
};