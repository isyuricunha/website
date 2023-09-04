// components/InstallPwaButton.tsx
import React, { useEffect, useState } from 'react';

const InstallPwaButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
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
