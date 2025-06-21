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

            // Update active state immediately
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Resize tabs
            resizeSidebarTabs();

            // Reset current carousel to beginning before transitioning
            const currentActiveSection = document.querySelector('.section');
            let currentSectionIndex = 0;
            sections.forEach((section, idx) => {
                const rect = section.getBoundingClientRect();
                const viewportCenter = window.innerHeight / 2;
                if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
                    currentSectionIndex = idx;
                }
            });
            
            const currentSection = sections[currentSectionIndex];
            if (currentSection && currentSection !== targetSection) {
                const currentCarousel = currentSection.querySelector('.carousel-track');
                if (currentCarousel && currentSection._carouselData) {
                    // Reset current carousel to beginning
                    currentSection._carouselData.currentImageIndex = 0;
                    smoothScrollCarousel(currentCarousel, 0, 200, () => {
                        // After resetting current carousel, scroll to target section
                        proceedToTargetSection();
                    });
                    return; // Exit early, proceedToTargetSection will handle the rest
                }
            }
            
            // If no current carousel to reset, proceed immediately
            proceedToTargetSection();
            
            function proceedToTargetSection() {
            // Use the smooth scrolling function
                isScrollingBetweenSections = true;
                updateSectionState(targetSection);
                
                smoothScrollToSection(targetSection, () => {
                    isScrollingBetweenSections = false;
                    // Reset target carousel to first image when manually navigating
                    const carousel = targetSection.querySelector('.carousel-track');
                    if (carousel) {
                        // Update the section's carousel data to reflect reset
                        if (targetSection._carouselData) {
                            targetSection._carouselData.currentImageIndex = 0;
                        }
                        smoothScrollCarousel(carousel, 0, 300);
                    }
                });
            }
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
    let scrollUpdateTimeout;
    
    window.addEventListener('scroll', function () {
        // Check if any modal is open - if so, don't update UI
        const anyModalOpen = document.querySelector('input[type="checkbox"]:checked');
        if (anyModalOpen) {
            return;
        }
        
        // Throttle scroll updates for better performance
        if (scrollUpdateTimeout) return;
        
        scrollUpdateTimeout = setTimeout(() => {
            // Only update if we're not in the middle of a section transition
            if (!isScrollingBetweenSections) {
                sections.forEach((section, index) => {
                    const rect = section.getBoundingClientRect();
                    const viewportCenter = window.innerHeight / 2;
                    
                    // Use a more precise detection area for better responsiveness
                    if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
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

                        // Update sidebar active link
                        const currentActive = document.querySelector('#sidebar li.active');
                        const newActive = sidebarLinks[index];
                        
                        if (currentActive !== newActive) {
                            sidebarLinks.forEach(link => {
                                link.classList.remove('active');
                            });
                            newActive.classList.add('active');
                            
                            // Resize tabs
                            resizeSidebarTabs();
                        }
                    }
                });
            }
            scrollUpdateTimeout = null;
        }, 16); // ~60fps throttling
    });

    // Carousel Scroll Handling
    let isScrollingBetweenSections = false;
    let globalScrollCooldown = false;
    
    // Global wheel event listener for entire page
    window.addEventListener('wheel', function(e) {
        // Check if any modal is open
        const anyModalOpen = document.querySelector('input[type="checkbox"]:checked');
        if (anyModalOpen) {
            e.preventDefault();
            return;
        }

        // Prevent scrolling if we're transitioning between sections or on cooldown
        if (isScrollingBetweenSections || globalScrollCooldown) {
            e.preventDefault();
            return;
        }

        // Find current active section
        let currentSection = null;
        let currentSectionIndex = -1;
        
        sections.forEach((section, index) => {
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
            sections.forEach((section, index) => {
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

        // Prevent default scrolling
        e.preventDefault();

        const deltaY = e.deltaY;
        const scrollDirection = deltaY > 0 ? 'down' : 'up';

        // Set global cooldown
        globalScrollCooldown = true;
        setTimeout(() => {
            globalScrollCooldown = false;
        }, 350);

        const carouselData = currentSection._carouselData;
        const carouselTrack = currentSection.querySelector('.carousel-track');

        if (scrollDirection === 'down') {
            // Scrolling down
            if (carouselData.currentImageIndex < carouselData.totalImages - 1) {
                carouselData.currentImageIndex++;
                scrollToImageInSection(currentSection, carouselData.currentImageIndex);
            } else {
                // Move to next section
                const nextSection = sections[currentSectionIndex + 1];
                if (nextSection) {
                    transitionToSection(nextSection, 0); // Start at first image
                }
            }
        } else {
            // Scrolling up
            if (carouselData.currentImageIndex > 0) {
                carouselData.currentImageIndex--;
                scrollToImageInSection(currentSection, carouselData.currentImageIndex);
            } else {
                // Move to previous section
                const prevSection = sections[currentSectionIndex - 1];
                if (prevSection && prevSection._carouselData) {
                    const lastImageIndex = prevSection._carouselData.totalImages - 1;
                    transitionToSection(prevSection, lastImageIndex); // Start at last image
                }
            }
        }
    }, { passive: false });
    
    function scrollToImageInSection(section, imageIndex) {
        const carouselTrack = section.querySelector('.carousel-track');
        if (!carouselTrack) return;
        
        section._carouselData.scrollingHorizontally = true;
        const carouselWidth = carouselTrack.clientWidth;
        const scrollPosition = imageIndex * carouselWidth;

        smoothScrollCarousel(carouselTrack, scrollPosition, 300, () => {
            section._carouselData.scrollingHorizontally = false;
        });
    }
    
    function transitionToSection(targetSection, imageIndex = 0) {
        isScrollingBetweenSections = true;
        
        // Update UI state before scrolling
        updateSectionState(targetSection);
        
        // Smooth scroll to target section
        smoothScrollToSection(targetSection, () => {
            isScrollingBetweenSections = false;
            // Set to specified image index
            if (targetSection._carouselData) {
                targetSection._carouselData.currentImageIndex = imageIndex;
                scrollToImageInSection(targetSection, imageIndex);
            }
        });
    }
    
    sections.forEach((section) => {
        const carouselTrack = section.querySelector('.carousel-track');
        if (!carouselTrack) return;

        const images = carouselTrack.querySelectorAll('img');
        if (images.length === 0) return;

        let currentImageIndex = 0;
        const totalImages = images.length;
        let scrollingHorizontally = false;
        let scrollCooldown = false;

        section.addEventListener('wheel', function (e) {
            // All wheel handling now moved to global listener above
            // This prevents double handling
            e.preventDefault();
            return;
        }, { passive: false });

        function scrollToImage(index) {
            if (scrollingHorizontally) return;
            
            scrollingHorizontally = true;
            const carouselWidth = carouselTrack.clientWidth;
            const scrollPosition = index * carouselWidth;

            // Use simple smooth scrolling
            smoothScrollCarousel(carouselTrack, scrollPosition, 300, () => {
                scrollingHorizontally = false;
            });
        }

        function transitionToNextSection(currentSection) {
            const nextSection = currentSection.nextElementSibling;
            if (nextSection) {
                isScrollingBetweenSections = true;
                
                // Update UI state before scrolling
                updateSectionState(nextSection);
                
                // Smooth scroll to next section
                smoothScrollToSection(nextSection, () => {
                    isScrollingBetweenSections = false;
                    // Always start at first image in new section
                    const nextCarousel = nextSection.querySelector('.carousel-track');
                    if (nextCarousel && nextSection._carouselData) {
                        nextSection._carouselData.currentImageIndex = 0;
                        // Update the local variable for this section
                        const nextSectionLoop = sections[Array.from(sections).indexOf(nextSection)];
                        smoothScrollCarousel(nextCarousel, 0, 300);
                    }
                });
            }
        }

        function transitionToPreviousSection(currentSection) {
            const prevSection = currentSection.previousElementSibling;
            if (prevSection) {
                isScrollingBetweenSections = true;
                
                // Update UI state before scrolling
                updateSectionState(prevSection);
                
                // Smooth scroll to previous section
                smoothScrollToSection(prevSection, () => {
                    isScrollingBetweenSections = false;
                    // Always start at last image in previous section
                    const prevCarousel = prevSection.querySelector('.carousel-track');
                    if (prevCarousel && prevSection._carouselData) {
                        const prevImages = prevCarousel.querySelectorAll('img');
                        if (prevImages.length > 0) {
                            prevSection._carouselData.currentImageIndex = prevImages.length - 1;
                            const lastImagePosition = (prevImages.length - 1) * prevCarousel.clientWidth;
                            smoothScrollCarousel(prevCarousel, lastImagePosition, 300);
                        }
                    }
                });
            }
        }

        // Store section data for state management
        section._carouselData = {
            currentImageIndex: 0, // Always start at 0
            totalImages: totalImages,
            scrollingHorizontally: false
        };
        
        // Initialize currentImageIndex from stored data
        currentImageIndex = section._carouselData.currentImageIndex;
    });

    // Smooth carousel scrolling
    function smoothScrollCarousel(element, targetLeft, duration = 300, callback) {
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

    // Section transition with smooth animation
    function smoothScrollToSection(section, callback) {
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

    // Update section state (sidebar, sub-header)
    function updateSectionState(section) {
        const sectionIndex = Array.from(sections).indexOf(section);
        if (sectionIndex === -1) return;

        const color = section.getAttribute('data-color');
        const title = section.getAttribute('data-title');

        // Update sub-header
        const subHeader = document.getElementById('sub-header');
        const subHeaderTitle = document.getElementById('sub-header-title');
        if (subHeader && color) subHeader.style.backgroundColor = color;
        if (subHeaderTitle && title) subHeaderTitle.textContent = title;

        // Update sidebar active link
        sidebarLinks.forEach(link => link.classList.remove('active'));
        if (sidebarLinks[sectionIndex]) {
            sidebarLinks[sectionIndex].classList.add('active');
        }
        
        // Resize tabs
        resizeSidebarTabs();
    }

    // Function to initialize the active state
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
        
        // Resize tabs
        resizeSidebarTabs();
        
        // If no hash, scroll to first project smoothly
        if (!window.location.hash && sections[0]) {
            setTimeout(() => {
                isScrollingBetweenSections = true;
                smoothScrollToSection(sections[0], () => {
                    isScrollingBetweenSections = false;
                    // Initialize first carousel
                    const firstCarousel = sections[0].querySelector('.carousel-track');
                    if (firstCarousel) {
                        smoothScrollCarousel(firstCarousel, 0, 300);
                    }
                });
            }, 200);
        }
    }

    // Initialize on page load
    initializeActiveState();
    
    // Also handle hash changes (browser back/forward)
    window.addEventListener('hashchange', initializeActiveState);
});