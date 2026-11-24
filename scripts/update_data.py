#!/usr/bin/env python3
"""Met à jour les données du site (indices et actions) depuis Yahoo Finance et CafeF.

Écrit trois fichiers lus par les pages :
  data/indices.js  -> window.IDX         (courbes 1/2/3 ans, page d'accueil)
  data/world.js    -> window.WORLD_ROWS  (page « Indices mondiaux »)
  data/watch.js    -> window.WATCH       (« À suivre : grandes actions par pays »)

Si une source ne répond pas, la valeur précédente est conservée.
Bibliothèque standard uniquement (pas de pip install).
"""
import datetime as dt
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data')
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
DAY = dt.timedelta(days=1)
TODAY = dt.datetime.now(dt.timezone.utc).date()
WARN = []


def warn(msg):
    WARN.append(msg)
    print('WARN', msg, flush=True)


# ---------------------------------------------------------------- configuration
# Courbes de la page d'accueil : clé -> (source, symbole)
CHART = {
    'SP500': ('y', '^GSPC'), 'NASDAQ': ('y', '^IXIC'), 'DOW': ('y', '^DJI'),
    'CAC40': ('y', '^FCHI'), 'DAX': ('y', '^GDAXI'), 'FTSE100': ('y', '^FTSE'), 'ESTX50': ('y', '^STOXX50E'),
    'NIKKEI': ('y', '^N225'), 'KOSPI': ('y', '^KS11'), 'TAIEX': ('y', '^TWII'), 'MSCIW': ('y', 'URTH'),
    'VNINDEX': ('c', 'VNINDEX'), 'VN30': ('c', 'VN30INDEX'), 'HNX': ('c', 'HNX-INDEX'), 'HNX30': ('c', 'HNX30-INDEX'), 'UPCOM': ('c', 'UPCOM-INDEX'),
}

# Page « Indices mondiaux » : (continent, pays, nom, source, symbole)
WORLD = [
    ('am', 'US', 'S&P 500', 'y', '^GSPC'), ('am', 'CA', 'S&P/TSX', 'y', '^GSPTSE'), ('am', 'MX', 'S&P/BMV IPC', 'y', '^MXX'), ('am', 'BR', 'Bovespa', 'y', '^BVSP'),
    ('eu', 'ES', 'IBEX 35', 'y', '^IBEX'), ('eu', 'SE', 'OMX Stockholm 30', 'y', '^OMX'), ('eu', 'BE', 'BEL 20', 'y', '^BFX'), ('eu', 'NL', 'AEX', 'y', '^AEX'),
    ('eu', 'CH', 'SMI', 'y', '^SSMI'), ('eu', 'IT', 'FTSE MIB', 'y', 'FTSEMIB.MI'), ('eu', 'GB', 'FTSE 100', 'y', '^FTSE'), ('eu', 'EZ', 'EURO STOXX 50', 'y', '^STOXX50E'),
    ('eu', 'DE', 'DAX', 'y', '^GDAXI'), ('eu', 'FR', 'CAC 40', 'y', '^FCHI'), ('eu', 'TR', 'BIST 100', 'y', 'XU100.IS'),
    ('as', 'TW', 'TAIEX', 'y', '^TWII'), ('as', 'KR', 'KOSPI', 'y', '^KS11'), ('as', 'JP', 'Nikkei 225', 'y', '^N225'), ('as', 'SG', 'Straits Times', 'y', '^STI'),
    ('as', 'NZ', 'S&P/NZX 50', 'y', '^NZ50'), ('as', 'AU', 'S&P/ASX 200', 'y', '^AXJO'),
    ('as', 'VN', 'VN-Index', 'c', 'VNINDEX'), ('as', 'VN', 'UPCoM-Index', 'c', 'UPCOM-INDEX'), ('as', 'VN', 'VN30-Index', 'c', 'VN30INDEX'),
    ('as', 'VN', 'HNX-Index', 'c', 'HNX-INDEX'), ('as', 'VN', 'HNX30-Index', 'c', 'HNX30-INDEX'),
    ('as', 'IN', 'Nifty 50', 'y', '^NSEI'), ('as', 'MY', 'FTSE Bursa Malaysia KLCI', 'y', '^KLSE'), ('as', 'CN', 'Shanghai Composite', 'y', '000001.SS'),
    ('as', 'HK', 'Hang Seng', 'y', '^HSI'), ('as', 'ID', 'IDX Composite', 'y', '^JKSE'),
    ('me', 'IL', 'TA-35', 'y', 'TA35.TA'), ('me', 'ZA', 'JSE All Share', 'y', '^J203.JO'),
    ('gl', 'W', 'MSCI World (ETF URTH)', 'y', 'URTH'), ('gl', 'EM', 'MSCI Emerging Markets (ETF EEM)', 'y', 'EEM'),
]

