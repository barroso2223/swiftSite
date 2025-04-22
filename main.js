document.addEventListener('DOMContentLoaded', function() {
    const navbarCollapse = document.getElementById('navbarNav');
    const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
    const navLinks = document.querySelectorAll('.nav-link');

    // Instant scroll to section with navbar height offset
    function instantScroll(target) {
        const navbarHeight = document.querySelector('.navbar').offsetHeight;
        const targetSection = document.querySelector(target);
        if (targetSection) {
            const offsetPosition = targetSection.offsetTop - navbarHeight;
            window.scrollTo(0, offsetPosition);
        }
    }

    // Nav link click handler
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const target = this.getAttribute('href');
            
            if (window.innerWidth < 992) {
                e.preventDefault();
                bsCollapse.hide();
                instantScroll(target);
            }
        });
    });

    // Keep existing click-anywhere-to-close logic
    document.addEventListener('click', function(e) {
        if (window.innerWidth >= 992) return;
        
        const isMenuOpen = navbarCollapse.classList.contains('show');
        const isClickInsideMenu = e.target.closest('#navbarNav');
        const isHamburgerButton = e.target.closest('.navbar-toggler');

        if (isMenuOpen && !isClickInsideMenu && !isHamburgerButton) {
            bsCollapse.hide();
        }
    });
});