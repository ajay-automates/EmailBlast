import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const config = {
  maxDuration: 300, // 5 minutes for Vercel
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getAuthUser(req)
    const { id } = req.query
    const { contactIds } = req.body

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid campaign ID' })
    }

    // Verify campaign ownership
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (campaignError || !campaign) {
      return res.status(403).json({ error: 'Campaign not found or unauthorized' })
    }

    // Get contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .in('id', contactIds || [])

    if (contactsError || !contacts || contacts.length === 0) {
      return res.status(400).json({ error: 'No contacts found' })
    }

    let generated = 0

    for (const contact of contacts) {
      // Generate 5 variations per contact
      for (let i = 1; i <= 5; i++) {
        try {
          const prompt = `You are an expert cold email copywriter. Generate a personalized cold email variation #${i}.

Context: ${campaign.context}
Recipient: ${contact.first_name} ${contact.last_name}
Company: ${contact.company}
Position: ${contact.position}
Subject Line Template: ${campaign.subject_line}

Requirements:
- Personalize with their name, company, and position
- Be concise (50-100 words)
- Include a clear CTA
- Sound natural, not templated
- Variation #${i} should have a DIFFERENT angle/hook than others

Return ONLY valid JSON:
{
  "subject": "...",
  "body": "..."
}`

          const message = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 300,
          })

          const content = message.choices[0].message.content
          if (!content) throw new Error('No response from OpenAI')

          const parsed = JSON.parse(content)

          // Save variation
          await supabase
            .from('email_variations')
            .insert({
              contact_id: contact.id,
              variation_number: i,
              subject: parsed.subject,
              body: parsed.body,
              personalization_data: {
                firstName: contact.first_name,
                lastName: contact.last_name,
                company: contact.company,
                position: contact.position,
              },
            })

          generated++
        } catch (error) {
          console.error(`Error generating variation ${i} for contact ${contact.id}:`, error)
        }
      }
    }

    res.json({
      generated,
      message: `Generated ${generated} email variations`,
    })
  } catch (error: any) {
    console.error('Generate variations error:', error)
    res.status(500).json({ error: error.message })
  }
}
