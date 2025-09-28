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
  Clock,
  CheckCircle,
  Users,
  ImageIcon,
  MessageSquare,
  Star,
  Lock,
  Baby,
  Eye,
  UserCheck,
  Search,
  Database,
  Wifi,
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
    conversations?: string[]
    photos?: string[]
    currentActivity?: string
  }
}

export default function FamilySafeApp() {
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
  const [currentScanPhase, setCurrentScanPhase] = useState<string>("")
  const [foundConversations, setFoundConversations] = useState<string[]>([])
  const [foundPhotos, setFoundPhotos] = useState<string[]>([])
  const [systemMessages, setSystemMessages] = useState<string[]>([])
  const [platforms, setPlatforms] = useState<PlatformData[]>([
    {
      name: "WhatsApp",
      icon: <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-green-600",
      bgColor: "bg-green-500",
      progress: 0,
      status: "waiting",
      findings: [],
      specificData: {
        type: "messages",
        items: [],
        conversations: [],
        photos: [],
        currentActivity: "",
      },
    },
    {
      name: "OnlyFans",
      icon: <Heart className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-blue-500",
      bgColor: "bg-blue-500",
      progress: 0,
      status: "waiting",
      findings: [],
      specificData: {
        type: "adult content",
        items: [],
        conversations: [],
        photos: [],
        currentActivity: "",
      },
    },
    {
      name: "Omegle",
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-orange-500",
      bgColor: "bg-orange-500",
      progress: 0,
      status: "waiting",
      findings: [],
      specificData: {
        type: "random chat",
        items: [],
        conversations: [],
        photos: [],
        currentActivity: "",
      },
    },
    {
      name: "ChatRoulette",
      icon: <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-red-500",
      bgColor: "bg-red-500",
      progress: 0,
      status: "waiting",
      findings: [],
      specificData: {
        type: "video chat",
        items: [],
        conversations: [],
        photos: [],
        currentActivity: "",
      },
    },
    {
      name: "Kik",
      icon: <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-green-400",
      bgColor: "bg-green-400",
      progress: 0,
      status: "waiting",
      findings: [],
      specificData: {
        type: "anonymous messages",
        items: [],
        conversations: [],
        photos: [],
        currentActivity: "",
      },
    },
    {
      name: "Telegram",
      icon: <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-blue-400",
      bgColor: "bg-blue-400",
      progress: 0,
      status: "waiting",
      findings: [],
      specificData: {
        type: "encrypted messages",
        items: [],
        conversations: [],
        photos: [],
        currentActivity: "",
      },
    },
    {
      name: "Roblox",
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-red-400",
      bgColor: "bg-red-400",
      progress: 0,
      status: "waiting",
      findings: [],
      specificData: {
        type: "gaming platform",
        items: [],
        conversations: [],
        photos: [],
        currentActivity: "",
      },
    },
    {
      name: "Instagram",
      icon: <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-pink-600",
      bgColor: "bg-gradient-to-br from-purple-500 to-pink-500",
      progress: 0,
      status: "waiting",
      findings: [],
      specificData: {
        type: "photos and profiles",
        items: [],
        conversations: [],
        photos: [],
        currentActivity: "",
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
        type: "social network",
        items: [],
        conversations: [],
        photos: [],
        currentActivity: "",
      },
    },
    {
      name: "X-Videos",
      icon: <Eye className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-red-600",
      bgColor: "bg-red-600",
      progress: 0,
      status: "waiting",
      findings: [],
      specificData: {
        type: "adult content",
        items: [],
        conversations: [],
        photos: [],
        currentActivity: "",
      },
    },
    {
      name: "Snapchat",
      icon: <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400",
      progress: 0,
      status: "waiting",
      findings: [],
      specificData: {
        type: "temporary messages",
        items: [],
        conversations: [],
        photos: [],
        currentActivity: "",
      },
    },
    {
      name: "Discord",
      icon: <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500",
      progress: 0,
      status: "waiting",
      findings: [],
      specificData: {
        type: "gaming chat",
        items: [],
        conversations: [],
        photos: [],
        currentActivity: "",
      },
    },
    {
      name: "TikTok",
      icon: <Star className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-pink-500",
      bgColor: "bg-pink-500",
      progress: 0,
      status: "waiting",
      findings: [],
      specificData: {
        type: "short videos",
        items: [],
        conversations: [],
        photos: [],
        currentActivity: "",
      },
    },
    {
      name: "Reddit",
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-orange-600",
      bgColor: "bg-orange-600",
      progress: 0,
      status: "waiting",
      findings: [],
      specificData: {
        type: "forums",
        items: [],
        conversations: [],
        photos: [],
        currentActivity: "",
      },
    },
    {
      name: "Twitch",
      icon: <Eye className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "text-purple-500",
      bgColor: "bg-purple-500",
      progress: 0,
      status: "waiting",
      findings: [],
      specificData: {
        type: "live streams",
        items: [],
        conversations: [],
        photos: [],
        currentActivity: "",
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
  }, [isLoading]) // Removed isLogin from dependencies to prevent infinite loop

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
      setSystemMessages([])
      setFoundConversations([])
      setFoundPhotos([])
      let currentIndex = 0

      const scanPlatform = () => {
        if (currentIndex < platforms.length && !isSystemOverloaded) {
          setCurrentScanningIndex(currentIndex)
          const platform = platforms[currentIndex]

          // Set initial scanning state
          setPlatforms((prev) =>
            prev.map((platform, idx) =>
              idx === currentIndex ? { ...platform, status: "scanning" as const, progress: 0 } : platform,
            ),
          )

          // Phase 1: Connection and Authentication
          setTimeout(() => {
            setCurrentScanPhase(`Connecting to ${platform.name} servers...`)
            setSystemMessages((prev) => [...prev, `🔗 Establishing secure connection to ${platform.name}`])
          }, 500)

          setTimeout(() => {
            setCurrentScanPhase(`Authenticating access to ${platform.name}...`)
            setSystemMessages((prev) => [...prev, `🔐 Bypassing ${platform.name} security protocols`])
          }, 2000)

          // Phase 2: Data Discovery
          setTimeout(() => {
            setCurrentScanPhase(`Scanning ${platform.name} database...`)
            setSystemMessages((prev) => [...prev, `📊 Analyzing ${platform.name} user data`])
          }, 4000)

          setTimeout(() => {
            setCurrentScanPhase(`Searching conversations in ${platform.name}...`)
            setSystemMessages((prev) => [...prev, `💬 Found conversation threads in ${platform.name}`])

            // Add realistic conversations based on platform
            const conversations = getRealisticConversations(platform.name)
            setFoundConversations((prev) => [...prev, ...conversations])

            setPlatforms((prev) =>
              prev.map((p, idx) =>
                idx === currentIndex
                  ? {
                      ...p,
                      specificData: {
                        ...p.specificData!,
                        conversations: conversations,
                        currentActivity: "Scanning conversations...",
                      },
                    }
                  : p,
              ),
            )
          }, 6000)

          // Phase 3: Photo Discovery
          setTimeout(() => {
            setCurrentScanPhase(`Analyzing photos in ${platform.name}...`)
            setSystemMessages((prev) => [...prev, `📸 Extracting image metadata from ${platform.name}`])

            const photos = getRealisticPhotos(platform.name)
            setFoundPhotos((prev) => [...prev, ...photos])

            setPlatforms((prev) =>
              prev.map((p, idx) =>
                idx === currentIndex
                  ? {
                      ...p,
                      specificData: {
                        ...p.specificData!,
                        photos: photos,
                        currentActivity: "Analyzing photos...",
                      },
                    }
                  : p,
              ),
            )
          }, 8000)

          // Phase 4: Deep Analysis
          setTimeout(() => {
            setCurrentScanPhase(`Deep analysis of ${platform.name} activity...`)
            setSystemMessages((prev) => [...prev, `🔍 Running behavioral analysis on ${platform.name}`])
          }, 10000)

          // Progress simulation with realistic phases
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
                  const increment = Math.random() * 0.8 + 0.2 // Slower: 0.2-1.0% increments
                  const maxAllowedProgress = (timeProgress / platforms.length) * (currentIndex + 1)
                  const newProgress = Math.min(platform.progress + increment, maxAllowedProgress)

                  setOverallProgress((prevOverall) => {
                    const completedPlatforms = currentIndex * (timeProgress / platforms.length)
                    const currentPlatformProgress = newProgress / platforms.length
                    const totalProgress = completedPlatforms + currentPlatformProgress
                    return Math.min(totalProgress, timeProgress)
                  })

                  // Complete platform scan after sufficient progress
                  if (newProgress >= maxAllowedProgress * 0.9 && timeProgress >= 75) {
                    clearInterval(progressInterval)

                    // Generate realistic findings
                    const hasFindings = Math.random() > 0.2 // 80% chance of findings
                    let findings: string[] = []
                    let specificData = {
                      type: "",
                      items: [],
                      count: 0,
                      conversations: platform.specificData?.conversations || [],
                      photos: platform.specificData?.photos || [],
                      currentActivity: "Analysis complete",
                    }

                    if (hasFindings) {
                      const platformFindings = getDetailedFindings(platform.name)
                      findings = platformFindings.findings
                      specificData = {
                        ...specificData,
                        type: platformFindings.type,
                        items: platformFindings.items,
                        count: platformFindings.count,
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

                      setSystemMessages((prev) => [
                        ...prev,
                        `✅ ${platform.name} scan completed - ${hasFindings ? "RISKS FOUND" : "Safe"}`,
                      ])

                      currentIndex++
                      if (currentIndex < platforms.length && !isSystemOverloaded) {
                        setTimeout(scanPlatform, 2000) // Delay between platforms
                      } else if (currentIndex >= platforms.length) {
                        setTimeout(() => {
                          setShowUnlockSquare(true)
                          setCurrentScanPhase("Generating comprehensive report...")
                          setSystemMessages((prev) => [...prev, `📋 Compiling final security report...`])
                        }, 3000)
                      }
                    }, 1500)
                  }

                  return { ...platform, progress: newProgress }
                }
                return platform
              }),
            )
          }, 1500) // Slower update interval for more realistic feel
        }
      }

      scanPlatform()
    }
  }, [currentStep])

  const getRealisticConversations = (platformName: string): string[] => {
    const conversationSets: { [key: string]: string[] } = {
      WhatsApp: [
        "💬 Chat with 'Unknown Contact' - 23 messages",
        "💬 Group: 'School Friends' - 156 messages",
        "💬 Chat with 'Mike_18' - 45 messages",
        "💬 Chat with 'Sarah_Mom' - 12 messages",
      ],
      Instagram: [
        "💬 DM from '@stranger_guy_21' - 8 messages",
        "💬 DM from '@hot_girl_nearby' - 15 messages",
        "💬 DM from '@modeling_scout' - 6 messages",
      ],
      Discord: [
        "💬 #general chat in 'Gaming Server' - 234 messages",
        "💬 DM with 'GamerDude42' - 67 messages",
        "💬 #nsfw channel access detected",
      ],
      TikTok: [
        "💬 Comments from adult accounts",
        "💬 DMs from suspicious profiles",
        "💬 Interactions with inappropriate content",
      ],
      Telegram: [
        "💬 Secret chat with 'Anonymous User'",
        "💬 Group: 'Teens Only 18+' - 89 messages",
        "💬 Bot conversations detected",
      ],
    }
    return conversationSets[platformName] || ["💬 Private conversations found"]
  }

  const getRealisticPhotos = (platformName: string): string[] => {
    const photoSets: { [key: string]: string[] } = {
      Instagram: [
        "📸 Profile photo - Location: Home",
        "📸 Story photo - Inappropriate content",
        "📸 Posted photo - School uniform visible",
        "📸 Tagged photo - With unknown adults",
      ],
      Snapchat: [
        "📸 Snap to 'Unknown User' - Deleted",
        "📸 Story post - Location shared",
        "📸 Private snap - Inappropriate",
      ],
      WhatsApp: [
        "📸 Profile picture - Personal info visible",
        "📸 Shared photo - Location metadata",
        "📸 Received photo - From stranger",
      ],
      Facebook: [
        "📸 Profile photos - Public access",
        "📸 Tagged photos - Privacy concerns",
        "📸 Shared photos - Inappropriate content",
      ],
    }
    return photoSets[platformName] || ["📸 Image content analyzed"]
  }

  const getDetailedFindings = (platformName: string) => {
    const findingsData: { [key: string]: any } = {
      WhatsApp: {
        findings: ["Active account found", "Stranger contacts", "Location sharing enabled"],
        type: "messaging risks",
        items: [
          "💬 15 active conversations found",
          "📱 Last seen: 2 hours ago",
          "👥 23 contacts (8 unknown numbers)",
          "📞 Video calls with strangers",
          "🔍 Groups: 'School Friends', 'Random Chat'",
          "⚠️ Messages from adult strangers",
          "📍 Location sharing: ENABLED",
          "🚨 Inappropriate content received",
        ],
        count: 23,
      },
      OnlyFans: {
        findings: ["⚠️ ADULT CONTENT ACCESS", "Active subscription", "Payment linked"],
        type: "adult content exposure",
        items: [
          "🔞 Active premium subscription",
          "💳 Payment: Parent's credit card",
          "📅 Account age: 2 months",
          "⚠️ Age verification bypassed",
          "📊 Daily usage: 2-3 hours",
          "🚨 EXPLICIT CONTENT ACCESSED",
          "💰 Monthly charges: $29.99",
          "🔍 Interaction with adult performers",
        ],
        count: 1,
      },
      Instagram: {
        findings: ["Public profile", "Adult followers", "Inappropriate DMs"],
        type: "social media exposure",
        items: [
          "📸 23 photos posted (some revealing)",
          "👥 847 followers (many unknown adults)",
          "💬 DMs from suspicious accounts",
          "📍 Location tags on all posts",
          "⚠️ Comments from predators",
          "🔍 Following inappropriate accounts",
          "📱 Stories viewed by strangers",
          "🚨 Modeling offers received",
        ],
        count: 23,
      },
      Discord: {
        findings: ["Adult servers", "Voice chats", "NSFW content"],
        type: "gaming platform risks",
        items: [
          "🎮 Member of 12 servers (3 adult-only)",
          "🔊 Voice chats with adults",
          "💬 Private DMs from strangers",
          "⚠️ NSFW channels accessed",
          "🚨 Grooming attempts detected",
          "🔍 Servers with explicit content",
          "📱 Screen sharing with strangers",
          "⚠️ Personal info shared in chats",
        ],
        count: 12,
      },
      TikTok: {
        findings: ["Viral content", "Adult interactions", "Dangerous trends"],
        type: "short video risks",
        items: [
          "📱 4+ hours daily usage",
          "👥 Adult followers (suspicious profiles)",
          "🎵 Inappropriate content viewed",
          "💬 Comments from strangers",
          "⚠️ Dangerous challenges attempted",
          "🔍 Algorithm showing adult content",
          "📸 Personal videos posted",
          "🚨 Location visible in videos",
        ],
        count: 156,
      },
    }

    return (
      findingsData[platformName] || {
        findings: ["Activity detected", "Potential risks", "Monitoring needed"],
        type: "platform activity",
        items: [
          "⚠️ Potential safety concerns",
          "👥 Contact with unknown users",
          "🚨 Inappropriate content exposure",
          "📱 Excessive usage detected",
          "🔍 Privacy settings inadequate",
          "⚠️ Parental supervision required",
        ],
        count: 1,
      }
    )
  }

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
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Baby className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  FamilySafe
                </span>
              </div>
            </div>

            {/* Landing Page */}
            {currentStep === "landing" && (
              <div className="space-y-6 sm:space-y-8">
                <div className="space-y-3 sm:space-y-4">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                    Protect Your
                    <br />
                    <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                      Children
                    </span>
                  </h1>
                  <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                    Advanced social media monitoring to keep your children safe online.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    <div className="text-center group">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-green-500 rounded-xl sm:rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <span className="text-gray-300 text-xs sm:text-sm font-medium">WhatsApp</span>
                    </div>

                    <div className="text-center group">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-current" />
                      </div>
                      <span className="text-gray-300 text-xs sm:text-sm font-medium">OnlyFans</span>
                    </div>

                    <div className="text-center group">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Star className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-current" />
                      </div>
                      <span className="text-gray-300 text-xs sm:text-sm font-medium">TikTok</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleStartScanning}
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Start Monitoring
                  </Button>

                  <div className="text-center">
                    <p className="text-gray-400 text-xs sm:text-sm">
                      ✓ 100% Secure • ✓ Real-time Results • ✓ Family Protection
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
                    {isLogin ? "Sign in to your monitoring account" : "Set up your family monitoring account"}
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
                        className="w-full h-12 sm:h-12 px-4 py-3 text-base text-white bg-slate-800 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 touch-manipulation"
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
                          className="w-full h-12 sm:h-12 px-4 py-3 text-base text-white bg-slate-800 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 touch-manipulation"
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
                        className="w-full h-12 sm:h-12 px-4 py-3 text-base text-white bg-slate-800 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 touch-manipulation"
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
                          className="w-full h-12 sm:h-12 px-4 py-3 text-base text-white bg-slate-800 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 touch-manipulation"
                          style={{ fontSize: "16px" }}
                          autoComplete="new-password"
                          required
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl mt-6 shadow-lg touch-manipulation"
                    >
                      {isLogin ? "Sign In" : "Create Account"}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center space-y-4 sm:space-y-6 py-6 sm:py-8">
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto"></div>
                      <div className="absolute inset-0 w-8 h-8 sm:w-12 sm:h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mt-2 ml-2"></div>
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
                      <p className="text-lg sm:text-xl font-bold text-green-400 mt-2">{Math.round(loadingProgress)}%</p>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-green-400 hover:text-green-300 underline font-medium transition-colors"
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
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Child Information</h2>
                  <p className="text-gray-300 text-sm sm:text-base">Enter the child's information for monitoring</p>
                </div>

                <form onSubmit={handleUploadSubmit} className="space-y-3 sm:space-y-4">
                  <div className="border-2 border-dashed border-slate-600 rounded-xl p-4 sm:p-6 text-center bg-slate-800/30 backdrop-blur-sm hover:border-green-500 transition-colors duration-300">
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
                            className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-xl mx-auto border-2 border-green-500"
                          />
                          <p className="text-gray-300 text-xs sm:text-sm">Click to change photo</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-400" />
                          <p className="text-gray-300 font-medium text-sm sm:text-base">Child's photo</p>
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
                      className="w-full h-12 sm:h-12 px-4 py-3 text-base text-white bg-slate-800 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 touch-manipulation"
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
                      className="w-full h-12 sm:h-12 px-4 py-3 text-base text-white bg-slate-800 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 touch-manipulation"
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
                      className="w-full h-12 sm:h-12 px-4 py-3 text-base text-white bg-slate-800 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 touch-manipulation"
                      style={{ fontSize: "16px" }}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl mt-6 shadow-lg touch-manipulation"
                  >
                    🔍 Start Monitoring
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
                        alt="Monitored child"
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-xl border-2 border-green-500"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-white">{formData.name}</h3>
                      <p className="text-gray-300 text-sm">
                        {formData.age} years old • {formData.phone}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                        <span className="text-xs sm:text-sm text-green-400 font-medium">
                          {isSystemOverloaded ? "SYSTEM OVERLOADED" : "MONITORING ACTIVE"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Overall Progress */}
                  <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-3 sm:p-4 rounded-xl border border-slate-600 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <span className="text-xs sm:text-sm font-medium">
                        {isSystemOverloaded ? "System Overloaded" : "Monitoring Progress"}
                      </span>
                      <span className="text-base sm:text-lg font-bold text-green-400">
                        {Math.round(overallProgress)}%
                      </span>
                    </div>
                    <Progress
                      value={overallProgress}
                      className={`w-full h-2 sm:h-3 ${isSystemOverloaded ? "bg-red-900" : "bg-slate-600"}`}
                    />
                    {isSystemOverloaded && (
                      <p className="text-red-400 text-xs mt-2">⚠️ Too many simultaneous monitoring sessions detected</p>
                    )}
                  </div>

                  {currentScanPhase && (
                    <div className="bg-blue-500/10 rounded-xl p-3 sm:p-4 border border-blue-500/30 backdrop-blur-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <Search className="w-4 h-4 text-blue-400 animate-pulse" />
                        <span className="text-blue-300 font-semibold text-sm">{currentScanPhase}</span>
                      </div>
                      {systemMessages.length > 0 && (
                        <div className="max-h-20 overflow-y-auto space-y-1">
                          {systemMessages.slice(-3).map((message, idx) => (
                            <p key={idx} className="text-blue-200 text-xs">
                              {message}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {(foundConversations.length > 0 || foundPhotos.length > 0) && (
                    <div className="bg-yellow-500/10 rounded-xl p-3 sm:p-4 border border-yellow-500/30 backdrop-blur-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <Database className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-300 font-semibold text-sm">Live Discoveries</span>
                      </div>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {foundConversations.slice(-2).map((conv, idx) => (
                          <p key={idx} className="text-yellow-200 text-xs">
                            {conv}
                          </p>
                        ))}
                        {foundPhotos.slice(-2).map((photo, idx) => (
                          <p key={idx} className="text-yellow-200 text-xs">
                            {photo}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Platforms Grid - Mobile optimized */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                  {platforms.map((platform, index) => (
                    <div
                      key={platform.name}
                      className={`p-2 sm:p-4 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm ${
                        platform.status === "scanning"
                          ? "border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20"
                          : platform.status === "found"
                            ? "border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20"
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
                          <div className="w-3 h-3 sm:w-5 sm:h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {platform.status === "found" && (
                          <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-red-400" />
                        )}
                        {platform.status === "completed" && (
                          <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-400" />
                        )}
                        {platform.status === "waiting" && <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />}
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-300 font-medium">
                            {platform.status === "waiting" && "Waiting..."}
                            {platform.status === "scanning" &&
                              (platform.specificData?.currentActivity || "Scanning...")}
                            {platform.status === "found" && "⚠️ Risks found!"}
                            {platform.status === "completed" && "Safe"}
                          </span>
                          <span className="font-bold text-white">{Math.round(platform.progress)}%</span>
                        </div>
                        <Progress
                          value={platform.progress}
                          className={`w-full h-1.5 sm:h-2 ${platform.status === "found" ? "bg-red-900" : "bg-slate-700"}`}
                        />

                        {platform.specificData &&
                          (platform.specificData.conversations?.length > 0 ||
                            platform.specificData.photos?.length > 0) && (
                            <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2 max-h-24 sm:max-h-32 overflow-y-auto">
                              <div className="flex items-center space-x-1 sm:space-x-2">
                                <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                                <span className="text-xs font-semibold text-blue-400 uppercase">LIVE DATA</span>
                              </div>
                              {platform.specificData.conversations?.slice(0, 2).map((conv, idx) => (
                                <div key={idx} className="flex items-start space-x-1 sm:space-x-2">
                                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-400 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                  <span className="text-xs text-blue-300 leading-relaxed">{conv}</span>
                                </div>
                              ))}
                              {platform.specificData.photos?.slice(0, 1).map((photo, idx) => (
                                <div key={idx} className="flex items-start space-x-1 sm:space-x-2">
                                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-yellow-400 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                  <span className="text-xs text-yellow-300 leading-relaxed">{photo}</span>
                                </div>
                              ))}
                            </div>
                          )}

                        {platform.specificData && platform.specificData.items.length > 0 && (
                          <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2 max-h-24 sm:max-h-32 overflow-y-auto">
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                              <span className="text-xs font-semibold text-red-400 uppercase">
                                {platform.specificData.type}
                              </span>
                            </div>
                            {platform.specificData.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex items-start space-x-1 sm:space-x-2">
                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-400 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                <span className="text-xs text-red-300 leading-relaxed">{item}</span>
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
                        <span className="font-semibold text-white text-xs sm:text-sm">Report</span>
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
                          {showUnlockSquare ? "Report ready..." : "Waiting..."}
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
                          <Shield
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${showUnlockSquare ? "text-yellow-400" : "text-gray-400"}`}
                          />
                          <span className="text-xs font-semibold text-white uppercase">FULL REPORT</span>
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
                              🚨 Safety alerts
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
                              📊 Activity analysis
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
                              💡 Recommendations
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Scanning Status */}
                {currentScanningIndex >= 0 && !isSystemOverloaded && (
                  <div className="text-center p-3 sm:p-4 bg-green-500/10 rounded-xl border border-green-500/30 backdrop-blur-sm">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <p className="text-green-300 font-semibold text-sm sm:text-base">
                        Analyzing {platforms[currentScanningIndex]?.name}...
                      </p>
                    </div>
                    <p className="text-green-400 text-xs sm:text-sm">
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
                      Too many monitoring sessions running. Redirecting to safety mode...
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
                  <p className="text-gray-300 text-base sm:text-lg">
                    Too many simultaneous monitoring sessions detected.
                  </p>
                  <p className="text-gray-400 text-sm sm:text-base">Our servers are protecting your privacy.</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                  <p className="text-yellow-400 text-xs sm:text-sm">⚠️ Please try again in a few minutes</p>
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
                          specificData: { type: "", items: [], conversations: [], photos: [], currentActivity: "" },
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
                      setCurrentScanPhase("")
                      setFoundConversations([])
                      setFoundPhotos([])
                      setSystemMessages([])
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
            <div className="absolute top-20 left-20 w-32 h-32 bg-green-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-green-500 to-blue-500 rounded-full blur-3xl"></div>
          </div>

          <div className="text-center space-y-8 max-w-md relative z-10">
            <div className="w-32 h-32 bg-gradient-to-br from-green-500 via-blue-500 to-teal-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl">
              <Baby className="w-16 h-16 text-white" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-white leading-tight">
                Advanced
                <br />
                <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Family Protection
                </span>
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                AI algorithms for digital monitoring and behavioral analysis across social networks, keeping your
                children safe.
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">100% Secure</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-400">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Family Protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
