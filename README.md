# AQA GCSE Science Exam Marker

A GCSE Science version of the A-level exam-marking app, keeping the same overall interface and workflow while replacing the A-level Physics content with AQA GCSE Biology, Chemistry and Physics.

## Included

- Practice question bank across all main GCSE Biology, Chemistry and Physics topic areas
- AQA GCSE Biology (8461), Chemistry (8462), Physics (8463) and Combined Science: Trilogy (8464) coverage
- Year 10 / Year 11 questions
- Paper 1 / Paper 2 metadata
- Combined Science and Separate Science support
- Foundation / Higher filtering in the mock builder
- Required-practical and working-scientifically questions
- GCSE calculations across Biology, Chemistry and Physics
- AI marking with offline fallback
- Typed or image-answer workflow retained from the A-level app
- Custom question generator and targeted follow-up questions
- Timed GCSE mock builder
- Whole-exam marker
- Mistake notebook and examiner training
- Topic heatmaps, progress tracking and indicative 9–1 practice bands
- Interactive GCSE Science equation and maths guide

## Main topic coverage

### Biology
Cell biology; Organisation; Infection and response; Bioenergetics; Homeostasis and response; Inheritance, variation and evolution; Ecology.

### Chemistry
Atomic structure and the periodic table; Bonding, structure and properties of matter; Quantitative chemistry; Chemical changes; Energy changes; Rate and extent of chemical change; Organic chemistry; Chemical analysis; Chemistry of the atmosphere; Using resources.

### Physics
Energy; Electricity; Particle model of matter; Atomic structure; Forces; Waves; Magnetism and electromagnetism; Space physics (separate Physics).

## Development

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```

## AI marking

Set `GEMINI_API_KEY` in the deployment environment for AI marking. The app also retains its offline marking fallback.

## Deployment

This is a Next.js app and can be imported directly into Vercel from this GitHub repository. Vercel should use the standard Next.js build settings.

> Practice grade bands in the app are revision indicators only. Official AQA grade boundaries vary by qualification, tier and exam series.
