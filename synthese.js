/* Synthèse automatique de la situation boursière par pays : tendance, points positifs, points de vigilance.
   Calculée à partir de data/world.js (indices) et data/watch.js (actions suivies), donc rafraîchie
   à chaque mise à jour des données (toutes les 2 heures). Ce n'est pas un conseil d'investissement. */
(function () {
  var ROWS = window.WORLD_ROWS;
  if (!ROWS || !ROWS.length) return;
  var W = window.WATCH || {};
  var lang = (document.documentElement.lang || 'fr').slice(0, 2);
  var LI = { fr: 0, en: 1, vi: 2 }[lang] || 0;
  var C = {
    US: ['États-Unis', 'United States', 'Mỹ'], CA: ['Canada', 'Canada', 'Canada'], MX: ['Mexique', 'Mexico', 'Mexico'], BR: ['Brésil', 'Brazil', 'Brazil'],
    ES: ['Espagne', 'Spain', 'Tây Ban Nha'], SE: ['Suède', 'Sweden', 'Thụy Điển'], BE: ['Belgique', 'Belgium', 'Bỉ'], NL: ['Pays-Bas', 'Netherlands', 'Hà Lan'],
    CH: ['Suisse', 'Switzerland', 'Thụy Sĩ'], IT: ['Italie', 'Italy', 'Ý'], GB: ['Royaume-Uni', 'United Kingdom', 'Anh'], EZ: ['Zone euro', 'Euro area', 'Khu vực đồng euro'],
    DE: ['Allemagne', 'Germany', 'Đức'], FR: ['France', 'France', 'Pháp'], TR: ['Turquie', 'Turkey', 'Thổ Nhĩ Kỳ'], TW: ['Taïwan', 'Taiwan', 'Đài Loan'],
    KR: ['Corée du Sud', 'South Korea', 'Hàn Quốc'], JP: ['Japon', 'Japan', 'Nhật Bản'], SG: ['Singapour', 'Singapore', 'Singapore'], NZ: ['Nouvelle-Zélande', 'New Zealand', 'New Zealand'],
    AU: ['Australie', 'Australia', 'Úc'], VN: ['Vietnam', 'Vietnam', 'Việt Nam'], IN: ['Inde', 'India', 'Ấn Độ'], MY: ['Malaisie', 'Malaysia', 'Malaysia'],
    CN: ['Chine', 'China', 'Trung Quốc'], HK: ['Hong Kong', 'Hong Kong', 'Hồng Kông'], ID: ['Indonésie', 'Indonesia', 'Indonesia'], IL: ['Israël', 'Israel', 'Israel'],
    ZA: ['Afrique du Sud', 'South Africa', 'Nam Phi'], W: ['Monde (pays développés)', 'World (developed markets)', 'Thế giới (thị trường phát triển)'],
    EM: ['Pays émergents', 'Emerging markets', 'Thị trường mới nổi']
  };
  var T = {
    fr: { locale: 'fr-FR', p: ' %', title: 'Synthèse des marchés par pays', choose: 'Choisir une région',
      intro: 'Analyse automatique de l’indice principal de chaque pays, recalculée à chaque mise à jour des données (toutes les 2 heures). Touche un pays pour voir le détail.',
      calc: 'Calculée le ', regions: { all: 'Tous', am: 'Amériques', eu: 'Europe', as: 'Asie-Pacifique', me: 'Moyen-Orient et Afrique', gl: 'Monde' },
      verdict: ['Tendance positive', 'Tendance neutre', 'Prudence'], sess: 'Séance', y1: '1 an', pos: 'Points positifs', vig: 'Points de vigilance', nothing: 'Rien de notable.',
      overview: 'En ce moment : {a} pays en tendance positive, {b} neutres, {c} à surveiller avec prudence.', best: 'Meilleure séance : {n} ({v}).', worst: 'Plus faible : {n} ({v}).',
      last: 'Dernière clôture prise en compte : {d}.', others: 'Autres indices : ',
      pY1: 'En hausse de {v} sur 1 an', pMa200: 'Au-dessus de sa moyenne sur 200 jours ({v}) : la tendance de fond est haussière', pCross: 'Moyenne 50 jours au-dessus de la moyenne 200 jours : la dynamique est positive',
      pM3: 'Progression sur 3 mois ({v})', pHigh: 'Proche de son plus haut de l’année ({v})', pD1: 'Séance en hausse ({v})', pM1: 'Bon mois ({v} sur 1 mois)',
      pBreadth: '{n} actions suivies sur {t} en hausse sur 6 mois : la hausse est bien répartie',
      vY1: 'En baisse de {v} sur 1 an', vMa200: 'Sous sa moyenne sur 200 jours ({v}) : la tendance de fond est baissière', vCross: 'Moyenne 50 jours sous la moyenne 200 jours : la dynamique s’essouffle',
      vM3: 'Recul sur 3 mois ({v})', vCorr: '{v} sous son plus haut de l’année : phase de correction', vBear: '{v} sous son plus haut de l’année : marché baissier (plus de 20 %)',
      vD1: 'Séance en baisse ({v})', vM1: 'Mauvais mois ({v} sur 1 mois)', vHot: 'Déjà {v} sur 1 an : risque de prises de bénéfices', vExt: 'Très au-dessus de sa moyenne 200 jours ({v}) : le marché est tendu',
      vBreadth: 'Seulement {n} actions suivies sur {t} en hausse sur 6 mois : la hausse repose sur peu de titres', vStale: 'Pas de cotation récente (dernière le {d}) : marché fermé ou donnée en retard',
      warn: 'Synthèse mécanique fondée sur les cours : elle ne tient pas compte de l’actualité économique ou politique et ne constitue pas un conseil d’investissement.' },
    en: { locale: 'en-GB', p: '%', title: 'Market summary by country', choose: 'Choose a region',
      intro: 'Automatic analysis of each country’s main index, recalculated with every data update (every 2 hours). Tap a country to see the details.',
      calc: 'Computed ', regions: { all: 'All', am: 'Americas', eu: 'Europe', as: 'Asia-Pacific', me: 'Middle East and Africa', gl: 'World' },
      verdict: ['Positive trend', 'Neutral trend', 'Caution'], sess: 'Session', y1: '1 yr', pos: 'Positive points', vig: 'Points to watch', nothing: 'Nothing notable.',
      overview: 'Right now: {a} countries in a positive trend, {b} neutral, {c} calling for caution.', best: 'Best session: {n} ({v}).', worst: 'Weakest: {n} ({v}).',
      last: 'Latest close used: {d}.', others: 'Other indices: ',
      pY1: 'Up {v} over 1 year', pMa200: 'Above its 200-day average ({v}): the underlying trend is up', pCross: '50-day average above the 200-day average: momentum is positive',
      pM3: 'Up over 3 months ({v})', pHigh: 'Close to its 1-year high ({v})', pD1: 'Up in the session ({v})', pM1: 'Good month ({v} over 1 month)',
      pBreadth: '{n} of {t} tracked stocks up over 6 months: the rise is broad-based',
      vY1: 'Down {v} over 1 year', vMa200: 'Below its 200-day average ({v}): the underlying trend is down', vCross: '50-day average below the 200-day average: momentum is fading',
      vM3: 'Down over 3 months ({v})', vCorr: '{v} below its 1-year high: correction phase', vBear: '{v} below its 1-year high: bear market (more than 20%)',
      vD1: 'Down in the session ({v})', vM1: 'Poor month ({v} over 1 month)', vHot: 'Already {v} over 1 year: risk of profit-taking', vExt: 'Far above its 200-day average ({v}): the market is stretched',
      vBreadth: 'Only {n} of {t} tracked stocks up over 6 months: the rise rests on few stocks', vStale: 'No recent quote (last on {d}): market closed or delayed data',
      warn: 'Mechanical summary based on prices only: it ignores economic and political news and is not investment advice.' },
    vi: { locale: 'vi-VN', p: ' %', title: 'Tổng quan thị trường theo quốc gia', choose: 'Chọn khu vực',
      intro: 'Phân tích tự động chỉ số chính của từng nước, tính lại mỗi lần cập nhật dữ liệu (mỗi 2 giờ). Chạm vào một nước để xem chi tiết.',
      calc: 'Tính lúc ', regions: { all: 'Tất cả', am: 'Châu Mỹ', eu: 'Châu Âu', as: 'Châu Á – Thái Bình Dương', me: 'Trung Đông và châu Phi', gl: 'Thế giới' },
      verdict: ['Xu hướng tích cực', 'Xu hướng trung tính', 'Thận trọng'], sess: 'Phiên', y1: '1 năm', pos: 'Điểm tích cực', vig: 'Điểm cần lưu ý', nothing: 'Không có gì đáng chú ý.',
      overview: 'Hiện tại: {a} nước có xu hướng tích cực, {b} trung tính, {c} cần thận trọng.', best: 'Phiên tốt nhất: {n} ({v}).', worst: 'Yếu nhất: {n} ({v}).',
      last: 'Giá đóng cửa gần nhất được dùng: {d}.', others: 'Chỉ số khác: ',
      pY1: 'Tăng {v} trong 1 năm', pMa200: 'Trên đường trung bình 200 ngày ({v}): xu hướng dài hạn đi lên', pCross: 'Trung bình 50 ngày nằm trên trung bình 200 ngày: đà tăng tích cực',
      pM3: 'Tăng trong 3 tháng ({v})', pHigh: 'Gần mức cao nhất trong năm ({v})', pD1: 'Phiên tăng ({v})', pM1: 'Tháng tốt ({v} trong 1 tháng)',
      pBreadth: '{n}/{t} cổ phiếu theo dõi tăng trong 6 tháng: đà tăng lan tỏa',
      vY1: 'Giảm {v} trong 1 năm', vMa200: 'Dưới đường trung bình 200 ngày ({v}): xu hướng dài hạn đi xuống', vCross: 'Trung bình 50 ngày nằm dưới trung bình 200 ngày: đà tăng suy yếu',
      vM3: 'Giảm trong 3 tháng ({v})', vCorr: 'Thấp hơn {v} so với đỉnh 1 năm: đang điều chỉnh', vBear: 'Thấp hơn {v} so với đỉnh 1 năm: thị trường giá xuống (hơn 20 %)',
      vD1: 'Phiên giảm ({v})', vM1: 'Tháng kém ({v} trong 1 tháng)', vHot: 'Đã tăng {v} trong 1 năm: rủi ro chốt lời', vExt: 'Cao hơn nhiều so với trung bình 200 ngày ({v}): thị trường căng',
      vBreadth: 'Chỉ {n}/{t} cổ phiếu theo dõi tăng trong 6 tháng: đà tăng dựa vào ít mã', vStale: 'Không có giá mới (gần nhất ngày {d}): thị trường nghỉ hoặc dữ liệu chậm',
      warn: 'Tổng quan tự động chỉ dựa trên giá: không xét tin tức kinh tế, chính trị và không phải là lời khuyên đầu tư.' }
  };
  var L = T[lang] || T.fr;
  var KEY = 'msi_synth_region';
  var region = 'all';
  try { var r0 = localStorage.getItem(KEY); if (r0 && L.regions[r0]) region = r0; } catch (e) {}

  function fmt(x, d) { return x.toLocaleString(L.locale, { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function pct(x) { return (x > 0 ? '+' : x < 0 ? '−' : '') + fmt(Math.abs(x), 1) + L.p; }
  function abs(x) { return fmt(Math.abs(x), 1) + L.p; }
  function f(t, o) { return t.replace(/\{(\w)\}/g, function (m, k) { return o[k]; }); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function num(x) { return typeof x === 'number' && isFinite(x); }
  function day(d) { return new Date(d + 'T12:00:00Z').toLocaleDateString(L.locale, { day: 'numeric', month: 'long', year: 'numeric' }); }
  function name(cc) { return (C[cc] || [cc, cc, cc])[LI]; }
  function sig(r) { var s = (r[8] > 0 ? 1 : -1) + (r[9] > 0 ? 1 : -1) + (r[6] > 0 ? 1 : -1); return s >= 3 ? 0 : s <= -1 ? 2 : 1; }

  // un pays = son premier indice (indice principal) + les autres
  var countries = [], byCc = {};
  ROWS.forEach(function (r) {
    if (!byCc[r[1]]) { byCc[r[1]] = { cc: r[1], reg: r[0], main: r, others: [] }; countries.push(byCc[r[1]]); }
    else byCc[r[1]].others.push(r);
  });
  var newest = ROWS.reduce(function (m, r) { return r[3] > m ? r[3] : m; }, '');

  function analyse(c) {
    var r = c.main, pos = [], vig = [];
    var d1 = r[12], m1 = r[13];
    if (num(d1)) { if (d1 >= 0.5) pos.push(f(L.pD1, { v: pct(d1) })); else if (d1 <= -0.5) vig.push(f(L.vD1, { v: pct(d1) })); }
    if (r[5] > 0) pos.push(f(L.pY1, { v: abs(r[5]) })); else vig.push(f(L.vY1, { v: abs(r[5]) }));
    if (r[8] > 0) pos.push(f(L.pMa200, { v: pct(r[8]) })); else vig.push(f(L.vMa200, { v: pct(r[8]) }));
    if (r[9] > 0) pos.push(L.pCross); else vig.push(L.vCross);
    if (r[7] > 0) pos.push(f(L.pM3, { v: pct(r[7]) })); else vig.push(f(L.vM3, { v: pct(r[7]) }));
    if (num(m1)) { if (m1 >= 3) pos.push(f(L.pM1, { v: pct(m1) })); else if (m1 <= -3) vig.push(f(L.vM1, { v: pct(m1) })); }
    if (r[10] >= -3) pos.push(f(L.pHigh, { v: pct(r[10]) }));
    else if (r[10] <= -20) vig.push(f(L.vBear, { v: abs(r[10]) }));
    else if (r[10] <= -10) vig.push(f(L.vCorr, { v: abs(r[10]) }));
    if (r[5] >= 40) vig.push(f(L.vHot, { v: pct(r[5]) }));
    if (r[8] >= 20) vig.push(f(L.vExt, { v: pct(r[8]) }));
    var w = W[c.cc];
    if (w && w.rows && w.rows.length >= 4) {
      var t = w.rows.length, n = w.rows.filter(function (x) { return x[6] > 0; }).length;
      if (n / t >= 0.6) pos.push(f(L.pBreadth, { n: n, t: t })); else if (n / t <= 0.4) vig.push(f(L.vBreadth, { n: n, t: t }));
    }
    if (newest && (new Date(newest) - new Date(r[3])) / 86400000 > 4) vig.push(f(L.vStale, { d: day(r[3]) }));
    return { s: sig(r), pos: pos, vig: vig };
  }

  var css = '#synthese .sy-ov{background:#fff;border:1px solid var(--line,#E2DED3);border-radius:12px;padding:14px 16px;font-size:15px;line-height:1.5;margin:14px 0}' +
    '#synthese details{background:#fff;border:1px solid var(--line,#E2DED3);border-radius:12px;margin-top:8px}' +
    '#synthese summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 16px;min-height:44px}#synthese summary::-webkit-details-marker{display:none}' +
    '#synthese summary:before{content:"›";font-weight:700;color:var(--green,#1F5C46);transition:transform .2s}#synthese details[open] summary:before{transform:rotate(90deg)}' +
    '#synthese .sy-n{font-weight:700;flex:1;min-width:140px}#synthese .sy-n small{display:block;font-weight:400;font-size:12px;color:var(--grey,#5B635E)}' +
    '#synthese .sy-b{font-size:12px;font-weight:700;border-radius:999px;padding:4px 10px;white-space:nowrap}.sy-b.s0{background:#E3F1E8;color:#1F6B45}.sy-b.s1{background:#EFEDE6;color:#5B635E}.sy-b.s2{background:#FBE9DF;color:#A8471C}' +
    '#synthese .sy-k{font-size:13px;color:var(--grey,#5B635E);text-align:right;min-width:72px}#synthese .sy-k b{display:block;font-size:15px}#synthese .up{color:#1F7A4D}#synthese .down{color:#B4472A}' +
    '#synthese .sy-body{padding:0 16px 14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px 24px}' +
    '#synthese h4{margin:6px 0 4px;font-size:13px;text-transform:uppercase;letter-spacing:.04em}#synthese h4.g{color:#1F6B45}#synthese h4.o{color:#A8471C}' +
    '#synthese ul{margin:0;padding-left:18px;font-size:14px;line-height:1.45}#synthese .sy-meta{grid-column:1/-1;font-size:13px;color:var(--grey,#5B635E);margin:0}' +
    '#synthese .sy-warn{background:#FBF3E8;border-left:4px solid #D98A3D;border-radius:8px;padding:12px 14px;font-size:14px;margin-top:16px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var sec = document.createElement('section');
  sec.id = 'synthese';
  var wi = document.getElementById('world-indices'), mk = document.getElementById('markets');
  if (wi) wi.parentNode.insertBefore(sec, wi);
  else if (mk) { var host = mk.closest('section') || mk; host.parentNode.insertBefore(sec, host.nextSibling); }
  else return;

  function stamp() { var d = window.DATA_UPDATED ? new Date(window.DATA_UPDATED) : null; if (!d || isNaN(d)) return ''; return ' <b>' + L.calc + d.toLocaleString(L.locale, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }) + '.</b>'; }

  var open = { VN: true };
  function render() {
    var all = countries.map(function (c) { return { c: c, a: analyse(c) }; });
    var cnt = [0, 0, 0]; all.forEach(function (x) { cnt[x.a.s]++; });
    var h = '<h2>' + L.title + '</h2><p class="note">' + L.intro + stamp() + '</p>';
    var ov = f(L.overview, { a: cnt[0], b: cnt[1], c: cnt[2] });
    var withD = all.filter(function (x) { return num(x.c.main[12]) && x.c.main[3] === newest; });
    if (withD.length > 1) {
      withD.sort(function (a, b) { return b.c.main[12] - a.c.main[12]; });
      ov += ' ' + f(L.best, { n: name(withD[0].c.cc), v: pct(withD[0].c.main[12]) }) + ' ' + f(L.worst, { n: name(withD[withD.length - 1].c.cc), v: pct(withD[withD.length - 1].c.main[12]) });
    }
    h += '<div class="sy-ov">' + ov + '</div>';
    h += '<div class="wl-tabs" role="group" aria-label="' + L.choose + '">';
    ['all', 'as', 'eu', 'am', 'me', 'gl'].forEach(function (k) { h += '<button type="button" data-r="' + k + '" aria-pressed="' + (region === k) + '">' + L.regions[k] + '</button>'; });
    h += '</div>';
    var list = all.filter(function (x) { return region === 'all' || x.c.reg === region; });
    list.sort(function (a, b) { return (b.c.cc === 'VN') - (a.c.cc === 'VN'); });
    list.forEach(function (x) {
      var r = x.c.main, d1 = r[12];
      h += '<details data-cc="' + x.c.cc + '"' + (open[x.c.cc] ? ' open' : '') + '><summary><span class="sy-n">' + esc(name(x.c.cc)) + '<small>' + esc(r[2]) + '</small></span>' +
        '<span class="sy-b s' + x.a.s + '">' + L.verdict[x.a.s] + '</span>' +
        (num(d1) ? '<span class="sy-k">' + L.sess + '<b class="' + (d1 >= 0 ? 'up' : 'down') + '">' + pct(d1) + '</b></span>' : '') +
        '<span class="sy-k">' + L.y1 + '<b class="' + (r[5] >= 0 ? 'up' : 'down') + '">' + pct(r[5]) + '</b></span></summary><div class="sy-body">' +
        '<div><h4 class="g">' + L.pos + '</h4><ul>' + (x.a.pos.length ? x.a.pos.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') : '<li>' + L.nothing + '</li>') + '</ul></div>' +
        '<div><h4 class="o">' + L.vig + '</h4><ul>' + (x.a.vig.length ? x.a.vig.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') : '<li>' + L.nothing + '</li>') + '</ul></div>' +
        '<p class="sy-meta">' + f(L.last, { d: day(r[3]) }) + (x.c.others.length ? ' ' + L.others + x.c.others.map(function (o) { return esc(o[2]) + ' ' + pct(o[5]) + ' (' + L.y1 + ')'; }).join(' · ') + '.' : '') + '</p></div></details>';
    });
    h += '<p class="sy-warn">' + L.warn + '</p>';
    sec.innerHTML = h;
    sec.querySelectorAll('details').forEach(function (d) { d.addEventListener('toggle', function () { open[d.getAttribute('data-cc')] = d.open; }); });
    sec.querySelectorAll('.wl-tabs button').forEach(function (b) {
      b.addEventListener('click', function () { region = b.getAttribute('data-r'); try { localStorage.setItem(KEY, region); } catch (e) {} render(); sec.querySelector('.wl-tabs button[aria-pressed="true"]').focus(); });
    });
  }
  render();
})();
