// ===== ГЛОБАЛЬНЫЕ =====
let pageVisible = !document.hidden;
document.addEventListener('visibilitychange', () => { pageVisible = !document.hidden; });

function randomBetween(min, max) { return Math.random() * (max - min) + min; }

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
}

// ===== ЗВЁЗДЫ =====
(function() {
    const canvas = document.getElementById('stars');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    const STAR_COUNT = 250;
    const FIXED_SIZE = 1.5;
    let W = 0, H = 0, stars = [];

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth; H = window.innerHeight;
        canvas.width = W * dpr; canvas.height = H * dpr;
        canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                speed: 40 + Math.random() * 100,
                opacity: 0.4 + Math.random() * 0.6
            });
        }
    }

    function updateStars(dt) {
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            s.x -= s.speed * dt;
            if (s.x < -5) {
                s.x = W + Math.random() * 30;
                s.y = Math.random() * H;
                s.opacity = 0.4 + Math.random() * 0.6;
                s.speed = 40 + Math.random() * 100;
            }
        }
    }

    function drawStars() {
        ctx.clearRect(0, 0, W, H);
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            ctx.globalAlpha = s.opacity;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(s.x, s.y, FIXED_SIZE, FIXED_SIZE);
        }
        ctx.globalAlpha = 1;
    }

    window.__stars = { updateStars, drawStars };
    resize(); initStars();

    let rt;
    window.addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(() => { resize(); initStars(); }, 150);
    });
})();

// ===== АМОГУСЫ ФОНА =====
const amongusData = [];
const AMONGUS_SPEED_MIN = 90;
const AMONGUS_SPEED_MAX = 160;
const BEHIND_FILES = ['blue', 'purple', 'white'];

function resetAmongus(a, spawnRight) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    if (spawnRight) a.x = W + randomBetween(50, 300);
    a.baseY = randomBetween(H * 0.08, H * 0.82);
    a.speed = randomBetween(AMONGUS_SPEED_MIN, AMONGUS_SPEED_MAX);
    a.floatAmp = randomBetween(6, 14);
    a.floatFreq = randomBetween(1.2, 2.2);
    a.floatPhase = randomBetween(0, Math.PI * 2);
    a.rotAmp = randomBetween(6, 14);
    a.rotPhase = randomBetween(0, Math.PI * 2);
    a.rotFreq = randomBetween(1.2, 2.2);
    a.baseRot = randomBetween(-6, 6);
    a.respawnAt = 0;
}

(function() {
    const FILES = ['red','tan','black','yellow','purple','maroon','white','blue','pink'];
    const layer = document.getElementById('amongusLayer');
    if (!layer) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const shuffled = FILES.slice().sort(() => Math.random() - 0.5);

    shuffled.forEach((name, index) => {
        const img = document.createElement('img');
        img.className = 'amongus';
        if (BEHIND_FILES.includes(name)) img.classList.add('behind');
        img.src = 'bg/' + name + '.png';
        img.alt = name;
        img.loading = 'lazy';
        img.onerror = function() { this.style.display = 'none'; };
        layer.appendChild(img);

        const a = { el: img, x: 0, baseY: 0, speed: 0,
            floatAmp: 0, floatFreq: 0, floatPhase: 0,
            rotAmp: 0, rotPhase: 0, rotFreq: 0, baseRot: 0, respawnAt: 0 };

        resetAmongus(a, false);
        a.x = (index / FILES.length) * W * 0.9 + randomBetween(0, W * 0.08);
        a.baseY = randomBetween(H * 0.08, H * 0.82);
        amongusData.push(a);
    });
})();

// ===== ЦИКЛ =====
let lastTime = performance.now();

function tick(now) {
    requestAnimationFrame(tick);
    if (!pageVisible) { lastTime = now; return; }

    let dt = (now - lastTime) / 1000;
    if (dt > 0.1) dt = 0.1;
    lastTime = now;

    if (window.__stars) {
        window.__stars.updateStars(dt);
        window.__stars.drawStars();
    }

    const t = now / 1000;

    for (let i = 0; i < amongusData.length; i++) {
        const a = amongusData[i];
        const img = a.el;
        if (img.style.display === 'none') continue;

        if (a.respawnAt) {
            if (now < a.respawnAt) continue;
            resetAmongus(a, true);
            img.style.opacity = '1';
        }

        a.x -= a.speed * dt;

        if (a.x < -150) {
            img.style.opacity = '0';
            a.respawnAt = now + randomBetween(1000, 5000);
            continue;
        }

        const offsetY = Math.sin(a.floatPhase + t * a.floatFreq) * a.floatAmp;
        const rotate = a.baseRot + Math.sin(a.rotPhase + t * a.rotFreq) * a.rotAmp;
        img.style.transform = 'translate3d(' + a.x + 'px,' +
            (a.baseY + offsetY) + 'px,0) rotate(' + rotate + 'deg)';
    }
}
requestAnimationFrame(tick);

