// portal.js — 13Ghosts.io Authentication
// Auth flow: sar1a.lempyra.com /auth/authorize → /auth/token
// sessionStorage only. No IP addresses. No localStorage.

var AUTH = {
    url:        'https://sar1a.lempyra.com',
    clientId:   'portal',
    scope:      'payments,ink,profile',
    tokenKey:   'ghosts_token',
    refreshKey: 'ghosts_refresh',
    userKey:    'ghosts_user'
};

// Redirect to dashboard if already authenticated
if (sessionStorage.getItem(AUTH.tokenKey)) {
    window.location.replace('../dashboard/');
}

// ─── Gateway health check ───
async function checkGateway() {
    var statusEl = document.getElementById('login-status');
    try {
        var opts = {};
        try { opts.signal = AbortSignal.timeout(5000); } catch(_) {}
        var res = await fetch(AUTH.url + '/auth/health', opts);
        if (res.ok) {
            statusEl.style.color = 'var(--bone)';
            statusEl.textContent = '● auth gateway online';
            return;
        }
    } catch(e) {}
    statusEl.style.color = 'var(--blood-glow)';
    statusEl.textContent = '✗ gateway offline — authentication unavailable';
    document.getElementById('submit-btn').disabled = true;
}

// ─── Auth flow ───
async function handleLogin(event) {
    event.preventDefault();

    var username = document.getElementById('username').value.trim();
    var password = document.getElementById('password').value;
    var btn      = document.getElementById('submit-btn');
    var statusEl = document.getElementById('login-status');
    var panelEl  = document.getElementById('login-panel');

    btn.disabled    = true;
    btn.textContent = 'Binding…';
    statusEl.style.color = 'var(--chalk-dim)';
    statusEl.textContent = '⟳ invoking authorization rite…';

    try {
        // Step 1: POST /auth/authorize → authorization code
        var authRes = await fetch(AUTH.url + '/auth/authorize', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username:  username,
                password:  password,
                client_id: AUTH.clientId,
                scope:     AUTH.scope
            })
        });

        var authData = await authRes.json();
        if (!authRes.ok) {
            if (authRes.status === 401 || authRes.status === 403) {
                throw new Error('entity not recognized — access sealed');
            }
            throw new Error(authData.detail || authData.error || 'authorization failed');
        }

        var code = authData.authorization_code || authData.code;
        if (!code) throw new Error('no authorization code received');

        statusEl.textContent = '⟳ seal accepted — exchanging token…';

        // Step 2: POST /auth/token → JWT
        var tokRes = await fetch(AUTH.url + '/auth/token', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grant_type:    'authorization_code',
                code:          code,
                client_id:     AUTH.clientId,
                client_secret: password
            })
        });

        var tokData = await tokRes.json();
        if (!tokRes.ok) {
            throw new Error(tokData.detail || tokData.error || 'token exchange failed');
        }

        var accessToken = tokData.access_token;
        if (!accessToken) throw new Error('no token in response');

        // sessionStorage only — page refresh = re-login by design
        sessionStorage.setItem(AUTH.tokenKey, accessToken);
        if (tokData.refresh_token) sessionStorage.setItem(AUTH.refreshKey, tokData.refresh_token);
        sessionStorage.setItem(AUTH.userKey, username);

        btn.textContent = '✓ Seal Broken — Entering';
        statusEl.style.color = 'var(--bone)';
        statusEl.textContent = '✓ portal unsealed — entering lab…';

        window.location.replace('../dashboard/');

    } catch(e) {
        if (panelEl) {
            panelEl.classList.remove('shake');
            void panelEl.offsetWidth;
            panelEl.classList.add('shake');
            setTimeout(function() { panelEl.classList.remove('shake'); }, 500);
        }
        btn.disabled = false;
        btn.textContent = 'Unseal';
        statusEl.style.color = 'var(--blood-glow)';
        statusEl.textContent = '✗ ' + (e.message || 'ritual failed');
    }
}
