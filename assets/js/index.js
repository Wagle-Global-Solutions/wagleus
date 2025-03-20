function initializeNavigation() {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navbar = document.querySelector('.navbar');

    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', function() {
            navbar.classList.toggle('navbar-mobile');
            this.classList.toggle('bi-list');
            this.classList.toggle('bi-x');
        });
    }

    // Handle dropdowns
    const dropdowns = document.querySelectorAll('.navbar .dropdown > a');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            if (navbar.classList.contains('navbar-mobile')) {
                e.preventDefault();
                this.nextElementSibling.classList.toggle('dropdown-active');
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navbar.contains(e.target) && navbar.classList.contains('navbar-mobile')) {
            navbar.classList.remove('navbar-mobile');
            mobileNavToggle.classList.add('bi-list');
            mobileNavToggle.classList.remove('bi-x');
        }
    });
}

// Initialize navigation when DOM is loaded 
document.addEventListener('DOMContentLoaded', initializeNavigation);