// ===== КНОПКА "СКАЧАТЬ" =====
(function() {
    const funkyBtn = document.getElementById('funkyBtn');
    if (!funkyBtn) return;
    funkyBtn.addEventListener('click', function() {
        const sub = document.getElementById('subButtons');
        sub.classList.toggle('open');
        this.classList.toggle('open');
    });
})();

// ===== ПОСТЫ =====
let posts = [];

function getImagePath(name) {
    const ext = name.split('.').pop().toLowerCase();
    const valid = ['jpg','jpeg','png','gif','webp','svg','bmp','ico'];
    return valid.includes(ext) ? 'images/' + name : 'images/' + name + '.jpg';
}
function getPlainText(c) { return c ? c.replace(/!image:\([^)]+\)/g, '').trim() : ''; }
function getFirstImage(c) {
    if (!c) return null;
    const m = c.match(/!image:\(([^)]+)\)/);
    return m ? getImagePath(m[1].trim()) : null;
}

function parseContent(content, isModal) {
    if (!content) return 'Нет содержимого';
    const parts = content.split(/!image:\(([^)]+)\)/);
    let result = '';
    for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
            const txt = parts[i].trim();
            if (txt) result += '<span>' + escapeHtml(txt) + '</span>';
        } else {
            const name = parts[i].trim();
            if (name) {
                const p = getImagePath(name);
                if (isModal) {
                    result += '<div class="modal-image-wrapper"><img src="' + escapeHtml(p) +
                        '" alt="' + escapeHtml(name) + '" loading="lazy"></div>';
                } else {
                    result += '<div style="margin:10px 0;"><img src="' + escapeHtml(p) +
                        '" alt="' + escapeHtml(name) +
                        '" style="width:100%;max-height:300px;object-fit:cover;border-radius:12px;" loading="lazy"></div>';
                }
            }
        }
    }
    return result;
}

async function loadPosts() {
    const grid = document.getElementById('postsGrid');
    if (!grid) return;
    try {
        const r = await fetch('./posts.json?' + Date.now());
        if (!r.ok) throw new Error();
        posts = await r.json();
    } catch { posts = []; }
    renderPosts();
}

function renderPosts() {
    const grid = document.getElementById('postsGrid');
    if (!grid) return;
    if (!posts || posts.length === 0) {
        grid.innerHTML = '<div class="empty-posts">' +
            '<div class="empty-icon">📭</div>' +
            '<div class="empty-title">Извините, но постов пока нет</div>' +
            '<div class="empty-desc">Скоро здесь появятся новые записи. Загляните позже!</div></div>';
        return;
    }
    grid.innerHTML = posts.map(post => {
        const img = getFirstImage(post.content);
        const plain = getPlainText(post.content);
        const preview = plain.substring(0, 150) + (plain.length > 150 ? '...' : '');
        const isAuthor = !!post.isAuthor;
        const badge = isAuthor
            ? '<span class="author-badge">AUTHOR</span>'
            : (post.isDev ? '<span class="dev-badge">DEV</span>' : '');
        return '<div class="post-card ' + (isAuthor ? 'author-post' : '') + '" data-id="' + post.id + '">' +
            '<div class="post-meta">' +
                '<span class="post-author">' + escapeHtml(post.author || 'Аноним') + badge + '</span>' +
                '<span class="post-date">' + escapeHtml(post.date || 'Дата не указана') + '</span>' +
            '</div>' +
            (img
                ? '<div class="post-image-wrapper"><img src="' + escapeHtml(img) +
                  '" alt="' + escapeHtml(post.title || '') +
                  '" loading="lazy" onerror="this.parentElement.style.display=\'none\'"></div>'
                : '<div class="post-image-placeholder">' + (isAuthor ? '⭐' : '🌠') + '</div>') +
            '<h3>' + escapeHtml(post.title || 'Без заголовка') + '</h3>' +
            '<div class="post-content-preview">' + escapeHtml(preview || 'Нет содержимого') + '</div>' +
            '<div class="read-more">Читать полностью →</div></div>';
    }).join('');
}

