"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const core_1 = require('@angular/core');
const Infragistics = require('../../../src/main');
const filter_pipe_1 = require('../../../src/list/filter-pipe');
let AppComponent = class AppComponent {
    constructor() {
        this.navItems = [
            { key: "1", text: "Nav1", link: "#" },
            { key: "2", text: "Nav2", link: "#" },
            { key: "3", text: "Nav3", link: "#" },
            { key: "4", text: "Nav4", link: "#" }
        ];
    }
    get filterOptions() {
        let fo = new filter_pipe_1.FilterOptions();
        return fo;
    }
    filteringHandler(args) {
        //args.cancel = true;
        console.log(args);
    }
    filteredHandler(args) {
        console.log(args);
    }
};
AppComponent = __decorate([
    core_1.Component({
        selector: 'sample-app',
        styleUrls: ["app/main.css"],
        templateUrl: "app/main.html",
        directives: [
            Infragistics.ListHeader,
            Infragistics.ListItem,
            Infragistics.List,
        ]
    }), 
    __metadata('design:paramtypes', [])
], AppComponent);
exports.AppComponent = AppComponent;

//# sourceMappingURL=main.js.map
