// Toggle mobile menu
document.getElementById('menuToggle').addEventListener('click', function() {
    document.getElementById('headerMenu').classList.toggle('open');
});

// Close menu when clicking on a link
document.querySelectorAll('.header-menu a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('headerMenu').classList.remove('open');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('.header-menu a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Temporarily disable scroll snap for smooth scrolling
            document.querySelector('.content').style.scrollSnapType = 'none';
            
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Re-enable scroll snap after scrolling completes
            setTimeout(() => {
                document.querySelector('.content').style.scrollSnapType = 'y mandatory';
            }, 1000);
        }
    });
});

// Prevent zoom on double-tap (for mobile)
let lastTap = 0;
document.addEventListener('touchend', function(event) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 300 && tapLength > 0) {
        event.preventDefault();
    }
    lastTap = currentTime;
});

// Disable pinch zoom
document.addEventListener('wheel', function(event) {
    if (event.ctrlKey) {
        event.preventDefault();
    }
}, { passive: false });

// Load portfolio sections from the server
document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/portfolios')
        .then(response => response.json())
        .then(portfolios => {
            const portfolioContainer = document.getElementById('portfolio-container');
            // Check if portfolio container exists
            if (!portfolioContainer) return;
            
            portfolioContainer.innerHTML = '';
            
            portfolios.forEach((portfolio) => {
                const section = document.createElement('section');
                section.id = `portfolio-${portfolio.id}`;
                section.className = 'page-section align-left';
                
                section.innerHTML = `
                    <img class="section-object" src="${portfolio.imageUrl}" alt="${portfolio.title}">
                    <div class="page-section-content">
                        <h1>${portfolio.title}</h1>
                        <p>${portfolio.subtitle}</p>
                        <a href="portfolios/portfolio-${portfolio.id}.html" class="portfolio-btn">View Portfolio</a>
                    </div>
                `;
                
                portfolioContainer.appendChild(section);
            });
        })
        .catch(error => {
            console.error('Error loading portfolios:', error);
        });
});