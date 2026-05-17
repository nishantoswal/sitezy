export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body — handle both JSON and form data
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }

  const {
    name,
    business_name,
    phone,
    email,
    about_business,
    existing_site,
    industry
  } = body || {};

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY not set');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const subject = industry
    ? `[${industry}] New preview request from ${business_name || name}`
    : `New preview request from ${business_name || name}`;

  const html = `<!DOCTYPE html>
<html>
<head>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#f4f4f8;margin:0;padding:32px 16px}
.card{background:#fff;border-radius:12px;max-width:560px;margin:0 auto;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.hd{background:linear-gradient(135deg,#3B5CE5,#6B3FFF);padding:28px;text-align:center}
.hd-logo{font-size:22px;font-weight:900;color:white;letter-spacing:-.5px}
.hd-logo span{color:#A5B4FC}
.hd-sub{font-size:13px;color:rgba(255,255,255,.7);margin-top:4px}
.bd{padding:28px}
.tag{display:inline-block;padding:4px 12px;border-radius:100px;background:#EEF2FF;color:#4F71FF;font-size:12px;font-weight:700;margin-bottom:18px}
.fl{margin-bottom:16px}
.fl-l{font-size:11px;font-weight:700;color:#9090A8;letter-spacing:.08em;text-transform:uppercase;margin-bottom:3px}
.fl-v{font-size:15px;color:#1a1a2e;font-weight:500}
.fl-v a{color:#4F71FF}
.divider{height:1px;background:#f0f0f8;margin:20px 0}
.msg{background:#f8f8fc;border-left:3px solid #4F71FF;border-radius:0 8px 8px 0;padding:14px}
.msg p{margin:0;font-size:15px;color:#333;line-height:1.7}
.ft{background:#f8f8fc;padding:16px 28px;text-align:center;font-size:12px;color:#9090A8}
.btn{display:inline-block;margin-top:20px;padding:12px 28px;background:linear-gradient(135deg,#4F71FF,#7C3FF5);color:white;border-radius:100px;font-size:14px;font-weight:700;text-decoration:none}
</style>
</head>
<body>
<div class="card">
  <div class="hd">
    <div class="hd-logo">Site<span>zy</span></div>
    <div class="hd-sub">New Preview Request ⚡</div>
  </div>
  <div class="bd">
    <span class="tag">${industry || 'New Lead'}</span>
    <div class="fl"><div class="fl-l">Name</div><div class="fl-v">${name}</div></div>
    ${business_name ? `<div class="fl"><div class="fl-l">Business</div><div class="fl-v">${business_name}</div></div>` : ''}
    <div class="fl"><div class="fl-l">Email</div><div class="fl-v"><a href="mailto:${email}">${email}</a></div></div>
    ${phone ? `<div class="fl"><div class="fl-l">Phone</div><div class="fl-v"><a href="tel:${phone}">${phone}</a></div></div>` : ''}
    ${existing_site ? `<div class="fl"><div class="fl-l">Existing Site</div><div class="fl-v"><a href="${existing_site}">${existing_site}</a></div></div>` : ''}
    ${about_business ? `<div class="divider"></div><div class="fl"><div class="fl-l">About Their Business</div><div class="msg"><p>${about_business.replace(/\n/g, '<br>')}</p></div></div>` : ''}
    <div style="text-align:center"><a href="mailto:${email}" class="btn">Reply to ${name} →</a></div>
  </div>
  <div class="ft">Sent via sitezy.co · ${new Date().toLocaleDateString('en-US', {weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
</div>
</body>
</html>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Sitezy <hello@sitezy.co>',
        to: ['hello@sitezy.co'],
        reply_to: email,
        subject: subject,
        html: html
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', JSON.stringify(data));
      return res.status(500).json({ error: 'Failed to send', detail: data });
    }

    return res.status(200).json({ success: true, id: data.id });

  } catch (err) {
    console.error('Handler error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
