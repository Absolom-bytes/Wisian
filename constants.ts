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
    id: 'geography-explorer',
    categoryId: 'teacher',
    name: 'Geography Explorer',
    description: 'Uses Maps grounding to plan field trips or explore locations.',
    basePrompt: 'Explore geographical locations or plan field trips. Use Google Maps grounding to provide specific place information, reviews, and directions. Always provide links to the places mentioned.',
    examplePrompt: 'Find 3 educational geography field trip locations near Johannesburg for Grade 9 students focusing on industrial development.'
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
    id: 'parent-comms',
    categoryId: 'admin',
    name: 'Elite Comms Engine',
    description: 'Automates professional stakeholder communications.',
    basePrompt: 'Draft a professional, empathetic, and clear newsletter or parent communication regarding school updates.',
    examplePrompt: 'Newsletter announcement about the upcoming EverySpark AI launch and how it will benefit student learning outcomes.'
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