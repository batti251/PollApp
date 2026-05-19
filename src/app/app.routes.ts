import { Routes } from '@angular/router';
import { FormSurvey } from './shared/components/form-survey/form-survey';

export const routes: Routes = [

    {
        path: '',
        component: FormSurvey,
        title: 'new form'
    }
];
