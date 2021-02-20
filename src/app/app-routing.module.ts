import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginGuard } from './auth/login.guard';
import { RecipeListComponent } from './recipes/recipe-list/recipe-list.component';
import { RecipeEditComponent } from './recipes/recipe-edit/recipe-edit.component';

const routes: Routes = [
  { path: "", component: RecipeListComponent, canActivate: [LoginGuard] },
  { path: "create", component: RecipeEditComponent, canActivate: [LoginGuard] },
  { path: "edit/:recipeId", component: RecipeEditComponent, canActivate: [LoginGuard] },
  { path: "auth", loadChildren: () => import('../app/auth/auth.module').then(m => m.AuthModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [LoginGuard]
})
export class AppRoutingModule { }
