-- Strip HTML tags from FAQ question and answer fields
-- Handles common patterns: <p>, <ul>, <li>, <strong>, <em>, <br>, etc.

UPDATE "faqs"
SET
  "question" = regexp_replace("question", '<[^>]+>', '', 'g'),
  "answer"   = regexp_replace(
                 regexp_replace(
                   regexp_replace("answer", '<li>', '- ', 'g'),
                   '<br\s*/?>', E'\n', 'g'
                 ),
                 '<[^>]+>', '', 'g'
               )
WHERE "question" ~ '<[^>]+>' OR "answer" ~ '<[^>]+>';

-- Trim leading/trailing whitespace left by tag removal
UPDATE "faqs"
SET
  "question" = trim("question"),
  "answer"   = trim("answer")
WHERE "question" != trim("question") OR "answer" != trim("answer");
