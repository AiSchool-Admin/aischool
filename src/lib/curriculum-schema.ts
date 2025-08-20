// src/lib/curriculum-schema.ts
import { z } from 'zod'

// Lesson schema
export const LessonSchema = z.object({
  lessonId: z.string(),
  name: z.string(),
  objectives: z.array(z.string()),
  dependencies: z.array(z.string()),
  keywords: z.array(z.string()),
})

// Chapter schema
export const ChapterSchema = z.object({
  chapterId: z.string(),
  name: z.string(),
  lessons: z.array(LessonSchema),
})

// Unit schema
export const UnitSchema = z.object({
  unitId: z.string(),
  name: z.string(),
  chapters: z.array(ChapterSchema),
})

// Subject schema
export const SubjectSchema = z.object({
  subjectId: z.string(),
  name: z.string(),
  units: z.array(UnitSchema),
})

// Main curriculum schema
export const CurriculumSchema = z.object({
  country: z.string(),
  grade: z.string(),
  subjects: z.array(SubjectSchema),
})

// Types derived from schemas
export type Lesson = z.infer<typeof LessonSchema>
export type Chapter = z.infer<typeof ChapterSchema>
export type Unit = z.infer<typeof UnitSchema>
export type Subject = z.infer<typeof SubjectSchema>
export type CurriculumData = z.infer<typeof CurriculumSchema>

// Validation function
export function validateCurriculum(data: unknown): CurriculumData {
  return CurriculumSchema.parse(data)
}

// Helper function to generate curriculum ID
export function generateCurriculumId(country: string, grade: string): string {
  return `${country.toLowerCase().replace(/\s+/g, '-')}-${grade.toLowerCase().replace(/\s+/g, '-')}`
}

