import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Eye, 
  Download, 
  RotateCw, 
  ZoomIn, 
  ZoomOut,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImagePreviewProps {
  currentImageUrl?: string;
  onImageChange: (imageUrl: string) => void;
  onImageRemove?: () => void;
  title?: string;
  description?: string;
  required?: boolean;
  aspectRatio?: 'square' | '16:9' | '4:3' | 'custom';
  maxSize?: number; // in MB
  acceptedFormats?: string[];
  allowUrlInput?: boolean; // New prop to enable URL input
}

export function ImagePreview({
  currentImageUrl,
  onImageChange,
  onImageRemove,
  title = "Project Image",
  description = "Upload an image for your project",
  required = false,
  aspectRatio = '16:9',
  maxSize = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowUrlInput = true // Enable URL input by default
}: ImagePreviewProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageUrl, setImageUrl] = useState(''); // New state for URL input
  const [isUrlLoading, setIsUrlLoading] = useState(false); // Loading state for URL fetch
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case '16:9':
        return 'aspect-video';
      case '4:3':
        return 'aspect-[4/3]';
      default:
        return 'aspect-video';
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsDataURL(file);
    });
  };

  // Optimize image before converting to base64
  const optimizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 800x600 for performance)
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            // Create new file with optimized size
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(optimizedFile);
          } else {
            resolve(file); // Fallback to original file
          }
        }, 'image/jpeg', 0.8); // 80% quality
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle URL input and fetch image
  const handleUrlSubmit = async () => {
    if (!imageUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter an image URL",
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsUrlLoading(true);
    try {
      // Test if the image loads
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Try to enable CORS
      
      img.onload = () => {
        // Create a canvas to convert the image to base64
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          try {
            // Convert to base64
            const base64String = canvas.toDataURL('image/jpeg', 0.8);
            
            // Validate base64 string
            if (!base64String.startsWith('data:image/')) {
              throw new Error('Failed to convert image to base64');
            }
            
            // Check if base64 string is too long
            const base64Size = Math.ceil((base64String.length * 3) / 4);
            if (base64Size > 5 * 1024 * 1024) {
              throw new Error('Image is too large. Please try a smaller image.');
            }
            
            // Set preview and call parent handler
            setPreviewUrl(base64String);
            onImageChange(base64String);
            
            toast({
              title: "Image Loaded",
              description: `Image fetched from URL successfully! Size: ${Math.round(base64Size / 1024)}KB`,
            });
            
            setImageUrl(''); // Clear URL input
          } catch (error) {
            throw new Error('Failed to process image from URL');
          }
        } else {
          throw new Error('Failed to create canvas context');
        }
      };
      
      img.onerror = () => {
        throw new Error('Failed to load image from URL. The image might be protected or inaccessible.');
      };
      
      img.src = imageUrl;
      
    } catch (error) {
      toast({
        title: "URL Fetch Failed",
        description: error instanceof Error ? error.message : "Failed to fetch image from URL",
        variant: "destructive",
      });
    } finally {
      setIsUrlLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!acceptedFormats.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: `Please select a valid image file. Accepted formats: ${acceptedFormats.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: `File size must be less than ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Optimize image
      const optimizedFile = await optimizeImage(file);
      
      // Convert file to base64
      const base64String = await convertFileToBase64(optimizedFile);
      
      // Validate base64 string
      if (!base64String.startsWith('data:image/')) {
        throw new Error('Invalid image format generated');
      }
      
      // Check if base64 string is too long (over 5MB equivalent)
      const base64Size = Math.ceil((base64String.length * 3) / 4);
      if (base64Size > 5 * 1024 * 1024) {
        throw new Error('Image is too large after optimization. Please try a smaller image.');
      }
      
      // Set preview immediately
      setPreviewUrl(base64String);
      
      // Call the parent handler with the base64 string
      onImageChange(base64String);

      toast({
        title: "Image Uploaded",
        description: `Image optimized and saved successfully! Size: ${Math.round(base64Size / 1024)}KB`,
      });
    } catch (error) {
      // Reset to current image if conversion fails
      setPreviewUrl(currentImageUrl || null);
      
      toast({
        title: "Upload Failed",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setZoom(1);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Update preview URL when currentImageUrl changes
  React.useEffect(() => {
    if (currentImageUrl && currentImageUrl !== previewUrl) {
      setPreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl, previewUrl]);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      {/* Image Preview Area */}
      {previewUrl ? (
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Image Preview</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetZoom}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className={`relative ${getAspectRatioClass()} bg-muted overflow-hidden`}>
              <img
                src={previewUrl}
                alt="Project preview"
                className="w-full h-full object-cover transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
              />
              
              {/* Zoom indicator */}
              {zoom !== 1 && (
                <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  {Math.round(zoom * 100)}%
                </div>
              )}

              {/* Image overlay info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <div className="flex items-center gap-2 text-white text-sm">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Image saved successfully</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Upload Area */
        <Card 
          className={`border-2 border-dashed transition-colors ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              
              <h3 className="text-lg font-medium mb-2">Upload Project Image</h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop an image here, or click to browse
              </p>
              
              {/* URL Input Section */}
              {allowUrlInput && (
                <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-muted">
                  <h4 className="font-medium mb-3 text-sm">Or fetch from URL</h4>
                  <div className="flex gap-2 max-w-md mx-auto">
                    <Input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUrlSubmit}
                      disabled={isUrlLoading || !imageUrl.trim()}
                    >
                      {isUrlLoading ? (
                        <>
                          <RotateCw className="h-4 w-4 mr-1 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-1" />
                          Fetch
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter an image URL to fetch and convert to base64
                  </p>
                </div>
              )}
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <span>Max size: {maxSize}MB</span>
                  <span>•</span>
                  <span>Formats: {acceptedFormats.map(f => f.split('/')[1]).join(', ')}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Recommended: {aspectRatio === '16:9' ? '1920x1080' : aspectRatio === '4:3' ? '1600x1200' : '1200x1200'}
                </div>
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  💡 Images are stored directly in the database (no external storage needed)
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={openFileDialog}
                disabled={isUploading}
                className="w-full sm:w-auto"
              >
                {isUploading ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden file input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* File format badges */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Accepted formats:</span>
        {acceptedFormats.map(format => (
          <Badge key={format} variant="secondary" className="text-xs">
            {format.split('/')[1].toUpperCase()}
          </Badge>
        ))}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && previewUrl && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={toggleFullscreen}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={previewUrl}
              alt="Project preview fullscreen"
              className="max-w-full max-h-full object-contain"
              style={{ transform: `scale(${zoom})` }}
            />
            
            {/* Fullscreen controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="bg-black/50 text-white border-white/20 hover:bg-black/70"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetZoom}
                className="bg-black/50 text-white border-white/20 hover:bg-black/70"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="bg-black/50 text-white border-white/20 hover:bg-black/70"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="bg-black/50 text-white border-white/20 hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Zoom indicator */}
            {zoom !== 1 && (
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded">
                {Math.round(zoom * 100)}%
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 