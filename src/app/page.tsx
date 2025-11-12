'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SkinProfile, Photo } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Calendar, Camera, TrendingUp, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<SkinProfile | null>(null)
  const [photos, setPhotos] = useState<{ before?: Photo; after?: Photo }>({})
  const [tips, setTips] = useState<string[]>([])

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    // Buscar perfil
    const { data: profileData } = await supabase
      .from('skin_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!profileData) {
      router.push('/onboarding')
      return
    }

    setProfile(profileData)

    // Buscar fotos
    const { data: photosData } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', user.id)
      .in('kind', ['before', 'after'])
      .order('created_at', { ascending: false })

    if (photosData) {
      const before = photosData.find(p => p.kind === 'before')
      const after = photosData.find(p => p.kind === 'after')
      setPhotos({ before, after })
    }

    // Gerar dicas personalizadas
    setTips([
      `Para pele ${profileData.skin_type === 'oily' ? 'oleosa' : profileData.skin_type === 'dry' ? 'seca' : profileData.skin_type === 'combination' ? 'mista' : 'sensível'}, mantenha a hidratação balanceada`,
      'Sempre use protetor solar pela manhã, mesmo em dias nublados',
      'Evite misturar ácidos fortes com retinoides na mesma aplicação'
    ])

    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-rose-500" />
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
              SkinGuide AI
            </h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Before/After Section */}
        <Card className="mb-8 border-rose-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-500" />
              Sua Jornada
            </CardTitle>
            <CardDescription>Acompanhe sua evolução</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Antes</p>
                {photos.before ? (
                  <img
                    src={photos.before.image_url}
                    alt="Before"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Depois</p>
                {photos.after ? (
                  <img
                    src={photos.after.image_url}
                    alt="After"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-sm text-gray-500">Em breve...</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link href="/routine">
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-purple-200 hover:border-purple-400">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Mapa de Rotina</h3>
                    <p className="text-sm text-gray-600">Ver rotina semanal</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/scanner">
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-rose-200 hover:border-rose-400">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-100 rounded-full">
                    <Camera className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Escanear Produto</h3>
                    <p className="text-sm text-gray-600">Análise com IA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Personalized Tips */}
        <Card className="border-amber-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Dicas Personalizadas
            </CardTitle>
            <CardDescription>Baseadas no seu perfil de pele</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200"
                >
                  <p className="text-sm text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Profile Info */}
        {profile && (
          <Card className="mt-8 border-gray-200">
            <CardHeader>
              <CardTitle>Seu Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Tipo de Pele</p>
                  <p className="font-medium capitalize">{profile.skin_type}</p>
                </div>
                <div>
                  <p className="text-gray-600">Idade</p>
                  <p className="font-medium">{profile.age || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Orçamento Mensal</p>
                  <p className="font-medium">${profile.budget_monthly || 'Não definido'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Preocupações</p>
                  <p className="font-medium">{profile.concerns?.length || 0} registradas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
