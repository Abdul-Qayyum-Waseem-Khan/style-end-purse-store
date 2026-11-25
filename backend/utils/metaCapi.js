const crypto = require('crypto');

/**
 * Sends a server-side event to Meta Conversions API (CAPI)
 */
const sendMetaCAPIEvent = async (eventName, eventData, eventId, req) => {
  const PIXEL_ID = process.env.META_PIXEL_ID;
  const ACCESS_TOKEN = process.env.META_CAPI_TOKEN;

  if (!PIXEL_ID || !ACCESS_TOKEN) {
    return; // Silently skip if CAPI is not configured
  }

  try {
    // Hash helper for user data
    const hashData = (data) => {
      if (!data) return undefined;
      return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
    };

    let clientIpAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // Handle local IP formats or multiple forwarded IPs
    if (clientIpAddress && clientIpAddress.includes(',')) {
      clientIpAddress = clientIpAddress.split(',')[0].trim();
    }
    const clientUserAgent = req.headers['user-agent'];

    const { user, order, visitor } = eventData;

    // Build the User Data Object
    const userData = {
      client_ip_address: clientIpAddress,
      client_user_agent: clientUserAgent,
      em: hashData(user?.email),
      ph: hashData(order?.shippingAddress?.phone),
      fn: hashData(order?.shippingAddress?.fullName?.split(' ')[0]),
      ln: hashData(order?.shippingAddress?.fullName?.split(' ').slice(1).join(' ')),
      ct: hashData(order?.shippingAddress?.city),
      st: hashData(order?.shippingAddress?.province),
      zp: hashData(order?.shippingAddress?.postalCode),
      country: hashData('pk'), // Assuming Pakistan based on currency
    };

    // Include standard browser identifiers if available (FBP/FBC from cookies)
    if (req.cookies) {
      if (req.cookies._fbp) userData.fbp = req.cookies._fbp;
      if (req.cookies._fbc) userData.fbc = req.cookies._fbc;
    }

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_id: eventId,
          event_source_url: req.headers.referer || `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout`,
          user_data: userData,
          custom_data: {
            currency: 'PKR',
            value: order?.total || 0,
            content_ids: order?.items?.map(i => i.product.toString()),
            content_type: 'product',
          }
        }
      ]
    };

    // Use native fetch to avoid adding axios dependency if not present
    const response = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Meta CAPI Error:', errorText);
    }
  } catch (error) {
    console.error('Failed to send Meta CAPI event:', error.message);
  }
};

module.exports = { sendMetaCAPIEvent };
