import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
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
    const user = await getAuthUser(req, res)
    const { id } = req.query
    const { contactIds } = req.body

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid campaign ID' })
    }

    console.log(`[Generate] Request received for campaign ${id} with ${contactIds?.length} contacts`)

    // Verify campaign ownership
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (campaignError || !campaign) {
      console.error('[Generate] Campaign error:', campaignError)
      return res.status(403).json({ error: 'Campaign not found or unauthorized' })
    }

    // Get contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .in('id', contactIds || [])

    if (contactsError || !contacts || contacts.length === 0) {
      console.error('[Generate] No contacts found:', contactsError)
      return res.status(400).json({ error: 'No contacts found' })
    }


    // Fetch user details for signature
    const { data: userProfile } = await supabase
      .from('users')
      .select('name, company')
      .eq('id', user.id)
      .single()

    const senderName = userProfile?.name || 'Adjust Name'
    const senderCompany = userProfile?.company || ''

    console.log(`[Generate] Processing ${contacts.length} contacts`)
    let generated = 0

    // Define tone-specific instructions
    const toneInstructions = {
      professional: 'Use a professional, respectful tone. Be formal but warm.',
      direct: 'Be direct and to-the-point. Skip pleasantries. Focus on value.',
      friendly: 'Use a casual, friendly tone. Sound like a peer reaching out to help.',
    }

    const toneInstruction = toneInstructions[campaign.tone as keyof typeof toneInstructions] || toneInstructions.professional

    for (const contact of contacts) {
      console.log(`[Generate] Generating for contact ${contact.email}`)
      // Generate 5 variations per contact
      for (let i = 1; i <= 5; i++) {
        try {
          // Use custom AI prompt if provided, otherwise use default
          const systemPrompt = campaign.ai_prompt || `You are an expert cold email copywriter. Your goal is to generate high-converting cold email variations. ${toneInstruction}`

          const userPrompt = `Generate personalized cold email variation #${i}.

Context: ${campaign.context}
Recipient: ${contact.first_name} ${contact.last_name}
Company: ${contact.company}
Position: ${contact.position}
Subject Line Template: ${campaign.subject_line}
Tone: ${campaign.tone || 'professional'}

Sender Name: ${senderName}
Sender Company: ${senderCompany}

Requirements:
- Personalize with their name, company, and position
- Be concise (50-100 words)
- Include a clear CTA
- Sound natural, not templated
- Variation #${i} should have a DIFFERENT angle/hook than others
- Follow the ${campaign.tone || 'professional'} tone
- **Sign off with my name: ${senderName}**
- **Do NOT use placeholders like [Your Name] or [Company Name]. Use the real sender info provided above.**

Return ONLY valid JSON in this format:
{
  "subject": "Email Subject",
  "body": "Email Body Content"
}`

          console.log(`[Generate] Calling Anthropic for var ${i}...`)
          const message = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
          })

          // Extract text content safely
          const contentBlock = message.content[0]

          if (!contentBlock || contentBlock.type !== 'text') {
            throw new Error('No text response from Claude')
          }

          let content = contentBlock.text

          // Clean up potential markdown code blocks if Claude adds them
          content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '')

          const parsed = JSON.parse(content)

          // ---------------------------------------------------------
          // SAFEGUARD: Post-processing to remove any stubborn placeholders
          // ---------------------------------------------------------
          const replacePlaceholders = (text: string) => {
            if (!text) return ''
            let processed = text

            const namePlaceholders = ['[Your Name]', '[My Name]', '[Sender Name]', '[Name]', '[your name]']
            const companyPlaceholders = ['[Your Company]', '[My Company]', '[Sender Company]', '[Company Name]', '[your company]']

            namePlaceholders.forEach(p => {
              processed = processed.split(p).join(senderName)
            })

            companyPlaceholders.forEach(p => {
              processed = processed.split(p).join(senderCompany)
            })

            return processed
          }

          parsed.subject = replacePlaceholders(parsed.subject)
          parsed.body = replacePlaceholders(parsed.body)
          // ---------------------------------------------------------

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
          console.log(`[Generate] Success var ${i}`)
        } catch (error) {
          console.error(`[Generate] Error generating variation ${i} for contact ${contact.id}:`, error)
        }
      }
    }

    res.json({
      generated,
      message: `Generated ${generated} email variations`,
    })
  } catch (error: any) {
    console.error('[Generate] Fatal error:', error)
    res.status(500).json({ error: error.message })
  }
}
