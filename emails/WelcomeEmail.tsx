/**
 * Renders the Welcome Newsletter Email template as safe responsive HTML
 */

export function buildWelcomeEmailHtml(userName: string): string {
  const currentYear = new Date().getFullYear();
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Student AI Hub</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background-color: #0b0f19;
          margin: 0;
          padding: 0;
          color: #f1f5f9;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .header {
          padding: 40px 30px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.05em;
          color: #ffffff;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 14px;
          color: #c7d2fe;
          font-weight: 500;
        }
        .content {
          padding: 40px 30px;
        }
        .content h2 {
          font-size: 20px;
          font-weight: 700;
          margin-top: 0;
          color: #ffffff;
        }
        .content p {
          font-size: 15px;
          line-height: 1.6;
          color: #94a3b8;
          margin-bottom: 24px;
        }
        .cta-btn {
          display: inline-block;
          background-color: #6366f1;
          color: #ffffff;
          text-decoration: none;
          padding: 14px 30px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 40px;
        }
        .cta-btn:hover {
          background-color: #4f46e5;
        }
        .features-grid {
          border-top: 1px solid #1e293b;
          padding-top: 30px;
          margin-top: 30px;
        }
        .feature-item {
          margin-bottom: 20px;
        }
        .feature-item h3 {
          font-size: 14px;
          font-weight: 700;
          color: #818cf8;
          margin: 0 0 4px 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .feature-item p {
          font-size: 13px;
          margin: 0;
          line-height: 1.4;
          color: #94a3b8;
        }
        .footer {
          background-color: #020617;
          text-align: center;
          padding: 30px;
          font-size: 12px;
          color: #64748b;
          border-top: 1px solid #1e293b;
        }
        .footer a {
          color: #6366f1;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Student AI Hub</h1>
          <p>Your Ultimate Co-Pilot for Opportunities & Engineering</p>
        </div>
        <div class="content">
          <h2>Welcome aboard, ${userName}!</h2>
          <p>We are absolutely thrilled to welcome you to the <strong>Student AI Hub</strong> ecosystem. Our sole mission is to supercharge your college-to-career journey with bleeding-edge AI models, fully curated internships databases, and prime hackathons alerts.</p>
          
          <a href="https://studentaihub.dev" class="cta-btn" target="_blank">Launch Workspace Console</a>

          <div class="features-grid">
            <h2 style="font-size: 16px; color: #ffffff; padding-bottom: 10px;">Three things you can do today:</h2>
            
            <div class="feature-item">
              <h3>1. Query the AI Coder Assistant</h3>
              <p>Our context-aware AI coding expert answers difficult homework questions, builds small scripts, and guides code reviews.</p>
            </div>
            
            <div class="feature-item">
              <h3>2. Scout Verified Internships</h3>
              <p>Skip the ghost listings. Dive into our live catalog of hand-verified placements spanning OpenAI, Vercel, and deep-tech fields.</p>
            </div>
            
            <div class="feature-item">
              <h3>3. Pin Registered Hackathons</h3>
              <p>Track prize deadlines and find eligibility blueprints to ensure your code projects yield maximum returns.</p>
            </div>
          </div>
        </div>
        <div class="footer">
          <p>Sent to you by the team at Student AI Hub.</p>
          <p>© ${currentYear} Student AI Hub. All rights reserved.</p>
          <p>Want to adjust your notifications? <a href="https://studentaihub.dev/dashboard">Manage Preferences</a> or <a href="https://studentaihub.dev/unsubscribe?email=${encodeURIComponent(userName)}">Unsubscribe</a>.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
