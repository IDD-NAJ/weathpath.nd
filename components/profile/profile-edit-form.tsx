"use client"

import { useState, useActionState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, X, Upload, User, Mail, FileText, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface ProfileFormData {
  name: string
  email: string
  bio: string
  profilePhotoUrl: string | null
}

interface ProfileEditFormProps {
  initialData: ProfileFormData
  onSave: (data: Partial<ProfileFormData>) => Promise<void>
  isLoading?: boolean
}

export function ProfileEditForm({ initialData, onSave, isLoading = false }: ProfileEditFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>(initialData)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPEG, PNG, WebP, and GIF are allowed.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/profile', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setFormData(prev => ({ ...prev, profilePhotoUrl: result.profilePhotoUrl }))
        toast({
          title: "Photo uploaded",
          description: "Your profile photo has been updated.",
        })
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload photo.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      handleFileUpload(imageFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleRemovePhoto = async () => {
    try {
      const response = await fetch('/api/upload/profile', {
        method: 'DELETE',
      })

      if (response.ok) {
        setFormData(prev => ({ ...prev, profilePhotoUrl: null }))
        toast({
          title: "Photo removed",
          description: "Your profile photo has been removed.",
        })
      } else {
        throw new Error('Failed to remove photo')
      }
    } catch (error) {
      toast({
        title: "Failed to remove photo",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await onSave(formData)
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile.",
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Profile
          </CardTitle>
          <CardDescription>
            Update your personal information and profile photo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center space-y-4">
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.profilePhotoUrl || ''} alt="Profile" />
                  <AvatarFallback className="text-lg">
                    {formData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <AnimatePresence>
                  {formData.profilePhotoUrl && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute -top-2 -right-2"
                    >
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="h-6 w-6 rounded-full p-0"
                        onClick={handleRemovePhoto}
                        disabled={isUploading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <div className="flex gap-2">
                <div
                  className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                    isDragging 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file)
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <div className="text-sm">
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </div>
                    <div className="text-xs text-muted-foreground">
                      PNG, JPG, WebP up to 5MB
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10"
                      placeholder="Your name"
                      required
                      minLength={2}
                      maxLength={50}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="pl-10 min-h-[100px]"
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                    {formData.bio.length}/500
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading || isUploading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
