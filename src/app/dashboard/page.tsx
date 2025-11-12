"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Sparkles, Calendar, Camera, LogOut, User } from 'lucide-react'
import { toast } from 'sonner'
import type { SkinProfile } from '@/lib/types'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<SkinProfile | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUserId(user.id)
    loadProfile(user.id)
  }

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('skin_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error)
      toast.error('Erro ao carregar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-pink-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">SkinGuide AI</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Bem-vindo de volta! 👋
              </h2>
              <p className="text-gray-600">
                Sua rotina personalizada está pronta
              </p>
            </div>
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-4">
              <User className="w-8 h-8 text-pink-600" />
            </div>
          </div>

          {profile && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Tipo de Pele</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {profile.skin_type === 'oily' && 'Oleosa'}
                  {profile.skin_type === 'dry' && 'Seca'}
                  {profile.skin_type === 'combination' && 'Mista'}
                  {profile.skin_type === 'sensitive' && 'Sensível'}
                </p>
              </div>
              {profile.age && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Idade</p>
                  <p className="font-semibold text-gray-900">{profile.age} anos</p>
                </div>
              )}
              {profile.budget_monthly && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Orçamento</p>
                  <p className="font-semibold text-gray-900">
                    R$ {profile.budget_monthly.toFixed(0)}
                  </p>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Preocupações</p>
                <p className="font-semibold text-gray-900">
                  {profile.concerns.length || 0}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Mapa de Rotina */}
          <button
            onClick={() => toast.info('Módulo 3: Mapa de Rotina (em breve)')}
            className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-8 text-left hover:shadow-2xl transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white/20 rounded-2xl p-3">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <span className="text-white/80 text-sm">Em breve</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Mapa de Rotina
            </h3>
            <p className="text-white/90">
              Visualize sua rotina semanal personalizada
            </p>
          </button>

          {/* Scanner de Produto */}
          <button
            onClick={() => toast.info('Módulo 2: Scanner IA (em breve)')}
            className="bg-white rounded-3xl p-8 text-left border-2 border-gray-200 hover:border-pink-300 hover:shadow-xl transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-3">
                <Camera className="w-8 h-8 text-pink-600" />
              </div>
              <span className="text-gray-500 text-sm">Em breve</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Escanear Produto
            </h3>
            <p className="text-gray-600">
              Use IA para identificar e analisar produtos
            </p>
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600 mb-2">0%</div>
              <p className="text-sm text-gray-600">Taxa de Cumprimento</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">0</div>
              <p className="text-sm text-gray-600">Produtos Cadastrados</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600 mb-2">0</div>
              <p className="text-sm text-gray-600">Dias de Streak</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-200">
          <h3 className="font-semibold text-gray-900 mb-3">
            📋 Próximos Módulos
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✨ <strong>Módulo 2:</strong> Scanner de Produto com IA (análise e recomendações)</li>
            <li>📅 <strong>Módulo 3:</strong> Mapa de Rotina Semanal (timeline interativa)</li>
            <li>📊 <strong>Módulo 4:</strong> Dashboard e Métricas (progresso e insights)</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
