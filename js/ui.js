// UI State Management Module
export class UIModule {
    constructor(sections) {
        this.sections = sections;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeActiveState();
    }

    setupEventListeners() {
        // Listen for section updates
        window.addEventListener('sectionUpdate', (e) => {
            const { section, index } = e.detail;
            this.updateSectionState(section, index);
        });

        // Listen for section transitions
        window.addEventListener('sectionTransition', (e) => {
            const { targetSection } = e.detail;
            const index = Array.from(this.sections).indexOf(targetSection);
            this.updateSectionState(targetSection, index);
        });

        // Listen for sidebar navigation
        window.addEventListener('sidebarNavigate', (e) => {
            const { targetSection, index } = e.detail;
            this.handleSidebarNavigation(targetSection, index);
        });

        // Handle hash changes (browser back/forward)
        window.addEventListener('hashchange', () => this.initializeActiveState());
    }

    updateSectionState(section, index) {
        const color = section.getAttribute('data-color');
        const title = section.getAttribute('data-title');

        // Update sub-header
        const subHeader = document.getElementById('sub-header');
        const subHeaderTitle = document.getElementById('sub-header-title');
        
        if (subHeader && color && subHeader.style.backgroundColor !== color) {
            subHeader.style.transition = 'background-color 0.3s ease';
            subHeader.style.backgroundColor = color;
        }
        
        if (subHeaderTitle && title && subHeaderTitle.textContent !== title) {
            subHeaderTitle.style.transition = 'opacity 0.2s ease';
            subHeaderTitle.style.opacity = '0';
            
            setTimeout(() => {
                subHeaderTitle.textContent = title;
                subHeaderTitle.style.opacity = '1';
            }, 200);
        }

        // Update sidebar via custom event
        window.dispatchEvent(new CustomEvent('updateSidebar', {
            detail: { index }
        }));
    }

    handleSidebarNavigation(targetSection, index) {
        // Find current section and reset its carousel
        const currentSectionIndex = this.getCurrentSectionIndex();
        if (currentSectionIndex !== -1 && currentSectionIndex !== index) {
            const currentSection = this.sections[currentSectionIndex];
            // Dispatch event to reset carousel
            window.dispatchEvent(new CustomEvent('resetCarousel', {
                detail: { section: currentSection }
            }));
        }

        // Update UI state
        this.updateSectionState(targetSection, index);
        
        // Scroll to target section
        window.dispatchEvent(new CustomEvent('scrollToSection', {
            detail: { targetSection, imageIndex: 0 }
        }));
    }

    getCurrentSectionIndex() {
        let currentIndex = 0;
        this.sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const viewportCenter = window.innerHeight / 2;
            if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
                currentIndex = index;
            }
        });
        return currentIndex;
    }

    initializeActiveState() {
        let activeIndex = 0; // Default to first project
        
        // If there's a hash, try to find matching section
        if (window.location.hash) {
            const targetId = window.location.hash.substring(1); // Remove the #
            this.sections.forEach((section, index) => {
                if (section.id === targetId) {
                    activeIndex = index;
                }
            });
        }
        
        // Update sidebar
        window.dispatchEvent(new CustomEvent('updateSidebar', {
            detail: { index: activeIndex }
        }));
        
        // Update sub-header for active section
        if (this.sections[activeIndex]) {
            const activeSection = this.sections[activeIndex];
            const color = activeSection.getAttribute('data-color');
            const title = activeSection.getAttribute('data-title');
            
            const subHeader = document.getElementById('sub-header');
            const subHeaderTitle = document.getElementById('sub-header-title');
            
            if (subHeader && color) {
                subHeader.style.transition = 'background-color 0.5s ease';
                subHeader.style.backgroundColor = color;
            }
            
            if (subHeaderTitle && title) {
                subHeaderTitle.style.transition = 'opacity 0.3s ease';
                subHeaderTitle.textContent = title;
                subHeaderTitle.style.opacity = '1';
            }
        }
        
        // If no hash, scroll to first project smoothly
        if (!window.location.hash && this.sections[0]) {
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('scrollToSection', {
                    detail: { targetSection: this.sections[0], imageIndex: 0 }
                }));
            }, 200);
        }
    }
}
