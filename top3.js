/* « Le filtre du jour » : les 3 actions de la liste de surveillance qui passent le mieux
   un filtre mécanique et transparent (tendance 6 mois, tendance 1 an, régularité, comparaison
   avec l'indice du pays, absence de surchauffe). Recalculé à chaque mise à jour des données.
   Ce n'est pas un conseil d'investissement. */
(function () {
  var D = window.WATCH;
  var anchor = document.getElementById('watchlist');
  if (!D || !anchor) return;
  var lang = (document.documentElement.lang || 'fr').slice(0, 2);
  var ORDER = ['VN', 'FR', 'DE', 'US', 'JP', 'KR', 'TW', 'CN'];
  var HOT = 60; // au-delà de +60 % sur 1 an : risque de correction plus élevé
  var T = {
    fr: { locale: 'fr-FR', p: ' %', title: 'Le filtre du jour : 3 actions qui ressortent', all: 'Tous les pays', choose: 'Choisir le périmètre',
      intro: 'Classement automatique des actions de la liste de surveillance selon 5 critères simples, recalculé à chaque mise à jour des données. Il sert à repérer des pistes à étudier, pas à décider à ta place.',
      crit: 'Critères (1 point chacun) : hausse sur 6 mois · hausse sur 1 an · hausse sur les deux semestres · meilleure que l’indice du pays sur 1 an · hausse sur 1 an inférieure à +60 % (pas de surchauffe). Seules les actions à 4 ou 5 points sont retenues, au plus une par secteur.',
      score: 'Score', why: 'Pourquoi elle ressort', watch: 'Points de vigilance',
      none: 'Aucune action de ce périmètre n’obtient 4 points aujourd’hui : le filtre ne fait ressortir aucune piste. Mieux vaut attendre ou rester sur la répartition prévue.',
      fewer: 'Seulement {n} action(s) passent le filtre aujourd’hui dans ce périmètre.',
      r6: '{v} sur 6 mois : la tendance récente est positive', r1: '{v} sur 1 an', rReg: 'Hausse sur les deux semestres : progression régulière ({a} puis {b})',
      rIdx: 'Mieux que son indice {i} ({v}) sur 1 an', rCool: 'Pas de surchauffe : hausse sur 1 an sous +60 %',
      wHot: 'Très forte hausse sur 1 an ({v}) : le risque de correction est plus élevé', wIrr: 'Premier semestre en baisse ({a}) : le rebond est récent',
      wIdx: 'Moins bien que son indice {i} ({v}) sur 1 an', w6: 'En baisse sur 6 mois ({v})',
      wFx: 'Achat hors Vietnam : il faut un courtier international et accepter le risque de change ({c})', wVN: 'Accessible directement avec un compte titres au Vietnam',
      wOne: 'Une seule action ne doit pas peser plus de 5 % du portefeuille',
      how: 'Comment s’en servir : vérifie d’abord les résultats, la valorisation et l’actualité de l’entreprise ; achète en plusieurs fois plutôt qu’en une ; reste dans la poche « actions » prévue par la répartition ci-dessus.',
      warn: 'Ce n’est pas un conseil d’investissement. Le filtre ne regarde que l’évolution passée des cours, qui ne prédit pas l’avenir, et ignore les résultats, la valorisation et l’actualité des entreprises.',
      vnUnit: 'milliers de ₫', c: { VN: 'Vietnam', FR: 'France', DE: 'Allemagne', US: 'États-Unis', JP: 'Japon', KR: 'Corée du Sud', TW: 'Taïwan', CN: 'Chine' } },
    en: { locale: 'en-GB', p: '%', title: 'Today’s screen: 3 stocks that stand out', all: 'All countries', choose: 'Choose the scope',
      intro: 'Automatic ranking of the watchlist stocks on 5 simple criteria, recalculated with every data update. It helps you spot ideas worth studying; it does not decide for you.',
      crit: 'Criteria (1 point each): up over 6 months · up over 1 year · up in both half-years · better than the country index over 1 year · 1-year gain below +60% (not overheated). Only stocks with 4 or 5 points are kept, at most one per sector.',
      score: 'Score', why: 'Why it stands out', watch: 'Points to watch',
      none: 'No stock in this scope scores 4 points today: the screen finds no idea. Better to wait or stick to the planned allocation.',
      fewer: 'Only {n} stock(s) pass the screen today in this scope.',
      r6: '{v} over 6 months: the recent trend is positive', r1: '{v} over 1 year', rReg: 'Up in both half-years: steady progress ({a} then {b})',
      rIdx: 'Better than its index {i} ({v}) over 1 year', rCool: 'Not overheated: 1-year gain below +60%',
      wHot: 'Very strong 1-year rise ({v}): higher risk of a pullback', wIrr: 'First half-year down ({a}): the rebound is recent',
      wIdx: 'Worse than its index {i} ({v}) over 1 year', w6: 'Down over 6 months ({v})',
      wFx: 'Buying outside Vietnam: needs an international broker and carries currency risk ({c})', wVN: 'Directly accessible with a brokerage account in Vietnam',
      wOne: 'A single stock should not weigh more than 5% of the portfolio',
      how: 'How to use it: first check the company’s results, valuation and news; buy in several steps rather than all at once; stay within the “stocks” share of the allocation above.',
      warn: 'This is not investment advice. The screen only looks at past price moves, which do not predict the future, and ignores company results, valuation and news.',
      vnUnit: 'thousand ₫', c: { VN: 'Vietnam', FR: 'France', DE: 'Germany', US: 'United States', JP: 'Japan', KR: 'South Korea', TW: 'Taiwan', CN: 'China' } },
    vi: { locale: 'vi-VN', p: ' %', title: 'Bộ lọc hôm nay: 3 cổ phiếu nổi bật', all: 'Tất cả các nước', choose: 'Chọn phạm vi',
      intro: 'Xếp hạng tự động các cổ phiếu trong danh sách theo dõi theo 5 tiêu chí đơn giản, tính lại mỗi lần cập nhật dữ liệu. Bộ lọc giúp tìm ý tưởng để tìm hiểu thêm, không quyết định thay bạn.',
      crit: 'Tiêu chí (mỗi tiêu chí 1 điểm): tăng trong 6 tháng · tăng trong 1 năm · tăng ở cả hai nửa năm · tốt hơn chỉ số của nước đó trong 1 năm · mức tăng 1 năm dưới +60 % (chưa quá nóng). Chỉ giữ cổ phiếu đạt 4 hoặc 5 điểm, tối đa một mã mỗi ngành.',
      score: 'Điểm', why: 'Vì sao nổi bật', watch: 'Điểm cần lưu ý',
      none: 'Hôm nay không có cổ phiếu nào trong phạm vi này đạt 4 điểm: bộ lọc không tìm ra ý tưởng. Nên chờ thêm hoặc giữ đúng phân bổ đã định.',
      fewer: 'Hôm nay chỉ có {n} cổ phiếu qua được bộ lọc trong phạm vi này.',
      r6: '{v} trong 6 tháng: xu hướng gần đây tích cực', r1: '{v} trong 1 năm', rReg: 'Tăng ở cả hai nửa năm: đà tăng đều ({a} rồi {b})',
      rIdx: 'Tốt hơn chỉ số {i} ({v}) trong 1 năm', rCool: 'Chưa quá nóng: mức tăng 1 năm dưới +60 %',
      wHot: 'Tăng rất mạnh trong 1 năm ({v}): rủi ro điều chỉnh cao hơn', wIrr: 'Nửa năm đầu giảm ({a}): đà hồi phục mới gần đây',
      wIdx: 'Kém hơn chỉ số {i} ({v}) trong 1 năm', w6: 'Giảm trong 6 tháng ({v})',
      wFx: 'Mua ngoài Việt Nam: cần công ty chứng khoán quốc tế và chịu rủi ro tỷ giá ({c})', wVN: 'Mua trực tiếp được bằng tài khoản chứng khoán tại Việt Nam',
      wOne: 'Một cổ phiếu không nên chiếm quá 5 % danh mục',
      how: 'Cách dùng: trước hết xem kết quả kinh doanh, định giá và tin tức của doanh nghiệp; mua làm nhiều lần thay vì một lần; giữ trong phần « cổ phiếu » của phân bổ ở trên.',
      warn: 'Đây không phải là lời khuyên đầu tư. Bộ lọc chỉ xét biến động giá trong quá khứ, vốn không dự báo được tương lai, và bỏ qua kết quả kinh doanh, định giá cũng như tin tức doanh nghiệp.',
      vnUnit: 'nghìn ₫', c: { VN: 'Việt Nam', FR: 'Pháp', DE: 'Đức', US: 'Mỹ', JP: 'Nhật Bản', KR: 'Hàn Quốc', TW: 'Đài Loan', CN: 'Trung Quốc' } }
  };
  var L = T[lang] || T.fr;
  var KEY = 'msi_top3_scope';
  var scope = 'ALL';
  try { var s0 = localStorage.getItem(KEY); if (s0 && (s0 === 'ALL' || D[s0])) scope = s0; } catch (e) {}

  function fmt(x, d) { return x.toLocaleString(L.locale, { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function pct(x) { return (x > 0 ? '+' : x < 0 ? '−' : '') + fmt(Math.abs(x), 1) + L.p; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function f(t, o) { return t.replace(/\{(\w)\}/g, function (m, k) { return o[k]; }); }

  function analyse(cc, r, idx) {
    var y1 = r[5], m6 = r[6];
    var h1 = ((1 + y1 / 100) / (1 + m6 / 100) - 1) * 100; // variation du premier semestre
    var why = [], watch = [], sc = 0;
    if (m6 > 0) { sc++; why.push(f(L.r6, { v: pct(m6) })); } else watch.push(f(L.w6, { v: pct(m6) }));
    if (y1 > 0) { sc++; why.push(f(L.r1, { v: pct(y1) })); }
    if (m6 > 0 && h1 > 0) { sc++; why.push(f(L.rReg, { a: pct(h1), b: pct(m6) })); } else if (m6 > 0) watch.push(f(L.wIrr, { a: pct(h1) }));
    if (y1 > idx[1]) { sc++; why.push(f(L.rIdx, { i: idx[0], v: pct(idx[1]) })); } else watch.push(f(L.wIdx, { i: idx[0], v: pct(idx[1]) }));
    if (y1 <= HOT) { sc++; if (y1 > 0) why.push(L.rCool); } else watch.unshift(f(L.wHot, { v: pct(y1) }));
    watch.push(cc === 'VN' ? L.wVN : f(L.wFx, { c: r[2] }));
    watch.push(L.wOne);
    return { cc: cc, r: r, sc: sc, rank: m6 + Math.min(y1, HOT) / 2, why: why, watch: watch };
  }

  function pick() {
    var list = [];
    Object.keys(D).forEach(function (cc) {
      if (scope !== 'ALL' && cc !== scope) return;
      (D[cc].rows || []).forEach(function (r) { list.push(analyse(cc, r, D[cc].idx)); });
    });
    list = list.filter(function (a) { return a.sc >= 4; }).sort(function (a, b) { return b.sc - a.sc || b.rank - a.rank; });
    var out = [], sectors = {};
    list.forEach(function (a) { if (out.length < 3 && !sectors[a.r[7]]) { sectors[a.r[7]] = 1; out.push(a); } });
    return out;
  }

  var css = '#top3 .t3-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;margin-top:16px}' +
    '#top3 .t3-card{background:#fff;border:1px solid var(--line,#E2DED3);border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:10px}' +
    '#top3 .t3-head{display:flex;align-items:flex-start;gap:12px}#top3 .t3-rank{flex:none;width:36px;height:36px;border-radius:50%;background:var(--dark,#123B2D);color:var(--mint,#A8D5BF);display:flex;align-items:center;justify-content:center;font-weight:700}' +
    '#top3 .t3-name{font-weight:700;font-size:17px;line-height:1.25}#top3 .t3-name small{display:block;font-weight:400;font-size:13px;color:var(--grey,#5B635E)}' +
    '#top3 .t3-score{margin-left:auto;flex:none;font-size:13px;font-weight:700;color:var(--green,#1F5C46);background:#E6F1EB;border-radius:999px;padding:4px 10px}' +
    '#top3 .t3-nums{display:flex;gap:16px;font-size:14px}#top3 .t3-nums b{display:block;font-size:18px}#top3 .up{color:#1F7A4D}#top3 .down{color:#B4472A}' +
    '#top3 h4{margin:4px 0 0;font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:var(--grey,#5B635E)}' +
    '#top3 ul{margin:0;padding-left:18px;font-size:14px;line-height:1.45}#top3 ul.w li::marker{color:#D98A3D}' +
    '#top3 .t3-warn{background:#FBF3E8;border-left:4px solid #D98A3D;border-radius:8px;padding:12px 14px;font-size:14px;margin-top:16px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var sec = document.createElement('section');
  sec.id = 'top3';
  anchor.parentNode.insertBefore(sec, anchor.nextSibling);

  function stamp() { var d = window.DATA_UPDATED ? new Date(window.DATA_UPDATED) : null; if (!d || isNaN(d)) return ''; return ' <b>' + ({ fr: 'Calculé le ', en: 'Computed ', vi: 'Tính lúc ' }[lang] || '') + d.toLocaleString(L.locale, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }) + '.</b>'; }
  function price(r) { return fmt(r[3], r[3] >= 1000 ? 0 : 2) + ' ' + (r[2] === 'VND' ? L.vnUnit : r[2]); }

  function render() {
    var res = pick();
    var h = '<h2>' + L.title + '</h2><p class="note">' + L.intro + stamp() + '</p>';
    h += '<div class="wl-tabs" role="group" aria-label="' + L.choose + '"><button type="button" data-s="ALL" aria-pressed="' + (scope === 'ALL') + '">' + L.all + '</button>';
    ORDER.forEach(function (k) { if (D[k] && D[k].rows && D[k].rows.length) h += '<button type="button" data-s="' + k + '" aria-pressed="' + (scope === k) + '">' + L.c[k] + '</button>'; });
    h += '</div>';
    if (!res.length) h += '<p class="t3-warn">' + L.none + '</p>';
    else {
      if (res.length < 3) h += '<p class="note">' + f(L.fewer, { n: res.length }) + '</p>';
      h += '<div class="t3-grid">';
      res.forEach(function (a, i) {
        var r = a.r;
        h += '<article class="t3-card"><div class="t3-head"><div class="t3-rank">' + (i + 1) + '</div><div class="t3-name">' + esc(r[0]) +
          '<small>' + esc(L.c[a.cc]) + ' · ' + esc(r[1]) + ' · ' + price(r) + '</small></div><div class="t3-score">' + L.score + ' ' + a.sc + '/5</div></div>' +
          '<div class="t3-nums"><div>1 an<b class="' + (r[5] >= 0 ? 'up' : 'down') + '">' + pct(r[5]) + '</b></div><div>6 mois<b class="' + (r[6] >= 0 ? 'up' : 'down') + '">' + pct(r[6]) + '</b></div></div>' +
          '<h4>' + L.why + '</h4><ul>' + a.why.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
          '<h4>' + L.watch + '</h4><ul class="w">' + a.watch.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></article>';
      });
      h += '</div>';
    }
    h += '<p class="note">' + L.crit + '</p><p class="note">' + L.how + '</p><p class="t3-warn">' + L.warn + '</p>';
    sec.innerHTML = h;
    if (lang === 'en') sec.querySelectorAll('.t3-nums div').forEach(function (d) { d.firstChild.nodeValue = d.firstChild.nodeValue === '1 an' ? '1 yr' : '6 mo'; });
    if (lang === 'vi') sec.querySelectorAll('.t3-nums div').forEach(function (d) { d.firstChild.nodeValue = d.firstChild.nodeValue === '1 an' ? '1 năm' : '6 tháng'; });
    sec.querySelectorAll('.wl-tabs button').forEach(function (b) {
      b.addEventListener('click', function () { scope = b.getAttribute('data-s'); try { localStorage.setItem(KEY, scope); } catch (e) {} render(); sec.querySelector('.wl-tabs button[aria-pressed="true"]').focus(); });
    });
  }
  render();
  if (typeof module !== 'undefined') module.exports = { analyse: analyse };
})();
