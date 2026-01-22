document.addEventListener('DOMContentLoaded', () => {
    
    // Select Elements
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-menu-btn'); // NEW Selection
    const sideMenu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');

    if (!menuBtn) {
        console.error("Error: Menu Button not found!");
        return;
    }

    // Toggle Function
    function toggleMenu() {
        sideMenu.classList.toggle('open');
        overlay.classList.toggle('show');
    }

    // Open Menu
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // NEW: Close Menu using Cross Button
    if(closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    // Close when clicking overlay
    if(overlay) {
        overlay.addEventListener('click', toggleMenu);
    }
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
        const isClickInside = sideMenu.contains(e.target);
        const isClickOnBtn = menuBtn.contains(e.target);
        
        if (sideMenu.classList.contains('open') && !isClickInside && !isClickOnBtn) {
            sideMenu.classList.remove('open');
            overlay.classList.remove('show');
        }
    });
});