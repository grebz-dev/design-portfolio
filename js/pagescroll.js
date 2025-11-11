/**
 * Page Scroll Management
 * Handles modal scroll behavior to prevent body scroll when modals are open
 */

(function() {
	'use strict';

	let scrollPosition = 0;

	// Initialize scroll management when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initScrollManagement);
	} else {
		initScrollManagement();
	}

	function initScrollManagement() {
		// Find all modal toggles
		const modalToggles = document.querySelectorAll('.modal-toggle');
		
		modalToggles.forEach(toggle => {
			toggle.addEventListener('change', handleModalToggle);
		});

		// Handle ESC key to close modals
		document.addEventListener('keydown', handleKeyDown);
		
		// Handle touch events on modal backdrop to prevent scroll propagation
		document.addEventListener('touchmove', handleTouchMove, { passive: false });
		
		// Handle wheel events to prevent scroll propagation
		document.addEventListener('wheel', handleWheelScroll, { passive: false });
	}

	function handleModalToggle(event) {
		const toggle = event.target;
		const isModalOpen = toggle.checked;
		
		if (isModalOpen) {
			openModal(toggle);
		} else {
			closeModal();
		}
	}

	function openModal(toggle) {
		// Store current scroll position
		scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
		
		// Add no-scroll class to body
		document.body.classList.add('modal-open');
		
		// Set body position to maintain scroll position visually
		document.body.style.position = 'fixed';
		document.body.style.top = `-${scrollPosition}px`;
		document.body.style.width = '100%';
		
		// Focus management - focus the modal
		const modalId = toggle.getAttribute('aria-controls');
		const modal = modalId ? document.getElementById(modalId) : null;
		if (modal) {
			// Small delay to ensure modal is visible before focusing
			setTimeout(() => {
				const closeButton = modal.querySelector('.modal-close');
				if (closeButton) {
					closeButton.focus();
				}
			}, 100);
		}
	}

	function closeModal() {
		// Check if any modals are still open before restoring scroll
		const openModal = document.querySelector('.modal-toggle:checked');
		if (openModal) {
			return; // Don't restore scroll if another modal is still open
		}
		
		// Remove no-scroll class and fixed positioning
		document.body.classList.remove('modal-open');
		document.body.style.position = '';
		document.body.style.top = '';
		document.body.style.width = '';
		
		// Restore scroll position
		window.scrollTo(0, scrollPosition);
	}

	function handleKeyDown(event) {
		// Handle ESC key to close any open modal
		if (event.key === 'Escape') {
			const openModal = document.querySelector('.modal-toggle:checked');
			if (openModal) {
				openModal.checked = false;
				closeModal();
				event.preventDefault();
			}
		}
	}

	function handleTouchMove(event) {
		// Check if any modal is open
		const openModal = document.querySelector('.modal-toggle:checked');
		if (!openModal) return;
		
		// Get the current modal container and body
		const modalContainer = openModal.nextElementSibling?.nextElementSibling;
		const modalBody = modalContainer?.querySelector('.modal-body');
		
		if (!modalContainer || !modalBody) return;
		
		// Get the touch target
		const target = event.target;
		
		// Allow scrolling within the modal body
		if (modalBody.contains(target)) {
			// Check if the modal body needs to scroll
			const isScrollable = modalBody.scrollHeight > modalBody.clientHeight;
			if (isScrollable) {
				// Allow natural scrolling within the modal
				return;
			}
		}
		
		// Prevent scroll for touches on backdrop, modal shell, or other non-scrollable areas
		event.preventDefault();
	}

	function handleWheelScroll(event) {
		// Check if any modal is open
		const openModal = document.querySelector('.modal-toggle:checked');
		if (!openModal) return;
		
		// Get the current modal container and body
		const modalContainer = openModal.nextElementSibling?.nextElementSibling;
		const modalBody = modalContainer?.querySelector('.modal-body');
		
		if (!modalContainer || !modalBody) return;
		
		// Get the target element
		const target = event.target;
		
		// Allow scrolling within the modal body if it's scrollable
		if (modalBody.contains(target)) {
			const isScrollable = modalBody.scrollHeight > modalBody.clientHeight;
			if (isScrollable) {
				return; // Allow natural scrolling
			}
		}
		
		// Prevent scroll for wheel events outside modal body
		event.preventDefault();
	}

	// Handle window resize to maintain scroll lock position
	window.addEventListener('resize', () => {
		const openModal = document.querySelector('.modal-toggle:checked');
		if (openModal && document.body.classList.contains('modal-open')) {
			// Recalculate and maintain the fixed position
			document.body.style.top = `-${scrollPosition}px`;
		}
	});

	// Handle browser navigation (back/forward) while modal is open
	window.addEventListener('beforeunload', () => {
		const openModal = document.querySelector('.modal-toggle:checked');
		if (openModal) {
			// Force close modal state before page unload
			closeModal();
		}
	});

})();