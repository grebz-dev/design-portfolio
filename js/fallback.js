// Fallback script for browsers that don't support ES6 modules
// This loads the old monolithic script as a backup

if (!window.moduleSupport) {
    // Test for module support
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = 'window.moduleSupport = true;';
    document.head.appendChild(script);
    
    // If modules aren't supported after a brief delay, load the backup
    setTimeout(() => {
        if (!window.moduleSupport) {
            const backupScript = document.createElement('script');
            backupScript.src = '/user/themes/grav-theme-design-portfolio/js/script-backup.js';
            document.head.appendChild(backupScript);
        }
    }, 100);
}
