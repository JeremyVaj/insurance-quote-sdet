// Cloudflare Worker - Mock Rating Engine API


export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    try {
      const body = await request.json();
      const { revenue, state, business } = body;

      // Validation - missing fields
      if (revenue === undefined || !state || !business) {
        return new Response(
          JSON.stringify({ 
            error: 'Missing required fields',
            message: 'Revenue, state, and business are required'
          }), 
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      // Validation - invalid revenue
      if (typeof revenue !== 'number' || revenue < 0) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid revenue',
            message: 'Revenue must be a positive number'
          }), 
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      // Validation - invalid state
      const validStates = ['CA', 'TX', 'NY', 'WI', 'OH', 'IL', 'NV'];
      if (!validStates.includes(state.toUpperCase())) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid state',
            message: 'State must be one of: CA, TX, NY, WI, OH, IL, NV'
          }), 
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      // Validation - invalid business type
      const validBusinessTypes = ['retail', 'restaurant', 'professional', 'manufacturing'];
      if (!validBusinessTypes.includes(business.toLowerCase())) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid business type',
            message: 'Business must be one of: retail, restaurant, professional, manufacturing'
          }), 
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      // Calculate premium based on revenue and business type
      // This is a simplified rating algorithm for demo purposes
      let baseRate = 0.025; // 2.5% of revenue
      
      // Business type multipliers
      const businessMultipliers = {
        'retail': 1.0,
        'restaurant': 1.3,
        'professional': 0.8,
        'manufacturing': 1.5
      };

      // State multipliers
      const stateMultipliers = {
        'CA': 1.2,
        'TX': 1.0,
        'NY': 1.3,
        'WI': 0.9,
        'OH': 0.85,
        'IL': 1.1,
        'NV': 1.15
      };

      const businessMultiplier = businessMultipliers[business.toLowerCase()];
      const stateMultiplier = stateMultipliers[state.toUpperCase()];
      
      const premium = Math.round(revenue * baseRate * businessMultiplier * stateMultiplier * 100) / 100;

      // Generate a quote ID
      const quoteId = `Q-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Return the quote
      return new Response(
        JSON.stringify({
          premium: premium,
          quoteId: quoteId,
          calculatedAt: new Date().toISOString()
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};
