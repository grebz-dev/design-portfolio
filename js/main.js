// Simplified Main Application
document.addEventListener('DOMContentLoaded', function () {
    const sections = document.querySelectorAll('.section');
    const sidebar = document.getElementById('sidebar');
    const subHeaderTitle = document.getElementById('sub-header-title');
    const subHeader = document.getElementById('sub-header');
    
    // Simple sidebar functionality
    if (sidebar) {
        const sidebarLinks = sidebar.querySelectorAll('li');
        
        // Set individual colors for each sidebar item based on their section
        sidebarLinks.forEach((link, index) => {
            if (sections[index]) {
                const sectionColor = sections[index].dataset.color;
                if (sectionColor) {
                    link.style.backgroundColor = sectionColor;
                }
            }
        });
        
        // Handle sidebar clicks
        sidebarLinks.forEach((link, index) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = sections[index];
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Update active sidebar item based on scroll position
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionIndex = Array.from(sections).indexOf(entry.target);
                    
                    // Update sidebar
                    sidebarLinks.forEach(link => link.classList.remove('active'));
                    if (sidebarLinks[sectionIndex]) {
                        sidebarLinks[sectionIndex].classList.add('active');
                    }
                    
                    // Update sub-header color only
                    const sectionData = entry.target.dataset;
                    if (sectionData.title && subHeaderTitle) {
                        subHeaderTitle.textContent = sectionData.title;
                    }
                    if (sectionData.color && subHeader) {
                        subHeader.style.backgroundColor = sectionData.color;
                    }
                }
            });
        }, { threshold: 0.5 });
        
        sections.forEach(section => observer.observe(section));
        
        // Initialize first section as active and set individual sidebar colors
        if (sections.length > 0 && sidebarLinks.length > 0) {
            sidebarLinks[0].classList.add('active');
            const firstSectionData = sections[0].dataset;
            if (firstSectionData.title && subHeaderTitle) {
                subHeaderTitle.textContent = firstSectionData.title;
            }
            if (firstSectionData.color && subHeader) {
                subHeader.style.backgroundColor = firstSectionData.color;
            }
        }
    }
    
    // Modal handling - prevent body scroll when modals are open
    const modalCheckboxes = document.querySelectorAll('input[type="checkbox"][id*="modal-"]');
    
    function updateBodyScrollLock() {
        const anyModalOpen = Array.from(modalCheckboxes).some(checkbox => checkbox.checked);
        document.body.style.overflow = anyModalOpen ? 'hidden' : '';
    }
    
    modalCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateBodyScrollLock);
    });
    
    // Close modal when clicking on background
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-background')) {
            const checkbox = e.target.previousElementSibling;
            if (checkbox && checkbox.type === 'checkbox') {
                checkbox.checked = false;
                updateBodyScrollLock();
            }
        }
    });
    
    // Initial check
    updateBodyScrollLock();
    
    // Scroll indicator functionality
    document.addEventListener('click', (e) => {
        // Handle section scroll indicators
        if (e.target.classList.contains('scroll-arrow-up')) {
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
            }
        }
        
        if (e.target.classList.contains('scroll-arrow-down')) {
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
            }
        }
        
        // Handle carousel scroll indicators
        if (e.target.classList.contains('carousel-scroll-arrow-up')) {
            const carousel = e.target.closest('.carousel');
            const carouselTrack = carousel?.querySelector('.carousel-track');
            if (carouselTrack) {
                carouselTrack.scrollBy({ top: -400, behavior: 'smooth' });
            }
        }
        
        if (e.target.classList.contains('carousel-scroll-arrow-down')) {
            const carousel = e.target.closest('.carousel');
            const carouselTrack = carousel?.querySelector('.carousel-track');
            if (carouselTrack) {
                carouselTrack.scrollBy({ top: 400, behavior: 'smooth' });
            }
        }
    });
});
