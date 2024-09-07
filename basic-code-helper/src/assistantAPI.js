"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssistant = createAssistant;
exports.createThread = createThread;
exports.addMessage = addMessage;
exports.streamAssistantResponse = streamAssistantResponse;
var openai_1 = require("openai");
var openai = new openai_1.default({
    apiKey: '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', // Replace with your actual OpenAI API key
});
function createAssistant() {
    return __awaiter(this, void 0, void 0, function () {
        var assistant;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, openai.beta.assistants.create({
                        name: "Code Explainer",
                        instructions: "You are an assistant that explains code snippets to users.",
                        tools: [{ type: "code_interpreter" }],
                        model: "gpt-4o-mini" // Choose a model for the assistant
                    })];
                case 1:
                    assistant = _a.sent();
                    return [2 /*return*/, assistant];
            }
        });
    });
}
function createThread() {
    return __awaiter(this, void 0, void 0, function () {
        var thread;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, openai.beta.threads.create()];
                case 1:
                    thread = _a.sent();
                    return [2 /*return*/, thread];
            }
        });
    });
}
function addMessage(threadId, content) {
    return __awaiter(this, void 0, void 0, function () {
        var message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, openai.beta.threads.messages.create(threadId, {
                        role: "user",
                        content: content
                    })];
                case 1:
                    message = _a.sent();
                    return [2 /*return*/, message];
            }
        });
    });
}
function streamAssistantResponse(assistantId_1, threadId_1, onData_1) {
    return __awaiter(this, arguments, void 0, function (assistantId, threadId, onData, retries) {
        var run, error_1;
        if (retries === void 0) { retries = 3; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 1, , 5]);
                    run = openai.beta.threads.runs.stream(threadId, {
                        assistant_id: assistantId
                    })
                        .on('textDelta', function (textDelta) {
                        if (textDelta.value) {
                            console.log("Received textDelta:", textDelta.value); // Log the incoming data
                            onData(textDelta.value);
                        }
                    })
                        .on('toolCallDelta', function (toolCallDelta) {
                        console.log("Received toolCallDelta:", toolCallDelta); // Log any tool-related data
                    });
                    return [2 /*return*/, run];
                case 1:
                    error_1 = _a.sent();
                    console.error("Error streaming assistant response:", error_1);
                    if (!(retries > 0)) return [3 /*break*/, 3];
                    console.log("Retrying... (".concat(3 - retries + 1, "/3)"));
                    return [4 /*yield*/, streamAssistantResponse(assistantId, threadId, onData, retries - 1)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3: throw new Error('Failed to stream assistant response after 3 retries');
                case 4: return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
