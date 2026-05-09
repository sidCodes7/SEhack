// AquaSentinel — Report Generation Route
// Spawns Python script to generate styled PDF alert reports

import { Router } from 'express';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * POST /api/report/generate
 * Body: alert dispatch data object
 * Returns: PDF binary stream
 */
router.post('/generate', async (req, res) => {
  const tmpDir = os.tmpdir();
  const timestamp = Date.now();
  const inputFile = path.join(tmpDir, `aqua_report_input_${timestamp}.json`);
  const outputFile = path.join(tmpDir, `aqua_report_output_${timestamp}.pdf`);

  try {
    const alertData = req.body;
    if (!alertData || Object.keys(alertData).length === 0) {
      return res.status(400).json({ error: 'Alert data is required' });
    }

    const scriptPath = path.resolve(__dirname, '..', 'scripts', 'generate_report.py');

    // Write alert data to temp JSON file
    fs.writeFileSync(inputFile, JSON.stringify(alertData), 'utf-8');

    // Run Python script: reads from input file, writes PDF to output file
    execFile('python', [scriptPath, inputFile, outputFile], { timeout: 30000 }, (error, stdout, stderr) => {
      // Clean up input file
      try { fs.unlinkSync(inputFile); } catch {}

      if (error) {
        console.error(`[Report] Python error:`, stderr || error.message);
        try { fs.unlinkSync(outputFile); } catch {}
        return res.status(500).json({
          error: 'Failed to generate report',
          details: (stderr || error.message).split('\n').filter(l => !l.includes('UserWarning')).join('\n'),
        });
      }

      // Check output file exists
      if (!fs.existsSync(outputFile)) {
        return res.status(500).json({ error: 'Report file was not generated' });
      }

      // Read and send the PDF
      const pdfBuffer = fs.readFileSync(outputFile);

      // Clean up output file
      try { fs.unlinkSync(outputFile); } catch {}

      // Generate filename
      const zoneName = (alertData.zone_name || 'unknown').replace(/\s+/g, '_').toLowerCase();
      const severity = (alertData.severity || 'alert').toUpperCase();
      const filename = `AquaSentinel_${severity}_${zoneName}_${timestamp}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    });

  } catch (err) {
    console.error('[Report] Error:', err);
    try { fs.unlinkSync(inputFile); } catch {}
    try { fs.unlinkSync(outputFile); } catch {}
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
