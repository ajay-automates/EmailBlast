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


    // Fetch company profile for personalization
    const { data: companyProfile } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Fallback to users table if no company profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('name, company')
      .eq('id', user.id)
      .single()

    const senderName = companyProfile?.sender_name || userProfile?.name || 'Your Name'
    const senderTitle = companyProfile?.sender_title || ''
    const senderCompany = companyProfile?.company_name || userProfile?.company || ''
    const companyTagline = companyProfile?.tagline || ''
    const companyServices = companyProfile?.services?.filter(Boolean).join('\n- ') || ''
    const keyResults = companyProfile?.key_results?.filter(Boolean).join('\n- ') || ''
    const calendarLink = companyProfile?.calendar_link || ''
    const senderPhone = companyProfile?.sender_phone || ''

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
          // Use custom AI prompt if provided, otherwise use default with strong instructions
          const systemPrompt = campaign.ai_prompt || `You are an expert cold email copywriter. 

CRITICAL RULES:
1. ALWAYS use the EXACT sender name provided - NEVER use placeholders
2. Include company information naturally in the email body
3. Mention specific services or results when relevant to the recipient
4. ${toneInstruction}
5. Every email MUST be signed with the sender's real name and title`

          const userPrompt = `Generate personalized cold email variation #${i}.

========================================
SENDER INFORMATION (YOU - USE THIS EXACT INFO):
========================================
Name: ${senderName}
Title: ${senderTitle || 'N/A'}
Company: ${senderCompany}
${companyTagline ? `Tagline: ${companyTagline}` : ''}
${senderPhone ? `Phone: ${senderPhone}` : ''}
${calendarLink ? `Calendar: ${calendarLink}` : ''}

${companyServices ? `What We Do:\n${companyServices}` : ''}

${keyResults ? `Our Results:\n${keyResults}` : ''}

========================================
RECIPIENT INFORMATION:
========================================
Name: ${contact.first_name} ${contact.last_name}
Company: ${contact.company}
Position: ${contact.position}

========================================
CAMPAIGN CONTEXT:
========================================
${campaign.context}

Subject Line Template: ${campaign.subject_line}
Tone: ${campaign.tone || 'professional'}

========================================
INSTRUCTIONS:
========================================
1. Write a ${campaign.tone || 'professional'} email to ${contact.first_name}
2. Reference YOUR company (${senderCompany}) and what you do
3. If relevant, mention one of your services or results
4. Keep it 50-100 words
5. Include a clear call-to-action${calendarLink ? ` (you can include the calendar link)` : ''}
6. Make variation #${i} have a DIFFERENT angle than other variations
7. SIGN OFF with your EXACT name: ${senderName}${senderTitle ? `, ${senderTitle}` : ''}

CRITICAL: Do NOT use ANY placeholders like [Your Name], [Company], etc. 
Use the REAL information provided above.

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

            // Comprehensive list of all possible placeholders
            const namePlaceholders = [
              '[Your Name]', '[My Name]', '[Sender Name]', '[Name]', '[your name]',
              '{{senderName}}', 'Adjust Name', '[Adjust Name]', 'Your Name',
              '[Insert Name]', '[SENDER_NAME]', 'SENDER_NAME'
            ]
            const titlePlaceholders = [
              '[Your Title]', '[My Title]', '[Sender Title]', '{{senderTitle}}',
              '[Your Position]', '[Position]', 'Your Title'
            ]
            const companyPlaceholders = [
              '[Your Company]', '[My Company]', '[Sender Company]', '[Company Name]',
              '[your company]', '{{companyName}}', 'Your Company', '[Company]',
              '[INSERT_COMPANY]', 'COMPANY_NAME'
            ]
            const taglinePlaceholders = [
              '[Your Tagline]', '[Tagline]', '{{tagline}}', 'Your Tagline'
            ]
            const calendarPlaceholders = [
              '[Calendar Link]', '[Booking Link]', '{{calendarLink}}',
              '[Your Calendar]', '[Schedule Link]'
            ]
            const phonePlaceholders = [
              '[Your Phone]', '[Phone]', '{{senderPhone}}', '[Phone Number]',
              'Your Phone', '[Contact Number]'
            ]

            // Replace all name placeholders
            namePlaceholders.forEach(p => {
              const regex = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
              processed = processed.replace(regex, senderName)
            })

            // Replace title placeholders
            if (senderTitle) {
              titlePlaceholders.forEach(p => {
                const regex = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
                processed = processed.replace(regex, senderTitle)
              })
            }

            // Replace company placeholders
            companyPlaceholders.forEach(p => {
              const regex = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
              processed = processed.replace(regex, senderCompany)
            })

            // Replace tagline placeholders
            if (companyTagline) {
              taglinePlaceholders.forEach(p => {
                const regex = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
                processed = processed.replace(regex, companyTagline)
              })
            }

            // Replace calendar placeholders
            if (calendarLink) {
              calendarPlaceholders.forEach(p => {
                const regex = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
                processed = processed.replace(regex, calendarLink)
              })
            }

            // Replace phone placeholders
            if (senderPhone) {
              phonePlaceholders.forEach(p => {
                const regex = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
                processed = processed.replace(regex, senderPhone)
              })
            }

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
