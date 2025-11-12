import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function analyzeProductImage(imageUrl: string, userProfile: any) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a skincare expert AI. Analyze product images and provide detailed information in JSON format.
        
User Profile:
- Skin Type: ${userProfile.skin_type}
- Age: ${userProfile.age}
- Concerns: ${userProfile.concerns?.join(', ') || 'None'}
- Budget: $${userProfile.budget_monthly}/month

Return ONLY valid JSON with this exact structure:
{
  "product_name": "Full product name",
  "product_type": "cleanser|toner|serum|moisturizer|sunscreen|treatment|other",
  "key_actives": ["active1", "active2"],
  "purpose": "What it does and benefits",
  "when_to_use": "morning|night|both",
  "instructions": "How to apply and use",
  "compatibility": "good|neutral|avoid",
  "reason": "Why it's compatible or not with user profile",
  "recommended_alternative": {
    "type": "Alternative product type",
    "why": "Reason for alternative",
    "price_hint": "Price range"
  },
  "routine_step_type": "cleanse|treat|hydrate|spf|other"
}`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this skincare product and provide detailed information based on the user profile.'
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl }
          }
        ]
      }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 1000
  })

  return JSON.parse(response.choices[0].message.content || '{}')
}

export async function generateInitialRoutine(userProfile: any, existingProducts: any[]) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a skincare expert creating personalized weekly routines.

User Profile:
- Skin Type: ${userProfile.skin_type}
- Age: ${userProfile.age}
- Concerns: ${userProfile.concerns?.join(', ') || 'None'}
- Budget: $${userProfile.budget_monthly}/month
- Existing Products: ${existingProducts.map(p => `${p.name} (${p.category})`).join(', ') || 'None'}

Rules:
1. Morning: cleanse → treat → hydrate → SPF (always last)
2. Night: cleanse → treat → hydrate
3. Avoid mixing strong acids with retinoids in same session
4. Limit chemical exfoliants to 2-3x/week
5. Retinoids: gradual tolerance building
6. Consider user's skin type and concerns

Return JSON with this structure:
{
  "routines": [
    {
      "day": 0-6 (Sunday=0),
      "morning": [
        {
          "step_type": "cleanse|treat|hydrate|spf",
          "product_suggestion": "Product name or type",
          "instructions": "How to use",
          "notes": "Important info"
        }
      ],
      "night": [...]
    }
  ],
  "weekly_tips": ["tip1", "tip2"],
  "warnings": ["warning1", "warning2"]
}`
      },
      {
        role: 'user',
        content: 'Create a complete weekly skincare routine for this user.'
      }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 2000
  })

  return JSON.parse(response.choices[0].message.content || '{}')
}

export async function getPersonalizedTips(userProfile: any, recentProducts: any[]) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Generate 3-4 personalized skincare tips based on user profile and recent products.
        
User Profile:
- Skin Type: ${userProfile.skin_type}
- Concerns: ${userProfile.concerns?.join(', ') || 'None'}
- Recent Products: ${recentProducts.map(p => p.name).join(', ') || 'None'}

Return JSON: { "tips": ["tip1", "tip2", "tip3"] }`
      },
      {
        role: 'user',
        content: 'Generate personalized tips.'
      }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 500
  })

  return JSON.parse(response.choices[0].message.content || '{}')
}
