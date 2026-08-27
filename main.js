// Language Switcher Logic
function setLang(l) {
    document.body.classList.toggle('cs', l === 'cs');
    document.querySelectorAll('.lang-sw button').forEach(b => {
        b.classList.toggle('on', b.textContent.trim() === (l === 'cs' ? 'CZ' : 'EN'));
    });
    try {
        localStorage.setItem('ss-l', l);
    } catch(e) {}
}

// Initialize Language from LocalStorage
try {
    const s = localStorage.getItem('ss-l');
    if(s) setLang(s);
} catch(e) {}

// Navigation Scroll Effect
window.addEventListener('scroll', () => {
    document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile Navigation Close on Click
document.querySelectorAll('.nav-menu a').forEach(a => {
    a.addEventListener('click', () => document.getElementById('navMenu').classList.remove('open'));
});

// Intersection Observer for Scroll Animations
const obs = new IntersectionObserver(es => {
    es.forEach(e => {
        if(e.isIntersecting) e.target.classList.add('show');
    });
}, { threshold: .1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.anim').forEach(el => obs.observe(el));

// Tab Switching Logic for Training Schedule
function showM(m, btn) {
    document.querySelectorAll('.tp').forEach(p => p.classList.remove('on'));
    document.querySelectorAll('.tb').forEach(b => b.classList.remove('on'));
    document.getElementById('p-' + m).classList.add('on');
    btn.classList.add('on');
}

// Scroll Spy for Navigation Active State
window.addEventListener('scroll', () => {
    let c = '';
    document.querySelectorAll('section[id]').forEach(s => {
        if(window.pageYOffset >= s.offsetTop - 120) {
            c = s.id;
        }
    });
    document.querySelectorAll('.nav-menu a[href^="#"]').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + c);
    });
});

// Photo Gallery Slide //
let currentSlide = 0;
let autoSlideTimer = null;
const intervalTime = 3000; // Rotates every 3.5 seconds

function showSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const thumbs = document.querySelectorAll('.thumb');
    
    if (!slides.length) return;

    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;

    slides.forEach(slide => slide.classList.remove('active'));
    thumbs.forEach(thumb => thumb.classList.remove('active'));

    slides[currentSlide].classList.add('active');
    if (thumbs[currentSlide]) {
        thumbs[currentSlide].classList.add('active');
    }
}

function changeSlide(direction) {
    showSlide(currentSlide + direction);
    restartTimer();
}

function goToSlide(index) {
    showSlide(index);
    restartTimer();
}

function startTimer() {
    if (!autoSlideTimer) {
        autoSlideTimer = setInterval(() => showSlide(currentSlide + 1), intervalTime);
    }
}

function stopTimer() {
    clearInterval(autoSlideTimer);
    autoSlideTimer = null;
}

function restartTimer() {
    stopTimer();
    startTimer();
}

// Pause rotation on hover
document.addEventListener('DOMContentLoaded', () => {
    const frame = document.querySelector('.slideshow-frame');
    if (frame) {
        frame.addEventListener('mouseenter', stopTimer);
        frame.addEventListener('mouseleave', startTimer);
    }
    startTimer();
});




