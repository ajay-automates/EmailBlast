import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'
import { Readable } from 'stream'
import csv from 'csv-parser'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getAuthUser(req, res)
    const { id } = req.query

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

    // Handle GET: List contacts
    if (req.method === 'GET') {
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('campaign_id', id)
        .order('imported_at', { ascending: false })

      if (contactsError) throw contactsError
      return res.json(contacts)
    }

    // Handle POST: Add contacts or Upload CSV
    const { csvData, contacts: manualContacts } = req.body

    // Case 1: Manual contacts array provided
    if (manualContacts && Array.isArray(manualContacts) && manualContacts.length > 0) {
      const contactsToInsert = manualContacts.map((c: any) => ({
        campaign_id: id,
        first_name: c.first_name || '',
        last_name: c.last_name || '',
        email: c.email || '',
        company: c.company || '',
        position: c.position || '',
      }))

      const { error: insertError } = await supabase
        .from('contacts')
        .insert(contactsToInsert)

      if (insertError) throw insertError

      return res.json({
        imported: contactsToInsert.length,
        message: `Successfully added ${contactsToInsert.length} contact(s)`
      })
    }

    // Case 2: CSV data provided
    if (!csvData) {
      return res.status(400).json({ error: 'No contact data provided (csvData or contacts array required)' })
    }

    const buffer = Buffer.from(csvData, 'base64')
    const stream = Readable.from([buffer])

    const contacts: any[] = []
    let rowCount = 0

    stream
      .pipe(csv())
      .on('data', (row) => {
        // Map CSV columns to contact fields
        contacts.push({
          campaign_id: id,
          first_name: row.first_name || row.firstName || '',
          last_name: row.last_name || row.lastName || '',
          email: row.email || '',
          company: row.company || '',
          position: row.position || row.title || '',
        })
        rowCount++
      })
      .on('end', async () => {
        if (contacts.length === 0) {
          return res.status(400).json({ error: 'No valid contacts in CSV' })
        }

        // Insert contacts into database
        const { error: insertError } = await supabase
          .from('contacts')
          .insert(contacts)

        if (insertError) throw insertError

        res.json({
          imported: contacts.length,
          message: `Successfully imported ${contacts.length} contacts`
        })
      })
      .on('error', (error) => {
        console.error('CSV parsing error:', error)
        res.status(400).json({ error: 'Failed to parse CSV' })
      })
  } catch (error: any) {
    console.error('Contacts API error:', error)
    res.status(500).json({ error: error.message })
  }
}
