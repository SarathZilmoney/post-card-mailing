import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { Check, X, RefreshCw } from 'lucide-react';

interface ImageEditorProps {
  imageFile: File;
  couponCode: string;
  onConfirm: (processedImageBlob: Blob) => void;
  onCancel: () => void;
  isDark?: boolean;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  imageFile,
  couponCode,
  onConfirm,
  onCancel,
  isDark = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [couponText, setCouponText] = useState<fabric.Text | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize fabric canvas
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: isDark ? '#1f2937' : '#ffffff'
    });

    setCanvas(fabricCanvas);

    // Load and display the image
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      
      fabric.Image.fromURL(imageUrl, (img) => {
        // Scale image to fit canvas while maintaining aspect ratio
        const canvasWidth = 800;
        const canvasHeight = 600;
        const padding = 40;
        
        const maxWidth = canvasWidth - padding;
        const maxHeight = canvasHeight - padding;
        
        const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);
        
        img.scale(scale);
        img.set({
          left: (canvasWidth - img.getScaledWidth()) / 2,
          top: (canvasHeight - img.getScaledHeight()) / 2,
          selectable: false,
          evented: false
        });
        
        fabricCanvas.add(img);
        fabricCanvas.sendToBack(img);
        
        // Add coupon code text
        const text = new fabric.Text(couponCode, {
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          fontSize: 24,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#000000',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: 8,
          stroke: '#000000',
          strokeWidth: 1,
          cornerStyle: 'circle',
          cornerColor: '#4F46E5',
          cornerSize: 8,
          transparentCorners: false
        });
        
        text.set({
          originX: 'center',
          originY: 'center'
        });
        
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        setCouponText(text);
        
        fabricCanvas.renderAll();
        setImageLoaded(true);
      });
    };
    
    reader.readAsDataURL(imageFile);

    return () => {
      fabricCanvas.dispose();
    };
  }, [imageFile, couponCode, isDark]);

  const handleConfirm = async () => {
    if (!canvas || !couponText) return;
    
    setIsProcessing(true);
    
    try {
      // Remove selection indicators
      canvas.discardActiveObject();
      canvas.renderAll();
      
      // Convert canvas to blob
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1.0
      });
      
      // Convert data URL to blob
      const response = await fetch(dataURL);
      const blob = await response.blob();
      
      onConfirm(blob);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (!canvas || !couponText) return;
    
    // Reset text position to center
    couponText.set({
      left: canvas.width! / 2,
      top: canvas.height! / 2
    });
    
    canvas.setActiveObject(couponText);
    canvas.renderAll();
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4`}>
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden`}>
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Position Coupon Code
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Drag the coupon code to position it on your postcard image
          </p>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className={`border-2 ${isDark ? 'border-gray-600' : 'border-gray-300'} rounded-lg overflow-hidden`}>
              <canvas
                ref={canvasRef}
                className="block"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
            
            {imageLoaded && (
              <div className="text-center">
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  Drag the coupon code to your desired position, then click "Confirm"
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={handleReset}
                    className={`px-4 py-2 rounded-md border ${
                      isDark 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    } transition-colors flex items-center space-x-2`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset Position</span>
                  </button>
                  
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  
                  <button
                    onClick={handleConfirm}
                    disabled={isProcessing}
                    className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isProcessing ? 'Processing...' : 'Confirm Position'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 