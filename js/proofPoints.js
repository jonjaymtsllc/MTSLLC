/* Moore Tutoring Solutions — proof-point stats (SINGLE SOURCE OF TRUTH)
   ======================================================================
   ANNUAL RE-VERIFICATION REQUIRED: WKU republishes its scholarship chart
   every year, and every figure in this file must be re-verified before
   each academic year. When you re-check a stat, update its numbers, its
   sourceUrl if the page moved, and its lastVerified date.

   Every statistic in the "What an ACT score is actually worth" section
   lives here and nowhere else. The section itself is drawn onto the page
   by js/proofSection.js — never type a number or a source into the HTML.
*/

/**
 * @typedef {Object} ProofPoint
 * @property {string} id
 * @property {string} headline      The big number shown on the card
 * @property {string} detail        Body copy explaining the stat
 * @property {string} sourceName    Visible source citation
 * @property {string} sourceUrl     Where the citation links
 * @property {string} lastVerified  ISO date (YYYY-MM-DD) of the last manual check
 * @property {string} verifyNote    Caveats + what to re-check next year
 * @property {string} [secondarySourceName]
 * @property {string} [secondarySourceUrl]
 */

/** @type {ProofPoint[]} */
window.MTS_PROOF_POINTS = [
  {
    id: "admission",
    headline: "89% vs 71%",
    detail:
      "At one university that went test optional, applicants who submitted a test score were admitted at 88.8 percent. Applicants who did not were admitted at 71.3 percent.",
    sourceName: "Kye and Wu, EdWorkingPaper 25-1285 (2025)",
    sourceUrl: "https://edworkingpapers.com/ai25-1285",
    lastVerified: "2026-08-02",
    verifyNote:
      "Single institution, Fall 2021 cycle, 26,880 admits. Submitters also had higher GPAs and higher family incomes, so this is a correlation, not a causal effect."
  },
  {
    id: "scholarship",
    headline: "$16,000",
    detail:
      "Western Kentucky University pays a 3.80 to 4.00 GPA student $3,500 per year with no ACT score, and $7,500 per year with a 30 or higher. Same transcript. A $16,000 difference over four years, decided by one test.",
    sourceName:
      "WKU Office of Student Financial Assistance, 2026 to 2027 Beginning Freshmen Academic Scholarships",
    sourceUrl:
      "https://www.wku.edu/financialaid/scholarships/2627awards/2627merit.php",
    lastVerified: "2026-08-02",
    verifyNote:
      "Published award chart. Republished annually, re-verify every year. WKU does not accept superscores for this award."
  },
  {
    id: "earnings",
    headline: "22% more",
    detail:
      "Economists tracked Florida students for 8 to 14 years after high school. Students who landed just above a university's admission threshold earned about 22 percent more than students who landed just below it. And retaking the test measurably raises scores, which is how students cross those thresholds in the first place.",
    sourceName: "Zimmerman, Journal of Labor Economics 32(4), 2014",
    sourceUrl: "https://www.journals.uchicago.edu/doi/abs/10.1086/676661",
    secondarySourceName:
      "Goodman, Gurantz and Smith, American Economic Journal: Economic Policy 12(2), 2020",
    secondarySourceUrl: "https://www.nber.org/papers/w24945",
    lastVerified: "2026-08-02",
    verifyNote:
      "Both causal, both regression discontinuity. Zimmerman's threshold is an admissions eligibility index, not a pure test score. Effects largest for male students and free lunch recipients. Goodman is SAT rather than ACT."
  }
];
