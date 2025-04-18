const sessions = new Map();

function setSession(chatId, key, value) {
  if (!sessions.has(chatId)) sessions.set(chatId, {});
  sessions.get(chatId)[key] = value;
}

function getSession(chatId) {
  return sessions.get(chatId) || {};
}

function clearSession(chatId) {
  sessions.delete(chatId);
}

module.exports = { setSession, getSession, clearSession };
