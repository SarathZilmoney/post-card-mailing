import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { Calendar, FileText, Upload, X, CheckCircle, AlertCircle, Loader2, Users, Tag, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useTheme } from '../../context/ThemeContext';
import { useAlert } from '../../context/AlertContext';
import { categoryService } from '../../services/categoryService';
import { AddressCategory, Campaign } from '../../types';
import toast from 'react-hot-toast';

interface CampaignModalProps {
  open: boolean;
  onClose: () => void;
  editCampaign?: Campaign;
}

interface CreateCampaignFormData {
  name: string;
  description: string;
  startDate: string;
  category: string;
  targetAddressCount: number;
  postcardImage: File;
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

export const CampaignModal: React.FC<CampaignModalProps> = ({ open, onClose, editCampaign }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageValidation, setImageValidation] = useState<ImageValidationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [categories, setCategories] = useState<AddressCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createCampaign, editCampaign: editCampaignApi, refetch } = useCampaigns();
  const navigate = useNavigate();
  const alert = useAlert();
  const isEditMode = !!editCampaign;

  // Clear all form data and state
  const clearFormData = () => {
    // Reset all form data
    reset();
    
    // Clear file upload state
    setSelectedImage(null);
    setImagePreview(null);
    setImageValidation(null);
    setIsProcessingImage(false);
    setDragActive(false);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Reset categories if needed
    setCategories([]);
    setLoadingCategories(false);
  };

  // Handle modal close
  const handleClose = () => {
    // Check if form has any content to show appropriate feedback
    const hasContent = watchedName || watchedDescription || selectedImage;
    
    // Clear all form data
    clearFormData();
    
    // Show feedback if there was content
    if (hasContent) {
      toast.success('Form cleared');
    }
    
    // Close the modal
    onClose();
  };

  // Handle successful submission close (no toast needed)
  const handleSuccessClose = () => {
    clearFormData();
    onClose();
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<CreateCampaignFormData>({
    defaultValues: {
      name: editCampaign?.name || '',
      description: editCampaign?.description || '',
      startDate: editCampaign?.scheduledDate || new Date().toISOString().split('T')[0],
      category: editCampaign?.category || '',
      targetAddressCount: editCampaign?.targetAddressCount || 100
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

  // Reset form when switching between edit and create modes
  useEffect(() => {
    if (open) {
      reset({
        name: editCampaign?.name || '',
        description: editCampaign?.description || '',
        startDate: editCampaign?.scheduledDate || new Date().toISOString().split('T')[0],
        category: editCampaign?.category || '',
        targetAddressCount: editCampaign?.targetAddressCount || 100
      });
      
      // Clear image state for new campaign or when switching modes
      if (!editCampaign) {
        setSelectedImage(null);
        setImagePreview(null);
        setImageValidation(null);
      }
    }
  }, [open, editCampaign, reset]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const categoriesData = await categoryService.getAddressCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
      alert.error('Failed to load address categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.name === watchedCategory);
  const maxAddressCount = selectedCategory ? selectedCategory.address_count : 1000;

  // Handle category selection change
  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    
    if (value === 'add-from-outscrapper') {
      // Close modal and navigate to Outscrapper page
      handleClose();
      navigate('/outscrapper');
      toast('Redirecting to Outscrapper to add addresses...', {
        icon: '📍',
        duration: 3000,
      });
      return;
    }
    
    // For normal category selection, update the form value
    setValue('category', value);
  };

  // --- File Validation Logic ---
  const validateFile = useCallback((file: File): Promise<ImageValidationResult> => {
    return new Promise((resolve) => {
      // File type - support images and PDFs
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      
      if (!isImage && !isPDF) {
        resolve({ isValid: false, error: 'Please select a valid image file or PDF' });
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
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif', '.pdf'];
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
      
      // For PDFs, skip dimension validation
      if (isPDF) {
        resolve({ isValid: true, size: file.size });
        return;
      }
      
      // Dimensions (only for images)
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
      reader.onerror = () => resolve({ isValid: false, error: 'Failed to read file.' });
      reader.readAsDataURL(file);
    });
  }, []);

  const processImageFile = useCallback(async (file: File) => {
    setIsProcessingImage(true);
    setImageValidation(null);
    try {
      const validation = await validateFile(file);
      if (!validation.isValid) {
        alert.error(validation.error || 'Invalid file');
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
        toast.success('File uploaded!');
      };
      reader.onerror = () => {
        alert.error('Failed to process file.');
        setIsProcessingImage(false);
      };
      reader.readAsDataURL(file);
    } catch {
      alert.error('An error occurred while processing the file');
      setIsProcessingImage(false);
    }
  }, [validateFile, setValue]);

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
    else alert.error('Please upload only one file.');
  };
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageValidation(null);
    // Note: postcardImage is now required, so we don't unset it from form
    toast.success('File removed');
  };

  // --- Form Submission ---
  const onSubmit = async (data: CreateCampaignFormData) => {
    setIsSubmitting(true);
    
    // For create mode, file is required. For edit mode, file is optional
    if (!isEditMode && !selectedImage) {
      alert.error('Postcard image or PDF is required. Please upload a file before creating the campaign.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Validate form data before submission
      if (!data.name?.trim()) {
        alert.error('Campaign name is required');
        setIsSubmitting(false);
        return;
      }
      
      if (!data.description?.trim()) {
        alert.error('Description is required');
        setIsSubmitting(false);
        return;
      }
      
      if (!data.startDate) {
        alert.error('Start date is required');
        setIsSubmitting(false);
        return;
      }
      
      // For create mode, validate file. For edit mode, validate only if file is provided
      if (selectedImage && !imageValidation?.isValid) {
        alert.error('Please upload a valid image or PDF file');
        setIsSubmitting(false);
        return;
      }
      
      // Log form data for debugging
      console.log('Form data being submitted:', data);
      
      const formData = new FormData();
      formData.append('name', data.name.trim());
      formData.append('description', data.description.trim());
      formData.append('startDate', data.startDate);
      formData.append('category', data.category?.trim() || '');
      
      // For edit mode, add campaign ID
      if (isEditMode && editCampaign) {
        formData.append('campaign_id', editCampaign.id);
      }
      
      // Add file if provided
      if (selectedImage) {
        formData.append('postcardImage', selectedImage);
      }
      
      let response;
      if (isEditMode) {
        response = await editCampaignApi(formData);
      } else {
        response = await createCampaign(formData);
      }
      
      // Reset form and close modal using the same cleanup logic
      handleSuccessClose();
      
      // Show success alert with message from backend
      const successMessage = response.message || `Campaign ${isEditMode ? 'updated' : 'created'} successfully!`;
      alert.success(successMessage, {
        title: 'Success',
        duration: 4000
      });
      
      // Refresh campaigns list with loading state
      await refetch(true);
    } catch (error: any) {
      console.error(`Campaign ${isEditMode ? 'update' : 'creation'} error:`, error);
      alert.error(error?.message || `Failed to ${isEditMode ? 'update' : 'create'} campaign.`, {
        title: 'Error',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

    if (!open) return null;

  const { isDark } = useTheme();

  // Create a portal to render the modal at the document level
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" 
         style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className={`${
        isDark ? 'glass-dark' : 'glass bg-white/90'
      } rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] relative animate-fadeIn border ${
        isDark ? 'border-white/10' : 'border-gray-200/50'
      } overflow-hidden flex flex-col`} 
           style={{ position: 'relative', zIndex: 10000 }}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-bold ${
            isDark 
              ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
          }`}>
            {isEditMode ? 'Edit Campaign' : 'Create New Campaign'}
          </h2>
          <button 
            onClick={handleClose} 
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
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4">
            {/* Grid Layout for Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                } mb-2`}>Address Category</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className={`h-4 w-4 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  </div>
                  <select
                    {...register('category')}
                    onChange={handleCategoryChange}
                    disabled={loadingCategories}
                    className={`block w-full pl-10 pr-12 py-3 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-600 text-white [&>option]:bg-gray-800 [&>option]:text-white [&>option]:py-3 [&>option]:px-2' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 [&>option]:bg-white [&>option]:text-gray-900 [&>option]:py-3 [&>option]:px-2'
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    } ${loadingCategories ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={isDark ? {
                      colorScheme: 'dark'
                    } : {}}
                  >
                    <option value="">
                      {loadingCategories 
                        ? 'Loading categories...' 
                        : 'Select category...'
                      }
                    </option>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <option key={category.name} value={category.name}>
                          {category.name} ({category.address_count} available)
                        </option>
                      ))
                    ) : !loadingCategories ? (
                      <option value="add-from-outscrapper" className="text-blue-600">
                        📍 Add addresses from Outscrapper
                      </option>
                    ) : null}
                  </select>
                  {loadingCategories && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                    </div>
                  )}
                </div>
                {errors.category && <p className="text-xs text-red-400 mt-1">{errors.category.message}</p>}
                {categories.length === 0 && !loadingCategories && (
                  <div className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  } mt-1 flex items-center gap-1`}>
                    <ExternalLink className="h-3 w-3" />
                    <span>No categories available. Use Outscrapper to add addresses first.</span>
                  </div>
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
                    Maximum available: {selectedCategory.address_count} addresses
                  </p>
                )}
              </div>
            </div>
            
            {/* Description - Full Width */}
            <div className="mb-4">
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
            
            {/* File Upload - Full Width */}
            <div className="mb-4">
              <label className={`block text-sm font-medium ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              } mb-2`}>Postcard Image or PDF {isEditMode ? '' : '*'}</label>
              {!imagePreview ? (
                <div
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg py-4 cursor-pointer transition-all duration-300 ${
                    dragActive 
                      ? 'border-purple-400 bg-purple-500/10' 
                      : isDark
                        ? 'border-white/20 hover:border-white/30 hover:bg-white/5'
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50/80 hover:bg-gray-100/80'
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
                  <span className="text-sm text-purple-400 font-medium">Click to Upload Postcard File</span>
                  <span className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  } mt-1 text-center`}>
                    or drag and drop • JPG, PNG, GIF, WebP, PDF (max 5MB) • {isEditMode ? 'Optional' : 'Required'}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="sr-only"
                    onChange={handleImageChange}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative inline-block">
                    {selectedImage?.type === 'application/pdf' ? (
                      <div className={`h-24 w-32 rounded-lg border ${
                        isDark ? 'border-white/10 bg-gray-800' : 'border-gray-200 bg-gray-50'
                      } flex items-center justify-center shadow-lg`}>
                        <div className="text-center">
                          <FileText className={`h-8 w-8 mx-auto mb-1 ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <span className={`text-xs ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>PDF</span>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className={`h-24 w-auto rounded-lg border ${
                          isDark ? 'border-white/10' : 'border-gray-200'
                        } object-contain shadow-lg`} 
                      />
                    )}
                    <button 
                      type="button" 
                      onClick={removeImage} 
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg transition-colors" 
                      title="Remove file"
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
                        }`}>File uploaded successfully</span>
                      </div>
                      {imageValidation.isPostcardSuitable !== undefined && (
                        <div className={`${
                          imageValidation.isPostcardSuitable 
                            ? isDark 
                              ? 'bg-green-500/10 border-green-400/20' 
                              : 'bg-green-50 border-green-200'
                            : isDark 
                              ? 'bg-yellow-500/10 border-yellow-400/20' 
                              : 'bg-yellow-50 border-yellow-200'
                        } border rounded-lg p-3 flex items-center`}>
                          <div className={`h-4 w-4 mr-2 flex items-center justify-center ${
                            imageValidation.isPostcardSuitable ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {imageValidation.isPostcardSuitable ? '✓' : '⚠'}
                          </div>
                          <span className={`text-xs ${
                            imageValidation.isPostcardSuitable 
                              ? isDark ? 'text-green-400' : 'text-green-800'
                              : isDark ? 'text-yellow-400' : 'text-yellow-800'
                          }`}>
                            {imageValidation.isPostcardSuitable ? 'Postcard suitable' : 'Non-standard aspect ratio'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Preview - Full Width */}
            {(watchedName || watchedDescription) && (
              <div className={`${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-gray-50 border-gray-200'
              } border rounded-lg p-4 mb-4`}>
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
                onClick={handleClose} 
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
                disabled={isSubmitting || (!isEditMode && !selectedImage)} 
                className="px-6 py-3 rounded-lg text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                title={(!isEditMode && !selectedImage) ? 'Please upload a postcard image or PDF first' : ''}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} 
                {isEditMode ? 'Update Campaign' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document level
  return createPortal(modalContent, document.body);
}; 