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

        const eased = easeInOutQuint(percent);
        window.scrollTo(0, startY + diff * eased);

        if (percent < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

const content = document.querySelector('.content');
const goTopBtn = document.getElementById('goTopBtn');

goTopBtn?.addEventListener('click', function(e) {
    e.preventDefault();
    content.style.scrollSnapType = 'none';

    content.scrollTo({ top: 0, behavior: "smooth" });

    // Wait for scroll to actually finish
    content.addEventListener('scrollend', function reenableSnap() {
        content.style.scrollSnapType = 'y mandatory';
        content.removeEventListener('scrollend', reenableSnap);
    });
});


