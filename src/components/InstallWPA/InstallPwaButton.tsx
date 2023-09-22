import React, { useEffect, useState } from 'react';

const InstallPwaButton = (): JSX.Element => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();

      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          // A instalação foi aceita pelo usuário, você pode adicionar lógica adicional aqui se necessário
          // console.log('O usuário aceitou a instalação da PWA.');
        }

        // Reinicialize deferredPrompt após o prompt
        setDeferredPrompt(null);
      });
    }
  };

  return (
    <div>
      {deferredPrompt && (
        <button onClick={handleInstallClick}>Instalar PWA</button>
      )}
    </div>
  );
};

export default InstallPwaButton;
