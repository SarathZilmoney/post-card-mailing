import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, FileText, Upload, X, CheckCircle, AlertCircle, Loader2, Users, Tag } from 'lucide-react';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useTheme } from '../../context/ThemeContext';
import { categoryService } from '../../services/categoryService';
import { AddressCategory } from '../../types';
import toast from 'react-hot-toast';

interface CampaignModalProps {
  open: boolean;
  onClose: () => void;
}

interface CreateCampaignFormData {
  name: string;
  description: string;
  startDate: string;
  category: string;
  targetAddressCount: number;
  postcardImage?: File;
}

interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  width?: number;
  height?: number;
  size?: number;
  aspectRatio?: number;
  isPostcardSuitable?: boolean;
  warnings?: string[];
}

export const CampaignModal: React.FC<CampaignModalProps> = ({ open, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageValidation, setImageValidation] = useState<ImageValidationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [categories, setCategories] = useState<AddressCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createCampaign } = useCampaigns();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<CreateCampaignFormData>({
    defaultValues: {
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      category: '',
      targetAddressCount: 100
    }
  });

  const watchedName = watch('name');
  const watchedDescription = watch('description');
  const watchedCategory = watch('category');
  const watchedTargetAddressCount = watch('targetAddressCount');

  // Load categories when modal opens
  useEffect(() => {
    if (open && categories.length === 0) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const categoriesData = await categoryService.getAddressCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load address categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === watchedCategory);
  const maxAddressCount = selectedCategory ? selectedCategory.count : 1000;

  // --- Image Validation Logic ---
  const validateImage = useCallback((file: File): Promise<ImageValidationResult> => {
    return new Promise((resolve) => {
      // File type
      if (!file.type.startsWith('image/')) {
        resolve({ isValid: false, error: 'Please select a valid image file' });
        return;
      }
      // File size
      const maxSizeBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        resolve({ isValid: false, error: `File size (${fileSizeMB} MB) exceeds 5 MB. Try compressing your image.` });
        return;
      }
      const minSizeBytes = 1024;
      if (file.size < minSizeBytes) {
        resolve({ isValid: false, error: 'File appears to be empty or corrupted.' });
        return;
      }
      // Extension
      const fileName = file.name.toLowerCase();
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif'];
      const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
      if (!allowedExtensions.includes(fileExtension)) {
        resolve({ isValid: false, error: `Unsupported file format. Allowed: ${allowedExtensions.map(e => e.toUpperCase().slice(1)).join(', ')}` });
        return;
      }
      // Dangerous patterns
      const dangerousPatterns = [
        /\.\./, /^\./, /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|dll|so|dylib)$/i, /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i
      ];
      for (const pattern of dangerousPatterns) {
        if (pattern.test(fileName)) {
          resolve({ isValid: false, error: 'File name contains potentially harmful patterns.' });
          return;
        }
      }
      // Dimensions (no filtering, just info)
      const img = new window.Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          const aspectRatio = width / height;
          const isPostcardSuitable = aspectRatio >= 1.2 && aspectRatio <= 2.5;
          const warnings: string[] = [];
          if (!isPostcardSuitable) warnings.push(`Aspect ratio (${aspectRatio.toFixed(2)}) is outside typical postcard range (1.2-2.5).`);
          resolve({ isValid: true, width, height, size: file.size, aspectRatio, isPostcardSuitable, warnings });
        };
        img.onerror = () => resolve({ isValid: false, error: 'Failed to load image for validation.' });
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve({ isValid: false, error: 'Failed to read image file.' });
      reader.readAsDataURL(file);
    });
  }, []);

  const processImageFile = useCallback(async (file: File) => {
    setIsProcessingImage(true);
    setImageValidation(null);
    try {
      const validation = await validateImage(file);
      if (!validation.isValid) {
        toast.error(validation.error || 'Invalid image file');
        setIsProcessingImage(false);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        setSelectedImage(file);
        setValue('postcardImage', file);
        setImageValidation(validation);
        setIsProcessingImage(false);
        toast.success('Image uploaded!');
      };
      reader.onerror = () => {
        toast.error('Failed to process image.');
        setIsProcessingImage(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('An error occurred while processing the image');
      setIsProcessingImage(false);
    }
  }, [validateImage, setValue]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processImageFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const handleUploadClick = () => fileInputRef.current?.click();
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragActive(false); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragActive(false);
    const files = e.dataTransfer.files;
    if (files.length === 1) processImageFile(files[0]);
    else toast.error('Please upload only one image file.');
  };
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageValidation(null);
    setValue('postcardImage', undefined);
    toast.success('Image removed');
  };

  // --- Form Submission ---
  const onSubmit = async (data: CreateCampaignFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedImage && !imageValidation?.isValid) {
        toast.error('Please upload a valid image or remove the current one');
        setIsSubmitting(false);
        return;
      }
      const formData = new FormData();
      formData.append('name', data.name.trim());
      formData.append('description', data.description.trim());
      formData.append('startDate', data.startDate);
      formData.append('category', data.category);
      formData.append('targetAddressCount', data.targetAddressCount.toString());
      if (selectedImage) formData.append('postcardImage', selectedImage);
      await createCampaign(formData);
      toast.success('Campaign created!');
      reset();
      setSelectedImage(null);
      setImagePreview(null);
      setImageValidation(null);
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create campaign.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  const { isDark } = useTheme();

  return (

<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`${
        isDark ? 'glass-dark' : 'glass bg-white/90'
      } rounded-2xl shadow-2xl w-full max-w-lg mx-4 relative animate-fadeIn border ${
        isDark ? 'border-white/10' : 'border-gray-200/50'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-bold ${
            isDark 
              ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
          }`}>
            Create New Campaign
          </h2>
          <button 
            onClick={onClose} 
            className={`p-2 rounded-full ${
              isDark 
                ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-gray-600 hover:border-red-500/50' 
                : 'hover:bg-red-50 text-gray-500 hover:text-red-600 border border-gray-300 hover:border-red-300'
            } transition-all duration-300 group`}
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
          {/* Campaign Name */}
          <div>
            <label className={`block text-sm font-medium ${
              isDark ? 'text-gray-200' : 'text-gray-700'
            } mb-2`}>Campaign Name *</label>
            <input
              {...register('name', { 
                required: 'Campaign name is required', 
                minLength: { value: 3, message: 'At least 3 characters' }, 
                maxLength: { value: 100, message: 'Max 100 characters' } 
              })}
              type="text"
              className={`block w-full px-4 py-3 ${
                isDark 
                  ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}
              placeholder="Enter campaign name"
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>
          
          {/* Description */}
          <div>
            <label className={`block text-sm font-medium ${
              isDark ? 'text-gray-200' : 'text-gray-700'
            } mb-2`}>Description *</label>
            <textarea
              {...register('description', { 
                required: 'Description is required', 
                minLength: { value: 10, message: 'At least 10 characters' }, 
                maxLength: { value: 500, message: 'Max 500 characters' } 
              })}
              rows={3}
              className={`block w-full px-4 py-3 ${
                isDark 
                  ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              } resize-none`}
              placeholder="Describe your campaign..."
            />
            <div className={`flex justify-between text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            } mt-1`}>
              {errors.description && <span className="text-red-400">{errors.description.message}</span>}
              <span className="ml-auto">{watchedDescription?.length || 0}/500</span>
            </div>
          </div>
          
          {/* Start Date */}
          <div>
            <label className={`block text-sm font-medium ${
              isDark ? 'text-gray-200' : 'text-gray-700'
            } mb-2`}>Start Date *</label>
            <div className="relative">
              <input
                {...register('startDate', { 
                  required: 'Start date is required', 
                  validate: (value) => { 
                    const d = new Date(value); 
                    const t = new Date(); 
                    t.setHours(0,0,0,0); 
                    return d >= t || 'Start date must be today or in the future'; 
                  } 
                })}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className={`block w-full px-4 py-3 ${
                  isDark 
                    ? 'bg-white/5 border-white/10 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${
                  isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                }`}
              />
              <Calendar className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              } pointer-events-none`} />
            </div>
            {errors.startDate && <p className="text-xs text-red-400 mt-1">{errors.startDate.message}</p>}
          </div>
          
          {/* Address Category */}
          <div>
            <label className={`block text-sm font-medium ${
              isDark ? 'text-gray-200' : 'text-gray-700'
            } mb-2`}>Address Category *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className={`h-4 w-4 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
              <select
                {...register('category', { 
                  required: 'Please select an address category' 
                })}
                className={`block w-full pl-10 pr-12 py-3 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-600 text-white [&>option]:bg-gray-800 [&>option]:text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 [&>option]:bg-white [&>option]:text-gray-900'
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
                style={isDark ? {
                  colorScheme: 'dark'
                } : {}}
              >
                <option value="">Select category...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count} available)
                  </option>
                ))}
              </select>
              {loadingCategories && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                </div>
              )}
            </div>
            {errors.category && <p className="text-xs text-red-400 mt-1">{errors.category.message}</p>}
            {selectedCategory && (
              <p className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              } mt-1`}>
                {selectedCategory.description}
              </p>
            )}
          </div>
          
          {/* Target Address Count */}
          <div>
            <label className={`block text-sm font-medium ${
              isDark ? 'text-gray-200' : 'text-gray-700'
            } mb-2`}>Number of Addresses *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className={`h-4 w-4 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
              <input
                {...register('targetAddressCount', { 
                  required: 'Number of addresses is required',
                  min: { value: 1, message: 'Must be at least 1' },
                  max: { value: maxAddressCount, message: `Cannot exceed ${maxAddressCount} (available in selected category)` },
                  valueAsNumber: true
                })}
                type="number"
                min="1"
                max={maxAddressCount}
                className={`block w-full pl-10 pr-3 py-3 ${
                  isDark 
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${
                  isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                }`}
                placeholder="Enter number of addresses"
              />
            </div>
            {errors.targetAddressCount && <p className="text-xs text-red-400 mt-1">{errors.targetAddressCount.message}</p>}
            {selectedCategory && (
              <p className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              } mt-1`}>
                Maximum available: {selectedCategory.count} addresses
              </p>
            )}
          </div>
          
          {/* File Upload */}
          <div>
            <label className={`block text-sm font-medium ${
              isDark ? 'text-gray-200' : 'text-gray-700'
            } mb-2`}>Postcard Image (optional)</label>
            {!imagePreview ? (
              <div
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg py-4 cursor-pointer transition-all duration-300 ${
                  dragActive 
                    ? 'border-purple-400 bg-purple-500/10' 
                    : isDark
                      ? 'border-white/20 hover:border-white/30 hover:bg-white/5'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onClick={handleUploadClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                tabIndex={0}
                role="button"
                aria-label="Upload postcard image"
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleUploadClick(); }}
              >
                {isProcessingImage ? (
                  <Loader2 className="h-6 w-6 text-purple-400 animate-spin mb-2" />
                ) : (
                  <Upload className={`h-6 w-6 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  } mb-2`} />
                )}
                <span className="text-sm text-purple-400 font-medium">Click to Upload</span>
                <span className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                } mt-1 text-center`}>
                  or drag and drop • JPG, PNG, GIF, WebP (max 5MB)
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageChange}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className={`h-24 w-auto rounded-lg border ${
                      isDark ? 'border-white/10' : 'border-gray-200'
                    } object-contain shadow-lg`} 
                  />
                  <button 
                    type="button" 
                    onClick={removeImage} 
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg transition-colors" 
                    title="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {imageValidation && (
                  <div className="space-y-2">
                    <div className={`${
                      isDark 
                        ? 'bg-green-500/10 border-green-400/20' 
                        : 'bg-green-50 border-green-200'
                    } border rounded-lg p-3 flex items-center`}>
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      <span className={`text-xs ${
                        isDark ? 'text-green-400' : 'text-green-800'
                      }`}>Image uploaded successfully</span>
                    </div>
                    <div className={`text-xs ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    } space-y-1`}>
                      <div>File: {selectedImage?.name}</div>
                      <div>Size: {imageValidation.size ? (imageValidation.size / 1024 / 1024).toFixed(2) : '0'} MB</div>
                      <div>Dimensions: {imageValidation.width} × {imageValidation.height} px</div>
                      {imageValidation.aspectRatio && <div>Aspect Ratio: {imageValidation.aspectRatio.toFixed(2)}</div>}
                      {imageValidation.isPostcardSuitable !== undefined && (
                        <div className={imageValidation.isPostcardSuitable ? 'text-green-400' : 'text-yellow-400'}>
                          {imageValidation.isPostcardSuitable ? '✓ Postcard suitable' : '⚠ Non-standard aspect ratio'}
                        </div>
                      )}
                    </div>
                    {imageValidation.warnings && imageValidation.warnings.length > 0 && (
                      <div className={`${
                        isDark 
                          ? 'bg-yellow-500/10 border-yellow-400/20' 
                          : 'bg-yellow-50 border-yellow-200'
                      } border rounded-lg p-3 flex items-start`}>
                        <AlertCircle className="h-4 w-4 text-yellow-400 mr-2 mt-0.5" />
                        <div className={`text-xs ${
                          isDark ? 'text-yellow-400' : 'text-yellow-800'
                        }`}>
                          {imageValidation.warnings.map((w, i) => <div key={i}>• {w}</div>)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Preview */}
          {(watchedName || watchedDescription) && (
            <div className={`${
              isDark 
                ? 'bg-white/5 border-white/10' 
                : 'bg-gray-50 border-gray-200'
            } border rounded-lg p-4`}>
              <div className={`font-medium ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              } mb-2`}>Preview</div>
              <div className={`text-sm ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{watchedName}</div>
              <div className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              } mt-1`}>{watchedDescription}</div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className={`px-6 py-3 rounded-lg border ${
                isDark 
                  ? 'border-white/10 text-gray-300 bg-white/5 hover:bg-white/10' 
                  : 'border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100'
              } transition-all duration-300`}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="px-6 py-3 rounded-lg text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} 
              Create Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 