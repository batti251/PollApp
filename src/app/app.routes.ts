import { Routes } from '@angular/router';
import { FormSurvey } from './shared/components/survey/form-survey/form-survey';
import { Overview } from './shared/components/overview/overview';
import { Hero } from './shared/components/hero/hero';
import { SurveyView } from './shared/components/survey/survey-view/survey-view';

export const routes: Routes = [

    {
        path: '',
        component: Hero,
        title: 'new form'
    }, 
    {
        path: 'overview',
        component: Overview,
        title: 'overview'
    }, 
    {
        path: 'newSurvey',
        component: FormSurvey,
        title: 'overview'
    }, 
    {
        path: 'survey/:id',
        component: SurveyView,
        title: 'overview'
    }
];
