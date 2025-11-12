'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { analyzeProductImage } from '@/lib/openai'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Camera, Upload, Sparkles, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { ProductAnalysisResult } from '@/types'

export default function ScannerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<ProductAnalysisResult | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setResult(null)

    try {
      // Preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Supabase
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const fileName = `${user.id}/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('product_scans')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('product_scans')
        .getPublicUrl(fileName)

      // Get user profile
      const { data: profile } = await supabase
        .from('skin_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Analyze with AI
      setAnalyzing(true)
      const analysis = await analyzeProductImage(publicUrl, profile || {})
      setResult(analysis)

      // Save analysis
      await supabase.from('ai_analyses').insert({
        user_id: user.id,
        image_url: publicUrl,
        parsed_product: analysis.product_name,
        purpose: analysis.purpose,
        when_to_use: analysis.when_to_use,
        compatibility: analysis.compatibility,
        alt_suggestion: analysis.recommended_alternative ? JSON.stringify(analysis.recommended_alternative) : null,
        full_ai_response: analysis,
      })

    } catch (err: any) {
      alert('Erro ao analisar produto: ' + err.message)
    } finally {
      setLoading(false)
      setAnalyzing(false)
    }
  }

  async function handleAddToRoutine() {
    if (!result) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      // Create product
      const { data: product } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          name: result.product_name,
          category: result.product_type,
          key_actives: result.key_actives,
          notes: result.instructions,
          suitability: result.compatibility,
        })
        .select()
        .single()

      if (!product) throw new Error('Erro ao criar produto')

      // Add to routine (simplified - add to today's routine)
      const today = new Date().getDay()
      const period = result.when_to_use === 'morning' ? 'morning' : result.when_to_use === 'night' ? 'night' : 'morning'

      let { data: routine } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', user.id)
        .eq('day_of_week', today)
        .eq('period', period)
        .single()

      if (!routine) {
        const { data: newRoutine } = await supabase
          .from('routines')
          .insert({
            user_id: user.id,
            day_of_week: today,
            period,
          })
          .select()
          .single()
        routine = newRoutine
      }

      if (routine) {
        // Get max step order
        const { data: items } = await supabase
          .from('routine_items')
          .select('step_order')
          .eq('routine_id', routine.id)
          .order('step_order', { ascending: false })
          .limit(1)

        const nextOrder = items && items.length > 0 ? items[0].step_order + 1 : 0

        await supabase.from('routine_items').insert({
          routine_id: routine.id,
          product_id: product.id,
          step_order: nextOrder,
          step_type: result.routine_step_type,
          ai_notes: `${result.instructions}\n\n${result.reason}`,
        })
      }

      alert('Produto adicionado à rotina com sucesso!')
      router.push('/routine')
    } catch (err: any) {
      alert('Erro ao adicionar à rotina: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const compatibilityConfig = {
    good: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    neutral: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    avoid: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
            Scanner de Produto
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!result ? (
          <Card className="border-rose-200 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-rose-500" />
                Análise com IA
              </CardTitle>
              <CardDescription>
                Tire uma foto ou faça upload de um produto de skincare
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {imagePreview && (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}

                {analyzing && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Analisando produto com IA...</p>
                  </div>
                )}

                {!analyzing && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border-2 border-dashed border-rose-200 rounded-lg p-8 text-center hover:border-rose-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="camera-input"
                        disabled={loading}
                      />
                      <label htmlFor="camera-input" className="cursor-pointer">
                        <Camera className="w-12 h-12 mx-auto mb-3 text-rose-400" />
                        <p className="text-sm font-medium">Tirar Foto</p>
                      </label>
                    </div>

                    <div className="border-2 border-dashed border-purple-200 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="upload-input"
                        disabled={loading}
                      />
                      <label htmlFor="upload-input" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                        <p className="text-sm font-medium">Fazer Upload</p>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {imagePreview && (
              <Card className="border-gray-200">
                <CardContent className="pt-6">
                  <img src={imagePreview} alt="Produto" className="w-full h-48 object-contain rounded-lg" />
                </CardContent>
              </Card>
            )}

            <Card className={`border-2 ${compatibilityConfig[result.compatibility].border}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{result.product_name}</CardTitle>
                    <CardDescription className="mt-2">
                      <Badge variant="outline" className="capitalize">
                        {result.product_type}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className={`p-3 rounded-full ${compatibilityConfig[result.compatibility].bg}`}>
                    {(() => {
                      const Icon = compatibilityConfig[result.compatibility].icon
                      return <Icon className={`w-6 h-6 ${compatibilityConfig[result.compatibility].color}`} />
                    })()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Ativos Principais</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.key_actives.map((active, i) => (
                      <Badge key={i} variant="secondary">{active}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Para que serve</h3>
                  <p className="text-gray-700">{result.purpose}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Como usar</h3>
                  <p className="text-gray-700">{result.instructions}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Quando usar</h3>
                  <Badge className="capitalize">{result.when_to_use}</Badge>
                </div>

                <div className={`p-4 rounded-lg ${compatibilityConfig[result.compatibility].bg}`}>
                  <h3 className="font-semibold mb-2">Compatibilidade com seu perfil</h3>
                  <p className="text-sm text-gray-700">{result.reason}</p>
                </div>

                {result.recommended_alternative && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold mb-2">Alternativa Recomendada</h3>
                    <p className="text-sm text-gray-700 mb-2">{result.recommended_alternative.why}</p>
                    <p className="text-sm font-medium">Tipo: {result.recommended_alternative.type}</p>
                    <p className="text-sm text-gray-600">Faixa de preço: {result.recommended_alternative.price_hint}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setResult(null)
                      setImagePreview(null)
                    }}
                  >
                    Escanear Outro
                  </Button>
                  {result.compatibility !== 'avoid' && (
                    <Button
                      className="flex-1 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700"
                      onClick={handleAddToRoutine}
                      disabled={loading}
                    >
                      {loading ? 'Adicionando...' : 'Adicionar à Rotina'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
