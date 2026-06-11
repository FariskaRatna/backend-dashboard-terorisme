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

const getEksekusiRencana = async (req, res) => {
  try {
    const query = `
      WITH latest_year AS (
          SELECT EXTRACT(YEAR FROM MAX(court_date::date)) AS max_year
          FROM cases
          WHERE court_date IS NOT NULL
      )
      SELECT
          COUNT(
              CASE
                  WHEN EXTRACT(YEAR FROM court_date::date) = max_year
                  AND has_attack_plan::text IN ('t', 'true', '1')
                  THEN 1
              END
          )::int AS total_plan_current,

          COUNT(
              CASE
                  WHEN EXTRACT(YEAR FROM court_date::date) = max_year
                  AND has_attack_plan::text IN ('t', 'true', '1')
                  AND injury_severity IS NOT NULL
                  AND injury_severity != 'Tidak Diketahui'
                  THEN 1
              END
          )::int AS execution_current,

          COUNT(
              CASE
                  WHEN EXTRACT(YEAR FROM court_date::date) = max_year - 1
                  AND has_attack_plan::text IN ('t', 'true', '1')
                  THEN 1
              END
          )::int AS total_plan_prev,

          COUNT(
              CASE
                  WHEN EXTRACT(YEAR FROM court_date::date) = max_year - 1
                  AND has_attack_plan::text IN ('t', 'true', '1')
                  AND injury_severity IS NOT NULL
                  AND injury_severity != 'Tidak Diketahui'
                  THEN 1
              END
          )::int AS execution_prev

      FROM cases, latest_year;
    `

    const result = await pool.query(query);
    const { total_plan_current, execution_current, total_plan_prev, execution_prev } = result.rows[0];

    let executionRate = 0;
    if (total_plan_current > 0) {
      executionRate = (execution_current / total_plan_current) * 100;
    }

    let yoyPercentage = 0;
    let isTrendingDown = true; 

    if (execution_prev > 0) {
      const diff = execution_current - execution_prev;
      yoyPercentage = (Math.abs(diff) / execution_prev) * 100;
      isTrendingDown = diff < 0; 
    } else if (execution_current > 0) {
      yoyPercentage = 100;
      isTrendingDown = false;
    }

    res.json({
      totalPlan: total_plan_current || 0,
      totalExecution: execution_current || 0,
      executionRate: executionRate.toFixed(1),
      yoyPercentage: yoyPercentage.toFixed(1),
      isTrendingDown
    });

  } catch (err) {
    console.error("Error pada getEksekusiRencana:", err);
    res.status(500).json({ error: err.message });
  }
};

const getSumberRadikalisasi = async (req, res) => {
  try {
    const query = `
      WITH latest_year AS (
        SELECT EXTRACT(YEAR FROM MAX(court_date::date)) AS max_year
        FROM cases
        WHERE court_date IS NOT NULL
      ),
      sources_data AS (
        SELECT
          rs.id,
          cfs.classified_name,
          EXTRACT(YEAR FROM c.court_date::date) as case_year,
          CASE WHEN cfs.classified_name ILIKE '%online%'
                OR cfs.classified_name ILIKE '%sosial%'
                OR cfs.classified_name ILIKE '%internet%'
                OR cfs.classified_name ILIKE '%media%'
              THEN 1 ELSE 0 END as is_online
        FROM radicalization_sources rs
        JOIN cases c ON rs.id_cases = c.id
        JOIN classified_factors_source cfs ON rs.id_classified = cfs.id
        CROSS JOIN latest_year ly
        WHERE EXTRACT(YEAR FROM c.court_date::date) IN (ly.max_year, ly.max_year - 1)
          AND cfs.classified_type = 'radicalization'
      ),
      current_year_sources AS (
        SELECT * FROM sources_data WHERE case_year = (SELECT max_year FROM latest_year)
      ),
      prev_year_sources AS (
        SELECT * FROM sources_data WHERE case_year = (SELECT max_year - 1 FROM latest_year)
      ),
      top_category AS (
        SELECT classified_name, COUNT(*) as cnt
        FROM current_year_sources
        GROUP BY classified_name
        ORDER BY cnt DESC
        LIMIT 1
      )
      SELECT
        (SELECT classified_name FROM top_category) as top_channel,
        (SELECT cnt FROM top_category)::int as top_channel_count,
        (SELECT COUNT(*) FROM current_year_sources)::int as total_current,
        (SELECT COALESCE(SUM(is_online), 0) FROM current_year_sources)::int as online_current,
        (SELECT COALESCE(SUM(is_online), 0) FROM prev_year_sources)::int as online_prev,
        (SELECT COUNT(*) FROM prev_year_sources)::int as total_prev;
    `;

    const result = await pool.query(query);
    const data = result.rows[0] || {}

    const top_channel = data.top_channel || "TIDAK DIKETAHUI";
    const top_channel_count = data.top_channel_count || 0;
    const total_current = data.total_current || 0;
    const online_current = data.online_current || 0;
    const online_prev = data.online_prev || 0;
    const total_prev = data.total_prev || 0;

    let channelPercentage = 0;
    if (total_current > 0) {
      channelPercentage = (top_channel_count / total_current) * 100;
    }
    
    let onlineRateCurrent = 0;
    if (total_current > 0) {
      onlineRateCurrent = (online_current / total_current) * 100;
    }

    let onlineRatePrev = 0;
    if (total_prev > 0) {
      onlineRatePrev = (online_prev / total_prev) * 100;
    }

    const diff = onlineRateCurrent - onlineRatePrev;
    const yoyPercentage = Math.abs(diff);
    const isTrendingDown = diff < 0;

    res.json({
      topChannel: top_channel,
      channelPercentage: channelPercentage.toFixed(1),
      onlineRate: onlineRateCurrent.toFixed(1),
      yoyPercentage: yoyPercentage.toFixed(1),
      isTrendingDown
    });

  } catch (err) {
    console.error("Error pada getSumberRadikalisasi: ", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getTotalPutusan,
  getEksekusiRencana,
  getSumberRadikalisasi,
};