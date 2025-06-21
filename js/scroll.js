// Touch and Scroll Handling Module
export class ScrollModule {
    constructor(sections) {
        this.sections = sections;
        this.isScrollingBetweenSections = false;
        this.globalScrollCooldown = false;
        
        // Touch handling variables
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.isTouchScrolling = false;
        this.touchThreshold = 50; // Minimum swipe distance
        this.touchTimeThreshold = 300; // Maximum time for swipe
        
        this.init();
    }

    init() {
        this.setupWheelEvents();
        this.setupTouchEvents();
        this.setupScrollTracking();
    }

    setupWheelEvents() {
        window.addEventListener('wheel', (e) => {
            // Check if any modal is open
            const anyModalOpen = document.querySelector('input[type="checkbox"]:checked');
            if (anyModalOpen) {
                e.preventDefault();
                return;
            }

            // Prevent scrolling if we're transitioning between sections or on cooldown
            if (this.isScrollingBetweenSections || this.globalScrollCooldown) {
                e.preventDefault();
                return;
            }

            this.handleScrollInput(e.deltaY > 0 ? 'down' : 'up');
            e.preventDefault();
        }, { passive: false });
    }

    setupTouchEvents() {
        // Touch start event
        window.addEventListener('touchstart', (e) => {
            // Check if any modal is open
            const anyModalOpen = document.querySelector('input[type="checkbox"]:checked');
            if (anyModalOpen) {
                return; // Allow normal scrolling in modals
            }
            
            this.touchStartY = e.touches[0].clientY;
            this.touchStartTime = Date.now();
            this.isTouchScrolling = false;
        }, { passive: true });

        // Touch move event
        window.addEventListener('touchmove', (e) => {
            // Check if any modal is open
            const anyModalOpen = document.querySelector('input[type="checkbox"]:checked');
            if (anyModalOpen) {
                return; // Allow normal scrolling in modals
            }

            // Prevent default touch scrolling behavior
            if (!this.isTouchScrolling) {
                e.preventDefault();
            }
        }, { passive: false });

        // Touch end event
        window.addEventListener('touchend', (e) => {
            // Check if any modal is open
            const anyModalOpen = document.querySelector('input[type="checkbox"]:checked');
            if (anyModalOpen) {
                return; // Allow normal scrolling in modals
            }

            if (this.isScrollingBetweenSections || this.globalScrollCooldown) {
                return;
            }

            const touchEndY = e.changedTouches[0].clientY;
            const touchEndTime = Date.now();
            
            const deltaY = this.touchStartY - touchEndY;
            const deltaTime = touchEndTime - this.touchStartTime;
            
            // Check if this qualifies as a swipe
            if (Math.abs(deltaY) > this.touchThreshold && deltaTime < this.touchTimeThreshold) {
                const direction = deltaY > 0 ? 'down' : 'up';
                this.handleScrollInput(direction);
            }
        }, { passive: true });
    }

    setupScrollTracking() {
        let scrollUpdateTimeout;
        
        window.addEventListener('scroll', () => {
            // Check if any modal is open - if so, don't update UI
            const anyModalOpen = document.querySelector('input[type="checkbox"]:checked');
            if (anyModalOpen) {
                return;
            }
            
            // Throttle scroll updates for better performance
            if (scrollUpdateTimeout) return;
            
            scrollUpdateTimeout = setTimeout(() => {
                // Only update if we're not in the middle of a section transition
                if (!this.isScrollingBetweenSections) {
                    this.updateCurrentSection();
                }
                scrollUpdateTimeout = null;
            }, 16); // ~60fps throttling
        });
    }

