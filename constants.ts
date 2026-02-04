import { ToolConfig } from './types';

export const TOOL_CATEGORIES = [
  { id: 'teacher', name: 'Educators', icon: 'fa-chalkboard-user' },
  { id: 'leadership', name: 'Principals', icon: 'fa-user-tie' },
  { id: 'admin', name: 'School Admin', icon: 'fa-envelope-open-text' },
  { id: 'learner', name: 'Learners', icon: 'fa-graduation-cap' },
];

export const TOOLS_CONFIG: ToolConfig[] = [
  {
    id: 'lesson-plan',
    categoryId: 'teacher',
    name: 'CAPS Lesson Planner',
    description: 'Generates high-fidelity, CAPS-aligned lesson plans.',
    basePrompt: 'Generate a high-fidelity lesson plan that is fully CAPS aligned. Focus on innovative teaching methods, time-saving workflows, and 10x output for the educator.',
    examplePrompt: 'Grade 10 Geography: The structure of the Earth and plate tectonics. Focus on active learning for a 60-minute session.'
  },
  {
    id: 'assessment-gen',
    categoryId: 'teacher',
    name: 'Assessment Architect',
    description: 'Creates formal assessments with Bloom\'s Taxonomy analysis.',
    basePrompt: 'Create a formal assessment or worksheet based on the provided topic. Include a marking memorandum and cognitive levels analysis (Bloom\'s Taxonomy).',
    examplePrompt: 'Grade 9 Mathematics: Algebraic expressions and equations. Include 5 multiple choice and 3 structured problem questions.'
  },
  {
    id: 'rubric-master',
    categoryId: 'teacher',
    name: 'Rubric Architect',
    description: 'Generates structured grading rubrics as beautiful HTML tables.',
    basePrompt: 'Generate a professional assessment rubric in a clean HTML/CSS table format. Ensure criteria are specific, measurable, and aligned with standard school grading bands.',
    examplePrompt: 'Grade 11 English HL: Oral presentation on a Shakespearean sonnet. 4 criteria (Content, Delivery, Language, Visuals).'
  },
  {
    id: 'differentiation-lab',
    categoryId: 'teacher',
    name: 'Differentiation Lab',
    description: 'Adapts content for different learning abilities (Remedial to Enrichment).',
    basePrompt: 'Take a core concept and differentiate it into three distinct levels: Support (Remedial), Core (Standard), and Extension (Enrichment). Ensure all three are aligned to the same CAPS outcome.',
    examplePrompt: 'Grade 6 Natural Science: The photosynthesis process. Adapt the content for mixed-ability learners.'
  },
  {
    id: 'quiz-blast',
    categoryId: 'teacher',
    name: 'Interactive Quiz Master',
    description: 'Creates self-marking HTML/JS quizzes for classroom use.',
    basePrompt: 'Generate a complete, single-file interactive HTML/CSS/JavaScript quiz. It must be self-marking, visually engaging, and responsive. Include at least 5 questions on the chosen topic.',
    examplePrompt: 'Grade 7 Economic and Management Sciences: The circular flow of money and simple interest.'
  },
  {
    id: 'strategy-toolkit',
    categoryId: 'leadership',
    name: 'Strategic School Lead',
    description: 'Corporate-grade management roadmaps for school principals.',
    basePrompt: 'Draft a strategic memo or leadership roadmap for a Principal dealing with the provided scenario. Treat the Principal as a CEO. Use corporate management logic applied to education.',
    examplePrompt: 'Scenario: Designing a digital literacy roadmap for a school with limited hardware but high community interest.'
  },
  {
    id: 'sgb-governance',
    categoryId: 'leadership',
    name: 'SGB Governance Advisor',
    description: 'Professional policy drafting and compliance logic for SGBs.',
    basePrompt: 'Draft a professional school policy or SGB resolution. Ensure the language is high-tier, legally sound in a South African context, and community-focused.',
    examplePrompt: 'Drafting a new Code of Conduct for Learners that prioritizes restorative justice and community values.'
  },
  {
    id: 'parent-comms',
    categoryId: 'admin',
    name: 'Elite Comms Engine',
    description: 'Automates professional stakeholder communications.',
    basePrompt: 'Draft a professional, empathetic, and clear newsletter or parent communication regarding school updates.',
    examplePrompt: 'Newsletter announcement about the upcoming EverySpark AI launch and how it will benefit student learning outcomes.'
  },
  {
    id: 'fundraising-pro',
    categoryId: 'admin',
    name: 'Sponsorship Pitcher',
    description: 'Generates high-impact corporate sponsorship proposals.',
    basePrompt: 'Write a corporate-grade sponsorship proposal for a school project. Focus on ROI for the corporate partner and Social Economic Development (SED) points.',
    examplePrompt: 'Pitching to a local bank to sponsor a new science lab. Highlight naming rights and community impact metrics.'
  },
  {
    id: 'study-guide',
    categoryId: 'learner',
    name: 'Syllabus Synthesizer',
    description: 'Converts complex syllabus content into high-impact revision guides.',
    basePrompt: 'Convert complex syllabus concepts into a "cheat sheet" or high-impact summary for a South African learner. Use mnemonic devices and simplified executive summaries.',
    examplePrompt: 'Grade 12 Life Sciences: DNA replication and protein synthesis. Summarize the process for quick exam revision.'
  }
];