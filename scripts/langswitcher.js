function setLanguage(lang) {
  if (typeof translations === 'undefined' || !translations[lang]) return;

  // 1. Save language preference
  localStorage.setItem('preferred_lang', lang);

  // 2. Update root element lang tag
  document.documentElement.lang = lang;

  // 3. Update all static i18n text tags
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // 4. Update UI language switch buttons
  document.querySelectorAll('.lang-sw button').forEach((btn) => {
    const isTarget = btn.getAttribute('onclick')?.includes(`'${lang}'`);
    btn.classList.toggle('on', isTarget);
  });
}

// Global accessor for legacy calls
window.setLang = setLanguage;

// Initial launch when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('preferred_lang') || 'en';
  setLanguage(savedLang);
});