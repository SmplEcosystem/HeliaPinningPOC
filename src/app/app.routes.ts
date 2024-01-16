import { Routes } from '@angular/router';
import {Home} from './pages/Home/home.component';
import {About} from './pages/About/about.component';
import {Test} from './pages/Test/test.component';

export const routes: Routes = [
    {path: "", component: Home},    
    {path: "about", component: About},    
    {path: "test", component: Test},    
];
