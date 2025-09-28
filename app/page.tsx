"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  AlertTriangle,
  Instagram,
  Facebook,
  Heart,
  Shield,
  MessageCircle,
  MapPin,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  ImageIcon,
  MessageSquare,
  Star,
  Lock,
} from "lucide-react"

type Step = "landing" | "account" | "login" | "upload" | "investigation" | "error"

interface FormData {
  email: string
  confirmEmail: string
  password: string
  confirmPassword: string
  name: string
  age: string
  phone: string
  photo: File | null
}

interface PlatformData {
  name: string
  icon: React.ReactNode
  color: string
  bgColor: string
  progress: number
  status: "waiting" | "scanning" | "completed" | "found"
  findings?: string[]
  specificData?: {
    type: string
    items: string[]
    count?: number
  }
}

export default function Spy3App() {
  const [currentStep, setCurrentStep] = useState<Step>("landing")
  const [isLogin, setIsLogin] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
    name: "",
    age: "",
    phone: "",
    photo: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [lastTryTime, setLastTryTime] = useState<number | null>(null)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const [isSystemOverloaded, setIsSystemOverloaded] = useState(false)
  const [investigationStartTime, setInvestigationStartTime] = useState<number | null>(null)
  const [showUnlockSquare, setShowUnlockSquare] = useState(false)
  const [platforms, setPlatforms] = useState<PlatformData[]>([
    {
      name: "Instagram",
      icon: <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-pink-600",
      bgColor: "bg-gradient-to-br from-purple-500 to-pink-500",
      progress: 0,
      status: "waiting",
      findings: [],
      specificData: {
        type: "photos & profiles",
        items: [],
      },
    },
    {
      name: "Facebook",
      icon: <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-600",
      progress: 0,
      status: "waiting",
      findings: [],
      specificData: {
        type: "posts & conversations",
        items: [],
      },
    },
    {
      name: "Tinder",
      icon: <Heart className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-red-500",
      bgColor: "bg-gradient-to-r from-red-500 to-pink-500",
      progress: 0,
      status: "waiting",
      findings: [],
      specificData: {
        type: "dating",
        items: [],
      },
    },
    {
      name: "WhatsApp",
      icon: <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-green-600",
      bgColor: "bg-green-500",
      progress: 0,
      status: "waiting",
      findings: [],
      specificData: {
        type: "messaging",
        items: [],
      },
    },
    {
      name: "Location",
      icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-red-600",
      bgColor: "bg-red-500",
      progress: 0,
      status: "waiting",
      findings: [],
      specificData: {
        type: "location",
        items: [],
      },
    },
  ])
  const [currentScanningIndex, setCurrentScanningIndex] = useState(-1)
  const [overallProgress, setOverallProgress] = useState(0)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    if (lastTryTime) {
      const interval = setInterval(() => {
        const now = Date.now()
        const elapsed = now - lastTryTime
        const remaining = Math.max(0, 600000 - elapsed) // 10 minutes in milliseconds
        setCooldownRemaining(remaining)

        if (remaining === 0) {
          clearInterval(interval)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [lastTryTime])

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          const newProgress = prev + Math.random() * 8 + 2 // Random increment between 2-10

          if (newProgress >= 100) {
            clearInterval(interval)
            setTimeout(() => {
              setIsLoading(false)
              if (!isLogin) {
                // Account created successfully, switch to login mode
                setIsLogin(true)
                setFormData((prev) => ({
                  ...prev,
                  confirmEmail: "",
                  confirmPassword: "",
                }))
              } else {
                // Login successful, go to upload
                setCurrentStep("upload")
              }
            }, 1000) // Small delay before transitioning
            return 100
          }

          return newProgress
        })
      }, 150) // Update every 150ms for smooth animation

      return () => clearInterval(interval)
    }
  }, [isLoading, isLogin])

  useEffect(() => {
    if (investigationStartTime && !isSystemOverloaded) {
      const checkOverload = setInterval(() => {
        const elapsed = Date.now() - investigationStartTime
        if (elapsed >= 300000) {
          // 5 minutes
          setIsSystemOverloaded(true)
          setTimeout(() => {
            setCurrentStep("error")
            setLastTryTime(Date.now())
          }, 2000)
          clearInterval(checkOverload)
        }
      }, 1000)

      return () => clearInterval(checkOverload)
    }
  }, [investigationStartTime, isSystemOverloaded])

  useEffect(() => {
    if (currentStep === "investigation") {
      setInvestigationStartTime(Date.now())
      let currentIndex = 0

      const scanPlatform = () => {
        if (currentIndex < platforms.length && !isSystemOverloaded) {
          setCurrentScanningIndex(currentIndex)

          setPlatforms((prev) =>
            prev.map((platform, idx) =>
              idx === currentIndex ? { ...platform, status: "scanning" as const, progress: 0 } : platform,
            ),
          )

          const progressInterval = setInterval(() => {
            if (isSystemOverloaded) {
              clearInterval(progressInterval)
              return
            }

            setPlatforms((prev) =>
              prev.map((platform, idx) => {
                if (idx === currentIndex) {
                  const timeElapsed = Date.now() - (investigationStartTime || Date.now())
                  const timeProgress = Math.min((timeElapsed / 300000) * 100, 95) // Max 95% until overload
                  const increment = Math.random() * 1.5 + 0.3 // Slower: 0.3-1.8% increments
                  const maxAllowedProgress = (timeProgress / platforms.length) * (currentIndex + 1)
                  const newProgress = Math.min(platform.progress + increment, maxAllowedProgress)

                  setOverallProgress((prevOverall) => {
                    const completedPlatforms = currentIndex * (timeProgress / platforms.length)
                    const currentPlatformProgress = newProgress / platforms.length
                    const totalProgress = completedPlatforms + currentPlatformProgress
                    return Math.min(totalProgress, timeProgress)
                  })

                  if (newProgress >= maxAllowedProgress * 0.95 && timeProgress >= 85) {
                    clearInterval(progressInterval)

                    // Platform-specific findings
                    const hasFindings = Math.random() > 0.2
                    let findings: string[] = []
                    let specificData = { type: "", items: [], count: 0 }

                    if (hasFindings) {
                      switch (platform.name) {
                        case "Instagram":
                          findings = ["Public profile found", "847 followers", "23 recent photos"]
                          specificData = {
                            type: "photos & profiles",
                            items: [
                              "📸 23 photos in main profile",
                              "❤️ 1,247 total likes received",
                              "📱 Active stories (viewed 2h ago)",
                              "👥 847 followers, 312 following",
                              "📍 15 photos with geolocation",
                              "💬 Comments on 8 recent posts",
                              "🔍 Accessed profiles: @maria_silva, @joao123",
                            ],
                            count: 23,
                          }
                          break
                        case "Facebook":
                          findings = ["Active profile", "312 friends", "Last activity: yesterday"]
                          specificData = {
                            type: "posts & conversations",
                            items: [
                              "📝 12 posts in last 30 days",
                              "💬 Active conversations with 5 people",
                              "👥 312 friends, 45 followers",
                              "📍 Check-ins: Shopping Center, Restaurant",
                              "❤️ 89 likes on recent posts",
                              "🔍 Visited profiles: Ana Costa, Pedro Santos",
                            ],
                            count: 312,
                          }
                          break
                        case "Tinder":
                          findings = ["Active profile found", "Last online: today", "7 profile photos"]
                          specificData = {
                            type: "matches & conversations",
                            items: [
                              "💕 14 active matches",
                              "💬 8 ongoing conversations",
                              "📸 7 verified profile photos",
                              "📍 Search radius: 25km",
                              "⭐ Super likes sent: 3 this week",
                              "🔥 Recent matches: Carla, Beatriz, Amanda",
                            ],
                            count: 14,
                          }
                          break
                        case "WhatsApp":
                          findings = ["Active number", "Last seen: 14:32", "Profile photo visible"]
                          specificData = {
                            type: "conversations & contacts",
                            items: [
                              "💬 23 active conversations",
                              "📱 Online 2 hours ago",
                              "📸 Profile photo changed 3 days ago",
                              "📞 Calls to: Mom, João, Work",
                              "📊 Status: 'Busy at work'",
                              "👥 Groups: Family, Friends, Work (3)",
                            ],
                            count: 23,
                          }
                          break
                        case "Location":
                          findings = ["3 addresses found", "Frequent locations identified", "Movement pattern detected"]
                          specificData = {
                            type: "locations & addresses",
                            items: [
                              "🏠 Home: Flores Street, 123 - Garden District",
                              "🏢 Work: Paulista Ave, 1000 - Downtown",
                              "🏋️ Gym: Smart Fit - Shopping Center",
                              "🍕 Frequent restaurant: Pizza Hut",
                              "⛽ Gas station: Shell - Main Street",
                              "📍 Last location: Shopping (3h ago)",
                            ],
                            count: 6,
                          }
                          break
                      }
                    }

                    setTimeout(() => {
                      setPlatforms((prev) =>
                        prev.map((p, i) =>
                          i === currentIndex
                            ? {
                                ...p,
                                progress: newProgress,
                                status: hasFindings ? ("found" as const) : ("completed" as const),
                                findings,
                                specificData,
                              }
                            : p,
                        ),
                      )

                      currentIndex++
                      if (currentIndex < platforms.length && !isSystemOverloaded) {
                        setTimeout(scanPlatform, 1500) // Shorter delay between platforms
                      } else if (currentIndex >= platforms.length) {
                        setTimeout(() => {
                          setShowUnlockSquare(true)
                        }, 2000)
                      }
                    }, 1000)
                  }

                  return { ...platform, progress: newProgress }
                }
                return platform
              }),
            )
          }, 1000) // Slower update interval - 1000ms for better synchronization
        }
      }

      scanPlatform()
    }
  }, [currentStep, isSystemOverloaded, investigationStartTime])

  const handleStartScanning = () => {
    setCurrentStep("account")
  }

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLogin) {
      // Login validation - only email and password required
      if (formData.email && formData.password) {
        setIsLoading(true)
        setLoadingProgress(0)
      }
    } else {
      // Create account validation - all fields required
      if (formData.email && formData.confirmEmail && formData.password && formData.confirmPassword) {
        setIsLoading(true)
        setLoadingProgress(0)
      }
    }
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.email && formData.password) {
      setIsLoading(true)
      setLoadingProgress(0)
    }
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.age && formData.phone) {
      setCurrentStep("investigation")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }))

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const formatCooldownTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex min-h-screen">
        {/* Main Content - Full width on mobile, left side on desktop */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Spy3
                </span>
              </div>
            </div>

            {/* Landing Page */}
            {currentStep === "landing" && (
              <div className="space-y-6 sm:space-y-8">
                <div className="space-y-3 sm:space-y-4">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                    Discover the
                    <br />
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Truth
                    </span>
                  </h1>
                  <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                    Professional social media investigation with advanced digital tracking technology.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    <div className="text-center group">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Instagram className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <span className="text-gray-300 text-xs sm:text-sm font-medium">Instagram</span>
                    </div>

                    <div className="text-center group">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Facebook className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <span className="text-gray-300 text-xs sm:text-sm font-medium">Facebook</span>
                    </div>

                    <div className="text-center group">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-current" />
                      </div>
                      <span className="text-gray-300 text-xs sm:text-sm font-medium">Tinder</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleStartScanning}
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Start Investigation
                  </Button>

                  <div className="text-center">
                    <p className="text-gray-400 text-xs sm:text-sm">
                      ✓ 100% Anonymous • ✓ Real-time Results • ✓ Secure Data
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Account Creation or Login */}
            {currentStep === "account" && (
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    {isLogin ? "Welcome Back" : "Secure Access"}
                  </h2>
                  <p className="text-gray-300 text-sm sm:text-base">
                    {isLogin ? "Sign in to your investigation account" : "Set up your investigation account"}
                  </p>
                </div>

                {!isLoading ? (
                  <form onSubmit={handleAccountSubmit} className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="w-full h-12 sm:h-12 px-4 py-3 text-base text-white bg-slate-800 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 touch-manipulation"
                        style={{ fontSize: "16px" }} // Prevents zoom on iOS
                        required
                      />
                    </div>

                    {!isLogin && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Email</label>
                        <input
                          type="email"
                          placeholder="Confirm your email address"
                          value={formData.confirmEmail}
                          onChange={(e) => handleInputChange("confirmEmail", e.target.value)}
                          className="w-full h-12 sm:h-12 px-4 py-3 text-base text-white bg-slate-800 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 touch-manipulation"
                          style={{ fontSize: "16px" }}
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                      <input
                        type="password"
                        placeholder={isLogin ? "Enter your password" : "Create a secure password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="w-full h-12 sm:h-12 px-4 py-3 text-base text-white bg-slate-800 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 touch-manipulation"
                        style={{ fontSize: "16px" }}
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        required
                      />
                    </div>

                    {!isLogin && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                        <input
                          type="password"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          className="w-full h-12 sm:h-12 px-4 py-3 text-base text-white bg-slate-800 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 touch-manipulation"
                          style={{ fontSize: "16px" }}
                          autoComplete="new-password"
                          required
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl mt-6 shadow-lg touch-manipulation"
                    >
                      {isLogin ? "Sign In" : "Create Account"}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center space-y-4 sm:space-y-6 py-6 sm:py-8">
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                      <div className="absolute inset-0 w-8 h-8 sm:w-12 sm:h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mt-2 ml-2"></div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-white font-medium text-sm sm:text-base">
                        {isLogin ? "Verifying credentials..." : "Setting up security system..."}
                      </p>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        {isLogin ? "Authenticating access" : "Encrypting access data"}
                      </p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                      <Progress value={loadingProgress} className="w-full h-2 sm:h-3 bg-slate-700" />
                      <p className="text-lg sm:text-xl font-bold text-blue-400 mt-2">{Math.round(loadingProgress)}%</p>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-blue-400 hover:text-blue-300 underline font-medium transition-colors"
                    >
                      {isLogin ? "Create Account" : "Sign In"}
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Upload Person */}
            {currentStep === "upload" && (
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Target Data</h2>
                  <p className="text-gray-300 text-sm sm:text-base">
                    Enter information about the person to investigate
                  </p>
                </div>

                <form onSubmit={handleUploadSubmit} className="space-y-3 sm:space-y-4">
                  <div className="border-2 border-dashed border-slate-600 rounded-xl p-4 sm:p-6 text-center bg-slate-800/30 backdrop-blur-sm hover:border-blue-500 transition-colors duration-300">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer block">
                      {photoPreview ? (
                        <div className="space-y-2 sm:space-y-3">
                          <img
                            src={photoPreview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-xl mx-auto border-2 border-blue-500"
                          />
                          <p className="text-gray-300 text-xs sm:text-sm">Click to change photo</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-400" />
                          <p className="text-gray-300 font-medium text-sm sm:text-base">Upload target photo</p>
                          <p className="text-gray-500 text-xs sm:text-sm mt-1">PNG, JPG up to 10MB</p>
                        </>
                      )}
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full h-12 sm:h-12 px-4 py-3 text-base text-white bg-slate-800 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 touch-manipulation"
                      style={{ fontSize: "16px" }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                    <input
                      type="number"
                      placeholder="Enter age"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      className="w-full h-12 sm:h-12 px-4 py-3 text-base text-white bg-slate-800 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 touch-manipulation"
                      style={{ fontSize: "16px" }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full h-12 sm:h-12 px-4 py-3 text-base text-white bg-slate-800 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 touch-manipulation"
                      style={{ fontSize: "16px" }}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl mt-6 shadow-lg touch-manipulation"
                  >
                    🔍 Start Investigation
                  </Button>
                </form>
              </div>
            )}

            {/* Step 3: Investigation */}
            {currentStep === "investigation" && (
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* Target Info Card */}
                  <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-slate-800/50 rounded-xl border border-slate-700 backdrop-blur-sm">
                    {photoPreview && (
                      <img
                        src={photoPreview || "/placeholder.svg"}
                        alt="Investigation target"
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-xl border-2 border-blue-500"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-white">{formData.name}</h3>
                      <p className="text-gray-300 text-sm">
                        {formData.age} years • {formData.phone}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Search className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                        <span className="text-xs sm:text-sm text-red-400 font-medium">
                          {isSystemOverloaded ? "SYSTEM OVERLOADED" : "ACTIVE INVESTIGATION"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Overall Progress */}
                  <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-3 sm:p-4 rounded-xl border border-slate-600 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <span className="text-xs sm:text-sm font-medium">
                        {isSystemOverloaded ? "System Overloaded" : "Investigation Progress"}
                      </span>
                      <span className="text-base sm:text-lg font-bold text-blue-400">
                        {Math.round(overallProgress)}%
                      </span>
                    </div>
                    <Progress
                      value={overallProgress}
                      className={`w-full h-2 sm:h-3 ${isSystemOverloaded ? "bg-red-900" : "bg-slate-600"}`}
                    />
                    {isSystemOverloaded && (
                      <p className="text-red-400 text-xs mt-2">⚠️ Too many simultaneous investigations detected</p>
                    )}
                  </div>
                </div>

                {/* Platforms Grid - Mobile optimized */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                  {platforms.map((platform, index) => (
                    <div
                      key={platform.name}
                      className={`p-2 sm:p-4 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm ${
                        platform.status === "scanning"
                          ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                          : platform.status === "found"
                            ? "border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20"
                            : platform.status === "completed"
                              ? "border-gray-500 bg-gray-500/10"
                              : "border-slate-600 bg-slate-800/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div
                            className={`w-6 h-6 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-lg ${platform.bgColor}`}
                          >
                            {platform.icon}
                          </div>
                          <span className="font-semibold text-white text-xs sm:text-sm">{platform.name}</span>
                        </div>

                        {platform.status === "scanning" && (
                          <div className="w-3 h-3 sm:w-5 sm:h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {platform.status === "found" && (
                          <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-400" />
                        )}
                        {platform.status === "completed" && <XCircle className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />}
                        {platform.status === "waiting" && <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />}
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-300 font-medium">
                            {platform.status === "waiting" && "Waiting..."}
                            {platform.status === "scanning" && "Scanning..."}
                            {platform.status === "found" && "Data found!"}
                            {platform.status === "completed" && "No results"}
                          </span>
                          <span className="font-bold text-white">{Math.round(platform.progress)}%</span>
                        </div>
                        <Progress
                          value={platform.progress}
                          className={`w-full h-1.5 sm:h-2 ${platform.status === "found" ? "bg-green-900" : "bg-slate-700"}`}
                        />

                        {platform.specificData && platform.specificData.items.length > 0 && (
                          <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2 max-h-24 sm:max-h-32 overflow-y-auto">
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              {platform.name === "Instagram" && (
                                <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400" />
                              )}
                              {platform.name === "Facebook" && (
                                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                              )}
                              {platform.name === "Tinder" && <Star className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />}
                              {platform.name === "WhatsApp" && (
                                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                              )}
                              {platform.name === "Location" && (
                                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                              )}
                              <span className="text-xs font-semibold text-white uppercase">
                                {platform.specificData.type}
                              </span>
                            </div>
                            {platform.specificData.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex items-start space-x-1 sm:space-x-2">
                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-400 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                <span className="text-xs text-green-300 leading-relaxed">{item}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div
                    className={`p-2 sm:p-4 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm ${
                      showUnlockSquare
                        ? "border-yellow-500 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 shadow-lg shadow-yellow-500/20 animate-pulse"
                        : "border-slate-600 bg-slate-800/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div
                          className={`w-6 h-6 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-lg ${
                            showUnlockSquare ? "bg-gradient-to-br from-yellow-500 to-orange-500" : "bg-slate-700"
                          }`}
                        >
                          <Lock className={`w-3 h-3 sm:w-5 sm:h-5 ${showUnlockSquare ? "animate-bounce" : ""}`} />
                        </div>
                        <span className="font-semibold text-white text-xs sm:text-sm">Unlock</span>
                      </div>
                      {showUnlockSquare ? (
                        <div className="w-3 h-3 sm:w-5 sm:h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                      )}
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className={`font-medium ${showUnlockSquare ? "text-yellow-300" : "text-gray-300"}`}>
                          {showUnlockSquare ? "Ready to unlock..." : "Waiting..."}
                        </span>
                        <span className={`font-bold ${showUnlockSquare ? "text-yellow-400" : "text-white"}`}>
                          {showUnlockSquare ? "100%" : "0%"}
                        </span>
                      </div>
                      <Progress
                        value={showUnlockSquare ? 100 : 0}
                        className={`w-full h-1.5 sm:h-2 ${showUnlockSquare ? "bg-yellow-900" : "bg-slate-700"}`}
                      />

                      <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <Lock
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${showUnlockSquare ? "text-yellow-400" : "text-gray-400"}`}
                          />
                          <span className="text-xs font-semibold text-white uppercase">FULL ACCESS</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-start space-x-1 sm:space-x-2">
                            <div
                              className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full mt-1.5 sm:mt-2 flex-shrink-0 ${
                                showUnlockSquare ? "bg-yellow-400" : "bg-gray-500"
                              }`}
                            ></div>
                            <span
                              className={`text-xs leading-relaxed ${showUnlockSquare ? "text-yellow-300" : "text-gray-400"}`}
                            >
                              📸 Photos
                            </span>
                          </div>
                          <div className="flex items-start space-x-1 sm:space-x-2">
                            <div
                              className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full mt-1.5 sm:mt-2 flex-shrink-0 ${
                                showUnlockSquare ? "bg-yellow-400" : "bg-gray-500"
                              }`}
                            ></div>
                            <span
                              className={`text-xs leading-relaxed ${showUnlockSquare ? "text-yellow-300" : "text-gray-400"}`}
                            >
                              💬 Conversations
                            </span>
                          </div>
                          <div className="flex items-start space-x-1 sm:space-x-2">
                            <div
                              className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full mt-1.5 sm:mt-2 flex-shrink-0 ${
                                showUnlockSquare ? "bg-yellow-400" : "bg-gray-500"
                              }`}
                            ></div>
                            <span
                              className={`text-xs leading-relaxed ${showUnlockSquare ? "text-yellow-300" : "text-gray-400"}`}
                            >
                              👥 Profiles accessed
                            </span>
                          </div>
                          <div className="flex items-start space-x-1 sm:space-x-2">
                            <div
                              className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full mt-1.5 sm:mt-2 flex-shrink-0 ${
                                showUnlockSquare ? "bg-yellow-400" : "bg-gray-500"
                              }`}
                            ></div>
                            <span
                              className={`text-xs leading-relaxed ${showUnlockSquare ? "text-yellow-300" : "text-gray-400"}`}
                            >
                              💕 Matches
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Scanning Status */}
                {currentScanningIndex >= 0 && !isSystemOverloaded && (
                  <div className="text-center p-3 sm:p-4 bg-blue-500/10 rounded-xl border border-blue-500/30 backdrop-blur-sm">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full animate-pulse"></div>
                      <p className="text-blue-300 font-semibold text-sm sm:text-base">
                        Analyzing {platforms[currentScanningIndex]?.name}...
                      </p>
                    </div>
                    <p className="text-blue-400 text-xs sm:text-sm">
                      Checking profiles, activities and connections in real-time
                    </p>
                  </div>
                )}

                {/* System Overload Warning */}
                {isSystemOverloaded && (
                  <div className="text-center p-3 sm:p-4 bg-red-500/10 rounded-xl border border-red-500/30 backdrop-blur-sm">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                      <p className="text-red-300 font-semibold text-sm sm:text-base">System Overloaded</p>
                    </div>
                    <p className="text-red-400 text-xs sm:text-sm">
                      Too many investigations running. Redirecting to safety mode...
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Error */}
            {currentStep === "error" && (
              <div className="space-y-4 sm:space-y-6 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">System Overloaded</h2>
                  <p className="text-gray-300 text-base sm:text-lg">Too many simultaneous investigations detected.</p>
                  <p className="text-gray-400 text-sm sm:text-base">Our servers are protecting your privacy.</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                  <p className="text-yellow-400 text-xs sm:text-sm">⚠️ Try again in a few minutes</p>
                </div>

                {cooldownRemaining > 0 ? (
                  <div className="space-y-3">
                    <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 backdrop-blur-sm border border-slate-600">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                        <span className="text-orange-400 font-semibold text-sm sm:text-base">Wait to try again</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-orange-300">
                        {formatCooldownTime(cooldownRemaining)}
                      </div>
                      <p className="text-gray-400 text-xs sm:text-sm mt-1">System in cooldown for security</p>
                    </div>
                    <Button
                      disabled
                      className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold bg-slate-700 text-gray-400 rounded-xl shadow-lg cursor-not-allowed"
                    >
                      🔒 Wait {formatCooldownTime(cooldownRemaining)}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      setCurrentStep("landing")
                      setFormData({
                        email: "",
                        confirmEmail: "",
                        password: "",
                        confirmPassword: "",
                        name: "",
                        age: "",
                        phone: "",
                        photo: null,
                      })
                      setPlatforms((prev) =>
                        prev.map((p) => ({
                          ...p,
                          progress: 0,
                          status: "waiting" as const,
                          findings: [],
                          specificData: { type: "", items: [] },
                        })),
                      )
                      setLoadingProgress(0)
                      setPhotoPreview(null)
                      setOverallProgress(0)
                      setCurrentScanningIndex(-1)
                      setLastTryTime(null)
                      setCooldownRemaining(0)
                      setIsSystemOverloaded(false)
                      setInvestigationStartTime(null)
                      setShowUnlockSquare(false)
                      setIsLogin(false)
                    }}
                    className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl shadow-lg"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Visual (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 items-center justify-center p-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl"></div>
          </div>

          <div className="text-center space-y-8 max-w-md relative z-10">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl">
              <Shield className="w-16 h-16 text-white" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-white leading-tight">
                Advanced
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Investigation Technology
                </span>
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Artificial intelligence algorithms for professional digital tracking and behavioral analysis on social
                networks.
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">100% Secure</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-400">
                <Lock className="w-5 h-5" />
                <span className="text-sm font-medium">Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
