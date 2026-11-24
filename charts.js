(function () {
  var D = window.IDX;
  var root = document.getElementById('markets');
  if (!D || !root) return;
  var lang = (document.documentElement.lang || 'fr').slice(0, 2);

  var T = {
    fr: { p: ['1 an', '2 ans', '3 ans'], period: 'Période', since: 'Variation depuis', val: 'Dernier cours',
          groups: { us: '1) États-Unis', eu: '2) Europe', asia: '3) Asie et monde', vn: '4) Vietnam' },
          src: 'Courbes en base 100 : chaque indice part de 0 % au début de la période, pour comparer des marchés de tailles différentes. Données hebdomadaires (clôture du vendredi) ; dernier point au ',
          src2: '. Sources : Yahoo Finance (indices internationaux), CafeF (indices vietnamiens). MSCI World représenté par l’ETF iShares MSCI World (URTH), en dollars.',
          locale: 'fr-FR' },
    en: { p: ['1 year', '2 years', '3 years'], period: 'Period', since: 'Change since', val: 'Last close',
          groups: { us: '1) United States', eu: '2) Europe', asia: '3) Asia and world', vn: '4) Vietnam' },
          src: 'Curves rebased to 0% at the start of the period, to compare markets of different sizes. Weekly data (Friday close); last point on ',
          src2: '. Sources: Yahoo Finance (international indices), CafeF (Vietnamese indices). MSCI World shown through the iShares MSCI World ETF (URTH), in US dollars.',
          locale: 'en-GB' },
    vi: { p: ['1 năm', '2 năm', '3 năm'], period: 'Khoảng thời gian', since: 'Thay đổi từ', val: 'Giá đóng cửa gần nhất',
          groups: { us: '1) Hoa Kỳ', eu: '2) Châu Âu', asia: '3) Châu Á và thế giới', vn: '4) Việt Nam' },
          src: 'Các đường được quy về 0 % ở đầu kỳ để so sánh các thị trường có quy mô khác nhau. Dữ liệu theo tuần (giá đóng cửa thứ Sáu); điểm cuối ngày ',
          src2: '. Nguồn: Yahoo Finance (chỉ số quốc tế), CafeF (chỉ số Việt Nam). MSCI World thể hiện qua quỹ ETF iShares MSCI World (URTH), tính bằng USD.',
          locale: 'vi-VN' }
  }[lang] || null;
  if (!T) return;

  var GROUPS = [
    ['us', [['SP500', 'S&P 500'], ['NASDAQ', 'Nasdaq Composite'], ['DOW', 'Dow Jones']]],
    ['eu', [['CAC40', 'CAC 40'], ['DAX', 'DAX'], ['FTSE100', 'FTSE 100'], ['ESTX50', 'EURO STOXX 50']]],
    ['asia', [['NIKKEI', 'Nikkei 225'], ['KOSPI', 'KOSPI'], ['TAIEX', 'TAIEX'], ['MSCIW', 'MSCI World']]],
    ['vn', [['VNINDEX', 'VN-Index'], ['VN30', 'VN30-Index'], ['HNX', 'HNX-Index'], ['HNX30', 'HNX30-Index'], ['UPCOM', 'UPCoM-Index']]]
  ];
  var COLORS = ['#1F5C46', '#D98A3D', '#3F7FA8', '#8E5BA8', '#B8901A'];
  var SPANS = [53, 105, 158];

  var start = new Date(D.start + 'T00:00:00Z');
  function dateAt(i, key) {
    if (i === D.weeks) return new Date((D.last[key] || D.lastAll) + 'T00:00:00Z');
    return new Date(start.getTime() + i * 7 * 864e5);
  }
  function fmtDate(d, long) {
    return d.toLocaleDateString(T.locale, long ? { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' } : { month: 'short', year: 'numeric', timeZone: 'UTC' });
  }
  function fmtNum(x) { return x.toLocaleString(T.locale, { maximumFractionDigits: x < 1000 ? 2 : 0 }); }
  function fmtPct(x) { return (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(x).toLocaleString(T.locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + (lang === 'en' ? '%' : ' %'); }

  var state = { span: 0 };
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent, ns) {
    var e = ns ? document.createElementNS(NS, tag) : document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  var bar = el('div', { 'class': 'mk-periods', role: 'group', 'aria-label': T.period }, root);
  var btns = T.p.map(function (label, i) {
    var b = el('button', { type: 'button', 'aria-pressed': i === state.span ? 'true' : 'false' }, bar);
    b.textContent = label;
    b.addEventListener('click', function () { state.span = i; render(); });
    return b;
  });
  var grid = el('div', { 'class': 'mk-grid' }, root);
  var note = el('p', { 'class': 'note' }, root);
  note.textContent = T.src + fmtDate(new Date(D.lastAll + 'T00:00:00Z'), true) + T.src2;

  function render() {
    btns.forEach(function (b, i) { b.setAttribute('aria-pressed', i === state.span ? 'true' : 'false'); });
    grid.innerHTML = '';
    var n = SPANS[state.span], i0 = D.weeks + 1 - n;
    GROUPS.forEach(function (g) {
      var card = el('div', { 'class': 'mk-card' }, grid);
      el('h3', {}, card).textContent = T.groups[g[0]];
      var series = g[1].map(function (s, j) {
        var v = D.series[s[0]].slice(i0);
        var base = v[0];
        return { key: s[0], name: s[1], color: COLORS[j], raw: v, pct: v.map(function (x) { return (x / base - 1) * 100; }) };
      });
      var lo = 0, hi = 0;
      series.forEach(function (s) { s.pct.forEach(function (p) { if (p < lo) lo = p; if (p > hi) hi = p; }); });
      var step = niceStep((hi - lo) / 4);
      lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
      var W = 560, H = 260, L = 48, R = 12, Tp = 10, B = 26;
      var x = function (i) { return L + (W - L - R) * i / (n - 1); };
      var y = function (p) { return Tp + (H - Tp - B) * (hi - p) / (hi - lo || 1); };
      var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': T.groups[g[0]] + ' — ' + T.p[state.span] }, card, true);
      for (var p = lo; p <= hi + 1e-9; p += step) {
        el('line', { x1: L, x2: W - R, y1: y(p), y2: y(p), stroke: Math.abs(p) < 1e-9 ? '#1A1F1C' : '#E2DED3', 'stroke-width': Math.abs(p) < 1e-9 ? 1.2 : 1 }, svg, true);
        var t = el('text', { x: L - 6, y: y(p) + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#5B635E' }, svg, true);
        t.textContent = (p > 0 ? '+' : '') + Math.round(p) + '%';
      }
      var ticks = state.span === 0 ? 4 : state.span === 1 ? 4 : 6;
      for (var k = 0; k <= ticks; k++) {
        var idx = Math.round((n - 1) * k / ticks);
        var tx = el('text', { x: x(idx), y: H - 6, 'text-anchor': k === 0 ? 'start' : k === ticks ? 'end' : 'middle', 'font-size': 11, fill: '#5B635E' }, svg, true);
        tx.textContent = fmtDate(dateAt(i0 + idx, series[0].key));
      }
      series.forEach(function (s) {
        var d = s.pct.map(function (p, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p).toFixed(1); }).join(' ');
        el('path', { d: d, fill: 'none', stroke: s.color, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg, true);
      });
      var ul = el('ul', { 'class': 'mk-legend' }, card);
      series.forEach(function (s) {
        var li = el('li', {}, ul);
        var sw = el('span', { 'class': 'mk-sw', 'aria-hidden': 'true' }, li); sw.style.background = s.color;
        el('span', { 'class': 'mk-name' }, li).textContent = s.name;
        el('span', { 'class': 'mk-val' }, li).textContent = fmtNum(s.raw[s.raw.length - 1]);
        var chg = s.pct[s.pct.length - 1];
        var c = el('span', { 'class': 'mk-chg ' + (chg >= 0 ? 'up' : 'down') }, li);
        c.textContent = fmtPct(chg);
      });
    });
  }
  function niceStep(r) {
    var m = Math.pow(10, Math.floor(Math.log10(r || 1))), f = r / m;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * m;
  }
  render();
})();
