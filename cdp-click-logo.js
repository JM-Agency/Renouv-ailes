const WebSocket = require('ws');
const http = require('http');
const PORT = 9333;
const url = process.argv[2];
function getWsUrl() {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port: PORT, path: `/json/new?${encodeURIComponent(url)}`, method: 'PUT' }, (res) => {
      let data = ''; res.on('data', d => data += d); res.on('end', () => resolve(JSON.parse(data).webSocketDebuggerUrl));
    }); req.on('error', reject); req.end();
  });
}
function send(ws, id, method, params) {
  return new Promise((resolve) => {
    const handler = (msg) => { const p = JSON.parse(msg); if (p.id === id) { ws.removeListener('message', handler); resolve(p.result); } };
    ws.on('message', handler); ws.send(JSON.stringify({ id, method, params }));
  });
}
(async () => {
  const wsUrl = await getWsUrl();
  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.on('open', r));
  await send(ws, 1, 'Runtime.enable', {});
  await send(ws, 2, 'Page.enable', {});
  await new Promise(r => setTimeout(r, 1500));
  const r = await send(ws, 3, 'Runtime.evaluate', {
    expression: `
      (function(){
        var a = document.querySelector('.nav-brand');
        return a.href;
      })()
    `,
    returnByValue: true,
  });
  console.log('resolved href:', r.result.value);
  const nav = await send(ws, 4, 'Runtime.evaluate', {
    expression: `document.querySelector('.nav-brand').click(); 'clicked'`,
  });
  await new Promise(r => setTimeout(r, 1200));
  const r2 = await send(ws, 5, 'Runtime.evaluate', { expression: `location.href`, returnByValue: true });
  console.log('after click, location:', r2.result.value);
  const r3 = await send(ws, 6, 'Runtime.evaluate', { expression: `document.title`, returnByValue: true });
  console.log('title:', r3.result.value);
  ws.close(); process.exit(0);
})();
