import { Internship } from "../src/types";

export function buildInternshipAlertEmailHtml(userName: string, internship: Internship): string {
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Placement: ${internship.role} at ${internship.company}</title>
      <style>
        body { font-family: -apple-system, system-ui, sans-serif; background-color: #0b0f19; color: #f1f5f9; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 40px auto; background-color: #0f172a; border-radius: 12px; border: 1px solid #1e293b; overflow: hidden; }
        .banner { background-color: #10b981; padding: 25px 30px; text-align: center; }
        .banner h1 { margin: 0; font-size: 20px; color: #ffffff; }
        .body { padding: 30px; }
        .card { background-color: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .btn { display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 25px; font-weight: bold; border-radius: 6px; }
        .footer { text-align: center; padding: 20px; color: #475569; font-size: 11px; border-top: 1px solid #1e293b; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="banner">
          <h1>New Placement Alert!</h1>
        </div>
        <div class="body">
          <p>Hi ${userName},</p>
          <p>A high-priority student internship has just been indexed matching your technology profile.</p>
          
          <div class="card">
            <h3 style="margin: 0; font-size: 18px; color: #ffffff;">${internship.role}</h3>
            <p style="margin: 5px 0 15px 0; font-size: 14px; color: #10b981; font-weight: bold;">${internship.company}</p>
            
            <p style="margin: 5px 0; font-size: 13px; color: #94a3b8;"><strong>Location:</strong> ${internship.location} (${internship.is_remote ? 'Remote ok' : 'Onsite'})</p>
            <p style="margin: 5px 0; font-size: 13px; color: #94a3b8;"><strong>Stipend:</strong> ${internship.stipend}</p>
            <p style="margin: 5px 0; font-size: 13px; color: #94a3b8;"><strong>Deadline:</strong> ${internship.deadline}</p>
            
            <p style="margin: 15px 0 0 0; font-size: 13px; color: #94a3b8;"><strong>Minimum criteria:</strong> ${internship.eligibility}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${internship.apply_url}" class="btn" target="_blank">Apply For Placement</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${currentYear} Student AI Hub. All rights reserved.</p>
          <p>You received this because you subscribed to placement email notifications.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
