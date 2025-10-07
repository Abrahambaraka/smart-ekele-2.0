import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Add Deno type declaration for environment access
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const TWILIO_ACCOUNT_SID = Deno?.env?.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno?.env?.get('TWILIO_AUTH_TOKEN')
const TWILIO_PHONE_NUMBER = Deno?.env?.get('TWILIO_PHONE_NUMBER')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req?.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, message } = await req?.json()

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, message' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Ensure phone number is in WhatsApp format
    const whatsappNumber = to?.startsWith('whatsapp:') ? to : `whatsapp:${to}`

    // Create Twilio request
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
    const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
    
    const formData = new URLSearchParams({
      To: whatsappNumber,
      From: `whatsapp:${TWILIO_PHONE_NUMBER}`,
      Body: message
    })

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    })

    const data = await response?.json()

    if (!response?.ok) {
      console.error('Twilio API error:', data)
      return new Response(
        JSON.stringify({
          error: 'Failed to send WhatsApp message',
          details: data
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('WhatsApp message sent successfully:', data?.sid)
    return new Response(
      JSON.stringify({
        success: true,
        messageSid: data.sid,
        status: data.status
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})