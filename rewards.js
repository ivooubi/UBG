/* UBGames.88 · Recompensas (misiones, logros, tienda). Cargar DESPUÉS del script principal. */
(function () {
    'use strict';
    if (!window.sb || !window.Arcade) { console.warn('rewards.js: falta window.sb / window.Arcade'); return; }
    const sb = window.sb;
    const $ = (id) => document.getElementById(id);
    const el = (tag, cls, txt) => {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (txt != null) e.textContent = txt;
        return e;
    };
    const fmt = (s) => {
        const hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60);
        return hh ? hh + ' h ' + mm + ' min' : mm + ' min';
    };
    function toast(t) {
        const n = $('arcade-toast');
        n.textContent = t;
        n.classList.add('show');
        clearTimeout(toast.t);
        toast.t = setTimeout(() => n.classList.remove('show'), 3500);
    }

    /* ---------- Notificación en pantalla (sin sonido) ---------- */
    const notifStack = el('div', 'r-notifs');
    document.body.appendChild(notifStack);
    function notify(title, text) {
        const n = el('div', 'r-notif');
        n.append(el('div', 'r-notif-t', title), el('div', 'r-notif-s', text));
        const close = () => { n.classList.remove('show'); setTimeout(() => n.remove(), 400); };
        n.onclick = close;
        notifStack.append(n);
        requestAnimationFrame(() => requestAnimationFrame(() => n.classList.add('show')));
        setTimeout(close, 6000);
    }

    /* ---------- Estilos ---------- */
    const style = el('style');
    style.textContent = `
.r-body{padding-bottom:calc(env(safe-area-inset-bottom,0px) + 80px)}
.r-body>.r-card{max-width:520px}
.r-tabs{display:flex;gap:22px;margin-bottom:20px;border-bottom:1px solid var(--line);overflow-x:auto;scrollbar-width:none}
.r-tabs::-webkit-scrollbar{display:none}
.r-tab{font:600 13px var(--font);white-space:nowrap;color:var(--text-2);background:none;border:0;border-bottom:2px solid transparent;margin-bottom:-1px;padding:10px 2px;cursor:pointer;touch-action:manipulation;transition:color .2s,border-color .2s}
.r-tab.on{color:var(--text-color);border-bottom-color:var(--text-color)}
@media (hover:hover) and (pointer:fine){.r-tab:hover{color:var(--text-color)}}
.r-stats{font-size:13px;color:var(--text-2);margin-bottom:16px;overflow-wrap:anywhere}
.r-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr));gap:10px}
.r-shop{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr));gap:10px}
.r-card{min-width:0;background:var(--card-bg);border:1px solid var(--line);border-radius:14px;padding:16px 18px;display:flex;flex-direction:column;gap:12px;animation:rise .4s var(--ease-out) backwards}
.r-row{display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:13px;min-width:0}
.r-card>.r-row:last-child{margin-top:auto}
.r-h{font-size:13px;font-weight:600;color:var(--text-2);margin:28px 0 12px}
.r-h:first-child{margin-top:0}
.r-row strong{font-weight:600;min-width:0;overflow-wrap:anywhere}
.r-reward{font-size:12px;font-weight:600;color:var(--text-2);white-space:nowrap}
.r-sub{font-size:12px;color:var(--text-2);line-height:1.5;overflow-wrap:anywhere}
.r-bar{height:4px;border-radius:2px;background:var(--fill);overflow:hidden}
.r-fill{height:100%;width:100%;background:var(--accent-ia);transform-origin:left;transition:transform .5s var(--ease-out);animation:r-grow .7s var(--ease-out) backwards}
@keyframes r-grow{from{transform:scaleX(0)}}
.r-swatch{height:64px;border-radius:9px;border:1px solid var(--line)}
.r-empty{grid-column:1/-1;color:var(--text-2);font-size:13px;margin:24px 0;overflow-wrap:anywhere}
.r-input{flex:1;min-width:0;background:var(--fill);border:1px solid transparent;border-radius:9px;color:var(--text-color);font-size:16px;padding:10px 14px;outline:none;transition:border-color .2s}
.r-input:focus{border-color:var(--line-strong)}
.r-secret{margin-top:18px}
.r-notifs{position:fixed;top:calc(env(safe-area-inset-top,0px) + 16px);left:50%;transform:translateX(-50%);z-index:8000;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;width:max-content;max-width:92vw}
.r-notif{pointer-events:auto;cursor:pointer;min-width:240px;max-width:92vw;box-sizing:border-box;padding:12px 18px;border-radius:12px;border:1px solid var(--line-strong);background:var(--sidebar-bg);box-shadow:var(--shadow);opacity:0;transform:translateY(-12px);transition:opacity .3s var(--ease-out),transform .3s var(--ease-out)}
.r-notif.show{opacity:1;transform:none}
.r-notif-t{font-size:13px;font-weight:600}
.r-notif-s{font-size:12px;color:var(--text-2);margin-top:2px;overflow-wrap:anywhere}
body.layout-compact #games-section .games-container{grid-template-columns:repeat(auto-fill,minmax(min(100%,130px),1fr));gap:8px}
body.layout-compact #games-section .game-card{padding:10px;min-height:56px}
body.layout-neon #games-section .game-card{border-color:var(--accent-ia);box-shadow:0 0 0 1px var(--accent-ia),0 0 18px -4px var(--accent-ia)}
body.layout-big #games-section .games-container{grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))}
body.layout-big #games-section .game-card{min-height:140px;padding:24px 20px}
body.layout-round #games-section .game-card{border-radius:26px}
body.layout-glass #games-section .game-card{background:rgba(128,128,128,.14);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
@media (prefers-reduced-motion:reduce){.r-fill,.r-card{animation:none}.r-notif{transform:none}}
`;
    document.head.appendChild(style);

    /* ---------- Sidebar y secciones ---------- */
    const nav = $('nav');
    function addSide(id, label) {
        const d = el('div', 'sidebar-item', label);
        d.id = 'btn-' + id;
        d.onclick = () => showSection(id);
        nav.appendChild(d);
    }
    function addSection(id, title) {
        const s = el('section', 'section');
        s.id = id + '-section';
        s.append(el('h1', 'main-title', title));
        const body = el('div', 'r-body');
        s.append(body);
        $('main-content').append(s);
        return body;
    }
    addSide('rewards', 'Misiones y logros');
    addSide('shop', 'Tienda');
    addSide('inventory', 'Inventario');
    addSide('settings', 'Ajustes');
    const rBody = addSection('rewards', 'Misiones y logros');
    const sBody = addSection('shop', 'Tienda');
    const eBody = addSection('early', 'Acceso anticipado');
    const invBody = addSection('inventory', 'Inventario');
    const setBody = addSection('settings', 'Ajustes');
    let earlyBtn = false;

    /* ---------- Estado ---------- */
    let state = null, tabR = 'mission', tabS = 'background';
    let hasSession = false, userEmail = '';
    const ready = new Set();

    function normalize(data) {
        let d = data;
        if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { return null; } }
        if (Array.isArray(d)) d = d[0];
        if (d && !Array.isArray(d.quests) && Array.isArray(d.rw_quests)) d.quests = d.rw_quests;
        return d && Array.isArray(d.quests) && Array.isArray(d.items) ? d : null;
    }

    async function refreshQuiet() {
        try {
            const { data } = await sb.rpc('rw_get_state');
            const d = normalize(data);
            if (d) { state = d; scan(true); }
        } catch (e) { console.warn('rewards refresh:', e.message || e); }
    }

    function scan(announce) {
        if (!state) return;
        state.quests.forEach((q) => {
            if (q.progress >= q.target && !q.claimed && !ready.has(q.id)) {
                ready.add(q.id);
                if (announce) notify(q.kind === 'mission' ? '🎯 ¡Misión completada!' : '🏆 ¡Logro conseguido!',
                    q.title + ' · ya puedes reclamar +' + q.exp + ' EXP y +' + q.coins + ' 🪙');
            }
        });
    }

    let loadRun = 0;
    function say(body, text) { body.replaceChildren(el('p', 'r-empty', text)); }
    async function load() {
        const run = ++loadRun;
        if (!state) [rBody, sBody, eBody, invBody].forEach((b) => say(b, 'Cargando…'));
        try {
            const { data: { session } } = await sb.auth.getSession();
            hasSession = !!session;
            userEmail = session ? (session.user.email || '') : '';
            let next = null;
            if (session) {
                const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('Tiempo de espera agotado')), 12000));
                const { data, error } = await Promise.race([sb.rpc('rw_get_state'), timeout]);
                if (error) throw error;
                const d = normalize(data);
                if (!d) throw new Error('respuesta inesperada de rw_get_state: ' + JSON.stringify(data).slice(0, 300));
                next = d;
            }
            if (run !== loadRun) return;
            state = next;
            scan(false);
            apply();
            render();
        } catch (e) {
            if (run !== loadRun) return;
            console.warn('rewards:', e);
            state = null;
            [rBody, sBody, eBody, invBody].forEach((b) => say(b, 'No se pudo cargar: ' + (e.message || e) + ' (¿ejecutaste rewards.sql?)'));
            renderSettings();
            renderCustomPages();
        }
    }

    function apply() {
        document.body.className = document.body.className.split(' ').filter((c) => !c.startsWith('layout-') && c !== 'has-bg').join(' ');
        document.body.style.backgroundImage = '';
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.removeProperty('--accent-ia');
        if (!state) return;
        state.items.filter((i) => i.equipped).forEach((i) => {
            if (i.kind === 'background' && i.data.css) { document.body.style.backgroundImage = i.data.css; document.body.classList.add('has-bg'); }
            if (i.kind === 'accent' && /^#[0-9a-fA-F]{6}$/.test(i.data.color || '')) document.body.style.setProperty('--accent-ia', i.data.color);
            if (i.kind === 'layout' && /^layout-[a-z0-9-]+$/.test(i.data.class || '')) document.body.classList.add(i.data.class);
        });
        if (!earlyBtn && state.items.some((i) => i.kind === 'early_access' && i.owned)) {
            addSide('early', 'Anticipado');
            earlyBtn = true;
        }
    }

    /* ---------- Render ---------- */
    function tabs(list, current, pick) {
        const w = el('div', 'r-tabs');
        list.forEach(([k, label]) => {
            const b = el('button', 'r-tab' + (k === current ? ' on' : ''), label);
            b.onclick = () => pick(k);
            w.append(b);
        });
        return w;
    }

    function renderRewards() {
        rBody.replaceChildren();
        if (!state) { rBody.append(el('p', 'r-empty', 'Inicia sesión para ver tus misiones y logros.')); return; }
        rBody.append(tabs([['mission', 'Misiones diarias'], ['achievement', 'Logros']], tabR, (k) => { tabR = k; renderRewards(); }));
        rBody.append(el('div', 'r-stats', '⏱ Un juego solo cuenta si juegas al menos 1 minuto.'));
        rBody.append(el('div', 'r-stats',
            'Hoy: ' + fmt(state.seconds_today) + ' · ' + state.games_today + ' juego(s)   |   Total: ' +
            fmt(state.seconds_total) + ' · ' + state.games_total + ' juego(s)'));
        const list = el('div', 'r-list');
        const qs = state.quests.filter((q) => q.kind === tabR);
        if (!qs.length) list.append(el('p', 'r-empty', 'No hay misiones en la base de datos. Ejecuta la parte "Datos iniciales" de rewards.sql.'));
        qs.forEach((q) => {
            const done = q.progress >= q.target;
            const c = el('div', 'r-card');
            const top = el('div', 'r-row');
            top.append(el('strong', null, q.title), el('span', 'r-reward', '+' + q.exp + ' EXP · +' + q.coins + ' 🪙'));
            const bar = el('div', 'r-bar'), fill = el('div', 'r-fill');
            fill.style.transform = 'scaleX(' + Math.min(1, q.progress / q.target) + ')';
            bar.append(fill);
            const p = Math.min(q.progress, q.target);
            const row = el('div', 'r-row');
            row.append(el('span', 'r-sub', q.metric === 'seconds' ? fmt(p) + ' / ' + fmt(q.target) : p + ' / ' + q.target + ' juegos'));
            const b = el('button', 'hud-btn' + (done && !q.claimed ? ' primary' : ''), q.claimed ? 'Reclamada ✓' : done ? 'Reclamar' : 'En curso');
            b.disabled = q.claimed || !done;
            b.onclick = () => claim(q);
            row.append(b);
            c.append(top, bar, row);
            list.append(c);
        });
        rBody.append(list);
    }

    function renderShop() {
        sBody.replaceChildren();
        if (!state) { sBody.append(el('p', 'r-empty', 'Inicia sesión para usar la tienda.')); return; }
        sBody.append(tabs([['background', 'Fondos'], ['accent', 'Colores'], ['layout', 'Pantalla de juegos'], ['slot', 'Huecos'], ['early_access', 'Acceso anticipado']],
            tabS, (k) => { tabS = k; renderShop(); }));
        sBody.append(el('div', 'r-stats', 'Tus monedas: ' + state.coins + ' 🪙'));
        if (tabS === 'slot') { sBody.append(slotCard(), secretBox()); return; }
        const grid = el('div', 'r-shop');
        const its = state.items.filter((i) => i.kind === tabS);
        if (!its.length) grid.append(el('p', 'r-empty', 'No hay artículos en esta categoría.'));
        its.forEach((i) => {
            const c = el('div', 'r-card');
            const sw = swatch(i);
            if (sw) c.append(sw);
            c.append(el('strong', null, i.name), el('div', 'r-sub', i.description));
            const row = el('div', 'r-row');
            row.append(el('span', 'r-reward', i.owned ? 'Comprado' : i.price + ' 🪙'));
            let b;
            if (!i.owned) {
                b = el('button', 'hud-btn primary', 'Comprar');
                b.disabled = state.coins < i.price;
                b.onclick = () => buy(i);
            } else if (i.kind === 'early_access') {
                b = el('button', 'hud-btn', 'Desbloqueado ✓');
                b.disabled = true;
            } else {
                b = el('button', 'hud-btn', i.equipped ? 'Quitar' : 'Equipar');
                b.onclick = () => equip(i, !i.equipped);
            }
            row.append(b);
            c.append(row);
            grid.append(c);
        });
        sBody.append(grid);
        sBody.append(secretBox());
    }

/* ---------- Huecos personalizados (de pago) ---------- */
    function slotCard() {
        const c = el('div', 'r-card');
        const n = state.slots || 0, max = state.slots_max || 12, price = state.slot_price;
        const full = price == null;
        c.append(el('strong', null, 'Hueco de juego personalizado'));
        c.append(el('div', 'r-sub', 'Desbloquea un hueco para añadir tu propia página a la pantalla de juegos. Cada hueco nuevo cuesta más.'));
        const row = el('div', 'r-row');
        row.append(el('span', 'r-reward', 'Tienes ' + n + ' de ' + max + (full ? '' : ' · Siguiente: ' + price + ' 🪙')));
        const b = el('button', 'hud-btn', full ? 'Máximo alcanzado' : 'Comprar hueco');
        b.disabled = full || state.coins < price;
        b.onclick = buySlot;
        row.append(b);
        c.append(row);
        return c;
    }
    async function buySlot() {
        if (!confirm('¿Comprar un hueco personalizado por ' + state.slot_price + ' monedas?')) return;
        const { error } = await sb.rpc('rw_buy_slot');
        if (error) return toast(error.message);
        toast('¡Hueco desbloqueado! Ya puedes añadir tu página');
        after();
    }

    function openSection(id) {   // como showSection, pero sin abrir/cerrar la barra lateral
        document.querySelectorAll('.section').forEach((s) => s.classList.remove('active'));
        $(id + '-section').classList.add('active');
        document.querySelectorAll('.sidebar-item').forEach((i) => i.classList.remove('active'));
        if ($('btn-' + id)) $('btn-' + id).classList.add('active');
        load();
    }

    function renderCustomPages() {
        const box = $('custom-games');
        if (!box) return;
        box.replaceChildren();
        if (!state) return;
        const pages = state.pages || [], n = state.slots || 0;
        for (let i = 1; i <= n; i++) {
            const p = pages.find((x) => x.slot === i);
            if (p) {
                const c = el('div', 'game-card custom-card');
                c.append(el('h3', null, p.name));
                c.onclick = () => openGame(p.url);
                const del = el('button', 'delete-custom', '✕');
                del.title = 'Eliminar';
                del.onclick = async (e) => {
                    e.stopPropagation();
                    if (!confirm('¿Eliminar "' + p.name + '"? El hueco seguirá siendo tuyo.')) return;
                    const { error } = await sb.rpc('rw_delete_page', { p_slot: i });
                    if (error) return toast(error.message);
                    load();
                };
                c.append(del);
                box.append(c);
            } else {
                const c = el('div', 'game-card add-card');
                c.append(el('h3', null, '+ Hueco libre'));
                c.onclick = () => window.openAddModal(i);
                box.append(c);
            }
        }
        if (state.slot_price != null) {
            const c = el('div', 'game-card add-card');
            c.append(el('h3', null, '🔒 Hueco · ' + state.slot_price + ' 🪙'));
            c.onclick = () => { tabS = 'slot'; renderShop(); openSection('shop'); };
            box.append(c);
        }
    }

    let addSlot = null;
    window.openAddModal = (slot) => {
        addSlot = slot;
        $('add-name').value = '';
        $('add-url').value = '';
        $('add-error').textContent = '';
        $('add-modal').classList.add('active');
        $('add-name').focus();
    };
    window.closeAddModal = () => $('add-modal').classList.remove('active');
    window.saveCustomGame = async () => {
        const err = $('add-error');
        const name = $('add-name').value.trim();
        let url = $('add-url').value.trim();
        if (!name || !url) { err.textContent = 'Escribe un nombre y una URL.'; return; }
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        try { new URL(url); } catch (e) { err.textContent = 'La URL no es válida.'; return; }
        const { error } = await sb.rpc('rw_save_page', { p_slot: addSlot, p_name: name, p_url: url });
        if (error) { err.textContent = error.message; return; }
        window.closeAddModal();
        toast('Página guardada');
        load();
    };

    /* ---------- Inventario (solo lo que tienes) ---------- */
    function swatch(i) {
        if (i.kind === 'background') {
            const s = el('div', 'r-swatch');
            s.style.background = i.data.css || '#000';
            return s;
        }
        if (i.kind === 'accent') {
            const s = el('div', 'r-swatch');
            s.style.height = '28px';
            s.style.background = /^#[0-9a-fA-F]{6}$/.test(i.data.color || '') ? i.data.color : '#888';
            return s;
        }
        return null;
    }
    function renderInventory() {
        invBody.replaceChildren();
        if (!state) { invBody.append(el('p', 'r-empty', hasSession ? 'No se pudo cargar tu inventario.' : 'Inicia sesión para ver tu inventario.')); return; }
        const owned = state.items.filter((i) => i.owned);
        const slots = state.slots || 0;
        if (!owned.length && !slots) {
            invBody.append(el('p', 'r-empty', 'Tu inventario está vacío. Lo que compres en la tienda aparecerá aquí.'));
            const b = el('button', 'hud-btn primary', 'Ir a la tienda');
            b.onclick = () => { tabS = 'background'; renderShop(); openSection('shop'); };
            invBody.append(b);
            return;
        }
        [['background', 'Fondos'], ['accent', 'Colores'], ['layout', 'Pantalla de juegos'], ['early_access', 'Acceso anticipado']].forEach(([k, label]) => {
            const list = owned.filter((i) => i.kind === k);
            if (!list.length) return;
            invBody.append(el('h2', 'r-h', label));
            const grid = el('div', 'r-shop');
            list.forEach((i) => {
                const c = el('div', 'r-card');
                const sw = swatch(i);
                if (sw) c.append(sw);
                c.append(el('strong', null, i.name), el('div', 'r-sub', i.description));
                const row = el('div', 'r-row');
                row.append(el('span', 'r-reward', i.kind === 'early_access' ? 'Desbloqueado' : i.equipped ? 'En uso' : 'Disponible'));
                const b = el('button', 'hud-btn' + (i.kind !== 'early_access' && !i.equipped ? ' primary' : ''),
                    i.kind === 'early_access' ? 'Abrir' : i.equipped ? 'Quitar' : 'Equipar');
                b.onclick = () => (i.kind === 'early_access' ? openSection('early') : equip(i, !i.equipped));
                row.append(b);
                c.append(row);
                grid.append(c);
            });
            invBody.append(grid);
        });
        if (slots) {
            const used = (state.pages || []).length;
            invBody.append(el('h2', 'r-h', 'Huecos personalizados'));
            const c = el('div', 'r-card');
            c.append(el('strong', null, slots + (slots === 1 ? ' hueco' : ' huecos') + ' · ' + used + ' en uso'));
            c.append(el('div', 'r-sub', 'Añade tus páginas desde la pantalla de juegos, en las tarjetas "+ Hueco libre".'));
            invBody.append(c);
        }
    }

    /* ---------- Ajustes (cuenta) ---------- */
    function renderSettings() {
        setBody.replaceChildren();
        const card = el('div', 'r-card');
        if (!hasSession) {
            card.append(el('strong', null, 'No has iniciado sesión'));
            card.append(el('div', 'r-sub', 'Inicia sesión o crea una cuenta para guardar tus monedas, recompensas y huecos.'));
            const b = el('button', 'hud-btn', 'Iniciar sesión / Crear cuenta');
            b.onclick = () => window.openAuth();
            card.append(b);
        } else {
            card.append(el('strong', null, 'Tu cuenta'));
            const r1 = el('div', 'r-row');
            r1.append(el('span', 'r-sub', 'Usuario'), el('strong', null, (state && state.username) || '—'));
            const r2 = el('div', 'r-row');
            r2.append(el('span', 'r-sub', 'Correo'), el('span', null, userEmail || '—'));
            const r3 = el('div', 'r-row');
            const rename = el('button', 'hud-btn', '✎ Cambiar nombre');
            rename.onclick = renameUser;
            const out = el('button', 'hud-btn', 'Cerrar sesión');
            out.onclick = () => window.signOut();
            r3.append(rename, out);
            card.append(r1, r2, r3);
        }
        setBody.append(card);
    }
    async function renameUser() {
        const n = prompt('Nuevo nombre de usuario (3-16 letras, números o _):', (state && state.username) || '');
        if (n === null) return;
        const { error } = await sb.rpc('rw_set_username', { p_name: n });
        if (error) return toast(error.message);
        toast('Nombre actualizado');
        after();
    }

    let secretCode = null;   // código ya validado por el servidor (paso 1)
    function secretBox() {
        const box = el('div', 'r-card r-secret');
        box.append(el('strong', null, '🔑 Código secreto'));
        const row = el('div', 'r-row');
        const input = el('input', 'r-input');
        input.type = secretCode ? 'number' : 'password';
        input.placeholder = secretCode ? 'Número de monedas' : 'Introduce el código';
        if (secretCode) { input.min = 0; input.max = 1000000000; }
        const b = el('button', 'hud-btn', secretCode ? 'Aplicar' : 'Canjear');
        b.onclick = async () => {
            const v = input.value.trim();
            if (!v) return;
            if (!secretCode) {
                const { data, error } = await sb.rpc('rw_check_code', { p_code: v });
                if (error) return toast(error.message);
                if (!data) return toast('Código incorrecto');
                secretCode = v;
                toast('Código correcto: elige cuántas monedas quieres');
                renderShop();
            } else {
                const n = Math.floor(Number(v));
                if (!Number.isFinite(n) || n < 0 || n > 1000000000) return toast('Número no válido');
                const { error } = await sb.rpc('rw_set_coins', { p_code: secretCode, p_coins: n });
                secretCode = null;
                if (error) return toast(error.message);
                toast('Ahora tienes ' + n + ' monedas 🪙');
                after();
            }
        };
        input.onkeydown = (e) => { if (e.key === 'Enter') b.click(); };
        row.append(input, b);
        box.append(row);
        return box;
    }

    function renderEarly() {
        eBody.replaceChildren();
        const games = state ? state.items.filter((i) => i.kind === 'early_access' && i.owned).flatMap((i) => i.data.games || []) : [];
        if (!games.length) { eBody.append(el('p', 'r-empty', 'Aún no tienes acceso anticipado.')); return; }
        const g = el('div', 'games-container');
        games.forEach((x) => {
            const c = el('div', 'game-card');
            c.append(el('h3', null, x.name));
            c.onclick = () => openGame(x.url);
            g.append(c);
        });
        eBody.append(g);
    }

    function render() { renderRewards(); renderShop(); renderEarly(); renderSettings(); renderCustomPages(); renderInventory(); }

    /* ---------- Acciones ---------- */
    async function after() { await load(); if (window.renderHud) window.renderHud(); }

    async function claim(q) {
        const { data, error } = await sb.rpc('rw_claim_quest', { p_id: q.id });
        if (error) return toast(error.message);
        toast('+' + data.exp + ' EXP · +' + data.coins + ' monedas');
        after();
    }
    async function buy(i) {
        if (!confirm('¿Comprar "' + i.name + '" por ' + i.price + ' monedas?')) return;
        const { error } = await sb.rpc('rw_buy_item', { p_id: i.id });
        if (error) return toast(error.message);
        toast('Comprado: ' + i.name);
        after();
    }
    async function equip(i, on) {
        const { error } = await sb.rpc('rw_equip_item', { p_id: i.id, p_equip: on });
        if (error) return toast(error.message);
        after();
    }

    /* ---------- Seguimiento de juego ---------- */
    let beat = null;
    const present = () => document.visibilityState === 'visible' && document.hasFocus();
    function slug(url) {
        try {
            const u = new URL(url);
            return (u.hostname + u.pathname).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'juego';
        } catch (e) { return 'juego'; }
    }
    async function tick() {
        if (!present()) return;
        try {
            await sb.rpc('rw_heartbeat');
            await refreshQuiet();
        } catch (e) { console.warn('rewards tick:', e.message || e); }
    }

    const startOrig = Arcade.startGame, stopOrig = Arcade.stopGame;
    Arcade.startGame = async function (url) {
        await startOrig(url);
        try {
            const { data: { session } } = await sb.auth.getSession();
            if (!session) return;
            await sb.rpc('rw_game_start', { p_slug: slug(url) });
            clearInterval(beat);
            beat = setInterval(tick, 30000);
        } catch (e) { console.warn('rewards start:', e.message || e); }
    };
    Arcade.stopGame = async function () {
        if (beat) {
            clearInterval(beat);
            beat = null;
            try { await sb.rpc('rw_game_end'); } catch (e) { /* ignorar */ }
            refreshQuiet();
        }
        await stopOrig();
    };

    /* ---------- Integración ---------- */
    const showOrig = window.showSection;
    window.showSection = function (id) {
        showOrig(id);
        if (['rewards', 'shop', 'early', 'inventory', 'settings'].includes(id)) load();
    };
    let authTimer = null;
    sb.auth.onAuthStateChange(() => { clearTimeout(authTimer); authTimer = setTimeout(load, 300); });
    load();
})();
