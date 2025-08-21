// Simplified Main Application
document.addEventListener('DOMContentLoaded', function () {
    const sections = document.querySelectorAll('.section');
    const sidebar = document.getElementById('sidebar');
    const subHeaderTitle = document.getElementById('sub-header-title');
    const subHeader = document.getElementById('sub-header');
    const subHeader2 = document.getElementById('sub-header-2');
    const subHeaderTitle2 = document.getElementById('sub-header-title-2');
    const mainContent = document.getElementById('main-content');
    
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
        
        // Handle sidebar clicks - scroll the #main-content container
        sidebarLinks.forEach((link, index) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = sections[index];
                if (targetSection) {
                    if (mainContent) {
                        mainContent.scrollTo({ top: targetSection.offsetTop, behavior: 'smooth' });
                    } else {
                        targetSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        function updateHeaders() {
            const activeSidebarLinks = sidebar.querySelectorAll('li.active');
            const activeSections = Array.from(activeSidebarLinks).map(link => {
                const index = Array.from(sidebar.querySelectorAll('li')).indexOf(link);
                return sections[index];
            }).filter(Boolean); // Filter out any undefined sections

            if (activeSections.length > 0) {
                activeSections.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
                const topSection = activeSections[0];
                const secondSection = activeSections[1];

                // First sub-header
                const topData = topSection.dataset;
                if (topData.title && subHeaderTitle) subHeaderTitle.textContent = topData.title;
                if (topData.color && subHeader) subHeader.style.backgroundColor = topData.color;

                // Second sub-header (if another section is visible in lower half)
                if (secondSection) {
                    const secondData = secondSection.dataset;
                    if (subHeader2 && subHeaderTitle2) {
                        subHeader2.style.display = 'flex';
                        if (secondData.title) subHeaderTitle2.textContent = secondData.title;
                        if (secondData.color) subHeader2.style.backgroundColor = secondData.color;
                    }
                } else if (subHeader2) {
                    subHeader2.style.display = 'none';
                }
            }
        }
        
        // Update active sidebar item(s) based on scroll position within #main-content
        const observerOptions = {
            root: mainContent || null,
            threshold: 0.1
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const sectionIndex = Array.from(sections).indexOf(entry.target);
                const link = sidebar.querySelectorAll('li')[sectionIndex];
                if (link) {
                    if (entry.isIntersecting) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                }
            });
            // No need to call updateHeaders() here, scroll listener handles it
        }, observerOptions);
        
        sections.forEach(section => observer.observe(section));

        // Update headers on scroll for continuous updates
        if (mainContent) {
            mainContent.addEventListener('scroll', updateHeaders);
        }
        
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
            if (subHeader2) {
                subHeader2.style.display = 'none';
            }
            // Initial header update
            updateHeaders();
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
            if (mainContent) {
                mainContent.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
            }
        }
        
        if (e.target.classList.contains('scroll-arrow-down')) {
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
