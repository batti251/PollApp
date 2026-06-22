import { Survey } from "../interfaces/survey";
import { SurveyQuestions } from "../interfaces/survey-questions";

export class SurveyModel implements Survey{
    surveyName: string;
    endDate?: string;
    description?: string;
    category?: number|string;
    type: 'survey';
    totalSubmitsCount?: number;
    questions: SurveyQuestions[];


    constructor(data: Partial<Survey> = {}){
        this.surveyName =  data.surveyName ?? "";
        this.endDate = data.endDate ?? "";
        this.description = data.description ?? "";
        this.category = data.category ?? 0;
        this.type = 'survey';
        this.totalSubmitsCount = data.totalSubmitsCount ?? 0;
        this.questions = data.questions ?? [];
    }
}

