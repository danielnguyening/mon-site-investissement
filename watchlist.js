(function () {
  // [nom, symbole, devise, dernier cours, date, variation 1 an %, variation 6 mois %, secteur (clé)]
  var D = window.WATCH || {
    FR: { idx: ['CAC 40', 1.1], rows: [
      ['TotalEnergies','TTE','EUR',77.87,'2026-11-24',39.3,-1,'energy'], ['LVMH','MC','EUR',391.7,'2026-11-24',-37,-17.1,'luxury'], ['Hermès','RMS','EUR',1243.5,'2026-11-24',-41.1,-22.5,'luxury'],
      ['L’Oréal','OR','EUR',439.05,'2026-11-24',20.2,21.4,'cosmetics'], ['Airbus','AIR','EUR',195.7,'2026-11-24',-2.2,15.4,'aero'], ['Schneider Electric','SU','EUR',230.85,'2026-11-24',3.6,-14.2,'electric'],
      ['Sanofi','SAN','EUR',93.09,'2026-11-24',8.3,21.1,'pharma'], ['Air Liquide','AI','EUR',188.52,'2026-11-24',26.1,15,'gases'], ['BNP Paribas','BNP','EUR',91.23,'2026-11-24',29.6,1.4,'bank'], ['Axa','CS','EUR',45.5,'2026-11-24',19,13.4,'insurance']] },
    DE: { idx: ['DAX', 8], rows: [
      ['SAP','SAP','EUR',189.18,'2026-11-24',-8.8,24.6,'software'], ['Siemens','SIE','EUR',259.9,'2026-11-24',16.5,-3.2,'industry'], ['Allianz','ALV','EUR',457.5,'2026-11-24',26.1,18.6,'insurance'],
      ['Deutsche Telekom','DTE','EUR',26.52,'2026-11-24',-2.5,-9.5,'telecom'], ['Rheinmetall','RHM','EUR',741.3,'2026-11-24',-48.6,-39.6,'defense'], ['Mercedes-Benz','MBG','EUR',37.35,'2026-11-24',-35,-25.5,'auto'],
      ['BMW','BMW','EUR',53.2,'2026-11-24',-38.9,-28.6,'auto'], ['Infineon','IFX','EUR',45.67,'2026-11-24',39,-37.8,'semis']] },
    US: { idx: ['S&P 500', 7.9], rows: [
      ['Nvidia','NVDA','USD',155.4,'2026-11-24',-14.9,-27.8,'semis'], ['Apple','AAPL','USD',352.68,'2026-11-24',27.8,14.2,'tech'], ['Microsoft','MSFT','USD',493.52,'2026-11-24',4.1,17.9,'software'],
      ['Alphabet (Google)','GOOGL','USD',281.05,'2026-11-24',-11.8,-26.6,'internet'], ['Amazon','AMZN','USD',254.55,'2026-11-24',12.5,-4.4,'internet'], ['Meta','META','USD',598.72,'2026-11-24',-2.3,-1.9,'internet'],
      ['Tesla','TSLA','USD',387.45,'2026-11-24',-7.3,-9.1,'auto'], ['JPMorgan Chase','JPM','USD',318.15,'2026-11-24',6.8,3.8,'bank']] },
    VN: { idx: ['VN-Index', 2.2], rows: [
      ['Vingroup','VIC','VND',245.7,'2026-11-23',105.2,13.5,'conglomerate'], ['Vinhomes','VHM','VND',61.5,'2026-11-23',24.4,-16.9,'realestate'], ['Vietcombank','VCB','VND',50.3,'2026-11-23',-13.7,-20.1,'bank'],
      ['BIDV','BID','VND',30.1,'2026-11-23',-13.6,-24.4,'bank'], ['VietinBank','CTG','VND',30.35,'2026-11-23',-8.7,-11.4,'bank'], ['Techcombank','TCB','VND',20.75,'2026-11-23',-6.4,-3.4,'bank'],
      ['FPT','FPT','VND',46.85,'2026-11-23',-47.3,-30.4,'it'], ['Hòa Phát','HPG','VND',20.4,'2026-11-23',-15.7,-14.8,'steel'], ['Thế Giới Di Động','MWG','VND',70.9,'2026-11-23',-9.2,-9.3,'retail'],
      ['Vinamilk','VNM','VND',52.3,'2026-11-23',-10.4,-5.1,'dairy']] },
    JP: { idx: ['Nikkei 225', 20.5], rows: [
      ['Toyota','7203','JPY',3312,'2026-11-20',7.6,9.5,'auto'], ['Sony','6758','JPY',4312,'2026-11-20',-1.7,19.8,'tech'], ['Mitsubishi UFJ','8306','JPY',3024,'2026-11-20',27.2,-1.4,'bank'],
      ['SoftBank Group','9984','JPY',3025,'2026-11-20',-21.4,-57.2,'invest'], ['Keyence','6861','JPY',14025,'2026-11-20',29.7,-11.1,'industry'], ['Tokyo Electron','8035','JPY',8309,'2026-11-20',33.6,-20.4,'semis'],
      ['Fast Retailing (Uniqlo)','9983','JPY',82220,'2026-11-20',46.8,9.5,'retail'], ['Hitachi','6501','JPY',4763,'2026-11-20',1.1,-5.8,'industry']] },
    KR: { idx: ['KOSPI', 29.8], rows: [
      ['Samsung Electronics','005930','KRW',177500,'2026-11-23',78.8,-39.3,'semis'], ['SK Hynix','000660','KRW',1085000,'2026-11-23',109.1,-44.1,'semis'], ['LG Energy Solution','373220','KRW',291500,'2026-11-23',-29.5,-26.9,'battery'],
      ['Hyundai Motor','005380','KRW',247500,'2026-11-23',-3.9,-62.2,'auto'], ['Kia','000270','KRW',86400,'2026-11-23',-22.3,-47.6,'auto'], ['Naver','035420','KRW',150000,'2026-11-23',-40.7,-26.1,'internet']] },
    TW: { idx: ['TAIEX', 51.4], rows: [
      ['TSMC','2330','TWD',2230,'2026-11-24',62.2,-1.1,'semis'], ['Hon Hai (Foxconn)','2317','TWD',226.5,'2026-11-24',3,-9.4,'electronics'], ['MediaTek','2454','TWD',4050,'2026-11-24',252.2,4.9,'semis'],
      ['Delta Electronics','2308','TWD',1085,'2026-11-24',21.5,-48.2,'electronics'], ['Quanta Computer','2382','TWD',282.5,'2026-11-24',3.9,-10.6,'electronics'], ['Fubon Financial','2881','TWD',143.5,'2026-11-24',56,50.9,'insurance']] },
    CN: { idx: ['Shanghai Composite', -7.5], rows: [
      ['Tencent','0700.HK','HKD',341.6,'2026-11-24',-45.3,-22.6,'internet'], ['Alibaba','9988.HK','HKD',82.2,'2026-11-24',-46.8,-35.3,'internet'], ['Kweichow Moutai','600519','CNY',1460,'2026-11-24',0.6,13.2,'beverage'],
      ['CATL','300750','CNY',227.37,'2026-11-24',-38.6,-44.7,'battery'], ['BYD','1211.HK','HKD',60.3,'2026-11-24',-36.4,-34.2,'auto'], ['Xiaomi','1810.HK','HKD',26.5,'2026-11-24',-31.5,-11.7,'tech'],
      ['China Mobile','0941.HK','HKD',78.75,'2026-11-24',-10.1,-7.9,'telecom'], ['ICBC','601398','CNY',9.22,'2026-11-24',12.4,28.4,'bank']] }
  };

  var ORDER = ['FR', 'DE', 'US', 'VN', 'JP', 'KR', 'TW', 'CN'];
  var T = {
    fr: { i: 0, locale: 'fr-FR', pct: ' %', title: 'À suivre : grandes actions par pays', choose: 'Choisir le pays',
      note: 'Variation du cours sur 1 an (barre) et sur 6 mois. Liste de surveillance : ces actions ne font pas partie de la répartition ci-dessus.',
      m6: '6 mois', idx: 'Indice de référence', vnUnit: 'milliers de ₫',
      foot: 'Sources : Yahoo Finance, CafeF (Vietnam). Pour investir à l’étranger depuis le Vietnam, un ETF sur l’indice du pays est plus simple et plus diversifié que des actions une par une ; vérifie d’abord les règles de transfert de capitaux auprès de ta banque. Les performances passées ne préjugent pas de l’avenir.',
      c: { FR: 'France', DE: 'Allemagne', US: 'États-Unis', VN: 'Vietnam', JP: 'Japon', KR: 'Corée du Sud', TW: 'Taïwan', CN: 'Chine' } },
    en: { i: 1, locale: 'en-GB', pct: '%', title: 'Watchlist: major stocks by country', choose: 'Choose a country',
      note: '1-year share price change (bar) and 6-month change. Watchlist only: these stocks are not part of the allocation above.',
      m6: '6 months', idx: 'Benchmark index', vnUnit: 'thousand ₫',
      foot: 'Sources: Yahoo Finance, CafeF (Vietnam). To invest abroad from Vietnam, an ETF on the country’s index is simpler and more diversified than single stocks; first check the rules on transferring capital with your bank. Past performance does not guarantee future results.',
      c: { FR: 'France', DE: 'Germany', US: 'United States', VN: 'Vietnam', JP: 'Japan', KR: 'South Korea', TW: 'Taiwan', CN: 'China' } },
    vi: { i: 2, locale: 'vi-VN', pct: ' %', title: 'Theo dõi: cổ phiếu chính theo quốc gia', choose: 'Chọn quốc gia',
      note: 'Biến động giá trong 1 năm (thanh) và 6 tháng. Đây là danh sách theo dõi: các cổ phiếu này không nằm trong phân bổ ở trên.',
      m6: '6 tháng', idx: 'Chỉ số tham chiếu', vnUnit: 'nghìn ₫',
      foot: 'Nguồn: Yahoo Finance, CafeF (Việt Nam). Để đầu tư ra nước ngoài từ Việt Nam, quỹ ETF theo chỉ số của nước đó đơn giản và đa dạng hơn mua từng cổ phiếu; hãy hỏi ngân hàng về quy định chuyển vốn trước. Kết quả trong quá khứ không đảm bảo cho tương lai.',
      c: { FR: 'Pháp', DE: 'Đức', US: 'Mỹ', VN: 'Việt Nam', JP: 'Nhật Bản', KR: 'Hàn Quốc', TW: 'Đài Loan', CN: 'Trung Quốc' } }
  };
  var S = {
    energy: ['Énergie', 'Energy', 'Năng lượng'], luxury: ['Luxe', 'Luxury goods', 'Hàng xa xỉ'], cosmetics: ['Cosmétiques', 'Cosmetics', 'Mỹ phẩm'], aero: ['Aéronautique', 'Aerospace', 'Hàng không'],
    electric: ['Équipements électriques', 'Electrical equipment', 'Thiết bị điện'], pharma: ['Pharmacie', 'Pharmaceuticals', 'Dược phẩm'], gases: ['Gaz industriels', 'Industrial gases', 'Khí công nghiệp'],
    bank: ['Banque', 'Banking', 'Ngân hàng'], insurance: ['Assurance', 'Insurance', 'Bảo hiểm'], software: ['Logiciels', 'Software', 'Phần mềm'], industry: ['Industrie', 'Industrials', 'Công nghiệp'],
    telecom: ['Télécoms', 'Telecoms', 'Viễn thông'], defense: ['Défense', 'Defence', 'Quốc phòng'], auto: ['Automobile', 'Automotive', 'Ô tô'], semis: ['Semi-conducteurs', 'Semiconductors', 'Bán dẫn'],
    tech: ['Électronique grand public', 'Consumer tech', 'Điện tử tiêu dùng'], internet: ['Internet', 'Internet', 'Internet'], invest: ['Investissement', 'Investment', 'Đầu tư'], retail: ['Distribution', 'Retail', 'Bán lẻ'],
    battery: ['Batteries', 'Batteries', 'Pin'], electronics: ['Électronique', 'Electronics', 'Điện tử'], beverage: ['Boissons', 'Beverages', 'Đồ uống'], realestate: ['Immobilier', 'Real estate', 'Bất động sản'],
    conglomerate: ['Conglomérat', 'Conglomerate', 'Tập đoàn đa ngành'], steel: ['Acier', 'Steel', 'Thép'], dairy: ['Produits laitiers', 'Dairy', 'Sữa'], it: ['Services informatiques', 'IT services', 'Công nghệ thông tin']
  };

  var root = document.getElementById('watchlist');
  if (!root) return;
  var lang = (document.documentElement.lang || 'fr').slice(0, 2);
  var L = T[lang] || T.fr;
  var KEY = 'msi_watch_country';
  var cur = 'FR';
  try { var saved = localStorage.getItem(KEY); if (saved && D[saved] && D[saved].rows.length) cur = saved; } catch (e) {}

  function fmt(x, d) { return x.toLocaleString(L.locale, { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function pct(x) { return (x > 0 ? '+' : x < 0 ? '−' : '') + fmt(Math.abs(x), 1) + L.pct; }
  function stamp() { var d = window.DATA_UPDATED ? new Date(window.DATA_UPDATED) : null; if (!d || isNaN(d)) return ''; return ' <b>' + ({ fr: 'Mis à jour le ', en: 'Updated ', vi: 'Cập nhật ' }[lang] || '') + d.toLocaleString(L.locale, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }) + '.</b>'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function price(r) {
    var d = r[3] >= 1000 ? 0 : 2;
    return fmt(r[3], d) + ' ' + (r[2] === 'VND' ? L.vnUnit : r[2]);
  }

  function render() {
    var c = D[cur];
    var rows = c.rows.slice().sort(function (a, b) { return b[5] - a[5]; });
    var max = Math.max.apply(null, rows.map(function (r) { return Math.abs(r[5]); }).concat([Math.abs(c.idx[1])]));
    var h = '<h2>' + L.title + '</h2>';
    h += '<div class="wl-tabs" role="group" aria-label="' + L.choose + '">';
    ORDER.forEach(function (k) {
      if (!D[k] || !D[k].rows.length) return;
      h += '<button type="button" data-c="' + k + '" aria-pressed="' + (k === cur ? 'true' : 'false') + '">' + L.c[k] + '</button>';
    });
    h += '</div><p class="note">' + L.note + stamp() + '</p><div class="perf">';
    var line = function (name, sub, v, extra, isIdx) {
      var w = Math.max(2, Math.abs(v) / max * 100).toFixed(1);
      return '<div class="perf-row' + (isIdx ? ' index' : '') + '"><div class="perf-name">' + esc(name) + '<small>' + sub + '</small></div>' +
        '<div class="track" aria-hidden="true"><div class="neg">' + (v < 0 ? '<i style="width:' + w + '%"></i>' : '') + '</div><div class="pos">' + (v >= 0 ? '<i style="width:' + w + '%"></i>' : '') + '</div></div>' +
        '<div class="val ' + (v >= 0 ? 'up' : 'down') + '">' + pct(v) + extra + '</div></div>';
    };
    rows.forEach(function (r) {
      var sub = esc(S[r[7]] ? S[r[7]][L.i] : '') + ' · ' + esc(r[1]) + ' · ' + price(r);
      h += line(r[0], sub, r[5], '<small class="wl-6m">' + L.m6 + ' ' + pct(r[6]) + '</small>', false);
    });
    h += line(c.idx[0], L.idx, c.idx[1], '', true);
    h += '</div><p class="note">' + L.foot + '</p>';
    root.innerHTML = h;
    root.querySelectorAll('.wl-tabs button').forEach(function (b) {
      b.addEventListener('click', function () { cur = b.getAttribute('data-c'); try { localStorage.setItem(KEY, cur); } catch (e) {} render(); root.querySelector('.wl-tabs button[aria-pressed="true"]').focus(); });
    });
  }
  render();
})();
