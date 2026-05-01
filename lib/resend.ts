import { Resend } from 'resend'

let cachedClient: Resend | null = null

export function getResend(): Resend {
  if (cachedClient) return cachedClient
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  cachedClient = new Resend(key)
  return cachedClient
}

const INQUIRER_TYPE_LABELS: Record<string, string> = {
  hotel: 'Hotel or Property',
  club: 'Private Club',
  brand: 'Brand',
  creative: 'Creative / Model / Beauty',
  community: 'Community',
}

const FIELD_LABELS: Record<string, string> = {
  propertyName: 'Property name',
  spaceType: 'Type of space',
  activationTypes: 'Activation type',
  expectedAttendance: 'Expected attendance',
  eventTimeline: 'Event timeline',
  decisionTimeline: 'Decision timeline',
  budget: 'Budget',
  goals: 'Goals',
  additionalNotes: 'Additional notes',
  clubName: 'Club name',
  engagementType: 'Engagement type',
  brandName: 'Brand name',
  brandCategory: 'Brand category',
  pastActivation: 'Past activation',
  primaryRole: 'Primary role',
  workInterest: 'Looking to do',
  portfolioUrl: 'Portfolio',
  involvement: 'How they want to be involved',
  aboutYou: 'About them',
}

interface BuildEmailArgs {
  inquirerType: string
  contact: { name: string; email: string; phone: string; city: string; howHeard?: string }
  details: Record<string, unknown>
  fileUrls: string[]
  createdAt: string
}

export function buildTfrEmailHtml({
  inquirerType,
  contact,
  details,
  fileUrls,
  createdAt,
}: BuildEmailArgs): string {
  const detailRows = Object.entries(details)
    .filter(([, v]) => v !== '' && v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => {
      const label = FIELD_LABELS[k] ?? k
      const display = Array.isArray(v) ? v.join(', ') : String(v)
      return `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;color:#666;width:200px;vertical-align:top;">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;color:#000;">${escapeHtml(display)}</td></tr>`
    })
    .join('')

  const filesBlock =
    fileUrls.length > 0
      ? `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;color:#666;vertical-align:top;">Files</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">${fileUrls
          .map((url, i) => `<a href="${url}" style="color:#000;">File ${i + 1}</a>`)
          .join('<br/>')}</td></tr>`
      : ''

  return `<!doctype html>
<html>
<body style="margin:0;padding:32px;background:#fafafa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #eee;">
    <div style="padding:24px;border-bottom:1px solid #eee;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#999;">New inquiry</p>
      <h1 style="margin:0;font-size:24px;font-weight:400;color:#000;">${escapeHtml(INQUIRER_TYPE_LABELS[inquirerType] ?? inquirerType)} — ${escapeHtml(contact.name)}</h1>
    </div>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;color:#666;width:200px;">Email</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;"><a href="mailto:${encodeURIComponent(contact.email)}" style="color:#000;">${escapeHtml(contact.email)}</a></td></tr>
      <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;color:#666;">Phone</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">${escapeHtml(contact.phone)}</td></tr>
      <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;color:#666;">City</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">${escapeHtml(contact.city)}</td></tr>
      ${detailRows}
      ${filesBlock}
      <tr><td style="padding:8px 12px;font-size:13px;color:#666;">How heard</td><td style="padding:8px 12px;font-size:14px;">${escapeHtml(contact.howHeard ?? '—')}</td></tr>
      <tr><td style="padding:8px 12px;font-size:13px;color:#666;">Submitted</td><td style="padding:8px 12px;font-size:14px;">${escapeHtml(createdAt)}</td></tr>
    </table>
    <div style="padding:16px 24px;border-top:1px solid #eee;">
      <p style="margin:0;font-size:12px;color:#999;">Reply directly to this email to respond to ${escapeHtml(contact.name)}.</p>
    </div>
  </div>
</body>
</html>`
}

export function buildInquirerEmailHtml(name: string): string {
  return `<!doctype html>
<html>
<body style="margin:0;padding:32px;background:#fafafa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #eee;padding:32px;">
    <h1 style="margin:0 0 16px;font-size:28px;font-weight:400;color:#000;">You're in.</h1>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#333;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#333;">We've received your inquiry and will be in touch soon.</p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#333;">In the meantime, follow along at <a href="https://www.instagram.com/thefrontrowlv" style="color:#000;">@thefrontrowlv</a> for what's next.</p>
    <p style="margin:0;font-size:14px;color:#666;">— The Front Row</p>
  </div>
</body>
</html>`
}

function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

interface InviteArgs {
  displayName: string
  email: string
  tempPassword: string
  loginUrl: string
  invitedBy: string
}

export function buildAdminInviteHtml({
  displayName,
  email,
  tempPassword,
  loginUrl,
  invitedBy,
}: InviteArgs): string {
  return `<!doctype html>
<html>
<body style="margin:0;padding:32px;background:#fafafa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #eee;padding:32px;">
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#999;">The Front Row</p>
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:400;color:#000;">You've been added to admin</h1>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#333;">${escapeHtml(displayName) || 'Hi'},</p>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#333;">You've been invited to The Front Row admin panel by ${escapeHtml(invitedBy)}.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:8px 0;font-size:13px;color:#666;width:160px;">Login URL</td><td style="padding:8px 0;font-size:14px;"><a href="${loginUrl}" style="color:#000;">${escapeHtml(loginUrl)}</a></td></tr>
      <tr><td style="padding:8px 0;font-size:13px;color:#666;">Email</td><td style="padding:8px 0;font-size:14px;">${escapeHtml(email)}</td></tr>
      <tr><td style="padding:8px 0;font-size:13px;color:#666;">Temporary password</td><td style="padding:8px 0;font-size:14px;font-family:Menlo,Consolas,monospace;background:#f5f5f5;padding-left:8px;padding-right:8px;border-radius:4px;">${escapeHtml(tempPassword)}</td></tr>
    </table>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#333;">Please change your password right after your first login from /admin/settings.</p>
    <p style="margin:0;font-size:14px;color:#666;">— The Front Row</p>
  </div>
</body>
</html>`
}

