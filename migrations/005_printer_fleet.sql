-- Match the workshop's three physical machines. Existing P1/P2/P3 bookings
-- stay attached to their printer IDs; P4 is retired from new bookings.
UPDATE printers
SET name = 'Bambu Lab P2S', unit = 'Printer 01', enabled = true, color = '#6883a8'
WHERE id = 'P1';

UPDATE printers
SET name = 'Bambu Lab P2S', unit = 'Printer 02', enabled = true, color = '#57a47d'
WHERE id = 'P2';

UPDATE printers
SET name = 'Bambu Lab X2D', unit = 'Printer 03', enabled = true, color = '#d89a58'
WHERE id = 'P3';

UPDATE printers
SET name = 'Retired printer', unit = 'Inactive', enabled = false
WHERE id = 'P4';

