// Sidebar Navigation Module
export class SidebarModule {
    constructor(sections) {
        this.sidebarLinks = document.querySelectorAll('#sidebar li');
        this.sections = sections;
        this.init();
    }

    init() {
        this.setupSidebarColors();
        this.setupSidebarEvents();
        this.resizeSidebarTabs();
        
        // Resize on window resize
        window.addEventListener('resize', () => this.resizeSidebarTabs());
    }

    resizeSidebarTabs() {}

    getContrastYIQ(hexcolor) {
        hexcolor = hexcolor.replace('#', '');
        const r = parseInt(hexcolor.substr(0, 2), 16);
        const g = parseInt(hexcolor.substr(2, 2), 16);
        const b = parseInt(hexcolor.substr(4, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#000' : '#fff';
    }

    setupSidebarColors() {
        this.sidebarLinks.forEach((link, index) => {
            const section = this.sections[index];
            const color = section.getAttribute('data-color');
            link.style.backgroundColor = color;

            // Adjust text color for readability
            const textColor = this.getContrastYIQ(color);
            link.style.color = textColor;
        });
    }

    setupSidebarEvents() {
        this.sidebarLinks.forEach((link, index) => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const targetSection = this.sections[index];
                
                // Dispatch custom event for navigation
                window.dispatchEvent(new CustomEvent('sidebarNavigate', {
                    detail: { targetSection, index }
                }));
            });
        });
    }

    updateActiveLink(index) {
        this.sidebarLinks.forEach(link => link.classList.remove('active'));
        if (this.sidebarLinks[index]) {
            this.sidebarLinks[index].classList.add('active');
            this.resizeSidebarTabs();
        }
    }
}
