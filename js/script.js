document.addEventListener('DOMContentLoaded', function () {
    // Sidebar Navigation Handling (unchanged)
    const sidebarLinks = document.querySelectorAll('#sidebar li');
    const sections = document.querySelectorAll('.section');

    sidebarLinks.forEach((link, index) => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const targetSection = sections[index];
            const targetPosition = targetSection.offsetTop;

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
});