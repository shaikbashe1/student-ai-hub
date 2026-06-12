import { Hackathon } from "../src/types";

export function buildHackathonAlertEmailHtml(userName: string, hackathon: Hackathon): string {
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Hackathon: ${hackathon.name} by ${hackathon.organizer}</title>
      <style>
        body { font-family: -apple-system, system-ui, sans-serif; background-color: #0b0f19; color: #f1f5f9; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 40px auto; background-color: #0f172a; border-radius: 12px; border: 1px solid #1e293b; overflow: hidden; }
        .banner { background-color: #f59e0b; padding: 25px 30px; text-align: center; }
        .banner h1 { margin: 0; font-size: 20px; color: #ffffff; }
        .body { padding: 30px; }
        .card { background-color: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .btn { display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 12px 25px; font-weight: bold; border-radius: 6px; }
        .footer { text-align: center; padding: 20px; color: #475569; font-size: 11px; border-top: 1px solid #1e293b; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="banner">
          <h1>New Coding Event Sprint Alert!</h1>
        </div>
        <div class="body">
          <p>Hi ${userName},</p>
          <p>A new hackathon milestone has been indexed. Assemble your teams and formulate your blueprints!</p>
          
          <div class="card">
            <h3 style="margin: 0; font-size: 17px; color: #ffffff;">${hackathon.name}</h3>
            <p style="margin: 5px 0 15px 0; font-size: 13px; color: #f59e0b; font-weight: bold;">Organizer: ${hackathon.organizer}</p>
            
            <p style="margin: 5px 0; font-size: 13px; color: #94a3b8;"><strong>Prize Pool:</strong> ${hackathon.prize_pool}</p>
            <p style="margin: 5px 0; font-size: 13px; color: #94a3b8;"><strong>Registration Deadline:</strong> ${hackathon.deadline}</p>
            <p style="margin: 5px 0; font-size: 13px; color: #94a3b8;"><strong>Who can participate:</strong> ${hackathon.eligibility}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${hackathon.registration_url}" class="btn" target="_blank">Register Today</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${currentYear} Student AI Hub. All rights reserved.</p>
          <p>You received this because you requested hackathon and project alerts.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
