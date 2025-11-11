/**
 * Carousel Navigation
 * Creates and manages unobtrusive carousel navigation buttons for project galleries
 */

(function() {
	'use strict';

	// Initialize carousel controls when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initCarousels);
	} else {
		initCarousels();
	}

	function initCarousels() {
		// Find all project galleries
		const projects = document.querySelectorAll('.project');
		
		projects.forEach(project => {
			const gallery = project.querySelector('.project-gallery');
			const toggles = project.querySelectorAll('.carousel-toggle');
			
			// Only add controls if there's more than one slide
			if (!gallery || toggles.length <= 1) return;
			
			createCarouselControls(project, gallery, toggles);
		});
	}

	function createCarouselControls(project, gallery, toggles) {
		const container = document.createElement('div');
		container.className = 'carousel-controls';
		container.setAttribute('aria-label', 'Gallery navigation');
		
		// Create previous button
		const prevButton = createButton('prev', 'Previous slide');
		prevButton.addEventListener('click', () => navigateCarousel(toggles, -1));
		
		// Create next button
		const nextButton = createButton('next', 'Next slide');
		nextButton.addEventListener('click', () => navigateCarousel(toggles, 1));
		
		container.appendChild(prevButton);
		container.appendChild(nextButton);
		
		// Insert controls as sibling to gallery, not child
		gallery.parentNode.insertBefore(container, gallery.nextSibling);
		
		// Update button states based on current slide
		toggles.forEach((toggle, index) => {
			toggle.addEventListener('change', () => {
				updateButtonStates(prevButton, nextButton, index, toggles.length);
			});
		});
		
		// Set initial button states
		const currentIndex = Array.from(toggles).findIndex(t => t.checked);
		updateButtonStates(prevButton, nextButton, currentIndex, toggles.length);
		
		// Add scroll event listener to sync manual scrolling with radio buttons
		gallery.addEventListener('scroll', () => {
			syncScrollToToggles(project, gallery, toggles, prevButton, nextButton);
		});
	}

	function createButton(direction, label) {
		const button = document.createElement('button');
		button.className = `carousel-button carousel-button--${direction}`;
		button.setAttribute('aria-label', label);
		button.type = 'button';
		
		// Add icon/arrow
		const icon = document.createElement('span');
		icon.className = 'carousel-button__icon';
		icon.setAttribute('aria-hidden', 'true');
		icon.textContent = direction === 'prev' ? '‹' : '›';
		
		button.appendChild(icon);
		
		return button;
	}

	function navigateCarousel(toggles, direction) {
		const currentIndex = Array.from(toggles).findIndex(t => t.checked);
		let newIndex = currentIndex + direction;
		
		// Wrap around if needed
		if (newIndex < 0) {
			newIndex = toggles.length - 1;
		} else if (newIndex >= toggles.length) {
			newIndex = 0;
		}
		
		// Trigger the corresponding radio button
		toggles[newIndex].checked = true;
		
		// Manually trigger change event for button state updates
		toggles[newIndex].dispatchEvent(new Event('change'));
		
		// Scroll the gallery track to the new slide
		scrollToSlide(toggles[newIndex], newIndex);
	}

	function scrollToSlide(toggle, index) {
		// Find the project container
		const project = toggle.closest('.project');
		if (!project) return;
		
		const gallery = project.querySelector('.project-gallery');
		const items = project.querySelectorAll('.project-gallery-item');
		
		if (!items[index]) return;
		
		// Simply scroll to the target item's position
		const targetItem = items[index];
		gallery.scrollTo({
			left: targetItem.offsetLeft,
			behavior: 'smooth'
		});
	}

	function updateButtonStates(prevButton, nextButton, currentIndex, totalSlides) {
		// Optionally disable buttons at boundaries (or leave enabled for wrap-around)
		// For wrap-around navigation, we don't disable any buttons
		
		// Update aria-disabled for accessibility
		prevButton.setAttribute('aria-disabled', 'false');
		nextButton.setAttribute('aria-disabled', 'false');
		
		// Add visual indicators if at start/end (optional)
		prevButton.classList.toggle('carousel-button--at-start', currentIndex === 0);
		nextButton.classList.toggle('carousel-button--at-end', currentIndex === totalSlides - 1);
	}

	function syncScrollToToggles(project, gallery, toggles, prevButton, nextButton) {
		// Find which slide is currently most visible based on scroll position
		const items = project.querySelectorAll('.project-gallery-item');
		const scrollLeft = gallery.scrollLeft;
		
		// Simple approach: find the closest item start position
		let closestIndex = 0;
		let closestDistance = Math.abs(scrollLeft - items[0].offsetLeft);
		
		for (let i = 1; i < items.length; i++) {
			const distance = Math.abs(scrollLeft - items[i].offsetLeft);
			if (distance < closestDistance) {
				closestDistance = distance;
				closestIndex = i;
			}
		}
		
		// Update the corresponding radio button if it's different
		if (!toggles[closestIndex].checked) {
			toggles[closestIndex].checked = true;
			updateButtonStates(prevButton, nextButton, closestIndex, toggles.length);
		}
	}

	// Support keyboard navigation
	document.addEventListener('keydown', (e) => {
		// Only handle if a modal is open
		const openModal = document.querySelector('.modal-toggle:checked');
		if (!openModal) return;
		
		const project = openModal.closest('.project')?.parentElement?.querySelector('.project');
		if (!project) return;
		
		const toggles = project.querySelectorAll('.carousel-toggle');
		if (toggles.length <= 1) return;
		
		switch(e.key) {
			case 'ArrowLeft':
				e.preventDefault();
				navigateCarousel(toggles, -1);
				break;
			case 'ArrowRight':
				e.preventDefault();
				navigateCarousel(toggles, 1);
				break;
		}
	});

})();
