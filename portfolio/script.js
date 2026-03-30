// ── 3D Background Particle System ──────────────────────────────
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');

let W, H, particles = [];
const TOTAL = 120;
const MOUSE = { x: -9999, y: -9999 };
const FOV = 300;

function resizeBg() {
  W = bgCanvas.width = window.innerWidth;
  H = bgCanvas.height = window.innerHeight;
}

function randBetween(a, b) { return a + Math.random() * (b - a); }

function createParticle() {
  return {
    x: randBetween(-W, W),
    y: randBetween(-H, H),
    z: randBetween(0, W),
    vx: randBetween(-0.3, 0.3),
    vy: randBetween(-0.3, 0.3),
    vz: randBetween(0.4, 1.2),
    r: randBetween(1, 2.5),
  };
}

function initParticles() {
  particles = [];
  for (let i = 0; i < TOTAL; i++) particles.push(createParticle());
}

function project(x, y, z) {
  const scale = FOV / (FOV + z);
  return {
    sx: x * scale + W / 2,
    sy: y * scale + H / 2,
    scale,
  };
}

function animateBg() {
  bgCtx.clearRect(0, 0, W, H);

  // mouse parallax offset
  const mx = (MOUSE.x - W / 2) * 0.04;
  const my = (MOUSE.y - H / 2) * 0.04;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    // move
    p.z -= p.vz;
    p.x += p.vx + mx * 0.01;
    p.y += p.vy + my * 0.01;

    // reset when too close
    if (p.z <= 0) {
      particles[i] = createParticle();
      particles[i].z = W;
      continue;
    }

    const { sx, sy, scale } = project(p.x, p.y, p.z);

    // skip off-screen
    if (sx < -10 || sx > W + 10 || sy < -10 || sy > H + 10) {
      particles[i] = createParticle();
      continue;
    }

    const alpha = Math.min(scale * 1.2, 0.8);
    const radius = p.r * scale * 2;

    // draw dot
    bgCtx.beginPath();
    bgCtx.arc(sx, sy, radius, 0, Math.PI * 2);
    bgCtx.fillStyle = `rgba(245,166,35,${alpha * 0.7})`;
    bgCtx.fill();

    // connect nearby projected dots
    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      if (q.z <= 0) continue;
      const { sx: qx, sy: qy, scale: qs } = project(q.x, q.y, q.z);
      const dx = sx - qx, dy = sy - qy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const lineAlpha = (1 - dist / 100) * 0.12 * Math.min(scale, qs) * 3;
        bgCtx.beginPath();
        bgCtx.moveTo(sx, sy);
        bgCtx.lineTo(qx, qy);
        bgCtx.strokeStyle = `rgba(245,166,35,${lineAlpha})`;
        bgCtx.lineWidth = 0.5;
        bgCtx.stroke();
      }
    }

    // mouse attraction line
    const mdx = sx - MOUSE.x, mdy = sy - MOUSE.y;
    const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
    if (mdist < 140) {
      bgCtx.beginPath();
      bgCtx.moveTo(sx, sy);
      bgCtx.lineTo(MOUSE.x, MOUSE.y);
      bgCtx.strokeStyle = `rgba(245,166,35,${(1 - mdist / 140) * 0.3})`;
      bgCtx.lineWidth = 0.7;
      bgCtx.stroke();
    }
  }

  requestAnimationFrame(animateBg);
}

window.addEventListener('resize', () => { resizeBg(); initParticles(); });
window.addEventListener('mousemove', e => { MOUSE.x = e.clientX; MOUSE.y = e.clientY; });
window.addEventListener('mouseleave', () => { MOUSE.x = -9999; MOUSE.y = -9999; });

resizeBg();
initParticles();
animateBg();
// ────────────────────────────────────────────────────────────────

// Infinite typewriter loop for nav logo
const logoEl = document.getElementById('navLogo');
const logoText = 'Awais Javeed.';
let idx = 0;
let deleting = false;

function typeLoop() {
  if (!deleting) {
    logoEl.textContent = logoText.slice(0, idx + 1);
    idx++;
    if (idx === logoText.length) {
      // pause 5s then start deleting
      setTimeout(() => { deleting = true; typeLoop(); }, 5000);
      return;
    }
    setTimeout(typeLoop, 110);
  } else {
    logoEl.textContent = logoText.slice(0, idx - 1);
    idx--;
    if (idx === 0) {
      // pause 0.5s then start typing again
      deleting = false;
      setTimeout(typeLoop, 500);
      return;
    }
    setTimeout(typeLoop, 60);
  }
}

typeLoop();

// Light/Dark mode toggle
const themeToggle = document.getElementById('themeToggle');
const moonIcon = document.getElementById('moonIcon');
const sunIcon = document.getElementById('sunIcon');

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  moonIcon.style.display = isLight ? 'none' : 'block';
  sunIcon.style.display = isLight ? 'block' : 'none';
});

// Lightbox
function openLightbox(src) {
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// FAQ accordion
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = answer.classList.contains('open');
  document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-q').forEach(q => q.classList.remove('open'));
  if (!isOpen) {
    answer.classList.add('open');
    btn.classList.add('open');
  }
}

// 3D tilt on hero card
const heroCard = document.getElementById('heroCard');
if (heroCard) {
  document.addEventListener('mousemove', (e) => {
    const rect = heroCard.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) / window.innerWidth;
    const dy = (e.clientY - centerY) / window.innerHeight;
    heroCard.style.transform = `rotateY(${dx * 20}deg) rotateX(${-dy * 20}deg) translateY(-10px)`;
    heroCard.style.animation = 'none';
  });

  document.addEventListener('mouseleave', () => {
    heroCard.style.transform = '';
    heroCard.style.animation = 'float3d 6s ease-in-out infinite';
  });
}

// 3D tilt on all cards
document.querySelectorAll('.process-card, .service-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -10;
    const rotateY = ((x - cx) / cx) * 10;
    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    card.style.transition = 'transform 0.1s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    card.style.transition = 'transform 0.4s ease';
  });
});

// Contact form submit
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('userName').value;
  const email = document.getElementById('userEmail').value;
  const project = document.getElementById('userProject').value;
  const message = document.getElementById('userMessage').value;

  const subject = encodeURIComponent('New Message from Portfolio - ' + name);
  const body = encodeURIComponent(
    'Name: ' + name + '\n' +
    'Email: ' + email + '\n' +
    'Project: ' + project + '\n\n' +
    'Message:\n' + message
  );

  window.open('https://mail.google.com/mail/?view=cm&to=mawaisjaveed17@gmail.com&su=' + subject + '&body=' + body, '_blank');

  const btn = e.target.querySelector('button');
  btn.textContent = 'Message Sent!';
  btn.style.background = '#22c55e';
  setTimeout(() => {
    btn.textContent = 'Send Message';
    btn.style.background = '';
    e.target.reset();
  }, 3000);
});
