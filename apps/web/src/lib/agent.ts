const AGENT_URL = process.env.AGENT_URL || 'http://localhost:8000'

export async function generateResumeDraft(data: {
  user_profile: any
  base_resume_text: string
  job_description: string
  job_title: string
  company: string
}) {
  const res = await fetch(`${AGENT_URL}/v1/generate_resume`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error('Failed to generate resume draft')
  }

  return res.json()
}