    handleScrollInput(direction) {
        // Find current active section
        let currentSection = null;
        let currentSectionIndex = -1;
        
        this.sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const viewportCenter = window.innerHeight / 2;
            if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
                currentSection = section;
                currentSectionIndex = index;
            }
        });

        // If no section is currently active, find the closest one
        if (!currentSection) {
            let closestDistance = Infinity;
            this.sections.forEach((section, index) => {
                const rect = section.getBoundingClientRect();
                const sectionCenter = rect.top + rect.height / 2;
                const viewportCenter = window.innerHeight / 2;
                const distance = Math.abs(sectionCenter - viewportCenter);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    currentSection = section;
                    currentSectionIndex = index;
                }
            });
        }

        if (!currentSection || !currentSection._carouselData) return;

        // Set global cooldown
        this.globalScrollCooldown = true;
        setTimeout(() => {
            this.globalScrollCooldown = false;
        }, 350);

        const carouselData = currentSection._carouselData;

        if (direction === 'down') {
            // Scrolling down
            if (carouselData.currentImageIndex < carouselData.totalImages - 1) {
                carouselData.currentImageIndex++;
                this.scrollToImageInSection(currentSection, carouselData.currentImageIndex);
            } else {
                // Move to next section
                const nextSection = this.sections[currentSectionIndex + 1];
                if (nextSection) {
                    this.transitionToSection(nextSection, 0); // Start at first image
                }
            }
        } else {
            // Scrolling up
            if (carouselData.currentImageIndex > 0) {
                carouselData.currentImageIndex--;
                this.scrollToImageInSection(currentSection, carouselData.currentImageIndex);
            } else {
                // Move to previous section
                const prevSection = this.sections[currentSectionIndex - 1];
                if (prevSection && prevSection._carouselData) {
                    const lastImageIndex = prevSection._carouselData.totalImages - 1;
                    this.transitionToSection(prevSection, lastImageIndex); // Start at last image
                }
            }
        }
    }

    scrollToImageInSection(section, imageIndex) {
        const carouselTrack = section.querySelector('.carousel-track');
        if (!carouselTrack) return;
        
        section._carouselData.scrollingHorizontally = true;
        const carouselWidth = carouselTrack.clientWidth;
        const scrollPosition = imageIndex * carouselWidth;

        this.smoothScrollCarousel(carouselTrack, scrollPosition, 300, () => {
            section._carouselData.scrollingHorizontally = false;
        });
    }
    
    transitionToSection(targetSection, imageIndex = 0) {
        this.isScrollingBetweenSections = true;
        
        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('sectionTransition', {
            detail: { targetSection, imageIndex }
        }));
        
        // Smooth scroll to target section
        this.smoothScrollToSection(targetSection, () => {
            this.isScrollingBetweenSections = false;
            // Set to specified image index
            if (targetSection._carouselData) {
                targetSection._carouselData.currentImageIndex = imageIndex;
                this.scrollToImageInSection(targetSection, imageIndex);
            }
        });
    }

    updateCurrentSection() {
        this.sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const viewportCenter = window.innerHeight / 2;
            
            // Use a more precise detection area for better responsiveness
            if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
                // Dispatch event for UI updates
                window.dispatchEvent(new CustomEvent('sectionUpdate', {
                    detail: { section, index }
                }));
            }
        });
    }

    smoothScrollCarousel(element, targetLeft, duration = 300, callback) {
        const startLeft = element.scrollLeft;
        const distance = targetLeft - startLeft;
        
        // Don't animate if we're already at the target
        if (Math.abs(distance) < 1) {
            if (callback) callback();
            return;
        }

        let startTime = null;

        function animate(currentTime) {
            if (startTime === null) startTime = currentTime;
            
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Smooth ease-out
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            
            const currentLeft = startLeft + (distance * easedProgress);
            element.scrollLeft = currentLeft;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Ensure we end exactly at the target
                element.scrollLeft = targetLeft;
                if (callback) {
                    setTimeout(callback, 50);
                }
            }
        }

        requestAnimationFrame(animate);
    }

    smoothScrollToSection(section, callback) {
        const targetPosition = section.offsetTop;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 800; // Longer duration for section transitions
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Cubic easing in-out for section transitions
            const easedProgress = progress < 0.5 
                ? 4 * progress * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            window.scrollTo(0, startPosition + (distance * easedProgress));

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (callback) {
                setTimeout(callback, 100); // Small delay to ensure scroll is complete
            }
        }

        requestAnimationFrame(animate);
    }
}
