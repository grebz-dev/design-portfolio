document.addEventListener('DOMContentLoaded', function () {
    // Sidebar Navigation Handling (unchanged)
    const sidebarLinks = document.querySelectorAll('#sidebar li');
    const sections = document.querySelectorAll('.section');

    // Function to resize sidebar tabs
    function resizeSidebarTabs() {
        const sidebar = document.getElementById('sidebar');
        const sidebarHeight = sidebar.clientHeight;
        const totalTabs = sidebarLinks.length;
        const squareTabSize = 60; // Same as sidebar width for square tabs
        const totalSquareSpace = (totalTabs - 1) * squareTabSize; // Space for inactive tabs
        const expandedTabHeight = sidebarHeight - totalSquareSpace; // Remaining space for active tab

        sidebarLinks.forEach((link, index) => {
            if (link.classList.contains('active')) {
                link.style.height = `${expandedTabHeight}px`;
                link.style.display = 'flex';
                link.style.alignItems = 'center';
                link.style.justifyContent = 'center';
            } else {
                link.style.height = `${squareTabSize}px`;
                link.style.display = 'flex';
                link.style.alignItems = 'center';
                link.style.justifyContent = 'center';
            }
        });
    }

    // Initial resize
    resizeSidebarTabs();

    // Resize on window resize
    window.addEventListener('resize', resizeSidebarTabs);

    sidebarLinks.forEach((link, index) => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const targetSection = sections[index];
            const targetPosition = targetSection.offsetTop;

            // Update active state immediately
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Resize tabs
            resizeSidebarTabs();

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });

    function getContrastYIQ(hexcolor) {
        hexcolor = hexcolor.replace('#', '');
        const r = parseInt(hexcolor.substr(0, 2), 16);
        const g = parseInt(hexcolor.substr(2, 2), 16);
        const b = parseInt(hexcolor.substr(4, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#000' : '#fff';
    }

    sidebarLinks.forEach((link, index) => {
        const section = sections[index];
        const color = section.getAttribute('data-color');
        link.style.backgroundColor = color;

        // Adjust text color for readability
        const textColor = getContrastYIQ(color);
        link.style.color = textColor;
    });

    // Update Sub-header and Sidebar on Scroll
    window.addEventListener('scroll', function () {
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                const color = section.getAttribute('data-color');
                const title = section.getAttribute('data-title');

                // Update sub-header
                const subHeader = document.getElementById('sub-header');
                const subHeaderTitle = document.getElementById('sub-header-title');
                subHeader.style.backgroundColor = color;
                subHeaderTitle.textContent = title;

                // Update sidebar active link
                sidebarLinks.forEach(link => {
                    link.classList.remove('active');
                });
                sidebarLinks[index].classList.add('active');
                
                // Resize tabs after active state change
                resizeSidebarTabs();
            }
        });
    });

    // Carousel Scroll Handling with Image-by-Image Scrolling
    // Carousel Scroll Handling
    sections.forEach((section) => {
        const carouselTrack = section.querySelector('.carousel-track');
        if (!carouselTrack) return;

        const images = carouselTrack.querySelectorAll('img');
        if (images.length === 0) return;

        let currentImageIndex = 0;
        const totalImages = images.length;
        let scrollingHorizontally = false;
        let scrollTimeout;

        section.addEventListener('wheel', function (e) {
            const deltaY = e.deltaY;

            if (scrollingHorizontally) {
                e.preventDefault();
                return;
            }

            if (deltaY > 0) {
                if (currentImageIndex < totalImages - 1) {
                    e.preventDefault();
                    currentImageIndex++;
                    scrollToImage(currentImageIndex);
                } else {
                    // Move to next section
                    const nextSection = section.nextElementSibling;
                    if (nextSection) {
                        e.preventDefault();
                        window.scrollTo({
                            top: nextSection.offsetTop,
                            behavior: 'smooth'
                        });
                    }
                }
            } else if (deltaY < 0) {
                if (currentImageIndex > 0) {
                    e.preventDefault();
                    currentImageIndex--;
                    scrollToImage(currentImageIndex);
                } else {
                    // Move to previous section
                    const prevSection = section.previousElementSibling;
                    if (prevSection) {
                        e.preventDefault();
                        window.scrollTo({
                            top: prevSection.offsetTop,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        }, { passive: false });

        function scrollToImage(index) {
            const carouselWidth = carouselTrack.clientWidth;
            const scrollPosition = index * carouselWidth;

            scrollingHorizontally = true;

            carouselTrack.scrollTo({
                left: scrollPosition,
                behavior: 'smooth',
            });
            // Reset scrollingHorizontally after scrolling ends
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function () {
                scrollingHorizontally = false;
            }, 100); // Adjust duration as needed
        }
    });

    // Function to initialize the active state based on current hash or default to first
    function initializeActiveState() {
        let activeIndex = 0; // Default to first project
        
        // If there's a hash, try to find matching section
        if (window.location.hash) {
            const targetId = window.location.hash.substring(1); // Remove the #
            sections.forEach((section, index) => {
                if (section.id === targetId) {
                    activeIndex = index;
                }
            });
        }
        
        // Set active state
        sidebarLinks.forEach(link => link.classList.remove('active'));
        if (sidebarLinks[activeIndex]) {
            sidebarLinks[activeIndex].classList.add('active');
        }
        
        // Update sub-header for active section
        if (sections[activeIndex]) {
            const activeSection = sections[activeIndex];
            const color = activeSection.getAttribute('data-color');
            const title = activeSection.getAttribute('data-title');
            
            const subHeader = document.getElementById('sub-header');
            const subHeaderTitle = document.getElementById('sub-header-title');
            if (subHeader && color) subHeader.style.backgroundColor = color;
            if (subHeaderTitle && title) subHeaderTitle.textContent = title;
        }
        
        // Resize tabs
        resizeSidebarTabs();
        
        // If no hash, scroll to first project smoothly
        if (!window.location.hash && sections[0]) {
            setTimeout(() => {
                sections[0].scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }

    // Initialize on page load
    initializeActiveState();
    
    // Also handle hash changes (browser back/forward)
    window.addEventListener('hashchange', initializeActiveState);
});