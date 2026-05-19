export interface SurveyQuestions {
        surveyId: number,
        questionId: number,
        text: string,
        value: string | boolean | number
        type: 'question'
}
