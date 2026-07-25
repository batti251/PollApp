export interface Survey {
    id?: number,
    surveyName: string,
    endDate?: string,
    description?: string,
    category?: number|string,
    type: 'survey',
    totalSubmitsCount?: number,
    questions: SurveyQuestions[]
}

export interface SurveyQuestions {
        surveyId: number,
        id?:number,
        questionInput: string,
        multipleChoice: boolean,
        answers: SurveyQuestionsAnswers[],
}

export interface SurveyQuestionsAnswers {
            answerInput: string,
            questionId: number
            id: number,
            checkedCount?:number
}
