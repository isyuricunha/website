// Reading Progress Bar
document.addEventListener('DOMContentLoaded', function() {
    const progressBar = document.getElementById('reading-progress');
    if (!progressBar) return;

    let isVisible = false;
    
    function updateProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        
        // Update progress bar width
        progressBar.style.width = Math.min(progress, 100) + '%';
        
        // Show/hide progress bar based on scroll position
        if (scrollTop > 50 && !isVisible) {
            progressBar.classList.add('visible');
            isVisible = true;
        } else if (scrollTop <= 50 && isVisible) {
            progressBar.classList.remove('visible');
            isVisible = false;
        }
    }

    // Update progress on scroll
    window.addEventListener('scroll', updateProgress);
    
    // Initial update
    updateProgress();
});