function openPost(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    const isAuthor = !!post.isAuthor;
    const badge = isAuthor
        ? '<span class="author-badge">AUTHOR</span>'
        : (post.isDev ? '<span class="dev-badge">DEV</span>' : '');
    document.getElementById('modalAuthor').innerHTML =
        escapeHtml(post.author || 'Аноним') + badge;
    document.getElementById('modalDate').textContent = post.date || 'Дата не указана';
    document.getElementById('modalTitle').textContent = post.title || 'Без заголовка';
    document.getElementById('modalContent').innerHTML =
        parseContent(post.content || 'Нет содержимого', true);
    document.getElementById('postModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const m = document.getElementById('postModal');
    if (m) m.classList.remove('active');
    document.body.style.overflow = '';
}

(function() {
    const grid = document.getElementById('postsGrid');
    if (grid) {
        grid.addEventListener('click', function(e) {
            const card = e.target.closest('.post-card');
            if (!card) return;
            const rect = card.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = (e.clientX - rect.left) + 'px';
            ripple.style.top = (e.clientY - rect.top) + 'px';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            card.appendChild(ripple);
            setTimeout(() => ripple.remove(), 700);
            openPost(parseInt(card.dataset.id, 10));
        });
    }
    const modal = document.getElementById('postModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });
    }
    const closeBtn = document.getElementById('closeModal');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();

// ===== ТИТРЫ =====
async function loadCredits() {
    const body = document.getElementById('creditsBody');
    if (!body) return;
    body.innerHTML = '<div class="credits-loading"><div class="spinner"></div><div>Загрузка...</div></div>';
    try {
        const r = await fetch('./credits.json?' + Date.now());
        if (!r.ok) throw new Error();
        const data = await r.json();

        const allMembers = [];
        (data.sections || []).forEach(section => {
            (section.members || []).forEach(p => {
                allMembers.push({
                    name: p.name || '',
                    role: p.role || '',
                    desc: p.desc || '',
                    avatar: p.avatar || '',
                    link: p.link || '',
                    linkText: p.linkText || 'Ссылка',
                    sectionTitle: section.title || ''
                });
            });
        });

        if (allMembers.length === 0) {
            body.innerHTML = '<div class="credits-empty">' +
                '<span class="empty-icon">👥</span>' +
                '<div class="empty-title">Список пуст</div>' +
            '</div>';
            return;
        }

        let html = '<div class="credits-list">';
        allMembers.forEach(p => {
            const name = escapeHtml(p.name);
            const role = escapeHtml(p.role);
            const desc = escapeHtml(p.desc);
            const decoText = escapeHtml(p.sectionTitle);

            const avatarInner = p.avatar
                ? '<img class="credits-author-avatar" src="' + escapeHtml(p.avatar) +
                  '" alt="' + name + '" loading="lazy" ' +
                  'onerror="this.outerHTML=\'<div class=&quot;credits-author-avatar-placeholder&quot;>👤</div>\'">'
                : '<div class="credits-author-avatar-placeholder">👤</div>';

            const linkHtml = p.link
                ? '<a class="credits-author-link" href="' + escapeHtml(p.link) +
                  '" target="_blank" rel="noopener">' + escapeHtml(p.linkText) + '</a>'
                : '';

            html += '<div class="credits-author-panel">' +
                (decoText ? '<div class="credits-author-deco">' + decoText + '</div>' : '') +
                '<div class="credits-author-avatar-wrapper">' +
                    '<div class="credits-author-avatar-ring"></div>' +
                    avatarInner +
                '</div>' +
                '<div class="credits-author-info">' +
                    (role ? '<div class="credits-author-role-badge">' + role + '</div>' : '') +
                    '<div class="credits-author-name">' + name + '</div>' +
                    (desc ? '<div class="credits-author-desc">' + desc + '</div>' : '') +
                    linkHtml +
                '</div>' +
            '</div>';
        });
        html += '</div>';

        body.innerHTML = html;
    } catch {
        body.innerHTML = '<div class="credits-empty">' +
            '<span class="empty-icon">⚠️</span>' +
            '<div class="empty-title">Не удалось загрузить</div>' +
            '<div class="empty-desc">Проверь файл credits.json</div>' +
        '</div>';
    }
}

// ===== КЛИКАБЕЛЬНЫЙ АМОГУС =====
(function() {
    const clickAmongus = document.getElementById('clickAmongus');
    if (!clickAmongus) return;

    const audio = new Audio('audio/boing.mp3');
    audio.volume = 0.7;
    audio.preload = 'auto';

    let clickCount = 0;
    const phrases = ['Boing!', 'Bruh!', 'Sus!', 'Amogus!', 'Vibe!', 'Wow!', 'Круто!', 'Ыыы!'];

    let animId = null;
    let animStart = 0;
    const ANIM_DURATION = 550;

    function animateAmongus(now) {
        if (!animStart) animStart = now;
        const t = Math.min((now - animStart) / ANIM_DURATION, 1);

        const punch = Math.sin(t * Math.PI);
        const scale = 1 - 0.15 * punch;
        const wobble = Math.sin(t * Math.PI * 4) * (1 - t) * 10;
        const lift = -Math.sin(t * Math.PI) * 6;

        clickAmongus.style.transform =
            'translateY(' + lift + 'px) ' +
            'scale(' + scale + ') ' +
            'rotate(' + wobble + 'deg)';

        if (t < 1) {
            animId = requestAnimationFrame(animateAmongus);
        } else {
            clickAmongus.style.transform = '';
            animId = null;
            animStart = 0;
        }
    }

    clickAmongus.addEventListener('click', function(e) {
        try {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        } catch (err) {}

        if (animId) cancelAnimationFrame(animId);
        animStart = 0;
        animId = requestAnimationFrame(animateAmongus);

        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 800);

        const text = document.createElement('div');
        text.className = 'float-text';
        text.textContent = phrases[clickCount % phrases.length];
        text.style.left = e.clientX + 'px';
        text.style.top = e.clientY + 'px';
        document.body.appendChild(text);
        setTimeout(() => text.remove(), 1000);

        clickCount++;
    });
})();

// ===== СТАРТ =====
loadPosts();
loadCredits();
