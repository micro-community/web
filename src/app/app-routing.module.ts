import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ServicesComponent } from "./services/services.component";
import { ServiceComponent } from "./service/service.component";
import { NewServiceComponent } from "./new-service/new-service.component";
import { AuthGuard } from "./auth.guard";
import { WelcomeComponent } from "./welcome/welcome.component";
import { NotInvitedComponent } from "./not-invited/not-invited.component";
import { SettingsComponent } from "./settings/settings.component";
import { EventsComponent } from "./events/events.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { StatusComponent } from "./status/status.component";
import { StatusSingleComponent } from "./status-single/status-single.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "services",
    pathMatch: "full",
  },
  {
    path: "status",
    component: StatusComponent,
  },
  {
    path: "not-invited",
    component: NotInvitedComponent,
  },
  {
    path: "service/new",
    component: NewServiceComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "service/new/:id",
    component: NewServiceComponent,
    canActivate: [AuthGuard],
  },

  {
    path: "service/:id/:tab",
    component: ServiceComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "status/:id/:version",
    component: StatusSingleComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "status/:id/:version/:tab",
    component: StatusSingleComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "service/:id",
    component: ServiceComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "settings/:id",
    component: SettingsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "events",
    component: EventsComponent,
    canActivate: [AuthGuard],
  },
  { path: "services", component: ServicesComponent, canActivate: [AuthGuard] },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
