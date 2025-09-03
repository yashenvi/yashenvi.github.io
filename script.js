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

        // Improved scroll to top functionality
        const content = document.querySelector('.content');
        const scrollToTopIndicator = document.getElementById('scrollToTop');
        const endMarker = document.getElementById('endMarker');
        let isAtBottom = false;
        let scrollTimeout;
        let hasScrolledPastBottom = false;

        // Use IntersectionObserver to detect when the end marker is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // End marker is in view, user has reached the bottom
                    isAtBottom = true;
                    scrollToTopIndicator.classList.add('visible');
                } else if (hasScrolledPastBottom) {
                    // User has scrolled back up from the bottom
                    isAtBottom = false;
                    hasScrolledPastBottom = false;
                    scrollToTopIndicator.classList.remove('visible');
                }
            });
        }, { threshold: 0.1 });

        if (endMarker) {
            observer.observe(endMarker);
        }

        content.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            
            // Check if we're past the bottom of the content
            const scrollPosition = content.scrollTop + content.clientHeight;
            const scrollHeight = content.scrollHeight;
            
            if (scrollPosition >= scrollHeight - 10) {
                hasScrolledPastBottom = true;
            }
            
            // Set timeout to handle scroll end
            scrollTimeout = setTimeout(function() {
                // If we're at the bottom and user scrolls again, go to top
                if (hasScrolledPastBottom && isAtBottom) {
                    // Temporarily disable scroll snap for smooth scrolling
                    content.style.scrollSnapType = 'none';
                    
                    content.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                    
                    // Hide the indicator
                    scrollToTopIndicator.classList.remove('visible');
                    isAtBottom = false;
                    hasScrolledPastBottom = false;
                    
                    // Re-enable scroll snap after scrolling completes
                    setTimeout(() => {
                        content.style.scrollSnapType = 'y mandatory';
                    }, 1000);
                }
            }, 100);
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
                    content.style.scrollSnapType = 'none';
                    
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Re-enable scroll snap after scrolling completes
                    setTimeout(() => {
                        content.style.scrollSnapType = 'y mandatory';
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