const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { newSession, normalizeSave, continuity } = require('../session-memory.js');

test('migrates the previous single chronicle into Session 1', () => {
  const legacy = [{ who: 'user', text: 'We enter the ruins.', at: 123 }];
  const save = normalizeSave({ plan: { title: 'The Ashen Crown' }, inputs: { name: 'The Ashen Crown' } }, legacy);
  assert.equal(save.sessions.length, 1);
  assert.equal(save.sessions[0].number, 1);
  assert.deepEqual(save.sessions[0].log, legacy);
  assert.equal(save.activeSessionId, save.sessions[0].id);
});

test('new sessions follow the planned title', () => {
  const session = newSession({ sessions: [{ number: 2, title: 'The Broken Gate' }] }, 2);
  assert.equal(session.number, 2);
  assert.equal(session.title, 'The Broken Gate');
  assert.deepEqual(session.log, []);
});

test('continuity uses previous recaps and current dialogue without future sessions', () => {
  const sessions = [
    { id: 'one', number: 1, title: 'Opening', summary: 'The party promised to protect Mira.', notes: '', log: [] },
    { id: 'two', number: 2, title: 'The Gate', summary: '', notes: 'Mira is waiting outside.', log: [{ who: 'user', text: 'We open the gate.' }] },
    { id: 'three', number: 3, title: 'Later', summary: 'A later event.', notes: '', log: [] }
  ];
  const memory = continuity(sessions, 'two');
  assert.match(memory.history, /promised to protect Mira/);
  assert.doesNotMatch(memory.history, /A later event/);
  assert.match(memory.currentLog, /We open the gate/);
  assert.equal(memory.current.id, 'two');
});

test('normalization discards malformed transcript entries', () => {
  const save = normalizeSave({ sessions: [{ id: 'one', log: [null, { who: 'user', text: 'hello' }, { who: 'other', text: 'ignore' }] }] });
  assert.equal(save.sessions[0].log.length, 1);
  assert.equal(save.sessions[0].log[0].text, 'hello');
});

test('exported session recaps and manual notes survive a reload', () => {
  const original = {
    plan: { title: 'The Ashen Crown' },
    sessions: [{ id: 'one', number: 1, title: 'Opening', summary: 'Mira joined the party.', summaryLogLength: 1, summaryLastAt: 42, notes: 'Mira owes Keth a favor.', log: [{ who: 'dm', text: 'Mira joins you.', at: 42 }] }],
    activeSessionId: 'one'
  };
  const loaded = normalizeSave(JSON.parse(JSON.stringify(original)));
  assert.equal(loaded.sessions[0].summary, 'Mira joined the party.');
  assert.equal(loaded.sessions[0].notes, 'Mira owes Keth a favor.');
  assert.equal(loaded.sessions[0].summaryLastAt, 42);
  assert.equal(loaded.activeSessionId, 'one');
});

test('live-session controls used by the app exist in the page', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]));
  for (const id of ['playWorldButton', 'sessionList', 'newSessionButton', 'sessionRecap', 'sessionSummaryWrap', 'sessionSummary', 'saveRecapButton', 'aiRecapButton', 'exportSave', 'importSave', 'transcript']) {
    assert.ok(ids.has(id), `Missing #${id}`);
  }
});
