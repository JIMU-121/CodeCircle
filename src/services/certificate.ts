import { supabase } from '../lib/supabase'
import { Event, EventParticipant } from '../types'

export class CertificateService {
  static async generateCertificate(participantId: string) {
    try {
      // Get participant and event details
      const { data: participant, error: participantError } = await supabase
        .from('event_participants')
        .select(`
          *,
          events (
            title,
            start_date,
            end_date
          ),
          profiles (
            full_name,
            email
          )
        `)
        .eq('id', participantId)
        .single()

      if (participantError) throw participantError

      // Generate certificate URL (you would implement actual certificate generation here)
      const certificateUrl = await this.generateCertificateFile(participant)

      // Update participant record with certificate
      const { error: updateError } = await supabase
        .from('event_participants')
        .update({
          certificate_generated: true,
          certificate_url: certificateUrl
        })
        .eq('id', participantId)

      if (updateError) throw updateError

      // Create certificate record
      const { data: certificate, error: certificateError } = await supabase
        .from('certificates')
        .insert({
          participant_id: participantId,
          event_id: participant.event_id,
          certificate_url: certificateUrl
        })
        .select()
        .single()

      if (certificateError) throw certificateError

      return certificate
    } catch (error) {
      console.error('Error generating certificate:', error)
      throw error
    }
  }

  private static async generateCertificateFile(participant: EventParticipant & { 
    events: Event, 
    profiles: { full_name: string; email: string } 
  }) {
    // This is where you would implement actual certificate generation
    // You could use libraries like PDFKit, or call an external API
    // For now, we'll return a dummy URL
    return `https://your-certificate-service.com/certificates/${participant.id}`
  }
} 