import { InviteData, SendgridTemplateResult } from "../types"
import { escapeHtml, renderBaseLayout } from "./base-layout"

export function renderInvite(
  data: InviteData
): SendgridTemplateResult {
  const roleLabel = data.role ? ` as ${data.role}` : ""

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: #f1f5f9; color: #334155; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 6px 14px; border-radius: 9999px; margin-bottom: 12px;">
        Team Invitation
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">
        You've Been Invited to LaptopZone
      </h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b;">
        Join the team${escapeHtml(roleLabel)} on the LaptopZone management dashboard.
      </p>
    </div>

    <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 24px 0;">
      Hello,<br>
      You have been invited to join the <strong>LaptopZone</strong> administration team. Click the button below to accept the invitation and set up your account.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${escapeHtml(data.invite_url)}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-weight: 800; font-size: 14px; padding: 14px 32px; border-radius: 9999px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 3px solid #f97316;">
        Accept Invitation
      </a>
    </div>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 24px 0; font-size: 12px; color: #64748b; line-height: 1.6;">
      <strong style="color: #0f172a;">Direct Link:</strong><br>
      <a href="${escapeHtml(data.invite_url)}" target="_blank" style="color: #2563eb; word-break: break-all;">
        ${escapeHtml(data.invite_url)}
      </a>
    </div>
  `

  const subject = "Invitation to Join LaptopZone Admin"
  const html = renderBaseLayout({
    title: subject,
    previewText: "You have been invited to join the LaptopZone administration dashboard.",
    content,
  })

  const text = `LAPTOPZONE ZIMBABWE - TEAM INVITATION

You have been invited to join the LaptopZone administration team.

Accept your invitation here:
${data.invite_url}

LaptopZone Zimbabwe`

  return { subject, html, text }
}
