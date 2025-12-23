import { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { websiteUrl } = req.body

        if (!websiteUrl) {
            return res.status(400).json({ error: 'Website URL required' })
        }

        console.log('[Analyze Website] Fetching:', websiteUrl)

        // Fetch website content
        const response = await fetch(websiteUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; EmailBlast/1.0)',
            },
        })

        if (!response.ok) {
            throw new Error('Failed to fetch website')
        }

        const html = await response.text()

        // Extract text content (basic HTML stripping)
        const textContent = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 8000) // Limit for API

        console.log('[Analyze Website] Calling Claude...')

        // Use AI to analyze
        const message = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1024,
            messages: [
                {
                    role: 'user',
                    content: `Analyze this business website and extract key information. Return ONLY valid JSON in this exact format:
{
  "companyName": "string",
  "tagline": "one-line description",
  "description": "2-3 sentence summary",
  "services": ["service1", "service2"],
  "targetAudience": "who they serve",
  "uniqueValueProposition": "what makes them different",
  "industry": "industry category",
  "tone": "professional/friendly/direct/casual"
}

Website content:
${textContent}`,
                },
            ],
        })

        const contentBlock = message.content[0]
        if (!contentBlock || contentBlock.type !== 'text') {
            throw new Error('No text response from Claude')
        }

        let analysisText = contentBlock.text

        // Clean up potential markdown code blocks
        analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '')

        // Parse JSON
        let analysis
        try {
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
            analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
        } catch {
            analysis = {}
        }

        console.log('[Analyze Website] Success')

        return res.json({ analysis })
    } catch (error: any) {
        console.error('[Analyze Website] Error:', error)
        res.status(500).json({ error: 'Failed to analyze website' })
    }
}
