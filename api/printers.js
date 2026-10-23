export default function handler(_req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.status(200).json({ printers: [
    { id: 'P1', name: 'Bambu Lab X1 Carbon', unit: 'Printer 01', state: 'Available', hours: 0, color: '#6883a8' },
    { id: 'P2', name: 'Bambu Lab P1S', unit: 'Printer 02', state: 'Available', hours: 0, color: '#57a47d' },
    { id: 'P3', name: 'Bambu Lab A1', unit: 'Printer 03', state: 'Available', hours: 0, color: '#d89a58' },
    { id: 'P4', name: 'Bambu Lab P1P', unit: 'Printer 04', state: 'Available', hours: 0, color: '#9b7db0' }
  ] });
}
