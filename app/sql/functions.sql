CREATE OR REPLACE FUNCTION get_appointments()
RETURNS TABLE(
    id integer,
    doctors JSON
)
AS $$
    SELECT a.id, COALESCE(json_agg(u) FILTER (where u.id IS NOT NULL), '[]') as doctors
    FROM appointments a LEFT  JOIN users u ON (u.id= a.userid)
    GROUP BY a.id
   $$
LANGUAGE sql;

-- My sql example
SELECT a.id,
GROUP_CONCAT(
  JSON_OBJECT(
    'name', u.name,
    'id', u.id
  )
)
FROM appointments a LEFT  JOIN users u ON (u.id= a.userid)
GROUP BY  a.id;