'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Gift } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';

const WishlistTour = dynamic(() => import('./WishlistTour'), { ssr: false });

export interface Regalo {
  id: number;
  nombre: string;
  descripcion: string;
  tienda: string;
  enlace: string;
  imagen_url: string;
  es_reservable: boolean;
  reservado: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function WishlistClient({
  initialRegalos,
  initialHasLoaded = false,
}: {
  initialRegalos: Regalo[];
  initialHasLoaded?: boolean;
}) {
  const [regalos, setRegalos] = useState<Regalo[]>(initialRegalos);
  const [selectedRegalo, setSelectedRegalo] = useState<Regalo | null>(null);
  const [isReserving, setIsReserving] = useState(false);

  // Total sincronización entre Servidor y Cliente para evitar Hydration Mismatch
  const [isFirstLoad] = useState(!initialHasLoaded);
  const [isLoading, setIsLoading] = useState(!initialHasLoaded);

  // Pre-carga real de imágenes enlazada directamente al tiempo de vida del Skeleton
  useEffect(() => {
    if (!isFirstLoad) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const urlsToLoad = initialRegalos
      .map((r) => r.imagen_url)
      .filter((url): url is string => Boolean(url));

    // Promesas de precarga para cada imagen
    const imagesPromise = Promise.all(
      urlsToLoad.map((url) => {
        return new Promise<void>((resolve) => {
          const img = new window.Image();
          img.src = url;
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        });
      })
    );

    // Mínimo de 600ms para evitar parpadeo si cargan en milisegundos
    const minDelayPromise = new Promise((resolve) => setTimeout(resolve, 600));

    const markLoaded = () => {
      if (typeof document !== 'undefined') {
        document.cookie = "wishlist_loaded=true; path=/;";
      }
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('wishlist_loaded', 'true');
      }
    };

    // Timeout de seguridad máximo (3500ms) para que nunca se quede trabado en conexiones muy lentas
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
        markLoaded();
      }
    }, 3500);

    // Solo cuando TODAS las imágenes estén descargadas en memoria se desactiva el Skeleton
    Promise.all([imagesPromise, minDelayPromise]).then(() => {
      if (isMounted) {
        clearTimeout(safetyTimer);
        setIsLoading(false);
        markLoaded();
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, [isFirstLoad, initialRegalos]);

  // Suscripción Realtime a Supabase para mantener la cuadrícula actualizada sin re-fetch ni rotura de scroll
  useEffect(() => {
    const channel = supabase
      .channel('realtime-regalos')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'regalos_ruth' },
        (payload) => {
          setRegalos((prevRegalos: any) =>
            prevRegalos.map((regalo: any) =>
              regalo.id === payload.new.id ? { ...regalo, ...payload.new } : regalo
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleReserve = async () => {
    if (!selectedRegalo) return;
    setIsReserving(true);

    try {
      const { error } = await supabase
        .from('regalos_ruth')
        .update({ reservado: true })
        .eq('id', selectedRegalo.id);

      if (error) throw error;

      // Actualizar estado local
      setRegalos((prev) =>
        prev.map((r) => r.id === selectedRegalo.id ? { ...r, reservado: true } : r)
      );
      setSelectedRegalo(null);
    } catch (err) {
      console.error("Error reservando regalo:", err);
      alert("Hubo un error al reservar el regalo. Por favor intenta de nuevo.");
    } finally {
      setIsReserving(false);
    }
  };

  const [columnsCount, setColumnsCount] = useState(2);

  React.useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth >= 1024) setColumnsCount(4);
      else if (window.innerWidth >= 768) setColumnsCount(3);
      else setColumnsCount(2);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const getMasonryColumns = () => {
    const cols = Array.from({ length: columnsCount }, () => [] as typeof regalos);
    regalos.forEach((regalo, i) => {
      cols[i % columnsCount].push(regalo);
    });
    return cols;
  };

  const masonryColumns = getMasonryColumns();

  const getSkeletonColumns = () => {
    const cols = Array.from({ length: columnsCount }, () => [] as number[]);
    Array.from({ length: 8 }).forEach((_, i) => {
      cols[i % columnsCount].push(i);
    });
    return cols;
  };

  const skeletonColumns = getSkeletonColumns();

  // Encontrar los primeros elementos para apuntar en el Tour
  const firstReservableId = regalos.find(r => r.es_reservable && !r.reservado)?.id;
  const firstInfiniteId = regalos.find(r => !r.es_reservable)?.id;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-16 text-pastel-text font-cormorant">

      {/* Componente de Onboarding Tour */}
      <WishlistTour />

      {/* Encabezado */}
      <div className="text-center mb-10">
        <p className="font-cormorant text-xs tracking-[0.2em] uppercase text-pastel-text/75 font-semibold mb-3">
          WISHLIST
        </p>
        <h1 className="font-parisienne text-5xl md:text-7xl text-pastel-text mb-4">
          Mesa de Regalos
        </h1>
        <p className="font-cormorant text-sm md:text-base text-pastel-text max-w-lg mx-auto leading-relaxed px-2 mb-8">
          Si deseas tener un detalle con Miranda, hemos preparado esta lista de sugerencias.
          Puedes reservar un regalo para asegurar que no se repita.
        </p>
      </div>

      {/* Banner Recordatorio */}
      <div className="bg-pastel-pink/60 border border-pastel-pink rounded-xl p-5 mb-10 max-w-2xl mx-auto shadow-sm flex flex-col items-center gap-2">
        <p className="text-center text-sm md:text-base text-pastel-text font-cormorant italic leading-relaxed">
          Por favor, recuerda identificar tu obsequio físico con una tarjetita para saber de quién viene este hermoso detalle.
        </p>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-wishlist-tour'))}
          className="text-xs md:text-sm text-pastel-text hover:opacity-80 font-cormorant uppercase tracking-wider underline underline-offset-4 font-bold transition-opacity mt-1"
        >
          ¿Cómo funciona la mesa de regalos? ✨
        </button>
      </div>

      {/* Layout de Regalos: Skeleton durante carga, o Masonry con animación en cascada */}
      {isLoading ? (
        <div className="flex w-full gap-3 md:gap-4 items-start">
          {skeletonColumns.map((col, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-3 md:gap-4 flex-1">
              {col.map((idx) => (
                <div
                  key={idx}
                  className="w-full bg-pastel-pink/30 border border-pastel-pink rounded-2xl overflow-hidden shadow-sm animate-pulse flex flex-col"
                >
                  <div className="h-56 bg-pastel-pink/50 rounded-t-2xl w-full" />
                  <div className="p-3 md:p-4 flex flex-col flex-grow items-center">
                    <div className="h-6 bg-pastel-pink rounded w-3/4 mx-auto mt-4" />
                    <div className="h-10 bg-pastel-green rounded-full w-1/2 mx-auto mt-4 mb-6" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex w-full gap-3 md:gap-4 items-start">
          {masonryColumns.map((col, colIndex) => (
            <motion.div
              key={colIndex}
              variants={containerVariants}
              initial={isFirstLoad ? "hidden" : false}
              animate="show"
              className="flex flex-col gap-3 md:gap-4 flex-1"
            >
              {col.map((regalo) => (
                <motion.div
                  key={regalo.id}
                  variants={itemVariants}
                  initial={isFirstLoad ? "hidden" : false}
                  animate="show"
                  id={regalo.id === firstReservableId ? 'tour-reservable-item' : regalo.id === firstInfiniteId ? 'tour-infinite-item' : undefined}
                  className="w-full bg-pastel-pink/35 border border-pastel-pink rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
                >
                  {/* Imagen con Placeholder y Badge */}
                  <div className="relative w-full">
                    {regalo.imagen_url ? (
                      <div className={`relative w-full min-h-[180px] sm:min-h-[220px] bg-white overflow-hidden rounded-t-2xl flex items-center justify-center transition-all ${
                        regalo.es_reservable && regalo.reservado ? 'opacity-70 grayscale-[0.25]' : ''
                      }`}>
                        <Gift className="w-10 h-10 text-pastel-pink absolute pointer-events-none" strokeWidth={1} />
                        <img
                          src={regalo.imagen_url}
                          alt={regalo.nombre}
                          className="relative z-10 w-full h-auto object-contain block"
                          loading="eager"
                        />
                      </div>
                    ) : (
                      <div className={`bg-pastel-pink/50 min-h-[180px] sm:min-h-[220px] flex items-center justify-center rounded-t-2xl ${
                        regalo.es_reservable && regalo.reservado ? 'opacity-70' : ''
                      }`}>
                        <Gift className="w-12 h-12 text-pastel-text/40" strokeWidth={1} />
                      </div>
                    )}

                    {/* Badge RESERVADO encima de la imagen */}
                    {regalo.es_reservable && regalo.reservado && (
                      <div className="absolute top-2.5 right-2.5 z-20 bg-pastel-green text-pastel-text text-[10px] md:text-xs font-cormorant font-bold tracking-wider px-2.5 py-1 rounded-full shadow-md uppercase border border-white/70 backdrop-blur-xs">
                        RESERVADO
                      </div>
                    )}
                  </div>

                  {/* Contenido de la Tarjeta */}
                  <div className="p-3 md:p-4 flex flex-col flex-grow">
                    <h3 className="font-cormorant font-semibold text-base md:text-lg text-pastel-text mb-1 leading-tight line-clamp-2">
                      {regalo.nombre}
                    </h3>

                    {regalo.tienda && (
                      <p className="font-cormorant text-xs md:text-sm text-pastel-text/75 italic mb-2">
                        {regalo.tienda}
                      </p>
                    )}

                    <div className="mt-auto flex flex-col gap-2 w-full pt-3">
                      <Link href={`/regalo/${regalo.id}`} className="w-full">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="w-full py-2 md:py-2.5 rounded-full bg-pastel-green text-pastel-text font-cormorant font-bold text-xs md:text-sm tracking-wider uppercase transition-all hover:brightness-95 shadow-xs"
                        >
                          Ver Detalles
                        </motion.button>
                      </Link>

                      {/* Lógica de Botón Secundario según Disponibilidad */}
                      {regalo.es_reservable && (
                        <>
                          {regalo.reservado ? (
                            <button
                              disabled
                              className="w-full py-2 md:py-2.5 rounded-full bg-pastel-green/70 text-pastel-text font-cormorant font-semibold text-xs md:text-sm tracking-wider uppercase cursor-not-allowed"
                            >
                              RESERVADO
                            </button>
                          ) : (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedRegalo(regalo)}
                              className="w-full py-2 md:py-2.5 rounded-full bg-white/80 border border-pastel-green text-pastel-text font-cormorant font-semibold text-xs md:text-sm tracking-wider uppercase hover:bg-pastel-green/60 transition-colors"
                            >
                              RESERVAR
                            </motion.button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal / Bottom Sheet de Reserva */}
      <AnimatePresence>
        {selectedRegalo && (
          <>
            {/* Fondo oscuro (Backdrop) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isReserving && setSelectedRegalo(null)}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            />

            {/* Modal Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-6 md:p-8 max-w-lg mx-auto border-t border-pastel-pink"
            >
              <div className="w-12 h-1.5 bg-pastel-pink rounded-full mx-auto mb-6" />

              <div className="flex items-center gap-4 mb-6 bg-pastel-pink/35 p-4 rounded-xl border border-pastel-pink">
                <div className="relative w-20 h-20 shrink-0 bg-white rounded-md border border-pastel-pink p-2 flex items-center justify-center">
                  {selectedRegalo.imagen_url ? (
                    <img src={selectedRegalo.imagen_url} alt={selectedRegalo.nombre} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎁</div>
                  )}
                </div>
                <div>
                  <h4 className="font-cormorant font-semibold text-lg text-pastel-text leading-tight mb-1">{selectedRegalo.nombre}</h4>
                  {selectedRegalo.tienda && <p className="font-cormorant text-xs text-pastel-text/75 italic">{selectedRegalo.tienda}</p>}
                </div>
              </div>

              <p className="font-cormorant text-base text-pastel-text mb-8 text-center leading-relaxed">
                ¿Confirmas que deseas regalar esto? Al reservarlo, te aseguras de ser la única persona en obsequiarlo.
              </p>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileTap={{ scale: isReserving ? 1 : 0.95 }}
                  disabled={isReserving}
                  onClick={handleReserve}
                  className="w-full py-4 rounded-full bg-pastel-green text-pastel-text font-cormorant font-bold text-sm tracking-widest uppercase flex justify-center items-center hover:brightness-95 transition-all shadow-sm"
                >
                  {isReserving ? (
                    <svg className="animate-spin h-5 w-5 text-pastel-text" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Sí, Reservar Regalo"
                  )}
                </motion.button>
                <button
                  disabled={isReserving}
                  onClick={() => setSelectedRegalo(null)}
                  className="w-full py-4 rounded-full bg-transparent text-pastel-text/80 font-cormorant font-semibold text-xs tracking-widest uppercase hover:bg-pastel-pink/30 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
