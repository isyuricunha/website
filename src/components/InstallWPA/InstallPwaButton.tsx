import React, { useEffect, useState } from 'react';

const InstallPwaButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          // Removed the console.log statement
          // console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  return (
    <div>
      {deferredPrompt && (
        <button onClick={handleInstallClick}>Install PWA</button>
      )}
    </div>
  );
};

export default InstallPwaButton;
