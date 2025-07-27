document.getElementById('menuToggle').onclick = function() {
    document.getElementById('headerMenu').classList.toggle('open');
};

// Custom smooth scroll function
function slowScrollTo(targetY, duration = 1200) {
    const startY = window.scrollY;
    const diff = targetY - startY;
    let startTime = null;

    function step(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const percent = Math.min(elapsed / duration, 1);

        const eased = easeInOutCubic(percent);
        window.scrollTo(0, startY + diff * eased);

        if (percent < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}


// Scroll snap control for PC (desktop only)
if (window.innerWidth > 700) {
    let lastScrollTime = 0;
    const SCROLL_DELAY = 1300; // ms, slightly more

    window.addEventListener('wheel', function(e) {
        const now = Date.now();
        if (now - lastScrollTime < SCROLL_DELAY) {
        e.preventDefault(); // Block double scrolling
         return;
        }
        lastScrollTime = now;
        e.preventDefault(); // Prevent default scrolling always


        const sections = Array.from(document.querySelectorAll('.page-section'));
        const scrollY = window.scrollY;
        const direction = e.deltaY > 0 ? 1 : -1;

        let currentIndex = sections.findIndex(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            return Math.abs(scrollY - sectionTop) < section.offsetHeight / 2;
        });

        let nextIndex = currentIndex + direction;

        if (nextIndex < 0 || nextIndex >= sections.length) return;

        e.preventDefault(); // stop default browser scroll
        lastScrollTime = now;

        slowScrollTo(sections[nextIndex].offsetTop - 80, 1000);
    }, { passive: false });
}
function easeInOutCubic(t) {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
const SCROLL_DELAY = 1300; // ms, slightly more

