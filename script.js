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

// On page load, set initial positions from data attributes
document.querySelectorAll('.section-object').forEach(obj => {
    if (obj.closest('#portfolio4')) return; // skip portfolio4
    const left = obj.dataset.left || '50%';
    const bottom = obj.dataset.bottom || '0%';
    obj.style.left = left;
    obj.style.bottom = bottom;
    obj.style.transform = 'translateX(-50%)';
});


// Subtle scroll movement
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const scrollFraction = scrollTop / (document.body.scrollHeight - window.innerHeight);

    document.querySelectorAll('.section-object').forEach((obj, index) => {
        const offset = 30 + index * 10; // different amount for each object
        obj.style.transform = `translateX(-50%) translateY(${scrollFraction * offset}px)`;
    });
});


const introImg = document.querySelector('#intro .section-object');
const dragMsg = document.getElementById('dragMsg');
const centerMsg = document.getElementById('centerMsg');

let dragging = false;
let dragStartX = null;
let dragStartY = null;
let offsetX = 0;
let offsetY = 0;
const dragThreshold = 5; // pixels

introImg.addEventListener('dragstart', (e) => {
    e.preventDefault();
});


introImg.addEventListener('mousedown', (e) => {
    const rect = introImg.getBoundingClientRect();

    // Only allow drag if click is roughly near the center of the image
    const centerZoneX = rect.width * 0.25; 
    const centerZoneY = rect.height * 0.25; 

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (
        clickX < centerZoneX || clickX > rect.width - centerZoneX ||
        clickY < centerZoneY || clickY > rect.height - centerZoneY
    ) {
        dragging = false;
        dragStartX = null;
        dragStartY = null;
        return; // ignore clicks outside center
    }

    // Set up potential drag
    dragging = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;

    // Calculate offset from mouse to image center
    offsetX = e.clientX - (rect.left + rect.width / 2);
    offsetY = e.clientY - (rect.top + rect.height / 2);

    introImg.style.cursor = 'grabbing';
    introImg.style.transition = 'none';
});

window.addEventListener('mousemove', (e) => {
    if (dragStartX === null) return;

    // Start dragging only if movement exceeds threshold
    if (!dragging) {
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        if (Math.abs(deltaX) < dragThreshold && Math.abs(deltaY) < dragThreshold) return;
        dragging = true;
    }

    if (!dragging) return;

    // Move image so its center follows the cursor
    const rect = introImg.getBoundingClientRect();
    const newLeft = e.clientX - rect.width / 2;
    const newTop = e.clientY - rect.height / 2;

    // Constrain inside window
    const maxLeft = window.innerWidth - rect.width;
    const maxTop = window.innerHeight - rect.height;
    introImg.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + 'px';
    introImg.style.top = Math.max(0, Math.min(newTop, maxTop)) + 'px';
});


window.addEventListener('mouseup', () => {
    if (!dragging) {
        introImg.style.cursor = 'grab';
        dragStartX = null;
        dragStartY = null;
        return; // do nothing if no real drag
    }

    dragging = false;
    introImg.style.cursor = 'grab';
    introImg.style.transition = 'transform 0.3s';

    const rect = introImg.getBoundingClientRect();
    const windowWidth = window.innerWidth;

    if (rect.left < windowWidth * 0.1) {
        dragMsg.style.display = 'none';
        centerMsg.style.display = 'block';
    } else {
        dragMsg.style.display = 'block';
        centerMsg.style.display = 'none';
    }

    dragStartX = null;
    dragStartY = null;
});


