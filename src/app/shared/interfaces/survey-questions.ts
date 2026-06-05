import { SurveyQuestionsAnswers } from "./survey-questions-answers";

export interface SurveyQuestions {
        surveyId: number,
        id?:number,
        questionInput: string,
        multipleChoice: boolean,
        answers: SurveyQuestionsAnswers[],
}
