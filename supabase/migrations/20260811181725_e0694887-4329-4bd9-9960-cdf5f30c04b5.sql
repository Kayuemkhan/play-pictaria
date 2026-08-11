-- Remove old artist codes
DELETE FROM beta_codes
WHERE code IN ('ARTISTFREE2', 'ARTIST-R29L');

-- Ensure ARTIST3 exists (3 months free)
INSERT INTO beta_codes (code, tier, max_uses, expires_at, note)
VALUES ('ARTIST3', 'artist', 10000, '2026-11-11T23:59:59+00:00', '3 months free Artist Studio access')
ON CONFLICT (code) DO UPDATE SET
  tier = EXCLUDED.tier,
  max_uses = EXCLUDED.max_uses,
  expires_at = EXCLUDED.expires_at,
  note = EXCLUDED.note,
  disabled = false;

-- Update BRANDSTUDIO50 description
UPDATE beta_codes
SET note = '50% off Brand Studio forever'
WHERE code = 'BRANDSTUDIO50';
