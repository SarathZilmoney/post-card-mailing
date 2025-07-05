import React, { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Calendar, 
  FileText, 
  Upload, 
  X, 
  Image as ImageIcon,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useCampaigns } from '../../hooks/useCampaigns';
import toast from 'react-hot-toast';

interface CreateCampaignFormData {
  name: string;
  description: string;
  startDate: string;
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

export const CreateCampaignForm: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageValidation, setImageValidation] = useState<ImageValidationResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createCampaign } = useCampaigns();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<CreateCampaignFormData>({
    defaultValues: {
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0]
    }
  });

  const watchedName = watch('name');
  const watchedDescription = watch('description');

  const validateImage = useCallback((file: File): Promise<ImageValidationResult> => {
    return new Promise((resolve) => {
      // Basic file validation
      if (!file.type.startsWith('image/')) {
        resolve({ isValid: false, error: 'Please select a valid image file' });
        return;
      }

      // File size validation (max 5MB)
      const maxSizeBytes = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSizeBytes) {
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        resolve({ 
          isValid: false, 
          error: `File size (${fileSizeMB} MB) exceeds the maximum allowed size of 5 MB. Please choose a smaller image or compress your image.` 
        });
        return;
      }

      // Minimum file size check (prevent empty or corrupted files)
      const minSizeBytes = 1024; // 1KB
      if (file.size < minSizeBytes) {
        resolve({ 
          isValid: false, 
          error: 'File appears to be empty or corrupted. Please select a valid image file.' 
        });
        return;
      }

      // File extension validation for security
      const fileName = file.name.toLowerCase();
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif'];
      const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
      const hasValidExtension = allowedExtensions.includes(fileExtension);
      
      if (!hasValidExtension) {
        const supportedFormats = allowedExtensions.map(ext => ext.toUpperCase().substring(1)).join(', ');
        resolve({ 
          isValid: false, 
          error: `Unsupported file format. Please use: ${supportedFormats}. Your file has extension: ${fileExtension.toUpperCase()}` 
        });
        return;
      }

      // File name security validation - allow common safe characters
    //   const safeFileName = fileName.replace(/[^a-z0-9.\-_()\[\]{}@#$%&+=,;!~]/g, '');
    //   if (safeFileName !== fileName) {
    //     const invalidChars = fileName.split('').filter(char => 
    //       !/[a-z0-9.\-_()\[\]{}@#$%&+=,;!~]/.test(char)
    //     );
    //     const uniqueInvalidChars = [...new Set(invalidChars)];
    //     resolve({ 
    //       isValid: false, 
    //       error: `File name contains invalid characters: ${uniqueInvalidChars.join(', ')}. Allowed characters: letters, numbers, dots, hyphens, underscores, parentheses, brackets, and common symbols.` 
    //     });
    //     return;
    //   }

      // Additional security checks for potentially harmful patterns
      const dangerousPatterns = [
        /\.\./, // Directory traversal
        /^\./, // Hidden files
        /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|dll|so|dylib)$/i, // Executable files
        /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i, // Reserved Windows names
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(fileName)) {
          resolve({ 
            isValid: false, 
            error: 'File name contains potentially harmful patterns and is not allowed' 
          });
          return;
        }
      }

      // Image dimensions validation
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          
          // Check minimum dimensions (300x200 for postcard)
        //   const minWidth = 300;
        //   const minHeight = 200;
        //   if (width < minWidth || height < minHeight) {
        //     const widthIssue = width < minWidth ? `width (${width}px < ${minWidth}px)` : '';
        //     const heightIssue = height < minHeight ? `height (${height}px < ${minHeight}px)` : '';
        //     const issues = [widthIssue, heightIssue].filter(Boolean).join(', ');
            
        //     resolve({ 
        //       isValid: false, 
        //       error: `Image dimensions are too small: ${issues}. Minimum required: ${minWidth}x${minHeight} pixels.`,
        //       width,
        //       height,
        //       size: file.size
        //     });
        //     return;
        //   }

          // Check maximum dimensions (4000x4000 to prevent memory issues)
          const maxDimension = 4000;
          if (width > maxDimension || height > maxDimension) {
            const widthIssue = width > maxDimension ? `width (${width}px > ${maxDimension}px)` : '';
            const heightIssue = height > maxDimension ? `height (${height}px > ${maxDimension}px)` : '';
            const issues = [widthIssue, heightIssue].filter(Boolean).join(', ');
            
            resolve({ 
              isValid: false, 
              error: `Image dimensions are too large: ${issues}. Maximum allowed: ${maxDimension}x${maxDimension} pixels.`,
              width,
              height,
              size: file.size
            });
            return;
          }

          // Check aspect ratio for postcard suitability (optional warning)
          const aspectRatio = width / height;
          const isPostcardSuitable = aspectRatio >= 1.2 && aspectRatio <= 2.5; // Typical postcard ratios

          const warnings: string[] = [];
          if (!isPostcardSuitable) {
            warnings.push(`Aspect ratio (${aspectRatio.toFixed(2)}) is outside the typical postcard range (1.2-2.5). This may affect print quality.`);
          }

          resolve({ 
            isValid: true, 
            width, 
            height, 
            size: file.size,
            aspectRatio,
            isPostcardSuitable,
            warnings
          });
        };
        
        img.onerror = () => {
          resolve({ isValid: false, error: 'Failed to load image for validation' });
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => {
        resolve({ isValid: false, error: 'Failed to read image file' });
      };
      
      reader.readAsDataURL(file);
    });
  }, []);

  const processImageFile = useCallback(async (file: File) => {
    setIsProcessingImage(true);
    setImageValidation(null);
    
    try {
      const validation = await validateImage(file);
      
      if (!validation.isValid) {
        // Provide more helpful error messages with suggestions
        let errorMessage = validation.error || 'Invalid image file';
        
        // Add helpful suggestions for common issues
        if (errorMessage.includes('File size')) {
          errorMessage += ' Try compressing your image or using a smaller file.';
        } else if (errorMessage.includes('dimensions are too small')) {
          errorMessage += ' Try using a higher resolution image.';
        } else if (errorMessage.includes('dimensions are too large')) {
          errorMessage += ' Try resizing your image to a smaller resolution.';
        } else if (errorMessage.includes('Unsupported file format')) {
          errorMessage += ' Convert your image to JPG, PNG, or WebP format.';
        }
        
        toast.error(errorMessage);
        setIsProcessingImage(false);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        setSelectedImage(file);
        setValue('postcardImage', file);
        setImageValidation(validation);
        setIsProcessingImage(false);
        toast.success('Image uploaded successfully!');
      };
      
      reader.onerror = () => {
        toast.error('Failed to process image. Please try again.');
        setIsProcessingImage(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('An error occurred while processing the image');
      setIsProcessingImage(false);
    }
  }, [validateImage, setValue]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // Reset input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Only process if it's a single file
      if (files.length === 1) {
        processImageFile(file);
      } else {
        toast.error('Please upload only one image file at a time');
      }
    }
  }, [processImageFile]);

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  }, []);

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageValidation(null);
    setValue('postcardImage', undefined);
    toast.success('Image removed');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: CreateCampaignFormData) => {
    setIsSubmitting(true);
    try {
      // Additional validation before submission
      if (selectedImage && !imageValidation?.isValid) {
        toast.error('Please upload a valid image or remove the current one');
        setIsSubmitting(false);
        return;
      }

      // Create form data for file upload
      const formData = new FormData();
      formData.append('name', data.name.trim());
      formData.append('description', data.description.trim());
      formData.append('startDate', data.startDate);
      
      if (selectedImage) {
        // Add additional metadata for security
        formData.append('postcardImage', selectedImage);
        formData.append('imageSize', selectedImage.size.toString());
        formData.append('imageType', selectedImage.type);
        formData.append('imageName', selectedImage.name);
      }

      await createCampaign(formData);
      toast.success('Campaign created successfully!');
      navigate('/campaigns');
    } catch (error: any) {
      console.error('Campaign creation error:', error);
      const errorMessage = error?.message || 'Failed to create campaign. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/campaigns')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
          <p className="mt-2 text-sm text-gray-600">
            Set up your postcard marketing campaign with all the essential details
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
            {/* Campaign Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('name', {
                    required: 'Campaign name is required',
                    minLength: {
                      value: 3,
                      message: 'Campaign name must be at least 3 characters'
                    },
                    maxLength: {
                      value: 100,
                      message: 'Campaign name must be less than 100 characters'
                    }
                  })}
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter campaign name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  {...register('description', {
                    required: 'Description is required',
                    minLength: {
                      value: 10,
                      message: 'Description must be at least 10 characters'
                    },
                    maxLength: {
                      value: 500,
                      message: 'Description must be less than 500 characters'
                    }
                  })}
                  rows={4}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Describe your campaign goals and target audience..."
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {watchedDescription?.length || 0}/500
                </p>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('startDate', {
                    required: 'Start date is required',
                    validate: (value) => {
                      const selectedDate = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return selectedDate >= today || 'Start date must be today or in the future';
                    }
                  })}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

                        {/* Postcard Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postcard Design (Optional)
              </label>
              
              {!imagePreview ? (
                <div 
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-all duration-200 cursor-pointer ${
                    dragActive 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleUploadClick}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleUploadClick();
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label="Upload postcard image"
                >
                  <div className="space-y-1 text-center">
                    <div className="flex justify-center">
                      {isProcessingImage ? (
                        <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
                      ) : (
                        <Upload className={`mx-auto h-12 w-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                      )}
                    </div>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <span className="font-medium text-blue-600 hover:text-blue-500">
                        Upload a file
                      </span>
                      <span className="ml-1">or drag and drop</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      JPG, PNG, GIF, WebP, BMP, TIFF up to 5MB • Min: 300x200px • Max: 4000x4000px
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-1">
                  {isProcessingImage ? (
                    <div className="flex justify-center items-center h-48 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Processing image...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Postcard preview"
                          className="h-48 w-auto rounded-lg border border-gray-300 object-contain shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm"
                          title="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Image Validation Info */}
                      {imageValidation && (
                        <div className="space-y-3">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-green-800">
                                  Image uploaded successfully
                                </p>
                                <div className="text-xs text-green-600 mt-1 space-y-1">
                                  <p>File: {selectedImage?.name}</p>
                                  <p>Size: {imageValidation.size ? (imageValidation.size / 1024 / 1024).toFixed(2) : '0'} MB</p>
                                  <p>Dimensions: {imageValidation.width} × {imageValidation.height} pixels</p>
                                  {imageValidation.aspectRatio && (
                                    <p>Aspect Ratio: {imageValidation.aspectRatio.toFixed(2)}</p>
                                  )}
                                  {imageValidation.isPostcardSuitable !== undefined && (
                                    <p className={`font-medium ${imageValidation.isPostcardSuitable ? 'text-green-700' : 'text-yellow-700'}`}>
                                      {imageValidation.isPostcardSuitable ? '✓ Postcard suitable' : '⚠ Non-standard aspect ratio'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Warnings */}
                          {imageValidation.warnings && imageValidation.warnings.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-yellow-800 mb-1">
                                    Image uploaded with warnings
                                  </p>
                                  <div className="text-xs text-yellow-700 space-y-1">
                                    {imageValidation.warnings.map((warning, index) => (
                                      <p key={index}>• {warning}</p>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Campaign Preview */}
            {(watchedName || watchedDescription) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Campaign Preview</h3>
                <div className="space-y-2">
                  {watchedName && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Name:</span>
                      <span className="text-sm text-gray-900 ml-2">{watchedName}</span>
                    </div>
                  )}
                  {watchedDescription && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Description:</span>
                      <p className="text-sm text-gray-900 mt-1">{watchedDescription}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/campaigns')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Campaign
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 