"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xstate_1 = require("xstate");
const check_1 = __importDefault(require("./check"));
const checkService = xstate_1.interpret(check_1.default).onTransition(state => console.log(state.value));
checkService.start();
checkService.send('ALLOCATE');
checkService.send('LOGIN');
checkService.send('RECEIVED');
checkService.send('PROCESSING_SUCCESS');