# « À suivre » : pays -> (indice de référence (nom, source, symbole), [(nom, code affiché, source, symbole, secteur)])
WATCH = {
    'FR': (('CAC 40', 'y', '^FCHI'), [('TotalEnergies', 'TTE', 'y', 'TTE.PA', 'energy'), ('LVMH', 'MC', 'y', 'MC.PA', 'luxury'), ('Hermès', 'RMS', 'y', 'RMS.PA', 'luxury'),
        ('L’Oréal', 'OR', 'y', 'OR.PA', 'cosmetics'), ('Airbus', 'AIR', 'y', 'AIR.PA', 'aero'), ('Schneider Electric', 'SU', 'y', 'SU.PA', 'electric'),
        ('Sanofi', 'SAN', 'y', 'SAN.PA', 'pharma'), ('Air Liquide', 'AI', 'y', 'AI.PA', 'gases'), ('BNP Paribas', 'BNP', 'y', 'BNP.PA', 'bank'), ('Axa', 'CS', 'y', 'CS.PA', 'insurance')]),
    'DE': (('DAX', 'y', '^GDAXI'), [('SAP', 'SAP', 'y', 'SAP.DE', 'software'), ('Siemens', 'SIE', 'y', 'SIE.DE', 'industry'), ('Allianz', 'ALV', 'y', 'ALV.DE', 'insurance'),
        ('Deutsche Telekom', 'DTE', 'y', 'DTE.DE', 'telecom'), ('Rheinmetall', 'RHM', 'y', 'RHM.DE', 'defense'), ('Mercedes-Benz', 'MBG', 'y', 'MBG.DE', 'auto'),
        ('BMW', 'BMW', 'y', 'BMW.DE', 'auto'), ('Infineon', 'IFX', 'y', 'IFX.DE', 'semis')]),
    'US': (('S&P 500', 'y', '^GSPC'), [('Nvidia', 'NVDA', 'y', 'NVDA', 'semis'), ('Apple', 'AAPL', 'y', 'AAPL', 'tech'), ('Microsoft', 'MSFT', 'y', 'MSFT', 'software'),
        ('Alphabet (Google)', 'GOOGL', 'y', 'GOOGL', 'internet'), ('Amazon', 'AMZN', 'y', 'AMZN', 'internet'), ('Meta', 'META', 'y', 'META', 'internet'),
        ('Tesla', 'TSLA', 'y', 'TSLA', 'auto'), ('JPMorgan Chase', 'JPM', 'y', 'JPM', 'bank')]),
    'VN': (('VN-Index', 'c', 'VNINDEX'), [('Vingroup', 'VIC', 'cs', 'VIC', 'conglomerate'), ('Vinhomes', 'VHM', 'cs', 'VHM', 'realestate'), ('Vietcombank', 'VCB', 'cs', 'VCB', 'bank'),
        ('BIDV', 'BID', 'cs', 'BID', 'bank'), ('VietinBank', 'CTG', 'cs', 'CTG', 'bank'), ('Techcombank', 'TCB', 'cs', 'TCB', 'bank'),
        ('FPT', 'FPT', 'cs', 'FPT', 'it'), ('Hòa Phát', 'HPG', 'cs', 'HPG', 'steel'), ('Thế Giới Di Động', 'MWG', 'cs', 'MWG', 'retail'), ('Vinamilk', 'VNM', 'cs', 'VNM', 'dairy')]),
    'JP': (('Nikkei 225', 'y', '^N225'), [('Toyota', '7203', 'y', '7203.T', 'auto'), ('Sony', '6758', 'y', '6758.T', 'tech'), ('Mitsubishi UFJ', '8306', 'y', '8306.T', 'bank'),
        ('SoftBank Group', '9984', 'y', '9984.T', 'invest'), ('Keyence', '6861', 'y', '6861.T', 'industry'), ('Tokyo Electron', '8035', 'y', '8035.T', 'semis'),
        ('Fast Retailing (Uniqlo)', '9983', 'y', '9983.T', 'retail'), ('Hitachi', '6501', 'y', '6501.T', 'industry')]),
    'KR': (('KOSPI', 'y', '^KS11'), [('Samsung Electronics', '005930', 'y', '005930.KS', 'semis'), ('SK Hynix', '000660', 'y', '000660.KS', 'semis'),
        ('LG Energy Solution', '373220', 'y', '373220.KS', 'battery'), ('Hyundai Motor', '005380', 'y', '005380.KS', 'auto'), ('Kia', '000270', 'y', '000270.KS', 'auto'),
        ('Naver', '035420', 'y', '035420.KS', 'internet')]),
    'TW': (('TAIEX', 'y', '^TWII'), [('TSMC', '2330', 'y', '2330.TW', 'semis'), ('Hon Hai (Foxconn)', '2317', 'y', '2317.TW', 'electronics'), ('MediaTek', '2454', 'y', '2454.TW', 'semis'),
        ('Delta Electronics', '2308', 'y', '2308.TW', 'electronics'), ('Quanta Computer', '2382', 'y', '2382.TW', 'electronics'), ('Fubon Financial', '2881', 'y', '2881.TW', 'insurance')]),
    'CN': (('Shanghai Composite', 'y', '000001.SS'), [('Tencent', '0700.HK', 'y', '0700.HK', 'internet'), ('Alibaba', '9988.HK', 'y', '9988.HK', 'internet'),
        ('Kweichow Moutai', '600519', 'y', '600519.SS', 'beverage'), ('CATL', '300750', 'y', '300750.SZ', 'battery'), ('BYD', '1211.HK', 'y', '1211.HK', 'auto'),
        ('Xiaomi', '1810.HK', 'y', '1810.HK', 'tech'), ('China Mobile', '0941.HK', 'y', '0941.HK', 'telecom'), ('ICBC', '601398', 'y', '601398.SS', 'bank')]),
}


