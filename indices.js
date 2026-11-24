(function () {
  // [continent, pays, indice, date, dernier, var 1 an %, var 6 mois %, var 3 mois %, écart MM200 %, MM50 vs MM200 %, écart plus haut 1 an %, courbe 1 an (base 100, 27 points)]
  var ROWS = window.WORLD_ROWS || [
    ['am','US','S&P 500','2026-11-23',7237,7.9,-3.2,-5.4,-1.5,3.6,-7.4,[100,102.1,102.6,102.9,103.5,104,102,102.6,99.9,94.6,102.7,107,110.6,111.5,110.4,111.4,112.4,111,113.4,115.5,114.6,113.6,114.6,116.4,114.5,112.6,107.9]],
    ['am','CA','S&P/TSX','2026-11-23',34082,11.4,-1.1,-7.2,-2,2.5,-7.8,[100,101.8,104.6,105.3,108.1,105.2,108.1,112.9,107.4,104.3,110.7,110.5,111.5,113.5,112.7,114.4,115.1,114.2,115.1,119.8,118.5,116.7,116,116.5,117.4,119.1,111.4]],
    ['am','MX','S&P/BMV IPC','2026-11-23',69356,10.9,1.5,5.5,2.5,-0.2,-3.7,[100,101.6,103.6,104,107.9,108.1,114.1,112.9,105,107.3,111.3,108.7,112.4,109.2,105.1,107.4,107.9,105.8,106.7,102.8,104.7,102.7,103.9,106.8,111.1,114.9,110.9]],
    ['am','BR','Bovespa','2026-11-24',166339,7.1,-5.6,-3.2,-8.1,2.3,-20.4,[100,101.9,101.8,104.2,106.2,117.7,120.1,121.9,115.8,117.5,127.5,122.1,117.2,114.2,108.6,109.7,111.1,111.7,114.6,107.4,114.3,119.5,117.8,134.6,113.7,110.9,107.1]],
    ['eu','ES','IBEX 35','2026-11-24',19040,19.2,5.9,-5.3,1.2,2.8,-5.8,[100,104.7,107.5,110.3,110.6,113.4,111.8,112,107,106.3,112.9,110.8,111.8,115.2,114.1,122.4,123.3,120.3,125.1,125.1,125.1,122.5,122.7,120.8,119.2,123.6,119.2]],
    ['eu','SE','OMX Stockholm 30','2026-11-24',3231,18.6,2.7,-1.8,1.7,3,-3.8,[100,103.6,104.4,106.5,109.5,112.5,114.5,116.3,111.1,106.1,113.8,113,113,117.2,114,117.1,118.7,115,120.1,119.8,121.4,118.1,120.4,120,118.3,121.4,118.6]],
    ['eu','BE','BEL 20','2026-11-24',5861,17.3,4.9,0.8,4.7,2.9,-4.2,[100,100.6,101.2,102,105.8,109.2,112,107.4,102.6,100.6,108.6,107.2,110,113,111,114.2,114.7,112.4,113.4,115.3,116.7,114.6,113.8,109.8,115.7,122,117.3]],
    ['eu','NL','AEX','2026-11-24',1080,16.5,3.3,-2.7,1.2,5.1,-5.7,[100,102,101.7,106.3,107.1,108.9,107.1,109.6,108.7,104.1,109.2,108.8,109.5,113.6,112.7,116.8,116.8,117.7,118.9,120.3,119.3,118.5,120.4,122.5,122.3,121.9,116.5]],
    ['eu','CH','SMI','2026-11-24',14720,16.3,9,1.9,6.2,3.7,-3.1,[100,102.6,104,104.7,104.9,106,107.9,109.3,101.8,100.1,103.9,104,103.5,106.7,105.3,109.4,113,112.6,113.6,113,112.9,109.7,110.2,109.7,114.9,118.1,116.3]],
    ['eu','IT','FTSE MIB','2026-11-24',48330,14.3,-2.4,-8,-3,1.3,-10,[100,102.7,105.4,108.4,106.9,108.8,107.4,109.4,104.8,103.6,112.4,112.7,117.4,118.7,118.7,124.8,125.2,122.6,125,126.7,124.4,122.1,122.4,118.3,116.3,121.5,114.3]],
    ['eu','GB','FTSE 100','2026-11-24',10453,9.6,-0.1,-3.7,-1,1.1,-4.2,[100,101.2,103.5,104.9,106.9,108.5,109.8,113.1,108.2,106.2,111,108.2,107.7,109.8,108.8,109.5,111.7,110.4,113.9,112.4,113.5,112.2,112.1,111.8,112.9,113.1,109.6]],
    ['eu','EZ','EURO STOXX 50','2026-11-24',6021,8.9,0,-6.6,-1.8,1.4,-8.1,[100,103.6,103.9,107.1,107.2,108.7,108.1,108.3,103.8,100.2,106.8,106,106.6,108.9,109.7,114.2,115.7,112.6,116.2,118.1,116.1,113.2,114,112.2,110.6,113.8,108.9]],
    ['eu','DE','DAX','2026-11-24',25088,8,0.8,-3.9,0.3,2.4,-6.3,[100,103.5,104.5,107,107.4,106.7,106.7,106,101.4,97.1,102.2,103.6,104.8,109.3,105.9,108.2,111.1,106.9,111.9,113.3,113,109.5,109.2,108.8,109.3,113,108]],
    ['eu','FR','CAC 40','2026-11-24',8045,1.1,-0.9,-4.8,-1.9,-2.2,-7.8,[100,101.9,102,103.2,101.9,102.8,104.5,105.5,99.7,97.6,103.5,102.3,101.2,103.8,103,105.5,106.5,104.8,108.2,107.8,104.7,102,101.5,98.4,98.6,103.4,101.1]],
    ['eu','TR','BIST 100','2026-11-24',10969,0.7,-20.6,-24.4,-18.5,-11.1,-27.5,[100,102.8,103.9,107.5,117.1,125.1,131.7,122.6,119,116,129.1,134,139,127.6,127.3,135.3,132.5,129.2,123.2,129.8,131.7,130.7,115.7,111.6,102.4,107.6,100.7]],
    ['as','TW','TAIEX','2026-11-24',40122,51.4,-5.1,-10.4,-3.5,8.9,-19.5,[100,106.8,106.2,113.6,119.4,119.3,126.8,132.4,125.8,122.7,133.8,149.5,157.7,164.7,164.1,180.1,175.7,160.2,163.7,173,174,173,181.2,186,173.7,157.2,151.4]],
    ['as','KR','KOSPI','2026-11-24',5006,29.8,-36.2,-25.8,-23.2,-8.3,-45.1,[100,107.4,106.7,117.3,126.6,137.1,142.8,150.1,146.2,131,154.7,172.1,198.1,208.6,209.9,212.7,198.5,174.9,164.8,178.1,177.2,171.8,178.1,156.4,146.2,135.8,129.8]],
    ['as','JP','Nikkei 225','2026-11-24',58645,20.5,-10,-11,-5.9,2.6,-19,[100,104.1,103.6,107.9,108.9,112.5,116.2,115.7,110.4,104.9,118.9,123.1,128.9,133.6,134.4,143.4,140.3,136.1,131.4,138.6,136.1,130.5,134.6,139.3,130,124.3,120.5]],
    ['as','SG','Straits Times','2026-11-24',4959,10.3,-2.2,-12.7,-5.8,3.1,-14.5,[100,100.2,102.5,104.1,107.5,108.8,109.8,108.8,108.3,108.9,110.8,108.8,109.9,112.8,110.4,115.7,117,122.3,124.8,128.3,128,127.2,127.4,120.4,120.4,115.2,110.3]],
    ['as','NZ','S&P/NZX 50','2026-11-24',13970,2.9,7.7,-0.2,3.4,2.5,-2.3,[100,98.9,99.8,100.7,99.3,98,96.5,99.6,97.1,95.1,95.9,94,96.4,96.3,97.3,99,101.4,100.6,102.4,102.2,101.6,100,100.8,101.3,100.8,103.8,102.9]],
    ['as','AU','S&P/ASX 200','2026-11-24',8726,2.2,0.4,-4.8,-1.2,-0.2,-5.9,[100,100.6,103,102.1,103.3,103.7,104.9,106.3,100.9,99.4,105.1,102,101.6,101.4,100.8,102.9,103.1,103,107.1,106.2,106.2,101.6,102,102.9,103.7,106.9,102.2]],
    ['as','VN','VN-Index','2026-11-23',1697,2.2,-10,-5.3,-4.8,-2.1,-12,[100,105.2,106.7,109.4,114.1,109.2,109.9,109.2,103,100.9,106.9,113,114.5,113.5,108,112.6,111.3,104.2,107,104.3,110.3,109.1,107.1,103.6,106.1,105,102.2]],
    ['as','VN','UPCoM-Index','2026-11-23',119.2,0.4,-5.7,-6.2,-5.7,-1.6,-8.5,[100,101,101.1,101.8,106.5,108.3,107.5,108.9,105.8,106.8,108.3,107.5,107.2,106.3,105.4,107.3,107.8,106,107.3,107.5,107.7,106.8,105.9,104.3,106.4,102.3,100.4]],
    ['as','VN','VN30-Index','2026-11-23',1791,-6.2,-11.4,-7.5,-7.2,-2.8,-14.6,[100,103.3,105.4,107.7,109.2,104.6,105.7,102.6,98.1,95.8,101.9,106.9,107.6,106.2,102.2,104.5,104.5,98.5,100.9,98.2,103.8,102.2,100.2,97.5,98.7,97.5,93.8]],
    ['as','VN','HNX-Index','2026-11-23',232.2,-9.7,-14.6,-17.8,-14.1,-3.6,-30.9,[100,99.9,99.3,95.8,98.4,103.1,99.9,101.1,95.9,97.5,98.1,96.9,98.4,108.1,118.8,126.8,114.3,109.1,111.3,109.7,110.7,106.5,104.9,102.7,100.9,99.6,90.3]],
    ['as','VN','HNX30-Index','2026-11-23',423.1,-24.3,-18.4,-8.8,-14.5,-11.7,-28.1,[100,99.6,98.2,94.6,99.7,104.4,100.9,103.9,93.9,97.3,97.9,93.4,94.7,94.2,91.3,91.8,92.2,82.8,82.5,80.4,83.4,80.2,78.8,76.5,79,79.3,75.7]],
    ['as','IN','Nifty 50','2026-11-23',25350,-2.3,6.9,4.7,5.6,-2,-3.7,[100,100,100.8,101.1,98.6,96.6,98.9,95.8,90.2,86,91.8,92.8,91.7,92.6,89.1,92.8,94.1,93.4,95.4,93.6,92.8,90.1,87.8,86.1,87.6,96.5,97.7]],
    ['as','MY','FTSE Bursa Malaysia KLCI','2026-11-24',1562,-3.5,-8.8,-10.1,-7.6,-4.1,-11.8,[100,99.6,103.2,103.8,105.8,107.5,107.6,105,104.8,104.3,103.8,106.1,107.8,105.5,103.8,105.1,104,106.4,106.6,106.6,106.6,104.9,103.2,100,99.1,99.9,96.5]],
    ['as','CN','Shanghai Composite','2026-11-24',3548,-7.5,-13.7,-8.6,-10.2,-5.3,-16.4,[100,102.3,102.1,104.9,107.2,104.7,106.4,109,106.5,102.3,104,106.5,110.1,108.2,103.2,108.5,105.3,98.9,99.3,103.8,103.9,101.3,99.7,99,96.4,95.4,92.5]],
    ['as','HK','Hang Seng','2026-11-24',22220,-13.6,-13.2,-12.9,-11.4,-4.4,-20.6,[100,100.2,100.3,102.5,103.3,104.1,103.8,101.3,100.5,96.2,99.8,100.8,102.7,99.6,95.9,92.4,91.8,97.8,101.1,99,99.4,96.9,95.8,94.4,90.3,95.1,86.4]],
    ['as','ID','IDX Composite','2026-11-24',5242,-38.8,-14.9,-19.4,-19.9,-14.2,-42.6,[100,101.6,100.9,103.4,106.6,92.4,95.8,93.5,81.9,82.7,87.5,82.9,80.6,72.4,62.3,71.4,69,72.7,72.7,74.7,76.1,76.2,71.7,69.3,62.7,59.2,61.2]],
    ['me','IL','TA-35','2026-11-24',3856,14.4,-12.2,-6.6,-8.2,-2,-14.8,[100,105.3,110,110.9,117.7,120.1,124.2,128,123.9,119.3,130,129,133.8,134.3,127,123,123.6,122.7,122,123.8,122.8,125.4,125.2,120.5,124.8,119,114.4]],
    ['me','ZA','JSE All Share','2026-11-24',105800,-3.8,-6.6,-9.3,-7.2,-3.5,-17.6,[100,100.7,105.4,106,109.2,108.1,110,115.4,106,102.2,107.7,106,107.7,105.4,101,102.5,101,99,102.4,104.2,105.7,103.2,99.2,98.9,99.2,104.6,96.2]],
    ['gl','W','MSCI World (ETF URTH)','2026-11-23',195.3,7.8,-3.6,-6.3,-2.3,2.8,-7.7,[100,102.6,102.8,103.8,104.4,105.2,104.5,105,101.6,96.6,104.9,107.9,110.9,111.8,111,111.7,112.9,111,113.6,116.2,115.3,114.2,114.4,115.3,113.8,113.1,107.8]],
    ['gl','EM','MSCI Emerging Markets (ETF EEM)','2026-11-23',57.83,7.8,-12.2,-12.5,-9.5,-0.5,-18.8,[100,101.8,100.7,106,107.8,110.5,113.9,114.6,108.8,102,113.8,118.6,126.5,122.8,122.5,132.7,125.9,118.4,119.9,125.5,124.9,123,125.2,123.3,115.2,113.7,107.8]]
  ];

  var C = {
    US:['États-Unis','United States','Hoa Kỳ'], CA:['Canada','Canada','Canada'], MX:['Mexique','Mexico','Mexico'], BR:['Brésil','Brazil','Brazil'],
    ES:['Espagne','Spain','Tây Ban Nha'], SE:['Suède','Sweden','Thụy Điển'], BE:['Belgique','Belgium','Bỉ'], NL:['Pays-Bas','Netherlands','Hà Lan'], CH:['Suisse','Switzerland','Thụy Sĩ'],
    IT:['Italie','Italy','Ý'], GB:['Royaume-Uni','United Kingdom','Anh'], EZ:['Zone euro','Eurozone','Khu vực đồng euro'], DE:['Allemagne','Germany','Đức'], FR:['France','France','Pháp'], TR:['Turquie','Türkiye','Thổ Nhĩ Kỳ'],
    TW:['Taïwan','Taiwan','Đài Loan'], KR:['Corée du Sud','South Korea','Hàn Quốc'], JP:['Japon','Japan','Nhật Bản'], SG:['Singapour','Singapore','Singapore'], NZ:['Nouvelle-Zélande','New Zealand','New Zealand'],
    AU:['Australie','Australia','Úc'], VN:['Vietnam','Vietnam','Việt Nam'], IN:['Inde','India','Ấn Độ'], MY:['Malaisie','Malaysia','Malaysia'], CN:['Chine','China','Trung Quốc'], HK:['Hong Kong','Hong Kong','Hồng Kông'],
    ID:['Indonésie','Indonesia','Indonesia'], IL:['Israël','Israel','Israel'], ZA:['Afrique du Sud','South Africa','Nam Phi'], W:['Monde (pays développés)','World (developed markets)','Thế giới (thị trường phát triển)'], EM:['Marchés émergents','Emerging markets','Thị trường mới nổi']
  };

  var T = {
    fr: { i: 0, locale: 'fr-FR', pct: ' %',
      rank: 'Classement mondial sur 1 an', rankNote: 'Variation de l’indice principal de chaque pays sur les 12 derniers mois.',
      cols: ['Pays', 'Indice', '1 an', '1 an', '6 mois', 'Signal'],
      sig: ['Positif', 'Neutre', 'Négatif'],
      cont: { am: 'Amériques', eu: 'Europe', as: 'Asie-Pacifique', me: 'Moyen-Orient et Afrique', gl: 'Repères mondiaux' },
      med: 'Médiane sur 1 an', outlook: 'Tendance à 6 mois (analyse de novembre 2026)',
      method: 'Comment lire le signal : il combine trois indicateurs techniques simples (cours au-dessus ou au-dessous de sa moyenne sur 200 séances, moyenne 50 séances au-dessus ou au-dessous de la moyenne 200 séances, variation sur 6 mois). Trois indicateurs favorables = Positif, deux ou trois défavorables = Négatif, sinon Neutre. Il décrit la tendance actuelle ; ce n’est pas une prévision ni un conseil d’investissement.',
      src: 'Sources des cours : Yahoo Finance (international), CafeF (Vietnam), mis à jour automatiquement deux fois par jour. Données absentes sur la source pour l’Argentine, le Chili, la Pologne, la Thaïlande, les Philippines, l’Arabie saoudite et l’Égypte. Avis d’analystes : Morgan Stanley, UBS, Goldman Sachs, SSI Research, Vietcap (novembre 2026).',
      o: {
        am: 'Après le recul de novembre lié aux valeurs de l’IA, le S&P 500 repasse juste sous sa moyenne 200 séances : signal technique mitigé. Les grandes banques restent positives à 12 mois (Morgan Stanley vise 8 700 points fin 2027, UBS 8 200). Scénario central : reprise progressive, avec une volatilité élevée tant que le doute sur l’IA persiste.',
        eu: 'L’Europe résiste mieux : la plupart des indices restent proches ou au-dessus de leur moyenne 200 séances, l’Espagne, la Suisse et le Benelux en tête. UBS fait de la zone euro sa région préférée (bénéfices attendus +15 % en 2027, Euro Stoxx 50 visé à 7 000 fin 2027). Scénario central : stabilité à légère hausse ; la France reste à la traîne. La Turquie est en net repli.',
        as: 'Forte correction depuis octobre en Corée et à Taïwan (vente massive des valeurs de l’IA, sorties de capitaux étrangers), signaux négatifs en Chine, à Hong Kong et en Indonésie. Goldman Sachs voit dans cette baisse un point d’entrée (+19 % attendu pour l’Asie hors Japon en 2027) mais prévient que la volatilité restera forte. Scénario central : rebond possible mais heurté ; l’Inde et la Nouvelle-Zélande montrent les tendances les plus saines.',
        me: 'Israël garde un gain sur 1 an mais corrige depuis 6 mois ; l’Afrique du Sud est en baisse. Couverture limitée faute de données sur l’Arabie saoudite et l’Égypte. Scénario central : neutre, très dépendant de la géopolitique et des matières premières.',
        gl: 'Les pays développés (+7,8 % sur 1 an) et émergents (+7,8 %) font jeu égal sur un an, mais les émergents ont davantage chuté depuis 6 mois.',
        vn: 'Vietnam : le VN-Index est 12 % sous son record et sous sa moyenne 200 séances (signal négatif à court terme), et les indices de Hanoi (HNX, HNX30) reculent nettement. Les analystes locaux restent positifs : SSI Research vise 1 940 points en 2027 (bénéfices +10 %), Vietcap 2 280 fin 2027, portés par le passage au statut de marché émergent FTSE et le retour attendu des investisseurs étrangers. Scénario central : marché volatil à court terme, puis raffermissement.'
      } },
    en: { i: 1, locale: 'en-GB', pct: '%',
      rank: 'World ranking over 1 year', rankNote: 'Change in each country’s main index over the last 12 months.',
      cols: ['Country', 'Index', '1 year', '1 year', '6 months', 'Signal'],
      sig: ['Positive', 'Neutral', 'Negative'],
      cont: { am: 'Americas', eu: 'Europe', as: 'Asia-Pacific', me: 'Middle East and Africa', gl: 'Global benchmarks' },
      med: 'Median over 1 year', outlook: '6-month outlook (November 2026 analysis)',
      method: 'How to read the signal: it combines three simple technical indicators (price above or below its 200-day average, 50-day average above or below the 200-day average, 6-month change). Three favourable = Positive, two or three unfavourable = Negative, otherwise Neutral. It describes the current trend; it is not a forecast or investment advice.',
      src: 'Price sources: Yahoo Finance (international), CafeF (Vietnam), updated automatically twice a day. No data at the source for Argentina, Chile, Poland, Thailand, the Philippines, Saudi Arabia and Egypt. Analyst views: Morgan Stanley, UBS, Goldman Sachs, SSI Research, Vietcap (November 2026).',
      o: {
        am: 'After November’s AI-led pullback, the S&P 500 sits just below its 200-day average: a mixed technical signal. The big banks remain positive over 12 months (Morgan Stanley targets 8,700 by end-2027, UBS 8,200). Base case: a gradual recovery, with high volatility while doubts about AI persist.',
        eu: 'Europe is holding up better: most indices stay close to or above their 200-day average, led by Spain, Switzerland and the Benelux. UBS names the eurozone its preferred region (earnings expected +15% in 2027, Euro Stoxx 50 target of 7,000 by end-2027). Base case: stable to slightly higher; France is lagging. Türkiye is in a clear downtrend.',
        as: 'Sharp correction since October in Korea and Taiwan (AI stock sell-off, foreign outflows); negative signals in China, Hong Kong and Indonesia. Goldman Sachs sees the drop as an entry point (+19% expected for Asia ex-Japan in 2027) but warns volatility will stay high. Base case: a possible but bumpy rebound; India and New Zealand show the healthiest trends.',
        me: 'Israel keeps a 1-year gain but has been correcting for 6 months; South Africa is down. Limited coverage, with no data for Saudi Arabia or Egypt. Base case: neutral, highly dependent on geopolitics and commodities.',
        gl: 'Developed (+7.8% over 1 year) and emerging markets (+7.8%) are level over one year, but emerging markets have fallen more over the past 6 months.',
        vn: 'Vietnam: the VN-Index is 12% below its record and under its 200-day average (negative short-term signal), and the Hanoi indices (HNX, HNX30) are clearly lower. Local analysts remain positive: SSI Research targets 1,940 points in 2027 (earnings +10%), Vietcap 2,280 by end-2027, helped by the FTSE upgrade to emerging-market status and the expected return of foreign investors. Base case: volatile in the short term, then firmer.'
      } },
    vi: { i: 2, locale: 'vi-VN', pct: ' %',
      rank: 'Xếp hạng thế giới trong 1 năm', rankNote: 'Biến động của chỉ số chính mỗi nước trong 12 tháng qua.',
      cols: ['Quốc gia', 'Chỉ số', '1 năm', '1 năm', '6 tháng', 'Tín hiệu'],
      sig: ['Tích cực', 'Trung tính', 'Tiêu cực'],
      cont: { am: 'Châu Mỹ', eu: 'Châu Âu', as: 'Châu Á – Thái Bình Dương', me: 'Trung Đông và châu Phi', gl: 'Tham chiếu toàn cầu' },
      med: 'Trung vị 1 năm', outlook: 'Xu hướng 6 tháng tới (phân tích tháng 11/2026)',
      method: 'Cách đọc tín hiệu: kết hợp ba chỉ báo kỹ thuật đơn giản (giá trên hay dưới đường trung bình 200 phiên, đường trung bình 50 phiên trên hay dưới đường 200 phiên, biến động 6 tháng). Ba chỉ báo thuận lợi = Tích cực, hai hoặc ba chỉ báo bất lợi = Tiêu cực, còn lại là Trung tính. Đây là mô tả xu hướng hiện tại, không phải dự báo hay lời khuyên đầu tư.',
      src: 'Nguồn giá: Yahoo Finance (quốc tế), CafeF (Việt Nam), tự động cập nhật hai lần mỗi ngày. Nguồn không có dữ liệu cho Argentina, Chile, Ba Lan, Thái Lan, Philippines, Ả Rập Xê Út và Ai Cập. Nhận định của chuyên gia: Morgan Stanley, UBS, Goldman Sachs, SSI Research, Vietcap (tháng 11/2026).',
      o: {
        am: 'Sau đợt giảm tháng 11 do cổ phiếu AI, S&P 500 nằm ngay dưới đường trung bình 200 phiên: tín hiệu kỹ thuật lẫn lộn. Các ngân hàng lớn vẫn lạc quan trong 12 tháng (Morgan Stanley dự báo 8.700 điểm cuối 2027, UBS 8.200). Kịch bản chính: phục hồi dần, biến động mạnh chừng nào còn lo ngại về AI.',
        eu: 'Châu Âu chống chịu tốt hơn: phần lớn chỉ số vẫn gần hoặc trên đường trung bình 200 phiên, dẫn đầu là Tây Ban Nha, Thụy Sĩ và Benelux. UBS chọn khu vực đồng euro là ưu tiên (lợi nhuận dự kiến +15 % năm 2027, Euro Stoxx 50 mục tiêu 7.000 điểm cuối 2027). Kịch bản chính: ổn định đến tăng nhẹ; Pháp tụt lại phía sau. Thổ Nhĩ Kỳ đang giảm rõ rệt.',
        as: 'Điều chỉnh mạnh từ tháng 10 tại Hàn Quốc và Đài Loan (bán tháo cổ phiếu AI, vốn ngoại rút ra); tín hiệu tiêu cực ở Trung Quốc, Hồng Kông và Indonesia. Goldman Sachs coi đợt giảm là cơ hội mua (dự báo châu Á trừ Nhật tăng 19 % năm 2027) nhưng cảnh báo biến động vẫn cao. Kịch bản chính: có thể phục hồi nhưng không suôn sẻ; Ấn Độ và New Zealand có xu hướng lành mạnh nhất.',
        me: 'Israel vẫn tăng trong 1 năm nhưng điều chỉnh suốt 6 tháng; Nam Phi giảm. Dữ liệu hạn chế, không có Ả Rập Xê Út và Ai Cập. Kịch bản chính: trung tính, phụ thuộc nhiều vào địa chính trị và hàng hóa.',
        gl: 'Thị trường phát triển (+7,8 % trong 1 năm) và mới nổi (+7,8 %) ngang nhau trong một năm, nhưng thị trường mới nổi giảm mạnh hơn trong 6 tháng qua.',
        vn: 'Việt Nam: VN-Index thấp hơn đỉnh 12 % và nằm dưới đường trung bình 200 phiên (tín hiệu ngắn hạn tiêu cực), các chỉ số sàn Hà Nội (HNX, HNX30) giảm rõ. Giới phân tích trong nước vẫn lạc quan: SSI Research dự báo 1.940 điểm năm 2027 (lợi nhuận +10 %), Vietcap 2.280 điểm cuối 2027, nhờ việc FTSE nâng hạng lên thị trường mới nổi và dòng vốn ngoại dự kiến quay lại. Kịch bản chính: biến động trong ngắn hạn, sau đó vững hơn.'
      } }
  };

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function sigOf(r) { var s = (r[8] > 0 ? 1 : -1) + (r[9] > 0 ? 1 : -1) + (r[6] > 0 ? 1 : -1); return s >= 3 ? 0 : s <= -1 ? 2 : 1; }

  function stamp(L, lang) { var d = (typeof window !== 'undefined' && window.DATA_UPDATED) ? new Date(window.DATA_UPDATED) : null; if (!d || isNaN(d)) return ''; return ' <b>' + ({ fr: 'Mis à jour le ', en: 'Updated ', vi: 'Cập nhật ' }[lang] || '') + d.toLocaleString(L.locale, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }) + '.</b>'; }

  function build(lang) {
    var L = T[lang] || T.fr;
    var fmt = function (x, d) { return x.toLocaleString(L.locale, { minimumFractionDigits: d, maximumFractionDigits: d }); };
    var pct = function (x) { return (x > 0 ? '+' : x < 0 ? '−' : '') + fmt(Math.abs(x), 1) + L.pct; };
    var cls = function (x) { return x >= 0 ? 'up' : 'down'; };
    var spark = function (v) {
      var lo = Math.min.apply(null, v), hi = Math.max.apply(null, v), W = 120, H = 32;
      var d = v.map(function (y, i) { return (i ? 'L' : 'M') + (i * W / (v.length - 1)).toFixed(1) + ' ' + (2 + (H - 4) * (hi - y) / ((hi - lo) || 1)).toFixed(1); }).join(' ');
      return '<svg class="wi-spark" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true"><path d="' + d + '" fill="none" stroke="' + (v[v.length - 1] >= v[0] ? '#1F5C46' : '#C2661E') + '" stroke-width="2" stroke-linejoin="round"/></svg>';
    };
    var badge = function (k) { return '<span class="wi-sig s' + k + '">' + ['▲ ', '■ ', '▼ '][k] + L.sig[k] + '</span>'; };
    var h = '';

    // 1. classement : indice principal par pays
    var seen = {}, main = ROWS.filter(function (r) { if (r[0] === 'gl' || seen[r[1]]) return false; seen[r[1]] = 1; return true; })
      .sort(function (a, b) { return b[5] - a[5]; });
    var max = Math.max.apply(null, main.map(function (r) { return Math.abs(r[5]); }));
    h += '<h3 class="wi-h">' + L.rank + '</h3><p class="note">' + L.rankNote + stamp(L, lang) + '</p><div class="wi-rank">';
    main.forEach(function (r) {
      var w = (Math.abs(r[5]) / max * 100).toFixed(1);
      h += '<div class="wi-rrow"><span class="wi-rname">' + esc(C[r[1]][L.i]) + ' <small>' + esc(r[2]) + '</small></span>' +
        '<span class="wi-track"><span class="wi-neg">' + (r[5] < 0 ? '<i style="width:' + w + '%"></i>' : '') + '</span><span class="wi-pos">' + (r[5] >= 0 ? '<i style="width:' + w + '%"></i>' : '') + '</span></span>' +
        '<span class="wi-v ' + cls(r[5]) + '">' + pct(r[5]) + '</span></div>';
    });
    h += '</div>';

    // 2. par continent puis par pays
    ['am', 'eu', 'as', 'me', 'gl'].forEach(function (c) {
      var rows = ROWS.filter(function (r) { return r[0] === c; });
      var vals = rows.filter(function (r, i, a) { return a.findIndex(function (x) { return x[1] === r[1]; }) === i; }).map(function (r) { return r[5]; }).sort(function (a, b) { return a - b; });
      var m = vals.length % 2 ? vals[(vals.length - 1) / 2] : (vals[vals.length / 2 - 1] + vals[vals.length / 2]) / 2;
      h += '<div class="wi-cont"><div class="wi-chead"><h3>' + L.cont[c] + '</h3>' + (c === 'gl' ? '' : '<span class="wi-med">' + L.med + ' : <b class="' + cls(m) + '">' + pct(m) + '</b></span>') + '</div>';
      h += '<div class="wi-tbl"><table><thead><tr><th>' + L.cols[0] + '</th><th>' + L.cols[1] + '</th><th class="wi-sp">' + L.cols[2] + '</th><th class="num">' + L.cols[3] + '</th><th class="num">' + L.cols[4] + '</th><th>' + L.cols[5] + '</th></tr></thead><tbody>';
      var prev = '';
      rows.forEach(function (r) {
        var same = r[1] === prev; prev = r[1];
        h += '<tr' + (same ? ' class="wi-sub"' : '') + '><td>' + (same ? '' : esc(C[r[1]][L.i])) + '</td><td>' + esc(r[2]) + '</td><td class="wi-sp">' + spark(r[11]) + '</td><td class="num ' + cls(r[5]) + '">' + pct(r[5]) + '</td><td class="num ' + cls(r[6]) + '">' + pct(r[6]) + '</td><td>' + badge(sigOf(r)) + '</td></tr>';
      });
      h += '</tbody></table></div>';
      h += '<div class="wi-out"><b>' + L.outlook + '</b><p>' + L.o[c] + '</p>' + (c === 'as' ? '<p>' + L.o.vn + '</p>' : '') + '</div></div>';
    });
    h += '<p class="note">' + L.method + '</p><p class="note">' + L.src + '</p>';
    return h;
  }

  if (typeof document !== 'undefined') {
    var root = document.getElementById('world-indices');
    if (root) root.innerHTML = build((document.documentElement.lang || 'fr').slice(0, 2));
  }
  if (typeof module !== 'undefined') module.exports = { build: build, ROWS: ROWS, sigOf: sigOf };
})();
