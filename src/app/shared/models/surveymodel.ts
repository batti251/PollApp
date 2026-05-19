import { Survey } from "../interfaces/survey";

export class SurveyModel implements Survey{
    surveyName: string;
    endDate?: string;
    description?: string;
    category: string;
    type: 'survey';


    constructor(data: Partial<Survey> = {}){
        this.surveyName =  data.surveyName ?? "";
        this.endDate = data.endDate ?? "";
        this.description = data.description ?? "";
        this.category = data.category ?? "";
        this.type = 'survey'
    }
}




