// Carousel Management Module
export class CarouselModule {
    constructor(sections) {
        this.sections = sections;
        this.init();
    }

    init() {
        this.setupCarousels();
    }

    setupCarousels() {
        this.sections.forEach((section) => {
            const carouselTrack = section.querySelector('.carousel-track');
            if (!carouselTrack) return;

            const images = carouselTrack.querySelectorAll('img');
            if (images.length === 0) return;

            const totalImages = images.length;

            // Store section data for state management
            section._carouselData = {
                currentImageIndex: 0, // Always start at 0
                totalImages: totalImages,
                scrollingHorizontally: false
            };

            // Remove old wheel event listeners since we handle this globally now
            section.addEventListener('wheel', (e) => {
                e.preventDefault();
                return;
            }, { passive: false });
        });
    }

    resetCarouselToFirst(section) {
        if (!section._carouselData) return;
        
        section._carouselData.currentImageIndex = 0;
        const carouselTrack = section.querySelector('.carousel-track');
        if (carouselTrack) {
            this.smoothScrollCarousel(carouselTrack, 0, 200);
        }
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
}
