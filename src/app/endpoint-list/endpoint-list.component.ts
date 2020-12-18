import { Component, OnInit, Input } from "@angular/core";
import * as types from "../types";
import { ServiceService } from "../service.service";
import { NotificationsService } from "angular2-notifications";
import { RegistryService } from "../registry.service";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { keyValuesToMap } from "@angular/flex-layout/extended/typings/style/style-transforms";

@Component({
  selector: "app-endpoint-list",
  templateUrl: "./endpoint-list.component.html",
  styleUrls: ["./endpoint-list.component.css"],
})
export class EndpointListComponent implements OnInit {
  @Input() serviceName: string = "";
  @Input() endpointQuery: string = "";
  @Input() selectedVersion: string = "";
  service: types.Service;
  request: any = {};
  endpoint: types.Endpoint = {} as any;
  selectedEndpoint = "";

  public configuration: Config;

  constructor(
    private ses: ServiceService,
    private rs: RegistryService,
    private notif: NotificationsService
  ) {}

  ngOnInit() {
    this.regenJSONs();
  }

  public parse(s: string): any {
    return JSON.parse(s);
  }

  select(e: types.Endpoint) {
    this.endpoint = e;
    this.selectedEndpoint = e.name;
  }

  ngOnCange() {
    //this.regenJSONs();
  }

  regenJSONs() {
    this.rs.get(this.serviceName).then((s) => {
      s.endpoints.forEach((endpoint) => {
        endpoint.requestJSON = this.valueToJson(endpoint.request, 1);
        endpoint.requestValue = JSON.parse(endpoint.requestJSON);

	// delete the cruft fro the value;
        endpoint.requestValue = this.deleteProtoCruft(JSON.parse(endpoint.requestJSON));

        // rebuild the request JSON value
        endpoint.requestJSON = JSON.stringify(endpoint.requestValue, null, 4);
      });
      this.service = s;
      if (!this.selectedEndpoint) {
        this.endpoint = this.service.endpoints[0];
        this.selectedEndpoint = this.endpoint.name;
      }
    });
  }

  apiURL(): string {
    return this.ses.url();
  }

  namespace(): string {
    return this.ses.namespace();
  }

  columns(endpoint: types.Endpoint): Columns[] {
    return Object.keys(endpoint.responseValue[0]).map((k) => {
      return { key: k, title: k };
    });
  }

  callEndpoint(service: types.Service, endpoint: types.Endpoint) {
    this.ses
      .call({
        endpoint: endpoint.name,
        service: service.name,
        address: service.nodes[0].address,
        method: "POST",
        request: endpoint.requestJSON,
      })
      .then((rsp) => {
        endpoint.responseJSON = rsp;
      })
      .catch((e) => {
        try {
          this.notif.error("Error calling service", e.error.Detail);
        } catch {
          this.notif.error("Error calling service", e);
        }
      });
  }

  // https://stackoverflow.com/questions/50139508/input-loses-focus-when-editing-value-using-ngfor-and-ngmodel-angular5
  trackByFn(index, item) {
    return index;
  }

  callEndpointForm(service: types.Service, endpoint: types.Endpoint) {
    // hack to not modify original
    var obj = JSON.parse(JSON.stringify(endpoint.requestValue));
    Object.keys(obj).forEach(
      (k) => !obj[k] && obj[k] !== undefined && delete obj[k]
    );
    console.log(obj);
    this.ses
      .call({
        endpoint: endpoint.name,
        service: service.name,
        address: service.nodes[0].address,
        method: "POST",
        request: JSON.stringify(obj),
      })
      .then((rsp) => {
        var jsonRsp = JSON.parse(rsp);
        var keys = Object.keys(jsonRsp);
        endpoint.responseValue = jsonRsp[keys[0]];
        // If the response is of format
        // {'message':'hi'}
        // we want to transform that to appear like it's
        // a list: [{'message':'hi'}] so it displays nicely
        if (
          typeof endpoint.responseValue === "string" ||
          endpoint.responseValue instanceof String
        ) {
          var k = keys[0];
          var obj = {};
          obj[k] = jsonRsp[keys[0]];
          endpoint.responseValue = [obj];
        }
      })
      .catch((e) => {
        try {
          this.notif.error("Error calling service", e.error.Detail);
        } catch {
          this.notif.error("Error calling service", e);
        }
      });
  }

  deleteProtoCruft(value: Object): Object {
    // super hack to remove protocruft
    for (const key in value) {
      if (key == "MessageState") {
        delete value["MessageState"];
      } else if (key == "int32") {
        delete value["int32"];
      } else if (key == "unknownFields") {
        delete value["unknownFields"];
      }
    };

    return value;
  }

  formatValue(value: unknown): any {
    if (typeof value === "object") {
      return JSON.stringify(this.deleteProtoCruft(value));
    }
    return value;
  }

  formatEndpoint(service: string, endpoint: string): string {
    var parts = endpoint.split(".", -1);

    if (parts[0].toLowerCase() === service) {
      return "/" + service + "/" + parts[1];
    }

    return "/" + service + "/" + endpoint.replace(".", "/");
  }

  formatName(name: string): string {
    if (name === "") {
      return "";
    }

    name = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
    var newName = name.split(".", -1);
    return newName.join(" | ");
  }

  valueToString(input: types.Value, indentLevel: number): string {
    if (!input) return "";

    if (input.name == "MessageState") {
       return "";
    } else if (input.name == "int32") {
       return "";
    } else if (input.name == "unknownFields") {
       return "";
    }

    const indent = Array(indentLevel).join("\t");
    const fieldSeparator = `\n\t`;

    if (input.values) {
      var vals = input.values
        .map((field) => this.valueToString(field, indentLevel + 1))
          .filter(Boolean).join(fieldSeparator);

      if (indentLevel == 0) {
        if (vals.trim().length == 0) {
          return "{}";
        }
        return "{\n\t" + vals + "\n}";
      }

      return `${indentLevel == 0 ? "" : indent}${
        indentLevel == 0 ? "" : input.type
      } ${indentLevel == 0 ? "" : input.name} {\n\t${vals}\n\t${indent}}`;
    } else if (indentLevel == 0) {
      return `{}`;
    }

    return `${indent}${input.name} ${input.type}`;
  }

  // This is admittedly a horrible temporary implementation
  valueToJson(input: types.Value, indentLevel: number): string {
    const typeToDefault = (type: string): string => {
      switch (type) {
        case "string":
          return '""';
        case "int":
        case "int32":
        case "int64":
          return "0";
        case "bool":
          return "false";
        default:
          return "{}";
      }
    };

    if (!input) return "";

    const indent = Array(indentLevel).join("    ");
    const fieldSeparator = `,\n`;
    if (input.values) {
      return `${indent}${indentLevel == 1 ? "{" : '"' + input.name + '": {'}
${input.values
  .map((field) => this.valueToJson(field, indentLevel + 1))
  .join(fieldSeparator)}
${indent}}`;
    } else if (indentLevel == 1) {
      return `{}`;
    }

    return `${indent}"${input.name}": ${typeToDefault(input.type)}`;
  }

  // code editor
  coptions = {
    theme: "vs-light",
    language: "json",
    lineNumbers: false,
  };

  pickVersion(services: types.Service[]): types.Service[] {
    return services.filter((s) => {
      return s.version == this.selectedVersion;
    });
  }
}
