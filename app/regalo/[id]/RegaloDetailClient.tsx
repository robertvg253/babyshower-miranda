'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  initialRegalo: any;
}

export default function RegaloDetailClient({ initialRegalo }: Props) {
  const [regalo, setRegalo] = useState(initialRegalo);
  const [showModal, setShowModal] = useState(false);
  const [isReserving, setIsReserving] = useState(false);

  const handleReserve = async () => {
    setIsReserving(true);
    try {
      const { error } = await supabase
        .from('regalos_ruth')
        .update({ reservado: true })
        .eq('id', regalo.id);

      if (error) throw error;
      
      setRegalo({ ...regalo, reservado: true });
      setShowModal(false);
    } catch (err) {
      console.error("Error al reservar:", err);
      alert("Hubo un error al reservar el regalo. Inténtalo de nuevo.");
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-pastel-pink/20 text-pastel-text font-cormorant relative pb-20">
      
      {/* Botón Flotante de Retorno */}
      <Link
        href="/"
        className="fixed top-6 left-4 z-50 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-pastel-pink/90 backdrop-blur-md shadow-sm text-pastel-text hover:bg-pastel-green transition-colors font-cormorant font-semibold text-xs tracking-wider uppercase border border-white/60"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver</span>
      </Link>

      {/* Imagen Hero Edge-to-Edge */}
      <div className="w-full relative">
        {regalo.imagen_url ? (
          <img 
            src={regalo.imagen_url} 
            alt={regalo.nombre} 
            className="w-full h-auto max-h-[50vh] object-cover block"
          />
        ) : (
          <div className="w-full h-64 bg-pastel-pink/50 flex items-center justify-center">
            <Gift className="w-20 h-20 text-pastel-text/40" strokeWidth={1} />
          </div>
        )}

        {/* Badge RESERVADO encima de la imagen */}
        {regalo.es_reservable && regalo.reservado && (
          <div className="absolute top-6 right-4 z-40 bg-pastel-green text-pastel-text text-[10px] md:text-xs font-cormorant font-bold tracking-widest px-3.5 py-1.5 rounded-full shadow-lg uppercase border border-white/70 backdrop-blur-xs">
            RESERVADO
          </div>
        )}
      </div>

      {/* Contenido Principal */}
      <div className="w-full max-w-2xl mx-auto px-6 mt-8 flex flex-col items-center">
        
        {/* Título Principal */}
        <h1 className="font-cormorant font-semibold text-4xl text-pastel-text text-center mb-2 leading-tight">
          {regalo.nombre}
        </h1>
        
        {/* Tienda en Cursiva (Opcional) */}
        {regalo.tienda && (
          <p className="font-cormorant text-base text-pastel-text/75 italic text-center mb-6">
            {regalo.tienda}
          </p>
        )}

        {/* Separador Elegante */}
        <hr className="w-1/3 mx-auto border-t border-pastel-pink my-6" />

        {/* Descripción */}
        {regalo.descripcion && (
          <p className="font-cormorant text-lg leading-relaxed text-pastel-text text-center px-4 md:px-12 mb-8">
            {regalo.descripcion}
          </p>
        )}

        {/* Botones de Acción Agrupados */}
        <div className="flex flex-col gap-4 w-full mt-4 pb-12 px-2">
          
          {regalo.enlace && (
            <a 
              href={regalo.enlace}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                window.open(regalo.enlace, '_blank', 'noopener,noreferrer');
              }}
              className="w-full py-4 rounded-full bg-pastel-pink/50 border border-pastel-pink text-pastel-text font-cormorant font-semibold text-xs tracking-wider uppercase text-center hover:bg-pastel-pink transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Ver Referencia en Tienda</span>
              <span className="text-sm">↗</span>
            </a>
          )}

          {regalo.es_reservable && (
            <>
              {regalo.reservado ? (
                <div className="flex flex-col gap-3 w-full">
                  <button 
                    disabled
                    className="w-full py-4 rounded-full bg-pastel-green text-pastel-text font-cormorant font-bold text-xs tracking-wider uppercase cursor-not-allowed opacity-90"
                  >
                    RESERVADO ✓
                  </button>
                  <Link
                    href="/"
                    className="w-full py-4 rounded-full bg-pastel-pink/40 border border-pastel-pink text-pastel-text font-cormorant font-semibold text-xs tracking-wider uppercase hover:bg-pastel-pink/80 transition-colors text-center"
                  >
                    ← Volver a la Lista
                  </Link>
                </div>
              ) : (
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModal(true)}
                  className="w-full py-4 rounded-full bg-pastel-green text-pastel-text font-cormorant font-bold text-xs tracking-wider uppercase hover:brightness-95 transition-all shadow-md"
                >
                  RESERVAR REGALO
                </motion.button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal / Bottom Sheet de Reserva */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isReserving && setShowModal(false)}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-6 md:p-8 max-w-lg mx-auto border-t border-pastel-pink"
            >
              <div className="w-12 h-1.5 bg-pastel-pink rounded-full mx-auto mb-6" />
              
              <p className="font-cormorant text-base text-pastel-text mb-8 text-center leading-relaxed">
                ¿Confirmas que deseas regalar <strong>{regalo.nombre}</strong>? Al reservarlo, te aseguras de ser la única persona en obsequiarlo.
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
                    "SÍ, RESERVAR REGALO"
                  )}
                </motion.button>
                <button 
                  disabled={isReserving}
                  onClick={() => setShowModal(false)}
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
