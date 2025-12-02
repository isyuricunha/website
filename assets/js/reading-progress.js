// Reading Progress Bar
document.addEventListener('DOMContentLoaded', function() {
    const progressBar = document.getElementById('reading-progress');
    if (!progressBar) return;

    let isVisible = false;
    let ticking = false;
    
    function updateProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollableHeight = documentHeight - windowHeight;
        
        // Calculate progress (0-100)
        let progress = 0;
        if (scrollableHeight > 0) {
            progress = (scrollTop / scrollableHeight) * 100;
        }
        
        // Update progress bar width
        progressBar.style.width = Math.min(Math.max(progress, 0), 100) + '%';
        
        // Show/hide progress bar based on scroll position
        if (scrollTop > 50 && !isVisible) {
            progressBar.classList.add('visible');
            isVisible = true;
        } else if (scrollTop <= 50 && isVisible) {
            progressBar.classList.remove('visible');
            isVisible = false;
        }
        
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateProgress);
            ticking = true;
        }
    }

    // Use passive listeners for better performance
    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick, { passive: true });
    
    // Initial update
    updateProgress();
});
