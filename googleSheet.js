const { google } = require('googleapis');
const path = require('path');

// credentials.json joylashgan joy (loyiha ildizida bo‘lsa, __dirname bilan chaqiramiz)
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'credentials.json'), // yoki .env orqali yo'l berish mumkin
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function appendToSheet({ section, message, phone, id }) {
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'A2',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [[new Date().toISOString(), id, section, message, phone]],
    },
  });
}

module.exports = { appendToSheet };
