/* Accès réservé (protection simple côté navigateur).
   Pour ajouter un compte : ajouter une ligne  identifiant: 'empreinte'  dans ACCOUNTS.
   L'empreinte = PBKDF2-SHA256(mot de passe, sel 'msi-v1:' + identifiant, 150 000 itérations), en hexadécimal. */
(function () {
  var ACCOUNTS = {
    daniel: '32d4514abf905ab33f73f78b7d0d4c98ba9d3f0ee79fa88d4cb7993a9e263fc6'
  };
  var KEY = 'msi_auth_v1';
  var script = document.currentScript;
  var base = script ? script.src.replace(/auth\.js(\?.*)?$/, '') : '/mon-site-investissement/';
  var isLogin = /\/login\/(index\.html)?(\?|#|$)/.test(location.pathname + location.search);

  function session() {
    try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); return s && ACCOUNTS[s.u] === s.h && s.exp > Date.now() ? s : null; } catch (e) { return null; }
  }

  async function hash(user, pw) {
    var enc = new TextEncoder();
    var key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
    var bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode('msi-v1:' + user), iterations: 150000 }, key, 256);
    return Array.prototype.map.call(new Uint8Array(bits), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }

  window.SiteAuth = {
    login: async function (user, pw, remember) {
      user = String(user || '').trim().toLowerCase();
      if (!ACCOUNTS[user]) return false;
      var h = await hash(user, pw);
      if (h !== ACCOUNTS[user]) return false;
      var days = remember ? 30 : 1;
      try { localStorage.setItem(KEY, JSON.stringify({ u: user, h: h, exp: Date.now() + days * 864e5 })); } catch (e) { return false; }
      return true;
    },
    logout: function () { try { localStorage.removeItem(KEY); } catch (e) {} location.href = base + 'login/'; },
    user: function () { var s = session(); return s ? s.u : null; },
    base: base
  };

  if (isLogin) return;
  if (!session()) {
    document.documentElement.style.display = 'none';
    location.replace(base + 'login/?next=' + encodeURIComponent(location.href));
    return;
  }
  document.addEventListener('DOMContentLoaded', function () {
    var nav = document.querySelector('nav.lang');
    if (!nav) return;
    var lang = (document.documentElement.lang || 'fr').slice(0, 2);
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'logout';
    b.textContent = { fr: 'Se déconnecter', en: 'Sign out', vi: 'Đăng xuất' }[lang] || 'Se déconnecter';
    b.setAttribute('style', 'font:inherit;font-size:13px;font-weight:600;padding:6px 12px;border-radius:999px;border:1px solid #A8D5BF;background:transparent;color:#A8D5BF;cursor:pointer;margin-left:6px');
    b.addEventListener('click', window.SiteAuth.logout);
    nav.appendChild(b);
  });
})();
