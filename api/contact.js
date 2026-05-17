export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name,
    business_name,
    phone,
    email,
    about_business,
    existing_site,
    subject,
    industry
  } = req.body;

  // Basic validation
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const pageSubject = subject || `New preview request from ${business_name || name}`;
  const industryTag = industry ? `[${industry}] ` : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #f4f4f8; margin: 0; padding: 32px 16px; }
    .card { background: #ffffff; border-radius: 12px; max-width: 560px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
    .header { background: linear-gradient(135deg, #3B5CE5, #6B3FFF); padding: 32px; text-align: center; }
    .header-logo { font-size: 24px; font-weight: 900; color: white; letter-spacing: -.5px; }
    .header-logo span { color: #A5B4FC; }
    .header-sub { font-size: 13px; color: rgba(255,255,255,.7); margin-top: 6px; }
    .body { padding: 32px; }
    .tag { display: inline-block; padding: 4px 12px; border-radius: 100px; background: #EEF2FF; color: #4F71FF; font-size: 12px; font-weight: 700; margin-bottom: 20px; }
    .field { margin-bottom: 18px; }
    .field-label { font-size: 11px; font-weight: 700; color: #9090A8; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 4px; }
    .field-value { font-size: 15px; color: #1a1a2e; font-weight: 500; }
    .field-value a { color: #4F71FF; }
    .divider { height: 1px; background: #f0f0f8; margin: 24px 0; }
    .message-box { background: #f8f8fc; border-left: 3px solid #4F71FF; border-radius: 0 8px 8px 0; padding: 16px; }
    .message-box p { margin: 0; font-size: 15px; color: #333; line-height: 1.7; }
    .footer { background: #f8f8fc; padding: 20px 32px; text-align: center; font-size: 12px; color: #9090A8; }
    .reply-btn { display: inline-block; margin-top: 24px; padding: 12px 28px; background: linear-gradient(135deg, #4F71FF, #7C3FF5); color: white; border-radius: 100px; font-size: 14px; font-weight: 700; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="header-logo">Site<span>zy</span></div>
      <div class="header-sub">New Preview Request</div>
    </div>
    <div class="body">
      ${industry ? `<span class="tag">${industry}</span>` : '<span class="tag">New Lead</span>'}

      <div class="field">
        <div class="field-label">Name</div>
        <div class="field-value">${name}</div>
      </div>

      ${business_name ? `
      <div class="field">
        <div class="field-label">Business Name</div>
        <div class="field-value">${business_name}</div>
      </div>` : ''}

      <div class="field">
        <div class="field-label">Email</div>
        <div class="field-value"><a href="mailto:${email}">${email}</a></div>
      </div>

      ${phone ? `
      <div class="field">
        <div class="field-label">Phone</div>
        <div class="field-value"><a href="tel:${phone}">${phone}</a></div>
      </div>` : ''}

      ${existing_site ? `
      <div class="field">
        <div class="field-label">Existing Website</div>
        <div class="field-value"><a href="${existing_site}" target="_blank">${existing_site}</a></div>
      </div>` : ''}

      ${about_business ? `
      <div class="divider"></div>
      <div class="field">
        <div class="field-label">About Their Business</div>
        <div class="message-box"><p>${about_business.replace(/\n/g, '<br>')}</p></div>
      </div>` : ''}

      <div style="text-align:center">
        <a href="mailto:${email}" class="reply-btn">Reply to ${name} →</a>
      </div>
    </div>
    <div class="footer">
      Sent via sitezy.co · ${new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
    </div>
  </div>
</body>
</html>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Sitezy <hello@sitezy.co>',
        to: ['hello@sitezy.co'],
        reply_to: email,
        subject: `${industryTag}${pageSubject}`,
        html: html
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
