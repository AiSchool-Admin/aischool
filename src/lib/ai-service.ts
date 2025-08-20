// src/lib/ai-service.ts
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.REDACTED!,
})

export interface LearningPreferences {
  style: 'academic' | 'simplified' | 'humorous'
  tutorPersona: {
    name: string
    gender: 'male' | 'female'
  }
}

export interface LessonGenerationRequest {
  curriculumId: string
  subjectId: string
  unitId: string
  chapterId: string
  lessonId: string
  learningPreferences?: LearningPreferences
}

export interface GeneratedLesson {
  lessonId: string
  title: string
  content: string
  summary: string
  keyPoints: string[]
  estimatedDuration: number
}

export interface QuestionGenerationRequest {
  curriculumId: string
  lessonId: string
  difficulty: 'easy' | 'medium' | 'hard'
  count: number
  learningPreferences?: LearningPreferences
}

export interface GeneratedQuestion {
  question: string
  type: 'multiple-choice' | 'short-answer'
  options?: string[]
  correctAnswer: string
  explanation: string
}

// Default learning preferences
const DEFAULT_PREFERENCES: LearningPreferences = {
  style: 'simplified',
  tutorPersona: {
    name: 'Professor Ahmed',
    gender: 'male'
  }
}

/**
 * Generate a personalized lesson using Claude
 */
export async function generateLesson(
  request: LessonGenerationRequest,
  lessonData: any
): Promise<GeneratedLesson> {
  try {
    const preferences = request.learningPreferences || DEFAULT_PREFERENCES
    
    // Build the prompt for Claude
    const prompt = buildLessonPrompt(lessonData, preferences)
    
    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    // Extract content from Claude response
    const content = response.content[0].type === 'text' ? response.content[0].text : ''
    
    // Parse the generated content
    const parsedLesson = parseGeneratedLesson(content, lessonData)
    
    return parsedLesson
  } catch (error) {
    console.error('Error generating lesson with Claude:', error)
    throw new Error('Failed to generate lesson content')
  }
}

/**
 * Generate practice questions using Claude
 */
export async function generateQuestions(
  request: QuestionGenerationRequest,
  lessonData: any
): Promise<GeneratedQuestion[]> {
  try {
    const preferences = request.learningPreferences || DEFAULT_PREFERENCES
    
    // Build the prompt for Claude
    const prompt = buildQuestionsPrompt(lessonData, request, preferences)
    
    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 3000,
      temperature: 0.8,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    // Extract content from Claude response
    const content = response.content[0].type === 'text' ? response.content[0].text : ''
    
    // Parse the generated questions
    const questions = parseGeneratedQuestions(content, request.count)
    
    return questions
  } catch (error) {
    console.error('Error generating questions with Claude:', error)
    throw new Error('Failed to generate practice questions')
  }
}

/**
 * Build lesson generation prompt for Claude
 */
function buildLessonPrompt(lessonData: any, preferences: LearningPreferences): string {
  const styleInstructions = getStyleInstructions(preferences.style)
  const tutorPersona = preferences.tutorPersona
  
  return `You are ${tutorPersona.name}, an experienced ${tutorPersona.gender === 'male' ? 'male' : 'female'} educator. Generate a comprehensive lesson on the following topic:

**Lesson Topic**: ${lessonData.name}

**Learning Objectives**:
${lessonData.objectives.map((obj: string) => `- ${obj}`).join('\n')}

**Key Terms**: ${lessonData.keywords.join(', ')}

**Teaching Style**: ${styleInstructions}

**Requirements**:
1. Create engaging, educational content that covers all learning objectives
2. Use the specified teaching style throughout
3. Include practical examples and analogies where appropriate
4. Structure the content with clear headings and sections
5. End with a brief summary of key points

**Format your response as follows**:

# [Lesson Title]

## Introduction
[Engaging introduction that hooks the student]

## Main Content
[Detailed explanation covering all objectives, broken into logical sections with subheadings]

## Key Points
- [Key point 1]
- [Key point 2]
- [Key point 3]
[Continue as needed]

## Summary
[Brief summary reinforcing the main concepts]

Please ensure the content is appropriate for high school level students and maintains the ${preferences.style} style throughout.`
}

/**
 * Build questions generation prompt for Claude
 */
function buildQuestionsPrompt(
  lessonData: any,
  request: QuestionGenerationRequest,
  preferences: LearningPreferences
): string {
  const difficultyInstructions = getDifficultyInstructions(request.difficulty)
  
  return `Generate ${request.count} practice questions for the following lesson:

**Lesson Topic**: ${lessonData.name}
**Learning Objectives**: ${lessonData.objectives.join(', ')}
**Key Terms**: ${lessonData.keywords.join(', ')}
**Difficulty Level**: ${request.difficulty}

**Instructions**:
${difficultyInstructions}

**Question Types**:
- Mix of multiple-choice and short-answer questions
- Each multiple-choice question should have 4 options (A, B, C, D)
- Include clear explanations for all answers

**Format your response as follows**:

**Question 1**
Type: multiple-choice
Question: [Your question here]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct Answer: [Letter]
Explanation: [Detailed explanation of why this answer is correct and others are wrong]

**Question 2**
Type: short-answer
Question: [Your question here]
Correct Answer: [Expected answer]
Explanation: [Explanation of the concept and what makes a good answer]

[Continue for all ${request.count} questions]

Ensure questions test understanding of the learning objectives and use appropriate terminology.`
}

/**
 * Get style-specific instructions
 */
