import { SurveyQuestions } from "./survey-questions"

export interface Survey {
    id?: number,
    surveyName: string,
    endDate?: string,
    description?: string,
    category?: string,
    type: 'survey',
    totalSubmitsCount?: number,
    questions: SurveyQuestions[]
}
