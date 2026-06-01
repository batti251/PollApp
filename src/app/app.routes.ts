import { Routes } from '@angular/router';
import { FormSurvey } from './shared/components/survey/form-survey/form-survey';
import { Overview } from './shared/components/overview/overview';
import { Hero } from './shared/components/hero/hero';

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
    }
];
