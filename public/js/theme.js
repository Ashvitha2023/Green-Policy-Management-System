// public/js/theme.js

(function () {
    // Load initial theme before render to prevent flashing
    const savedTheme = localStorage.getItem('formal-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Expose toggle function globally
    window.toggleFormalTheme = function () {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('formal-theme', newTheme);

        // Update the icon if it exists
        updateThemeIcon(newTheme);
    };

    // Set initial icon state when DOM loads
    window.addEventListener('DOMContentLoaded', () => {
        updateThemeIcon(savedTheme);
    });

    function updateThemeIcon(theme) {
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            if (theme === 'dark') {
                themeIcon.classList.remove('bi-moon-stars');
                themeIcon.classList.add('bi-sun-fill');
            } else {
                themeIcon.classList.remove('bi-sun-fill');
                themeIcon.classList.add('bi-moon-stars');
            }
        }
    }
})();
