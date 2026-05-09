export const QUESTIONS = [
  {
    id: "q1",
    section: "About You",
    question: "Which of these best describes how you earn money?",
    type: "single",
    options: [
      "Small Business Owner",
      "Freelancer / Gig Worker",
      "Informal Trader or Artisan",
      "Paid Employee (salary)",
      "Other",
    ],
  },
  {
    id: "q2",
    section: "About You",
    question: "How do you currently handle your tax payments?",
    type: "single",
    options: [
      "I use government portals (e.g. TaxPro Max)",
      "I pay through tax agents or middlemen",
      "I hire an accountant",
      "I don't pay / I don't know how to pay",
    ],
  },
  {
    id: "q3",
    section: "New Tax Law Awareness",
    question:
      "Did you know that under the new 2026 tax laws, individuals earning ₦800,000 or less annually are completely exempt from personal income tax, and small businesses earning under ₦100 million are exempt from Companies Income Tax?",
    type: "single",
    options: [
      "Yes, I knew this",
      "I had heard something but wasn't sure",
      "No, this is new to me",
    ],
  },
  {
    id: "q4",
    section: "New Tax Law Awareness",
    question:
      "How difficult is it for you to separate your business expenses from your personal income to calculate what you actually owe?",
    type: "scale",
    scaleLabels: ["Very Easy", "Very Difficult"],
    scaleSize: 5,
  },
  {
    id: "q5",
    section: "Middlemen & Proof of Payment",
    question:
      "Have you ever paid a tax agent or middleman and NOT received an official government receipt?",
    type: "single",
    options: [
      "Yes, this has happened to me",
      "No, I always get a receipt",
      "I've never paid through a middleman",
    ],
  },
  {
    id: "q6",
    section: "Middlemen & Proof of Payment",
    question:
      "Have you ever missed out on a loan, contract, or visa opportunity because getting a Tax Clearance Certificate (TCC) was too slow or difficult?",
    type: "single",
    options: [
      "Yes, this has happened to me",
      "No, but I've struggled to get a TCC before",
      "No, this hasn't affected me",
    ],
  },
  {
    id: "q7",
    section: "Trust & Transparency",
    question:
      "If an app showed you exactly where your tax money was being spent (roads, hospitals, schools in your area), would it make you more willing to pay your taxes?",
    type: "scale",
    scaleLabels: ["Strongly Disagree", "Strongly Agree"],
    scaleSize: 5,
  },
  {
    id: "q8",
    section: "App Preference",
    question:
      "Would you prefer to pay taxes using a simple mobile app (like Opay or Moniepoint) instead of visiting a tax office or government website?",
    type: "single",
    options: [
      "Yes, definitely prefer the app",
      "Maybe, depends on the app",
      "No, I prefer the current way",
    ],
  },
  {
    id: "q9",
    section: "App Preference",
    question:
      "How comfortable would you be linking your BVN or NIN to a registered tax app to verify your identity?",
    type: "scale",
    scaleLabels: ["Not Comfortable", "Very Comfortable"],
    scaleSize: 5,
  },
  {
    id: "q10",
    section: "Value & Willingness to Pay",
    question:
      "The new tax law has a ₦100,000 penalty for filing wrong returns. If an app could automatically file your taxes correctly for a small fee, how likely are you to use it?",
    type: "scale",
    scaleLabels: ["Very Unlikely", "Very Likely"],
    scaleSize: 5,
  },
  {
    id: "q11",
    section: "Final Thoughts",
    question:
      "Any other thoughts, recommendations, or feedback you'd like to share?",
    type: "text",
    optional: true,
    maxLength: 500,
  },
];