export function buildAdminInviteText({
  displayName,
  email,
  tempPassword,
  loginUrl,
  invitedBy,
}: InviteArgs): string {
  return `${displayName || 'Hi'},

You've been invited to The Front Row admin panel by ${invitedBy}.

Login: ${loginUrl}
Email: ${email}
Temporary password: ${tempPassword}

Please change your password after your first login at /admin/settings.

— The Front Row`
}

interface ModelEmailArgs {
  fullName: string
  email: string
  phone: string
  city: string
  age: number
  heightCm: number
  bustCm: number
  waistCm: number
  hipsCm: number
  sizeTops: string
  sizeBottoms: string
  sizeDressSuit: string
  shoeSizeUs: number
  hairColor: string
  eyeColor: string
  modelingExperience: string
  hasAgency: boolean
  agencyName: string | null
  instagramHandle: string
  travelAvailability: string
  whyTfr: string
  photoUrls: { label: string; url: string }[]
  createdAt: string
}

function cmToFt(cm: number): string {
  const totalIn = cm / 2.54
  const ft = Math.floor(totalIn / 12)
  const inches = Math.round(totalIn - ft * 12)
  return `${ft}\u2032${inches}\u2033`
}

export function buildModelTfrEmailHtml(args: ModelEmailArgs): string {
  const photosBlock =
    args.photoUrls.length > 0
      ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">${args.photoUrls
          .map(
            (p) =>
              `<a href="${p.url}" style="display:inline-block;text-decoration:none;color:#000;font-size:12px;border:1px solid #eee;padding:6px 10px;border-radius:4px;">${escapeHtml(p.label)}</a>`,
          )
          .join('')}</div>`
      : ''

  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;font-size:12px;color:#666;width:180px;">${escapeHtml(label)}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;font-size:14px;color:#000;">${escapeHtml(value)}</td></tr>`

  return `<!doctype html>
<html><body style="margin:0;padding:32px;background:#fafafa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:680px;margin:0 auto;background:#fff;border:1px solid #eee;">
    <div style="padding:24px;border-bottom:1px solid #eee;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#999;">New model submission</p>
      <h1 style="margin:0;font-size:22px;font-weight:400;color:#000;">${escapeHtml(args.fullName)} — age ${args.age}</h1>
    </div>
    <div style="padding:16px 24px;">${photosBlock}</div>
    <table style="width:100%;border-collapse:collapse;">
      ${row('Email', args.email)}
      ${row('Phone', args.phone)}
      ${row('Location', args.city)}
      ${row('Height', `${cmToFt(args.heightCm)} (${args.heightCm} cm)`)}
      ${row('Bust / Waist / Hips', `${args.bustCm} / ${args.waistCm} / ${args.hipsCm} cm`)}
      ${row('Tops / Bottoms / Dress', `${args.sizeTops} / ${args.sizeBottoms} / ${args.sizeDressSuit}`)}
      ${row('Shoe (US)', String(args.shoeSizeUs))}
      ${row('Hair / Eye', `${args.hairColor} / ${args.eyeColor}`)}
      ${row('Agency', args.hasAgency ? args.agencyName || 'Yes' : 'No')}
      ${row('Travel', args.travelAvailability)}
      ${row('Instagram', '@' + args.instagramHandle)}
    </table>
    <div style="padding:16px 24px;border-top:1px solid #eee;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#999;">Experience</p>
      <p style="margin:0 0 16px;font-size:14px;color:#000;line-height:1.5;white-space:pre-wrap;">${escapeHtml(args.modelingExperience)}</p>
      ${
        args.whyTfr.trim()
          ? `<p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#999;">Why TFR</p>
      <p style="margin:0 0 16px;font-size:14px;color:#000;line-height:1.5;white-space:pre-wrap;">${escapeHtml(args.whyTfr)}</p>`
          : ''
      }
      <p style="margin:0;font-size:12px;color:#999;">Submitted ${escapeHtml(args.createdAt)}. Reply to this email to respond directly.</p>
    </div>
  </div>
</body></html>`
}

export function buildModelSubmitterEmailHtml(name: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:32px;background:#fafafa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #eee;padding:32px;">
    <h1 style="margin:0 0 16px;font-size:28px;font-weight:400;color:#000;">Submission received.</h1>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#333;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#333;">We review every submission carefully. If there&rsquo;s a fit for an upcoming production, we&rsquo;ll reach out directly.</p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#333;">In the meantime, follow along at <a href="https://www.instagram.com/thefrontrowlv" style="color:#000;">@thefrontrowlv</a> for casting calls and what&rsquo;s next.</p>
    <p style="margin:0;font-size:14px;color:#666;">— The Front Row</p>
  </div>
</body></html>`
}
