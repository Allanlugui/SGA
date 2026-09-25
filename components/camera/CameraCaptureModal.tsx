'use client';

import React, { useRef, useState, useEffect } from 'react';
import { AttachedFile } from '@/types';
import { Camera, Check, X, Image as ImageIcon, Upload } from 'lucide-react';

interface CameraCaptureModalProps {
  osId?: string;
  ticketId?: string;
  defaultCategory?: 'antes' | 'durante' | 'depois' | 'geral';
  onCapture: (file: AttachedFile) => void;
  onClose: () => void;
}

export function CameraCaptureModal({ 
  osId, 
  ticketId, 
  defaultCategory = 'antes', 
  onCapture, 
  onClose 
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [category, setCategory] = useState<'antes' | 'durante' | 'depois' | 'geral'>(defaultCategory);
  const [description, setDescription] = useState('');

  // Start Camera
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function initCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        currentStream = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.warn('Câmera indisponível ou permissão não concedida:', err);
        setCameraError('Não foi possível acessar a câmera do dispositivo. Use o upload de arquivo abaixo.');
      }
    }

    initCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Overlay watermark timestamp
    const now = new Date();
    const watermarkText = `CorpServices Campo • ${now.toLocaleDateString()} ${now.toLocaleTimeString()} • Categoria: ${category.toUpperCase()}`;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(watermarkText, 10, canvas.height - 10);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);

    // Stop camera stream once captured
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const retakeSnapshot = async () => {
    setCapturedImage(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (e) {
      console.warn('Erro ao reiniciar câmera:', e);
    }
  };

  const handleFileFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      setCapturedImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (!capturedImage) return;

    const newFile: AttachedFile = {
      id: `photo-${Date.now()}`,
      name: `evidencia_${category}_${Date.now()}.jpg`,
      url: capturedImage,
      size: '1.4 MB',
      type: 'image',
      category,
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      uploadedBy: 'Técnico de Campo (Câmera Móvel)',
      description: description || `Registro fotográfico de campo - ${category.toUpperCase()}`,
      osId,
      ticketId
    };

    onCapture(newFile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#e7dfd1] rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-xl text-stone-900">
        
        <div className="flex items-center justify-between pb-2 border-b border-[#e7dfd1]">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-[#c85a32]" />
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              Captura de Registro Fotográfico de Campo
            </h2>
          </div>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-900">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category selector */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-stone-600 font-medium">Classificar como:</span>
          {(['antes', 'durante', 'depois'] as const).map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                category === cat
                  ? 'bg-[#c85a32] text-white shadow-xs'
                  : 'bg-[#faf7f2] text-stone-700 hover:bg-[#ede5d8]'
              }`}
            >
              {cat === 'antes' && 'Antes do Serviço'}
              {cat === 'durante' && 'Durante Execução'}
              {cat === 'depois' && 'Depois / Concluído'}
            </button>
          ))}
        </div>

        {/* Viewport for Camera or Preview */}
        <div className="relative bg-stone-100 rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-[#d6cab8]">
          {capturedImage ? (
            <img src={capturedImage} alt="Foto Capturada" className="w-full h-full object-cover" />
          ) : cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-4 text-xs text-stone-500 space-y-3">
              <Camera className="w-10 h-10 text-stone-400 mx-auto" />
              <p>{cameraError || 'Inicializando câmera...'}</p>
              <label className="inline-flex items-center space-x-2 px-4 py-2 bg-[#faf7f2] hover:bg-[#ede5d8] text-stone-800 rounded-lg cursor-pointer border border-[#d6cab8] transition">
                <Upload className="w-4 h-4 text-[#c85a32]" />
                <span>Carregar Foto da Galeria / Arquivos</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileFallback}
                  className="hidden"
                />
              </label>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Description field */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Descrição / Anotação Técnica da Foto (Opcional):
          </label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ex: Detalhe do rolamento desgastado / Painel religado com sucesso"
            className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-lg px-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32] focus:bg-white"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-[#e7dfd1]">
          <div>
            {!capturedImage && cameraActive && (
              <label className="text-xs text-stone-600 hover:text-stone-900 cursor-pointer flex items-center space-x-1">
                <ImageIcon className="w-3.5 h-3.5 text-[#c85a32]" />
                <span>Usar Arquivo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileFallback}
                  className="hidden"
                />
              </label>
            )}
            {capturedImage && (
              <button
                type="button"
                onClick={retakeSnapshot}
                className="text-xs text-stone-600 hover:text-stone-900"
              >
                Tirar Outra Foto
              </button>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs text-stone-600 hover:text-stone-900"
            >
              Cancelar
            </button>

            {!capturedImage && cameraActive ? (
              <button
                type="button"
                onClick={takeSnapshot}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#c85a32] hover:bg-[#b84924] text-white shadow-xs"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Capturar Foto</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!capturedImage}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs disabled:opacity-40"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Anexar Evidência à OS</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
