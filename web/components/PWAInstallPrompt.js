'use client';
import { useEffect, useMemo, useState } from 'react';
import { FiDownload, FiShare2, FiX } from 'react-icons/fi';

function isStandaloneMode() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const isIos = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  }, []);

  const canRegisterServiceWorker = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.isSecureContext || ['localhost', '127.0.0.1'].includes(window.location.hostname);
  }, []);

  useEffect(() => {
    setIsInstalled(isStandaloneMode());

    const openInstall = () => setIsOpen(true);
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setIsOpen(true);
    };
    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setIsOpen(false);
    };

    window.addEventListener('fiestapp:open-install', openInstall);
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    if ('serviceWorker' in navigator && canRegisterServiceWorker) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }

    return () => {
      window.removeEventListener('fiestapp:open-install', openInstall);
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, [canRegisterServiceWorker]);

  const showPrompt = !isInstalled && (isOpen || !!deferredPrompt || isIos);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setIsOpen(true);
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice.catch(() => undefined);
    setDeferredPrompt(null);
    setIsOpen(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-[1200] flex justify-center sm:left-auto sm:right-5 sm:w-[360px]">
      <div className="pointer-events-auto w-full max-w-md rounded-[1.35rem] border border-white/8 bg-[rgba(10,13,18,0.92)] p-4 text-white shadow-[0_24px_70px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b4bed1]">Instalar app</p>
            <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-white">Abre FIESTAPP como app</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-full border border-white/8 p-2 text-[#a5afc2] transition hover:text-white"
            aria-label="Cerrar"
          >
            <FiX size={15} />
          </button>
        </div>

        {deferredPrompt ? (
          <p className="mt-2 text-sm leading-6 text-[#b4bed1]">
            Instálala para abrir sin barra del navegador y usar una experiencia más cercana a app nativa.
          </p>
        ) : isIos ? (
          <p className="mt-2 text-sm leading-6 text-[#b4bed1]">
            En iPhone, toca <span className="inline-flex items-center gap-1 font-semibold text-white"><FiShare2 size={14} /> Compartir</span> y luego “Agregar a pantalla de inicio”.
          </p>
        ) : (
          <p className="mt-2 text-sm leading-6 text-[#b4bed1]">
            La instalación automática requiere HTTPS o abrir la app desde localhost. En red local por IP puede funcionar la web, pero no siempre la instalación.
          </p>
        )}

        {!canRegisterServiceWorker && !deferredPrompt && !isIos && (
          <p className="mt-3 text-xs leading-5 text-[#f4b5b5]">
            Para instalarla en otros dispositivos conviene desplegarla con HTTPS.
          </p>
        )}

        <div className="mt-4 flex items-center gap-3">
          {deferredPrompt ? (
            <button type="button" onClick={handleInstall} className="btn-primary flex items-center gap-2 !px-4 !py-2.5 text-sm">
              <FiDownload size={15} /> Instalar ahora
            </button>
          ) : (
            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary !px-4 !py-2.5 text-sm">
              Entendido
            </button>
          )}
          <button type="button" onClick={() => setIsOpen(false)} className="btn-ghost text-sm">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