function getStyleInstructions(style: 'academic' | 'simplified' | 'humorous'): string {
  switch (style) {
    case 'academic':
      return 'Use formal academic language with precise terminology. Include theoretical background and detailed explanations. Reference established principles and methodologies.'
    
    case 'simplified':
      return 'Use clear, simple language that is easy to understand. Break down complex concepts into smaller parts. Use everyday analogies and practical examples to illustrate points.'
    
    case 'humorous':
      return 'Make the content engaging and fun while maintaining educational value. Use appropriate humor, interesting analogies, and relatable examples. Keep the tone light but informative.'
    
    default:
      return 'Use clear, engaging language appropriate for high school students.'
  }
}

/**
 * Get difficulty-specific instructions
 */
function getDifficultyInstructions(difficulty: 'easy' | 'medium' | 'hard'): string {
  switch (difficulty) {
    case 'easy':
      return 'Create basic questions that test fundamental understanding and recall of key concepts. Focus on definitions and simple applications.'
    
    case 'medium':
      return 'Create questions that require understanding and application of concepts. Include some analysis and problem-solving elements.'
    
    case 'hard':
      return 'Create challenging questions that require synthesis, analysis, and critical thinking. Include complex problem-solving and application to new situations.'
    
    default:
      return 'Create questions appropriate for high school level understanding.'
  }
}

/**
 * Parse the generated lesson content from Claude
 */
function parseGeneratedLesson(content: string, lessonData: any): GeneratedLesson {
  // Extract title
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1].trim() : lessonData.name
  
  // Extract key points
  const keyPointsSection = content.match(/##\s+Key Points\s*\n((?:- .+\n?)+)/i)
  const keyPoints = keyPointsSection 
    ? keyPointsSection[1].split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace(/^\s*-\s+/, '').trim())
    : []
  
  // Extract summary
  const summaryMatch = content.match(/##\s+Summary\s*\n([\s\S]+?)(?=\n##|\n#|$)/)
  const summary = summaryMatch ? summaryMatch[1].trim() : ''
  
  // Estimate reading duration (average 200 words per minute)
  const wordCount = content.split(/\s+/).length
  const estimatedDuration = Math.max(5, Math.ceil(wordCount / 200))
  
  return {
    lessonId: lessonData.lessonId,
    title,
    content,
    summary,
    keyPoints,
    estimatedDuration
  }
}

/**
 * Parse the generated questions from Claude
 */
function parseGeneratedQuestions(content: string, expectedCount: number): GeneratedQuestion[] {
  const questions: GeneratedQuestion[] = []
  
  // Split content by question markers
  const questionBlocks = content.split(/\*\*Question \d+\*\*/).slice(1)
  
  for (const block of questionBlocks) {
    try {
      const question = parseQuestionBlock(block.trim())
      if (question) {
        questions.push(question)
      }
    } catch (error) {
      console.error('Error parsing question block:', error)
      continue
    }
  }
  
  // If we don't have enough questions, create fallback questions
  while (questions.length < expectedCount) {
    questions.push(createFallbackQuestion(questions.length + 1))
  }
  
  return questions.slice(0, expectedCount)
}

/**
 * Parse individual question block
 */
function parseQuestionBlock(block: string): GeneratedQuestion | null {
  try {
    // Extract type
    const typeMatch = block.match(/Type:\s*(multiple-choice|short-answer)/i)
    const type = typeMatch ? typeMatch[1].toLowerCase() as 'multiple-choice' | 'short-answer' : 'multiple-choice'
    
    // Extract question
    const questionMatch = block.match(/Question:\s*(.+?)(?=\n[A-D]\)|Correct Answer:|$)/s)
    const question = questionMatch ? questionMatch[1].trim() : ''
    
    // Extract correct answer
    const correctAnswerMatch = block.match(/Correct Answer:\s*(.+?)(?=\nExplanation:|$)/s)
    const correctAnswer = correctAnswerMatch ? correctAnswerMatch[1].trim() : ''
    
    // Extract explanation
    const explanationMatch = block.match(/Explanation:\s*(.+?)$/s)
    const explanation = explanationMatch ? explanationMatch[1].trim() : ''
    
    if (!question || !correctAnswer) {
      return null
    }
    
    const result: GeneratedQuestion = {
      question,
      type,
      correctAnswer,
      explanation
    }
    
    // Extract options for multiple-choice questions
    if (type === 'multiple-choice') {
      const optionMatches = block.match(/[A-D]\)\s*(.+?)(?=\n[A-D]\)|\nCorrect Answer:|$)/g)
      if (optionMatches) {
        result.options = optionMatches.map(match => match.replace(/^[A-D]\)\s*/, '').trim())
      }
    }
    
    return result
  } catch (error) {
    console.error('Error parsing question block:', error)
    return null
  }
}

/**
 * Create fallback question when parsing fails
 */
function createFallbackQuestion(index: number): GeneratedQuestion {
  return {
    question: `What is an important concept from this lesson? (Question ${index})`,
    type: 'short-answer',
    correctAnswer: 'Please refer to the lesson content for key concepts and their explanations.',
    explanation: 'This is a general question about the lesson content. Review the main points covered in the lesson to provide a comprehensive answer.'
  }
}

/**
 * Test the AI service connection
 */
export async function testAIConnection(): Promise<boolean> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: 'Hello, please respond with "AI service is working correctly" to test the connection.'
        }
      ]
    })
    
    const content = response.content[0].type === 'text' ? response.content[0].text : ''
    return content.includes('AI service is working correctly')
  } catch (error) {
    console.error('AI connection test failed:', error)
    return false
  }
}