# ---------------------------------------------------------------- utilitaires
def http_json(url, tries=3):
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'application/json,text/plain,*/*'})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read().decode('utf-8'))
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(2 + 3 * i)
    raise RuntimeError(f'{url} -> {last}')


def rnd(x):
    return round(x) if x >= 1000 else round(x, 1) if x >= 100 else round(x, 2)


def pct(a, b):
    return round((a / b - 1) * 100, 1)


def value_at(series, day):
    """Dernière clôture à la date « day » ou avant. series = liste triée de (date, valeur)."""
    v = None
    for d, x in series:
        if d <= day:
            v = x
        else:
            break
    return v


def drop_outliers(series):
    keep = []
    for i, (d, v) in enumerate(series):
        nb = sorted(x for _, x in series[max(0, i - 5):i] + series[i + 1:i + 6])
        if nb and abs(v / nb[len(nb) // 2] - 1) > 0.15:
            warn(f'valeur aberrante ignorée {d} {v}')
            continue
        keep.append((d, v))
    return keep


# ---------------------------------------------------------------- sources
_yahoo_cache = {}


def yahoo_daily(symbol, start):
    key = (symbol, start)
    if key in _yahoo_cache:
        return _yahoo_cache[key]
    p1 = int(dt.datetime(start.year, start.month, start.day, tzinfo=dt.timezone.utc).timestamp())
    p2 = int(time.time())
    q = urllib.parse.quote(symbol)
    data = None
    for host in ('query1', 'query2'):
        try:
            data = http_json(f'https://{host}.finance.yahoo.com/v8/finance/chart/{q}?period1={p1}&period2={p2}&interval=1d', tries=2)
            break
        except Exception as e:  # noqa: BLE001
            err = e
    if data is None:
        raise RuntimeError(f'Yahoo {symbol}: {err}')
    res = (data.get('chart') or {}).get('result')
    if not res:
        raise RuntimeError(f'Yahoo {symbol}: pas de données')
    res = res[0]
    ts = res.get('timestamp') or []
    closes = res['indicators']['quote'][0].get('close') or []
    gmt = res.get('meta', {}).get('gmtoffset', 0) or 0
    out = {}
    for t, c in zip(ts, closes):
        if c is None:
            continue
        out[dt.datetime.fromtimestamp(t + gmt, dt.timezone.utc).date()] = float(c)
    series = sorted(out.items())
    if len(series) < 50:
        raise RuntimeError(f'Yahoo {symbol}: seulement {len(series)} points')
    _yahoo_cache[key] = (series, res.get('meta', {}).get('currency', ''))
    return _yahoo_cache[key]


CAFEF = 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx'


def cafef_rows(symbol, d1, d2, page):
    url = f"{CAFEF}?Symbol={urllib.parse.quote(symbol)}&StartDate={d1:%m/%d/%Y}&EndDate={d2:%m/%d/%Y}&PageIndex={page}&PageSize=30"
    data = http_json(url)
    rows = ((data.get('Data') or {}).get('Data')) or []
    out = []
    for x in rows:
        try:
            d, m, y = x['Ngay'].split('/')
            out.append((dt.date(int(y), int(m), int(d)), float(x['GiaDongCua']), float(x.get('GiaDieuChinh') or x['GiaDongCua'])))
        except Exception:  # noqa: BLE001
            continue
    return out


_cafef_cache = {}


def cafef_daily(symbol, start):
    """Clôtures quotidiennes d'un indice vietnamien (fenêtres de ~10 mois, la source plafonne ~250 lignes)."""
    if symbol in _cafef_cache:
        return _cafef_cache[symbol]
    out = {}
    a = start
    while a <= TODAY:
        b = min(a + dt.timedelta(days=300), TODAY)
        for page in range(1, 13):
            rows = cafef_rows(symbol, a, b, page)
            for d, close, _adj in rows:
                out[d] = close
            if len(rows) < 30:
                break
            time.sleep(0.3)
        a = b + DAY
    series = drop_outliers(sorted(out.items()))
    if len(series) < 50:
        raise RuntimeError(f'CafeF {symbol}: seulement {len(series)} points')
    _cafef_cache[symbol] = series
    return series


def cafef_stock_points(symbol, days):
    """Cours ajusté autour de chaque date de « days » (+ dernier cours brut) pour une action vietnamienne."""
    pts = []
    for day in days:
        rows = sorted(cafef_rows(symbol, day - dt.timedelta(days=14), day, 1))
        if not rows:
            raise RuntimeError(f'CafeF {symbol}: rien autour de {day}')
        pts.append(rows[-1])
        time.sleep(0.3)
    return pts


def daily(src, symbol, start):
    if src == 'y':
        return yahoo_daily(symbol, start)[0]
    return cafef_daily(symbol, start)


# ---------------------------------------------------------------- lecture des anciennes données
def read_js(name, var):
    path = os.path.join(DATA, name)
    if not os.path.exists(path):
        return None
    txt = open(path, encoding='utf-8').read()
    m = re.search(r'window\.' + var + r'\s*=\s*(\{.*?\}|\[.*?\]);\s*$', txt, re.S | re.M)
    if not m:
        return None
    try:
        return json.loads(m.group(1))
    except Exception:  # noqa: BLE001
        warn(f'{name} illisible, on repart de zéro')
        return None


def write_js(name, var, obj, comment):
    path = os.path.join(DATA, name)
    body = json.dumps(obj, ensure_ascii=False, separators=(',', ':'))
    stamp = dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%MZ')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(f'// {comment}\n// Fichier généré automatiquement par scripts/update_data.py — ne pas modifier à la main.\n')
        f.write(f'window.DATA_UPDATED = "{stamp}";\n')
        f.write(f'window.{var} = {body};\n')


# ---------------------------------------------------------------- 1. courbes (window.IDX)
def build_chart():
    old = read_js('indices.js', 'IDX')
    last_fri = TODAY - dt.timedelta(days=(TODAY.weekday() - 4) % 7)
    weeks = 157
    start = last_fri - dt.timedelta(weeks=weeks - 1)
    grid = [start + dt.timedelta(weeks=i) for i in range(weeks)]
    series, last = {}, {}
    for key, (src, sym) in CHART.items():
        try:
            s = daily(src, sym, start - dt.timedelta(days=10))
            vals = [value_at(s, g) for g in grid]
            if vals[0] is None:
                vals[0] = s[0][1]
            for i in range(1, len(vals)):
                if vals[i] is None:
                    vals[i] = vals[i - 1]
            vals.append(s[-1][1])
            series[key] = [rnd(v) for v in vals]
            last[key] = s[-1][0].isoformat()
        except Exception as e:  # noqa: BLE001
            warn(f'courbe {key}: {e}')
            if old and key in old.get('series', {}):
                o_start = dt.date.fromisoformat(old['start'])
                o_vals = old['series'][key]
                o_series = [(o_start + dt.timedelta(weeks=i), v) for i, v in enumerate(o_vals[:-1])]
                vals = [value_at(o_series, g) or o_vals[0] for g in grid] + [o_vals[-1]]
                series[key] = vals
                last[key] = old.get('last', {}).get(key, old.get('lastAll'))
    if not series:
        raise RuntimeError('aucune courbe')
    return {'start': start.isoformat(), 'weeks': weeks, 'lastAll': max(last.values()), 'last': last, 'series': series}


# ---------------------------------------------------------------- 2. indices mondiaux (window.WORLD_ROWS)
def world_row(reg, cc, name, src, sym):
    s = daily(src, sym, TODAY - dt.timedelta(days=420))
    d_last, v_last = s[-1]
    t1y, t6m, t3m = TODAY - dt.timedelta(days=365), TODAY - dt.timedelta(days=182), TODAY - dt.timedelta(days=91)
    v1y, v6m, v3m = value_at(s, t1y), value_at(s, t6m), value_at(s, t3m)
    closes = [v for _, v in s]
    ma50 = sum(closes[-50:]) / len(closes[-50:])
    ma200 = sum(closes[-200:]) / len(closes[-200:])
    hi = max(v for d, v in s if d >= t1y)
    spark = [value_at(s, t1y + dt.timedelta(days=14 * k)) for k in range(26)] + [v_last]
    spark = [x if x is not None else v1y for x in spark]
    return [reg, cc, name, d_last.isoformat(), rnd(v_last), pct(v_last, v1y), pct(v_last, v6m), pct(v_last, v3m),
            pct(v_last, ma200), pct(ma50, ma200), pct(v_last, hi), [round(x / spark[0] * 100, 1) for x in spark]]


def build_world():
    old_rows = read_js('world.js', 'WORLD_ROWS') or []
    old = {(r[1], r[2]): r for r in old_rows}
    rows = []
    for reg, cc, name, src, sym in WORLD:
        try:
            rows.append(world_row(reg, cc, name, src, sym))
        except Exception as e:  # noqa: BLE001
            warn(f'indice {name}: {e}')
            if (cc, name) in old:
                rows.append(old[(cc, name)])
    # ordre : par continent, pays classés selon leur premier indice (1 an), indices d'un même pays groupés
    order = ['am', 'eu', 'as', 'me', 'gl']
    first = {}
    for r in rows:
        first.setdefault(r[1], r[5])
    rows.sort(key=lambda r: (order.index(r[0]), -first[r[1]]))
    return rows


# ---------------------------------------------------------------- 3. actions par pays (window.WATCH)
def build_watch(world_rows):
    old = read_js('watch.js', 'WATCH') or {}
    world_1y = {r[2]: r[5] for r in world_rows}
    t1y, t6m = TODAY - dt.timedelta(days=365), TODAY - dt.timedelta(days=182)
    out = {}
    for cc, (idx, stocks) in WATCH.items():
        idx_name = idx[0]
        idx_1y = world_1y.get(idx_name)
        if idx_1y is None:
            try:
                s = daily(idx[1], idx[2], TODAY - dt.timedelta(days=400))
                idx_1y = pct(s[-1][1], value_at(s, t1y))
            except Exception as e:  # noqa: BLE001
                warn(f'indice {idx_name}: {e}')
                idx_1y = (old.get(cc) or {}).get('idx', [idx_name, 0])[1]
        old_rows = {r[1]: r for r in (old.get(cc) or {}).get('rows', [])}
        rows = []
        for name, code, src, sym, sector in stocks:
            try:
                if src == 'y':
                    s, cur = yahoo_daily(sym, TODAY - dt.timedelta(days=400))
                    d_last, v_last = s[-1]
                    rows.append([name, code, cur, rnd(v_last), d_last.isoformat(), pct(v_last, value_at(s, t1y)), pct(v_last, value_at(s, t6m)), sector])
                else:
                    a, b, c = cafef_stock_points(sym, [t1y, t6m, TODAY])
                    # c = (date, clôture, clôture ajustée) ; variations calculées sur les cours ajustés
                    rows.append([name, code, 'VND', c[1], c[0].isoformat(), pct(c[2], a[2]), pct(c[2], b[2]), sector])
            except Exception as e:  # noqa: BLE001
                warn(f'action {name}: {e}')
                if code in old_rows:
                    rows.append(old_rows[code])
        out[cc] = {'idx': [idx_name, idx_1y], 'rows': rows}
    return out


def main():
    os.makedirs(DATA, exist_ok=True)
    ok = 0
    try:
        write_js('indices.js', 'IDX', build_chart(), 'Courbes hebdomadaires (clôture du vendredi) sur 3 ans + dernier cours. Sources : Yahoo Finance, CafeF.')
        ok += 1
    except Exception as e:  # noqa: BLE001
        warn(f'courbes non mises à jour: {e}')
    world = []
    try:
        world = build_world()
        if world:
            write_js('world.js', 'WORLD_ROWS', world, '[continent, pays, indice, date, dernier, 1 an %, 6 mois %, 3 mois %, écart MM200 %, MM50 vs MM200 %, écart plus haut 1 an %, courbe 1 an base 100]')
            ok += 1
    except Exception as e:  # noqa: BLE001
        warn(f'indices mondiaux non mis à jour: {e}')
    try:
        write_js('watch.js', 'WATCH', build_watch(world), 'Pays -> {idx: [indice, 1 an %], rows: [nom, code, devise, dernier, date, 1 an %, 6 mois %, secteur]}')
        ok += 1
    except Exception as e:  # noqa: BLE001
        warn(f'actions non mises à jour: {e}')
    print(f'{ok}/3 fichiers écrits, {len(WARN)} avertissement(s)')
    if ok == 0:
        sys.exit(1)


if __name__ == '__main__':
    main()
