import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
import { NotificationsService } from "angular2-notifications";
import { RuntimeService } from "../runtime.service";

interface Runnable {
  name?: string;
  title?: string;
  source?: string;
  description?: string;
}

var runnables: Runnable[] = [
  {
    title: "Helloworld",
    name: "helloworld",
    source: "github.com/micro/services/helloworld",
    description: "The only helloworld service you will ever need",
  },
  {
    title: "Posts",
    name: "posts",
    source: "github.com/micro/services/blog/posts",
    description: "The building block for headless CMS as a service",
  },
  {
    title: "Comments",
    name: "comments",
    source: "github.com/micro/services/blog/comments",
    description: "Add comments to your posts or any website",
  },
  {
    title: "Location",
    name: "location",
    source: "github.com/micro/services/location",
    description: "Realtime gps and point location tracking and search",
  },
  {
    title: "Users",
    name: "users",
    source: "github.com/micro/services/users",
    description: "Simple user management and authentication",
  },
];

@Component({
  selector: "app-new-service",
  templateUrl: "./new-service.component.html",
  styleUrls: ["./new-service.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class NewServiceComponent implements OnInit {
  serviceInput = new FormControl("", [Validators.required]);
  runnables = runnables;
  @ViewChild("sinput", { static: false }) sinput: ElementRef;

  source = "";
  serviceName = "";
  query = "";
  deploying = false;

  constructor(
    private router: Router,
    private rus: RuntimeService,
    private notif: NotificationsService
  ) {}

  ngOnInit() {}

  deploy() {
    this.deploying = true;
    if (!this.serviceName) {
      this.notif.error("Service name required", "Please specify it.");
      this.deploying = false;
      return false;
    }
    this.rus
      .create(this.serviceName, this.source)
      .then((v) => {
        setTimeout(() => {
          this.router.navigate(["/status"]);
        }, 1500);
      })
      .catch((e) => {
        this.notif.error(e);
        this.deploying = false;
      });
  }

  select(r: Runnable) {
    this.serviceName = r.name;
    this.source = r.source;
  }
}
