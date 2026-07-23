/**
 * LEAP Growth — shared Google Sheets submission helper.
 * Set GOOGLE_SCRIPT_URL once here; all landing/assessment pages use this file.
 */
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzGOFhO4gyw_Yqiy3mPuHnbNiUzINQb0YOuDnp9EdBm3pyDsrTJWefsxRD4Gb6wN6Cn/exec';

/**
 * POST JSON payload to the LEAP Apps Script Web App.
 * @param {Object} payload - Must include sheetName
 * @returns {Promise<{status: string, message?: string}>}
 */
async function submitToLeapSheet(payload) {
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.indexOf('PASTE_YOUR') === 0) {
    console.warn('GOOGLE_SCRIPT_URL is not configured — skipping Google Sheets submission.');
    return { status: 'skipped', message: 'URL not configured' };
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Sheet submission failed:', error);
    return { status: 'error', message: error.message || 'Network error' };
  }
}
