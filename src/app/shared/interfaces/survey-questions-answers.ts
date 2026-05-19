export interface SurveyQuestionsAnswers {
            questionId: number,
            answerId: number,
            text: string,
            value: string | boolean | number,
            multipleChoice: boolean,
            type: 'answers'
        
}
