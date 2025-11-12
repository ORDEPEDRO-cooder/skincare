'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Routine, RoutineItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Sun, Moon, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

const STEP_ICONS = {
  cleanse: '🧼',
  treat: '💧',
  hydrate: '💦',
  spf: '☀️',
  other: '✨'
}

export default function RoutinePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())
  const [routines, setRoutines] = useState<{ morning?: Routine & { items: RoutineItem[] }, night?: Routine & { items: RoutineItem[] } }>({})
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadRoutines()
  }, [selectedDay])

  async function loadRoutines() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: routinesData } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', user.id)
      .eq('day_of_week', selectedDay)

    if (routinesData) {
      const morning = routinesData.find(r => r.period === 'morning')
      const night = routinesData.find(r => r.period === 'night')

      const result: any = {}

      if (morning) {
        const { data: items } = await supabase
          .from('routine_items')
          .select('*, product:products(*)')
          .eq('routine_id', morning.id)
          .order('step_order')
        result.morning = { ...morning, items: items || [] }
      }

      if (night) {
        const { data: items } = await supabase
          .from('routine_items')
          .select('*, product:products(*)')
          .eq('routine_id', night.id)
          .order('step_order')
        result.night = { ...night, items: items || [] }
      }

      setRoutines(result)
    }

    setLoading(false)
  }

  async function handleToggleComplete(itemId: string, routineItemId: string) {
    const newCompleted = new Set(completedItems)
    
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId)
    } else {
      newCompleted.add(itemId)
      
      // Log usage
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('usage_logs').insert({
          user_id: user.id,
          routine_item_id: routineItemId,
        })
      }
    }
    
    setCompletedItems(newCompleted)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-purple-50 via-white to-rose-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-500 to-rose-600 bg-clip-text text-transparent">
            Mapa de Rotina
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Day Selector */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {DAYS.map((day, index) => (
              <Button
                key={index}
                variant={selectedDay === index ? 'default' : 'outline'}
                className={selectedDay === index ? 'bg-gradient-to-r from-purple-500 to-rose-600' : ''}
                onClick={() => setSelectedDay(index)}
              >
                {day}
              </Button>
            ))}
          </div>
        </div>

        {/* Routines */}
        <Tabs defaultValue="morning" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="morning" className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              Manhã
            </TabsTrigger>
            <TabsTrigger value="night" className="flex items-center gap-2">
              <Moon className="w-4 h-4" />
              Noite
            </TabsTrigger>
          </TabsList>

          <TabsContent value="morning">
            {routines.morning ? (
              <div className="space-y-4">
                {routines.morning.items.map((item, index) => (
                  <Card key={item.id} className="border-purple-200 hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
                            {STEP_ICONS[item.step_type]}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-lg capitalize">
                                Passo {index + 1}: {item.step_type}
                              </h3>
                              {item.product && (
                                <p className="text-sm text-gray-600 mt-1">{item.product.name}</p>
                              )}
                            </div>
                            <Checkbox
                              checked={completedItems.has(item.id)}
                              onCheckedChange={() => handleToggleComplete(item.id, item.id)}
                              className="mt-1"
                            />
                          </div>
                          {item.ai_notes && (
                            <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">
                              {item.ai_notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-purple-200">
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600">Nenhuma rotina matinal configurada para este dia</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="night">
            {routines.night ? (
              <div className="space-y-4">
                {routines.night.items.map((item, index) => (
                  <Card key={item.id} className="border-rose-200 hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-2xl">
                            {STEP_ICONS[item.step_type]}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-lg capitalize">
                                Passo {index + 1}: {item.step_type}
                              </h3>
                              {item.product && (
                                <p className="text-sm text-gray-600 mt-1">{item.product.name}</p>
                              )}
                            </div>
                            <Checkbox
                              checked={completedItems.has(item.id)}
                              onCheckedChange={() => handleToggleComplete(item.id, item.id)}
                              className="mt-1"
                            />
                          </div>
                          {item.ai_notes && (
                            <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">
                              {item.ai_notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-rose-200">
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600">Nenhuma rotina noturna configurada para este dia</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
