// Main Application Entry Point
import { SidebarModule } from './sidebar.js';
import { ScrollModule } from './scroll.js';
import { CarouselModule } from './carousel.js';
import { UIModule } from './ui.js';

document.addEventListener('DOMContentLoaded', function () {
    const sections = document.querySelectorAll('.section');
    
    // Initialize all modules
    const sidebar = new SidebarModule(sections);
    const scroll = new ScrollModule(sections);
    const carousel = new CarouselModule(sections);
    const ui = new UIModule(sections);
    
    // Setup inter-module communication
    
    // Listen for sidebar updates
    window.addEventListener('updateSidebar', (e) => {
        const { index } = e.detail;
        sidebar.updateActiveLink(index);
    });
    
    // Listen for carousel reset requests
    window.addEventListener('resetCarousel', (e) => {
        const { section } = e.detail;
        carousel.resetCarouselToFirst(section);
    });
    
    // Listen for scroll-to-section requests
    window.addEventListener('scrollToSection', (e) => {
        const { targetSection, imageIndex } = e.detail;
        scroll.transitionToSection(targetSection, imageIndex);
    });

    // Prevent scrolling when modals are open (fallback for browsers without :has() support)
    const modalCheckboxes = document.querySelectorAll('input[type="checkbox"][id*="modal-"]');
    
    function updateBodyScrollLock() {
        const anyModalOpen = Array.from(modalCheckboxes).some(checkbox => checkbox.checked);
        
        if (anyModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
    
    // Listen for modal state changes
    modalCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateBodyScrollLock);
    });
    
    // Initial check
    updateBodyScrollLock();
});
