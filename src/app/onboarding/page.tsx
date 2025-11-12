'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { generateInitialRoutine } from '@/lib/openai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, Upload } from 'lucide-react'
import { SkinType } from '@/types'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const [skinType, setSkinType] = useState<SkinType>('combination')
  const [age, setAge] = useState('')
  const [concerns, setConcerns] = useState('')
  const [budget, setBudget] = useState('')
  const [products, setProducts] = useState('')
  const [beforePhoto, setBeforePhoto] = useState<File | null>(null)

  async function handleNext() {
    if (step < 3) {
      setStep(step + 1)
    } else {
      await handleComplete()
    }
  }

  async function handleComplete() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      // Salvar perfil
      const concernsArray = concerns.split(',').map(c => c.trim()).filter(Boolean)
      const { error: profileError } = await supabase
        .from('skin_profiles')
        .insert({
          user_id: user.id,
          skin_type: skinType,
          age: age ? parseInt(age) : null,
          concerns: concernsArray,
          budget_monthly: budget ? parseFloat(budget) : null,
        })

      if (profileError) throw profileError

      // Upload foto "antes" se fornecida
      if (beforePhoto) {
        const fileName = `${user.id}/${Date.now()}_${beforePhoto.name}`
        const { error: uploadError } = await supabase.storage
          .from('profile_photos')
          .upload(fileName, beforePhoto)

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('profile_photos')
            .getPublicUrl(fileName)

          await supabase.from('photos').insert({
            user_id: user.id,
            kind: 'before',
            image_url: publicUrl,
          })
        }
      }

      // Gerar rotina inicial com IA
      const productsArray = products.split(',').map(p => ({
        name: p.trim(),
        category: 'other' as const
      })).filter(p => p.name)

      const routineData = await generateInitialRoutine(
        { skin_type: skinType, age: parseInt(age), concerns: concernsArray, budget_monthly: parseFloat(budget) },
        productsArray
      )

      // Salvar rotinas no banco
      for (const dayRoutine of routineData.routines || []) {
        for (const period of ['morning', 'night'] as const) {
          const steps = dayRoutine[period] || []
          if (steps.length === 0) continue

          const { data: routine } = await supabase
            .from('routines')
            .insert({
              user_id: user.id,
              day_of_week: dayRoutine.day,
              period,
            })
            .select()
            .single()

          if (routine) {
            for (let i = 0; i < steps.length; i++) {
              const step = steps[i]
              await supabase.from('routine_items').insert({
                routine_id: routine.id,
                step_order: i,
                step_type: step.step_type,
                ai_notes: `${step.product_suggestion}\n${step.instructions}\n${step.notes}`,
              })
            }
          }
        }
      }

      router.push('/')
    } catch (err: any) {
      alert('Erro ao salvar perfil: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-rose-200 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-rose-500 to-purple-600 rounded-full">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Bem-vindo ao SkinGuide AI</CardTitle>
          <CardDescription>
            Etapa {step} de 3 - Vamos personalizar sua experiência
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Qual é o seu tipo de pele?</Label>
                <RadioGroup value={skinType} onValueChange={(v) => setSkinType(v as SkinType)}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-rose-50 transition-colors">
                    <RadioGroupItem value="oily" id="oily" />
                    <Label htmlFor="oily" className="cursor-pointer flex-1">Oleosa</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-rose-50 transition-colors">
                    <RadioGroupItem value="dry" id="dry" />
                    <Label htmlFor="dry" className="cursor-pointer flex-1">Seca</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-rose-50 transition-colors">
                    <RadioGroupItem value="combination" id="combination" />
                    <Label htmlFor="combination" className="cursor-pointer flex-1">Mista</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-rose-50 transition-colors">
                    <RadioGroupItem value="sensitive" id="sensitive" />
                    <Label htmlFor="sensitive" className="cursor-pointer flex-1">Sensível</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Idade (opcional)</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Ex: 25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="border-rose-200"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="concerns">Quais são suas preocupações? (separadas por vírgula)</Label>
                <Textarea
                  id="concerns"
                  placeholder="Ex: acne, manchas, rugas, poros dilatados"
                  value={concerns}
                  onChange={(e) => setConcerns(e.target.value)}
                  className="border-rose-200 min-h-24"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Orçamento mensal (opcional)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="Ex: 100"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="border-rose-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="products">Produtos que já usa (opcional, separados por vírgula)</Label>
                <Textarea
                  id="products"
                  placeholder="Ex: Cleanser CeraVe, Protetor Solar La Roche"
                  value={products}
                  onChange={(e) => setProducts(e.target.value)}
                  className="border-rose-200 min-h-24"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Foto "Antes" (opcional)</Label>
                <p className="text-sm text-gray-600">
                  Tire uma foto do seu rosto para acompanhar sua evolução
                </p>
                <div className="border-2 border-dashed border-rose-200 rounded-lg p-8 text-center hover:border-rose-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBeforePhoto(e.target.files?.[0] || null)}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-rose-400" />
                    <p className="text-sm font-medium">
                      {beforePhoto ? beforePhoto.name : 'Clique para fazer upload'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Você pode pular esta etapa
                    </p>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
                disabled={loading}
              >
                Voltar
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700"
              disabled={loading}
            >
              {loading ? 'Processando...' : step === 3 ? 'Finalizar' : 'Próximo'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
