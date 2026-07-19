import { Routes } from '@angular/router';
import { SurveyOverview } from './shared/components/survey/survey-overview/survey-overview'; 
import { Hero } from './shared/components/hero/hero';
import { SurveyView } from './shared/components/survey/survey-view/survey-view';
import { CreateSurvey } from './shared/components/survey/survey-create/survey-create';

export const routes: Routes = [

    {
        path: '',
        component: Hero,
        title: 'Poll App'
    }, 
    {
        path: 'overview',
        component: SurveyOverview,
        title: 'Poll App - Overview'
    }, 
    {
        path: 'newSurvey',
        component: CreateSurvey,
        title: 'Poll App - Create New Survey'
    }, 
    {
        path: 'survey/:id',
        component: SurveyView,
        title: 'Poll App - Survey'
    },
     {
        path: '**',
        redirectTo: ''
    }
];
