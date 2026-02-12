// src/data/sample-candidates.ts

export interface Candidate {
  id: string
  filename: string
  uploadedAt: string
  rawText: string
  name?: string
}

export const sampleCandidates: Candidate[] = [
  {
    id: "sample-1",
    filename: "Santu_Pradhan_Resume_2025.docx",
    uploadedAt: new Date("2025-02-01T10:30:00").toISOString(),
    name: "Santu Pradhan",
    rawText: `Santu Pradhan

I am a senior software engineer with more than 7 years of work experience. 
My main area of experience is in modern full-stack development technologies 
with Node.js, Next js & Angular 2+ for Web Development. ...

EXPERIENCE
Soft Amass India — Full Stack Developer
NOVEMBER 2017 – SEPTEMBER 2021
Indusnet Technology — Full Stack Developer
SEPTEMBER 2021 - PRESENT

EDUCATION
Global Institute of Science & Technology, Haldia — BCA
2014 - 2017

SKILLS
HTML, CSS, JAVASCRIPT, TYPESCRIPT, ANGULAR 2+, REACT JS, NEXT JS, NODE.JS, NEST.JS, EXPRESS.JS, MONGODB, ...

Date : 22.05.2025
Place : Haldia, West Bengal
Santu Pradhan
Signature`,
  },
  {
    id: "sample-2",
    filename: "John_Doe_Senior_Dev.pdf",
    uploadedAt: new Date("2025-01-15T14:20:00").toISOString(),
    name: "John Doe",
    rawText: `John Doe
Senior Frontend Engineer
8+ years experience
React, TypeScript, Next.js, Redux, TailwindCSS
...
Previous companies: Google, Meta, Vercel
Education: MS Computer Science, Stanford
`,
  },
  {
    id: "sample-3",
    filename: "Anna_Smith_PM_CV.docx",
    uploadedAt: new Date("2025-03-05T09:15:00").toISOString(),
    name: "Anna Smith",
    rawText: `Anna Smith
Product Manager
6 years in tech product management
Previously at Amazon, Stripe
MBA from Harvard Business School
Skills: Agile, Scrum, User Research, Figma, SQL, Product Roadmapping
`,
  },
]