/* Pure campaign save and continuity helpers. Kept separate so session behavior can be tested. */
(function (root) {
  function newSession(plan, number) {
    const planned = plan?.sessions?.find(item => Number(item.number) === number) || plan?.sessions?.[number - 1];
    return {
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      number,
      title: planned?.title || `Session ${number}`,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      endedAt: null,
      summary: '',
      summaryLogLength: 0,
      summaryLastAt: 0,
      notes: '',
      log: []
    };
  }

  function normalizeSave(raw, legacyLog) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) raw = {};
    const sessions = Array.isArray(raw.sessions) ? raw.sessions.filter(item => item && typeof item === 'object').map((item, index) => ({
      id: String(item.id || `migrated-${index + 1}`),
      number: Number(item.number) || index + 1,
      title: String(item.title || `Session ${index + 1}`),
      startedAt: item.startedAt || new Date().toISOString(),
      updatedAt: item.updatedAt || item.startedAt || new Date().toISOString(),
      endedAt: item.endedAt || null,
      summary: String(item.summary || ''),
      summaryLogLength: Number(item.summaryLogLength) || 0,
      summaryLastAt: Number(item.summaryLastAt) || 0,
      notes: String(item.notes || ''),
      log: Array.isArray(item.log) ? item.log.filter(entry => entry && (entry.who === 'dm' || entry.who === 'user') && typeof entry.text === 'string').slice(-500) : []
    })) : [];
    if (!sessions.length && Array.isArray(legacyLog) && legacyLog.length) {
      const migrated = newSession(raw.plan, 1);
      migrated.log = legacyLog.filter(entry => entry && (entry.who === 'dm' || entry.who === 'user') && typeof entry.text === 'string').slice(-500);
      sessions.push(migrated);
    }
    const activeSessionId = sessions.some(item => item.id === raw.activeSessionId) ? raw.activeSessionId : sessions.at(-1)?.id || null;
    return { inputs: raw.inputs && typeof raw.inputs === 'object' ? raw.inputs : {}, plan: raw.plan && typeof raw.plan === 'object' ? raw.plan : null, sessions, activeSessionId };
  }

  function continuity(sessions, activeSessionId) {
    const current = sessions.find(item => item.id === activeSessionId);
    const previous = sessions.filter(item => item.id !== activeSessionId && item.number < (current?.number || Infinity));
    const history = previous.map(item => {
      const memory = [item.summary, item.notes].filter(Boolean).join('\nDM notes: ');
      const fallback = item.log.slice(-35).map(entry => `${entry.who === 'dm' ? 'DM' : 'PLAYER'}: ${entry.text}`).join('\n');
      return `Session ${item.number} — ${item.title}\n${memory || fallback || 'No chronicle saved.'}`;
    }).join('\n\n').slice(-30000);
    const currentLog = (current?.log || []).slice(-80).map(entry => `${entry.who === 'dm' ? 'DM' : 'PLAYER'}: ${entry.text}`).join('\n').slice(-18000);
    return { history, currentLog, current };
  }

  const api = { newSession, normalizeSave, continuity };
  root.CampaignMemory = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
