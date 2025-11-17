import { EmailRecord } from "./types";

export const sampleInbox: EmailRecord[] = [
  {
    id: "1",
    sender: "ceo@strategicpartners.com",
    subject: "Quarterly partnership review meeting",
    body: `Hi Alex,

We would like to schedule our quarterly partnership review to align on the roadmap, ensure compliance with the latest contractual obligations, and confirm the invoicing schedule for Q3. Please propose two time slots next week. In advance of the meeting, share the updated performance dashboard and a short summary of your strategic priorities.

Regards,
Patricia Gomez
Chief Strategy Officer`,
    receivedAt: "2024-03-12T09:15:00.000Z",
  },
  {
    id: "2",
    sender: "events@productlaunchhq.io",
    subject: "🌟 Don’t miss our mega summer sale!",
    body: `Hello!

You’re receiving this email because you signed up for our exclusive deals. Claim 65% off all accessories before midnight! If you’d rather not receive emails, click here.`,
    receivedAt: "2024-03-11T13:00:00.000Z",
    unsubscribeLink: "https://productlaunchhq.io/unsubscribe",
  },
  {
    id: "3",
    sender: "compliance@clientcorp.org",
    subject: "Urgent: Updated vendor due diligence questionnaire",
    body: `Dear Vendor Partner,

ClientCorp must complete the annual due diligence review for all strategic vendors. Submit the attached questionnaire and evidence of ISO 27001 compliance by Friday, March 15. Missing the deadline may cause a temporary suspension of purchase orders.

Sincerely,
Compliance Team`,
    receivedAt: "2024-03-11T08:30:00.000Z",
  },
  {
    id: "4",
    sender: "newsletter@growthhacksdaily.com",
    subject: "10 AI tools to grow your marketing list 🚀",
    body: `Hey there growth hacker,

Ready to 10x your reach? We curated the hottest AI tools that marketers rave about. Want fewer emails? Manage your subscription preferences here.`,
    receivedAt: "2024-03-10T19:20:00.000Z",
    unsubscribeLink: "https://growthhacksdaily.com/unsubscribe",
  },
  {
    id: "5",
    sender: "board@nonprofitalliance.org",
    subject: "Follow-up on grant disbursement documentation",
    body: `Good afternoon Alex,

Thank you for presenting the impact metrics last week. Please send the signed disbursement acknowledgement and the updated budget breakdown by Thursday so we can release the second tranche of funding.

Warm regards,
Board Secretariat`,
    receivedAt: "2024-03-09T15:45:00.000Z",
  },
];

