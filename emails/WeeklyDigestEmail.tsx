import { AITool, Internship, Hackathon } from "../src/types";

/**
 * Weekly Digest Email Builder.
 * Generates beautiful HTML summary of indexed items.
 */

export function buildWeeklyDigestEmailHtml(
  userName: string,
  newTools: AITool[],
  newInternships: Internship[],
  newHackathons: Hackathon[]
): string {
  const currentYear = new Date().getFullYear();

  const renderTools = newTools.slice(0, 3).map(tool => `
    <div style="border-left: 3px solid #6366f1; padding-left: 15px; margin-bottom: 20px;">
      <h4 style="margin: 0; color: #ffffff; font-size: 14px;">${tool.name} <span style="background: rgba(99,102,241,0.15); color: #818cf8; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 5px;">${tool.pricing}</span></h4>
      <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 12px; line-height: 1.4;">${tool.description}</p>
    </div>
  `).join("");

  const renderInternships = newInternships.slice(0, 3).map(intern => `
    <div style="border-left: 3px solid #10b981; padding-left: 15px; margin-bottom: 20px;">
      <h4 style="margin: 0; color: #ffffff; font-size: 14px;">${intern.role} &middot; <span style="color: #10b981;">${intern.company}</span></h4>
      <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 12px; line-height: 1.4;">
        <strong>Stipend:</strong> ${intern.stipend} | <strong>Location:</strong> ${intern.location} (${intern.is_remote ? 'Remote' : 'Onsite'})
      </p>
    </div>
  `).join("");

  const renderHackathons = newHackathons.slice(0, 3).map(hack => `
    <div style="border-left: 3px solid #f59e0b; padding-left: 15px; margin-bottom: 20px;">
      <h4 style="margin: 0; color: #ffffff; font-size: 14px;">${hack.name} &middot; <span style="color: #f59e0b;">Pool: ${hack.prize_pool}</span></h4>
      <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 12px; line-height: 1.4;">
        <strong>Organizer:</strong> ${hack.organizer} | <strong>Due Date:</strong> ${hack.deadline}
      </p>
    </div>
  `).join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Weekly AI & Career Digest</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background-color: #0b0f19;
          margin: 0;
          padding: 0;
          color: #f1f5f9;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 16px;
          overflow: hidden;
        }
        .header {
          padding: 30px;
          background: #020617;
          border-b: 1px solid #1e293b;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 22px;
          font-weight: 850;
          color: #ffffff;
        }
        .body {
          padding: 30px;
        }
        .section-header {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #64748b;
          margin: 30px 0 15px 0;
          border-bottom: 1px dashed #1e293b;
          padding-bottom: 5px;
        }
        .footer {
          background-color: #020617;
          text-align: center;
          padding: 25px;
          font-size: 11px;
          color: #64748b;
          border-top: 1px solid #1e293b;
        }
        .footer a {
          color: #6366f1;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Weekly Directory Digest</h1>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">The latest indexed assets on Student AI Hub</p>
        </div>
        <div class="body">
          <p style="font-size: 14px; margin-top: 0;">Hey ${userName},</p>
          <p style="font-size: 14px; line-height: 1.5; color: #94a3b8;">Here is your curated weekly briefing of fresh tools, placements, and code sprints indexed over the last 7 days.</p>
          
          ${newTools.length > 0 ? `
            <div class="section-header">Newly Indexed AI Tools</div>
            ${renderTools}
          ` : ""}

          ${newInternships.length > 0 ? `
            <div class="section-header">Spotlight Internships</div>
            ${renderInternships}
          ` : ""}

          ${newHackathons.length > 0 ? `
            <div class="section-header">Active Hackathons</div>
            ${renderHackathons}
          ` : ""}

          <div style="text-align: center; margin-top: 40px;">
            <a href="https://studentaihub.org" style="background: #4f46e5; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 30px; border-radius: 8px;" target="_blank">View Your Dashboard</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${currentYear} Student AI Hub. All rights reserved.</p>
          <p>Too much email? <a href="https://studentaihub.dev/dashboard">Unsubscribe</a> or adapt notifications.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
