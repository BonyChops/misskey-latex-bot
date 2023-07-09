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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
// Import the framework and instantiate it
var fastify_1 = require("fastify");
var axios_1 = require("axios");
var dotenv_1 = require("dotenv");
var form_data_1 = require("form-data");
var mathjax_1 = require("mathjax-full/js/mathjax");
var tex_1 = require("mathjax-full/js/input/tex");
var svg_1 = require("mathjax-full/js/output/svg");
var liteAdaptor_1 = require("mathjax-full/js/adaptors/liteAdaptor");
var html_1 = require("mathjax-full/js/handlers/html");
var AllPackages_1 = require("mathjax-full/js/input/tex/AllPackages");
var sharp_1 = require("sharp");
(0, dotenv_1.config)();
var envToLogger = {
    development: {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname'
            }
        }
    },
    production: true,
    test: false
};
var fastify = (0, fastify_1.default)({
    logger: (_b = envToLogger[(_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : 'production']) !== null && _b !== void 0 ? _b : true
});
fastify.post('/generate', function handler(req, res) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var adaptor, html, svg, png, uploadJob, wrapper;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log(req === null || req === void 0 ? void 0 : req.body);
                    if (!((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.content)) {
                        throw new Error('No content provided');
                    }
                    adaptor = new liteAdaptor_1.LiteAdaptor();
                    html_1.RegisterHTMLHandler(adaptor);
                    html = mathjax_1.mathjax.document('', {
                        InputJax: new tex_1.TeX({ packages: AllPackages_1.AllPackages }),
                        OutputJax: new svg_1.SVG({ fontCache: 'none' })
                    });
                    svg = adaptor.innerHTML(html.convert((_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.content, { display: true }));
                    return [4 /*yield*/, (0, sharp_1.default)(Buffer.from(svg))
                            .resize({ height: 500 })
                            .flatten({ background: { r: 255, g: 255, b: 255 } })
                            .png()
                            .toBuffer()];
                case 1:
                    png = _c.sent();
                    uploadJob = function () { return __awaiter(_this, void 0, void 0, function () {
                        var form, uploadResult;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    form = new form_data_1.default();
                                    form.append('i', (_a = process.env.MISSKEY_TOKEN) !== null && _a !== void 0 ? _a : 'none');
                                    form.append('file', Buffer.from(png));
                                    return [4 /*yield*/, axios_1.default.post("".concat(process.env.MISSKEY_HOST, "/api/drive/files/create"), form)];
                                case 1:
                                    uploadResult = _b.sent();
                                    return [4 /*yield*/, axios_1.default.post("".concat(process.env.MISSKEY_HOST, "/api/notes/create"), {
                                            mediaIds: [uploadResult.data.id],
                                            i: process.env.MISSKEY_TOKEN
                                        })];
                                case 2:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    wrapper = function () { return __awaiter(_this, void 0, void 0, function () {
                        var e_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, uploadJob()];
                                case 1:
                                    _a.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    e_1 = _a.sent();
                                    console.error(e_1);
                                    console.error(e_1.response.data);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); };
                    // wrapper();
                    res.type('image/png').send(png);
                    return [2 /*return*/];
            }
        });
    });
});
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var err_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, fastify.listen({ port: Number((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 8080) })];
            case 1:
                _b.sent();
                return [3 /*break*/, 3];
            case 2:
                err_1 = _b.sent();
                fastify.log.error(err_1);
                process.exit(1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); })();
