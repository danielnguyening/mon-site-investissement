/* Barre « Dernière mise à jour » + bouton « Mettre à jour ».
   Le bouton lance la tâche GitHub Actions « update-data.yml », puis la page se recharge
   toute seule quand les nouvelles données sont publiées (10 à 15 minutes).
   Le jeton GitHub éventuel reste uniquement dans le navigateur de l'appareil (localStorage). */
(function () {
  var REPO = 'danielnguyening/mon-site-investissement';
  var WF = 'update-data.yml';
  var K_TOKEN = 'msi_gh_token', K_WAIT = 'msi_upd_wait';
  var script = document.currentScript;
  var base = script ? script.src.replace(/update\.js(\?.*)?$/, '') : '';
  var lang = (document.documentElement.lang || 'fr').slice(0, 2);
  var T = {
    fr: { locale: 'fr-FR', last: 'Données mises à jour le', unknown: 'Date de mise à jour inconnue', btn: 'Mettre à jour', auto: 'Mises à jour automatiques chaque jour à 7 h et 16 h (heure du Vietnam).',
      running: 'Mise à jour en cours : les nouveaux chiffres arrivent dans 10 à 15 minutes. La page se rechargera toute seule.', started: 'Lancée à', cancel: 'Arrêter d’attendre',
      timeout: 'Pas de nouvelles données après 40 minutes. Vérifie l’onglet Actions sur GitHub.',
      need: 'Pour lancer une mise à jour, il faut l’autoriser depuis ton compte GitHub.', gh: 'Lancer sur GitHub', ghNote: 'Ouvre GitHub, clique sur « Run workflow » puis sur le bouton vert. Cette page attendra les nouvelles données.',
      one: 'Bouton en un clic (facultatif)', oneHelp: 'Crée un jeton GitHub « fine-grained » limité à ce dépôt, avec la permission Actions : Read and write, puis colle-le ici. Il reste uniquement sur cet appareil.',
      create: 'Créer le jeton', save: 'Enregistrer', placeholder: 'github_pat_…', forget: 'Oublier le jeton de cet appareil', saved: 'Jeton enregistré sur cet appareil.',
      bad: 'GitHub a refusé la demande (jeton invalide, expiré ou sans la permission Actions). Le jeton a été oublié.', net: 'Impossible de joindre GitHub. Réessaie plus tard.', close: 'Fermer',
      trends: 'Les cours, courbes et signaux de tendance sont recalculés ; les commentaires écrits restent ceux de novembre 2026.' },
    en: { locale: 'en-GB', last: 'Data updated on', unknown: 'Update time unknown', btn: 'Update now', auto: 'Automatic updates every day at 7:00 and 16:00 (Vietnam time).',
      running: 'Update in progress: new figures arrive in 10 to 15 minutes. This page will reload by itself.', started: 'Started at', cancel: 'Stop waiting',
      timeout: 'No new data after 40 minutes. Check the Actions tab on GitHub.',
      need: 'To start an update, you need to allow it from your GitHub account.', gh: 'Start on GitHub', ghNote: 'Opens GitHub: click “Run workflow”, then the green button. This page will wait for the new data.',
      one: 'One-click button (optional)', oneHelp: 'Create a fine-grained GitHub token limited to this repository, with the Actions: Read and write permission, and paste it here. It stays on this device only.',
      create: 'Create the token', save: 'Save', placeholder: 'github_pat_…', forget: 'Forget the token on this device', saved: 'Token saved on this device.',
      bad: 'GitHub refused the request (invalid or expired token, or missing Actions permission). The token has been forgotten.', net: 'Cannot reach GitHub. Try again later.', close: 'Close',
      trends: 'Prices, curves and trend signals are recalculated; the written comments stay those of November 2026.' },
    vi: { locale: 'vi-VN', last: 'Dữ liệu cập nhật', unknown: 'Không rõ thời điểm cập nhật', btn: 'Cập nhật', auto: 'Tự động cập nhật mỗi ngày lúc 7 h và 16 h (giờ Việt Nam).',
      running: 'Đang cập nhật: số liệu mới sẽ có sau 10–15 phút. Trang sẽ tự tải lại.', started: 'Bắt đầu lúc', cancel: 'Thôi chờ',
      timeout: 'Chưa có dữ liệu mới sau 40 phút. Hãy kiểm tra tab Actions trên GitHub.',
      need: 'Để chạy cập nhật, bạn cần cho phép từ tài khoản GitHub của mình.', gh: 'Chạy trên GitHub', ghNote: 'Mở GitHub, bấm “Run workflow” rồi bấm nút màu xanh. Trang này sẽ chờ dữ liệu mới.',
      one: 'Nút một chạm (không bắt buộc)', oneHelp: 'Tạo một token GitHub loại “fine-grained” chỉ cho kho này, với quyền Actions: Read and write, rồi dán vào đây. Token chỉ lưu trên thiết bị này.',
      create: 'Tạo token', save: 'Lưu', placeholder: 'github_pat_…', forget: 'Xóa token khỏi thiết bị này', saved: 'Đã lưu token trên thiết bị này.',
      bad: 'GitHub từ chối yêu cầu (token sai, hết hạn hoặc thiếu quyền Actions). Token đã bị xóa.', net: 'Không kết nối được GitHub. Hãy thử lại sau.', close: 'Đóng',
      trends: 'Giá, đường biểu diễn và tín hiệu xu hướng được tính lại; phần nhận định viết tay vẫn là của tháng 11/2026.' }
  };
  var L = T[lang] || T.fr;

  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function fmt(d) { return d.toLocaleString(L.locale, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }); }
  function ago(d) {
    var s = (d.getTime() - Date.now()) / 1000, rtf;
    try { rtf = new Intl.RelativeTimeFormat(L.locale, { numeric: 'auto' }); } catch (e) { return ''; }
    var a = Math.abs(s);
    if (a < 3600) return rtf.format(Math.round(s / 60), 'minute');
    if (a < 86400) return rtf.format(Math.round(s / 3600), 'hour');
    return rtf.format(Math.round(s / 86400), 'day');
  }
  function el(tag, cls, parent, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; if (parent) parent.appendChild(e); return e; }

  var css = '.upd{margin-top:8px;display:flex;flex-direction:column;gap:10px;max-width:760px}' +
    '.upd-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;background:rgba(168,213,191,.12);border:1px solid rgba(168,213,191,.35);border-radius:12px;padding:10px 14px}' +
    '.upd-row svg{flex:none}.upd-txt{flex:1;min-width:200px;font-size:14px;color:#D7E8DF}.upd-txt b{color:#F6F4EE;font-weight:600}.upd-txt small{display:block;color:#A8D5BF;font-size:12px}' +
    '.upd-btn{font:inherit;font-size:14px;font-weight:700;min-height:44px;padding:8px 18px;border-radius:999px;border:none;background:#A8D5BF;color:#123B2D;cursor:pointer;display:inline-flex;align-items:center;gap:8px}' +
    '.upd-btn:hover{background:#F6F4EE}.upd-btn[disabled]{opacity:.7;cursor:wait}.upd-btn.ghost{background:transparent;color:#A8D5BF;border:1px solid #A8D5BF}' +
    '.upd-panel{background:#F6F4EE;color:#1A1F1C;border-radius:12px;padding:16px 18px;display:flex;flex-direction:column;gap:10px;font-size:14px}' +
    '.upd-panel a{color:#1F5C46;font-weight:600}.upd-panel .upd-btn{background:#1F5C46;color:#fff}.upd-panel .upd-btn.ghost{background:transparent;color:#1F5C46;border-color:#1F5C46}' +
    '.upd-panel input{font:inherit;padding:10px 12px;border:1px solid #C9C4B6;border-radius:10px;min-height:44px;flex:1;min-width:200px}' +
    '.upd-line{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.upd-msg{font-weight:600;color:#1F5C46}.upd-msg.err{color:#9A3B12}' +
    '.upd-spin{width:14px;height:14px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:updspin 1s linear infinite}@keyframes updspin{to{transform:rotate(360deg)}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var host = document.querySelector('header .wrap');
  if (!host) return;
  var box = el('div', 'upd', host);
  box.setAttribute('aria-live', 'polite');
  var row = el('div', 'upd-row', box);
  row.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A8D5BF" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  var txt = el('div', 'upd-txt', row);
  var btn = el('button', 'upd-btn', row, L.btn);
  btn.type = 'button';
  var panel = null;
  var current = null;

  function showTime() {
    txt.innerHTML = '';
    if (current) { el('b', '', txt, L.last + ' ' + fmt(current)); txt.appendChild(document.createTextNode(' · ' + ago(current))); }
    else el('b', '', txt, L.unknown);
    var w = waiting();
    el('small', '', txt, w ? L.running + ' ' + L.started + ' ' + new Date(w.at).toLocaleTimeString(L.locale, { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }) + '.' : L.auto);
    btn.disabled = !!w;
    btn.innerHTML = '';
    if (w) { el('span', 'upd-spin', btn); }
    btn.appendChild(document.createTextNode(L.btn));
  }

  function readStatus() {
    return fetch(base + 'data/status.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return j && j.updated ? new Date(j.updated) : null; })
      .catch(function () { return null; });
  }
  function fromPage() { var d = window.DATA_UPDATED ? new Date(window.DATA_UPDATED) : null; return d && !isNaN(d) ? d : null; }

  function waiting() { try { var w = JSON.parse(ls(K_WAIT) || 'null'); if (w && Date.now() - w.at > 40 * 60000) { ls(K_WAIT, null); showMsg(L.timeout, true); return null; } return w; } catch (e) { return null; } }
  function startWaiting() { ls(K_WAIT, JSON.stringify({ at: Date.now(), since: current ? current.getTime() : 0 })); closePanel(); showTime(); poll(); }

  var timer = null;
  function poll() {
    clearTimeout(timer);
    var w = waiting();
    if (!w) { showTime(); return; }
    readStatus().then(function (d) {
      if (d && d.getTime() > w.since) { ls(K_WAIT, null); location.reload(); return; }
      timer = setTimeout(poll, 45000);
    });
  }

  function msgBox() { if (!panel) openPanel(true); return panel.querySelector('.upd-msg'); }
  function showMsg(m, err) { var p = msgBox(); p.textContent = m; p.className = 'upd-msg' + (err ? ' err' : ''); }
  function closePanel() { if (panel) { panel.remove(); panel = null; } }

  function openPanel(msgOnly) {
    closePanel();
    panel = el('div', 'upd-panel', box);
    if (!msgOnly) {
      el('p', '', panel, L.need);
      var l1 = el('div', 'upd-line', panel);
      var a = el('a', 'upd-btn', l1, L.gh);
      a.href = 'https://github.com/' + REPO + '/actions/workflows/' + WF; a.target = '_blank'; a.rel = 'noopener';
      a.addEventListener('click', function () { setTimeout(startWaiting, 300); });
      el('p', '', panel, L.ghNote);
      el('b', '', panel, L.one);
      el('p', '', panel, L.oneHelp);
      var l2 = el('div', 'upd-line', panel);
      var mk = el('a', '', l2, L.create);
      mk.href = 'https://github.com/settings/personal-access-tokens/new'; mk.target = '_blank'; mk.rel = 'noopener';
      var l3 = el('div', 'upd-line', panel);
      var inp = el('input', '', l3); inp.type = 'password'; inp.placeholder = L.placeholder; inp.autocomplete = 'off'; inp.setAttribute('aria-label', L.one);
      var sv = el('button', 'upd-btn', l3, L.save); sv.type = 'button';
      sv.addEventListener('click', function () { var v = inp.value.trim(); if (!v) return; ls(K_TOKEN, v); inp.value = ''; dispatch(); });
      el('p', '', panel, L.trends);
    }
    el('p', 'upd-msg', panel);
    var l4 = el('div', 'upd-line', panel);
    if (ls(K_TOKEN)) { var fg = el('button', 'upd-btn ghost', l4, L.forget); fg.type = 'button'; fg.addEventListener('click', function () { ls(K_TOKEN, null); closePanel(); }); }
    if (waiting()) { var cw = el('button', 'upd-btn ghost', l4, L.cancel); cw.type = 'button'; cw.addEventListener('click', function () { ls(K_WAIT, null); clearTimeout(timer); closePanel(); showTime(); }); }
    var cl = el('button', 'upd-btn ghost', l4, L.close); cl.type = 'button'; cl.addEventListener('click', closePanel);
  }

  function dispatch() {
    var tok = ls(K_TOKEN);
    if (!tok) { openPanel(false); return; }
    btn.disabled = true;
    fetch('https://api.github.com/repos/' + REPO + '/actions/workflows/' + WF + '/dispatches', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + tok, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: 'main' })
    }).then(function (r) {
      if (r.status === 204) { startWaiting(); return; }
      ls(K_TOKEN, null); btn.disabled = false; openPanel(false); showMsg(L.bad, true);
    }).catch(function () { btn.disabled = false; showMsg(L.net, true); });
  }

  btn.addEventListener('click', function () { if (waiting()) { openPanel(true); return; } if (ls(K_TOKEN)) dispatch(); else openPanel(false); });

  current = fromPage();
  showTime();
  readStatus().then(function (d) { if (d && (!current || d > current)) current = d; showTime(); poll(); });
  setInterval(showTime, 60000);
})();
