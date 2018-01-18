// Copyright by N-Dream AG, 2017. All rights reserved.
! function (e) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
    else if ("function" == typeof define && define.amd) define([], e);
    else {
        var f;
        "undefined" != typeof window ? f = window : "undefined" != typeof global ? f = global : "undefined" != typeof self && (f = self), f.jsondiffpatch = e()
    }
}(function () {
    var define, module, exports;
    return (function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    var f = new Error("Cannot find module '" + o + "'");
                    throw f.code = "MODULE_NOT_FOUND", f
                }
                var l = n[o] = {
                    exports: {}
                };
                t[o][0].call(l.exports, function (e) {
                    var n = t[o][1][e];
                    return s(n ? n : e)
                }, l, l.exports, e, t, n, r)
            }
            return n[o].exports
        }
        var i = typeof require == "function" && require;
        for (var o = 0; o < r.length; o++) s(r[o]);
        return s
    })({
        1: [function (require, module, exports) {
            var environment = require("./environment"),
                DiffPatcher = require("./diffpatcher").DiffPatcher;
            exports.DiffPatcher = DiffPatcher, exports.create = function (e) {
                return new DiffPatcher(e)
            }, exports.dateReviver = require("./date-reviver");
            var defaultInstance;
            if (exports.diff = function () {
                return defaultInstance || (defaultInstance = new DiffPatcher), defaultInstance.diff.apply(defaultInstance, arguments)
            }, exports.patch = function () {
                return defaultInstance || (defaultInstance = new DiffPatcher), defaultInstance.patch.apply(defaultInstance, arguments)
            }, exports.unpatch = function () {
                return defaultInstance || (defaultInstance = new DiffPatcher), defaultInstance.unpatch.apply(defaultInstance, arguments)
            }, exports.reverse = function () {
                return defaultInstance || (defaultInstance = new DiffPatcher), defaultInstance.reverse.apply(defaultInstance, arguments)
            }, environment.isBrowser) exports.homepage = "https://github.com/benjamine/jsondiffpatch", exports.version = "0.1.43";
            else {
                var packageInfoModuleName = "../package.json",
                    packageInfo = require(packageInfoModuleName);
                exports.homepage = packageInfo.homepage, exports.version = packageInfo.version;
                var formatterModuleName = "./formatters",
                    formatters = require(formatterModuleName);
                exports.formatters = formatters, exports.console = formatters.console
            }
        }, {
            "./date-reviver": 6,
            "./diffpatcher": 7,
            "./environment": 8
        }],
        2: [function (require, module, exports) {
            var Pipe = require("../pipe").Pipe,
                Context = function () {};
            Context.prototype.setResult = function (t) {
                return this.result = t, this.hasResult = !0, this
            }, Context.prototype.exit = function () {
                return this.exiting = !0, this
            }, Context.prototype.switchTo = function (t, e) {
                return "string" == typeof t || t instanceof Pipe ? this.nextPipe = t : (this.next = t, e && (this.nextPipe = e)), this
            }, Context.prototype.push = function (t, e) {
                return t.parent = this, "undefined" != typeof e && (t.childName = e), t.root = this.root || this, t.options = t.options || this.options, this.children ? (this.children[this.children.length - 1].next = t, this.children.push(t)) : (this.children = [t], this.nextAfterChildren = this.next || null, this.next = t), t.next = this, this
            }, exports.Context = Context;
        }, {
            "../pipe": 15
        }],
        3: [function (require, module, exports) {
            var Context = require("./context").Context,
                dateReviver = require("../date-reviver"),
                DiffContext = function (t, e) {
                    this.left = t, this.right = e, this.pipe = "diff"
                };
            DiffContext.prototype = new Context, DiffContext.prototype.setResult = function (t) {
                if (this.options.cloneDiffValues) {
                    var e = "function" == typeof this.options.cloneDiffValues ? this.options.cloneDiffValues : function (t) {
                            return JSON.parse(JSON.stringify(t), dateReviver)
                        };
                    "object" == typeof t[0] && (t[0] = e(t[0])), "object" == typeof t[1] && (t[1] = e(t[1]))
                }
                return Context.prototype.setResult.apply(this, arguments)
            }, exports.DiffContext = DiffContext;
        }, {
            "../date-reviver": 6,
            "./context": 2
        }],
        4: [function (require, module, exports) {
            var Context = require("./context").Context,
                PatchContext = function (t, e) {
                    this.left = t, this.delta = e, this.pipe = "patch"
                };
            PatchContext.prototype = new Context, exports.PatchContext = PatchContext;
        }, {
            "./context": 2
        }],
        5: [function (require, module, exports) {
            var Context = require("./context").Context,
                ReverseContext = function (e) {
                    this.delta = e, this.pipe = "reverse"
                };
            ReverseContext.prototype = new Context, exports.ReverseContext = ReverseContext;
        }, {
            "./context": 2
        }],
        6: [function (require, module, exports) {
            module.exports = function (d, e) {
                var t;
                return "string" == typeof e && (t = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d*))?(Z|([+\-])(\d{2}):(\d{2}))$/.exec(e)) ? new Date(Date.UTC(+t[1], +t[2] - 1, +t[3], +t[4], +t[5], +t[6], +(t[7] || 0))) : e
            };
        }, {}],
        7: [function (require, module, exports) {
            var Processor = require("./processor").Processor,
                Pipe = require("./pipe").Pipe,
                DiffContext = require("./contexts/diff").DiffContext,
                PatchContext = require("./contexts/patch").PatchContext,
                ReverseContext = require("./contexts/reverse").ReverseContext,
                trivial = require("./filters/trivial"),
                nested = require("./filters/nested"),
                arrays = require("./filters/arrays"),
                dates = require("./filters/dates"),
                texts = require("./filters/texts"),
                DiffPatcher = function (e) {
                    this.processor = new Processor(e), this.processor.pipe(new Pipe("diff").append(nested.collectChildrenDiffFilter, trivial.diffFilter, dates.diffFilter, texts.diffFilter, nested.objectsDiffFilter, arrays.diffFilter).shouldHaveResult()), this.processor.pipe(new Pipe("patch").append(nested.collectChildrenPatchFilter, arrays.collectChildrenPatchFilter, trivial.patchFilter, texts.patchFilter, nested.patchFilter, arrays.patchFilter).shouldHaveResult()), this.processor.pipe(new Pipe("reverse").append(nested.collectChildrenReverseFilter, arrays.collectChildrenReverseFilter, trivial.reverseFilter, texts.reverseFilter, nested.reverseFilter, arrays.reverseFilter).shouldHaveResult())
                };
            DiffPatcher.prototype.options = function () {
                return this.processor.options.apply(this.processor, arguments)
            }, DiffPatcher.prototype.diff = function (e, r) {
                return this.processor.process(new DiffContext(e, r))
            }, DiffPatcher.prototype.patch = function (e, r) {
                return this.processor.process(new PatchContext(e, r))
            }, DiffPatcher.prototype.reverse = function (e) {
                return this.processor.process(new ReverseContext(e))
            }, DiffPatcher.prototype.unpatch = function (e, r) {
                return this.patch(e, this.reverse(r))
            }, exports.DiffPatcher = DiffPatcher;
        }, {
            "./contexts/diff": 3,
            "./contexts/patch": 4,
            "./contexts/reverse": 5,
            "./filters/arrays": 9,
            "./filters/dates": 10,
            "./filters/nested": 12,
            "./filters/texts": 13,
            "./filters/trivial": 14,
            "./pipe": 15,
            "./processor": 16
        }],
        8: [function (require, module, exports) {
            exports.isBrowser = "undefined" != typeof window;
        }, {}],
        9: [function (require, module, exports) {
            function arraysHaveMatchByRef(e, t, r, i) {
                for (var a = 0; r > a; a++) for (var n = e[a], l = 0; i > l; l++) {
                    var s = t[l];
                    if (n === s) return !0
                }
            }
            function matchItems(e, t, r, i, a) {
                var n = e[r],
                    l = t[i];
                if (n === l) return !0;
                if ("object" != typeof n || "object" != typeof l) return !1;
                var s = a.objectHash;
                if (!s) return a.matchByPosition && r === i;
                var o, f;
                return "number" == typeof r ? (a.hashCache1 = a.hashCache1 || [], o = a.hashCache1[r], "undefined" == typeof o && (a.hashCache1[r] = o = s(n, r))) : o = s(n), "undefined" == typeof o ? !1 : ("number" == typeof i ? (a.hashCache2 = a.hashCache2 || [], f = a.hashCache2[i], "undefined" == typeof f && (a.hashCache2[i] = f = s(l, i))) : f = s(l), "undefined" == typeof f ? !1 : o === f)
            }
            var DiffContext = require("../contexts/diff").DiffContext,
                PatchContext = require("../contexts/patch").PatchContext,
                ReverseContext = require("../contexts/reverse").ReverseContext,
                lcs = require("./lcs"),
                ARRAY_MOVE = 3,
                isArray = "function" == typeof Array.isArray ? Array.isArray : function (e) {
                    return e instanceof Array
                }, arrayIndexOf = "function" == typeof Array.prototype.indexOf ? function (e, t) {
                    return e.indexOf(t)
                } : function (e, t) {
                    for (var r = e.length, i = 0; r > i; i++) if (e[i] === t) return i;
                    return -1
                }, diffFilter = function (e) {
                    if (e.leftIsArray) {
                        var t, r, i, a, n = {
                            objectHash: e.options && e.options.objectHash,
                            matchByPosition: e.options && e.options.matchByPosition
                        }, l = 0,
                            s = 0,
                            o = e.left,
                            f = e.right,
                            c = o.length,
                            h = f.length;
                        for (c > 0 && h > 0 && !n.objectHash && "boolean" != typeof n.matchByPosition && (n.matchByPosition = !arraysHaveMatchByRef(o, f, c, h)); c > l && h > l && matchItems(o, f, l, l, n);) t = l, a = new DiffContext(e.left[t], e.right[t]), e.push(a, t), l++;
                        for (; c > s + l && h > s + l && matchItems(o, f, c - 1 - s, h - 1 - s, n);) r = c - 1 - s, i = h - 1 - s, a = new DiffContext(e.left[r], e.right[i]), e.push(a, i), s++;
                        var u;
                        if (l + s === c) {
                            if (c === h) return void e.setResult(void 0).exit();
                            for (u = u || {
                                _t: "a"
                            }, t = l; h - s > t; t++) u[t] = [f[t]];
                            return void e.setResult(u).exit()
                        }
                        if (l + s === h) {
                            for (u = u || {
                                _t: "a"
                            }, t = l; c - s > t; t++) u["_" + t] = [o[t], 0, 0];
                            return void e.setResult(u).exit()
                        }
                        delete n.hashCache1, delete n.hashCache2;
                        var d = o.slice(l, c - s),
                            v = f.slice(l, h - s),
                            p = lcs.get(d, v, matchItems, n),
                            y = [];
                        for (u = u || {
                            _t: "a"
                        }, t = l; c - s > t; t++) arrayIndexOf(p.indices1, t - l) < 0 && (u["_" + t] = [o[t], 0, 0], y.push(t));
                        var x = !0;
                        e.options && e.options.arrays && e.options.arrays.detectMove === !1 && (x = !1);
                        var m = !1;
                        e.options && e.options.arrays && e.options.arrays.includeValueOnMove && (m = !0);
                        var C = y.length;
                        for (t = l; h - s > t; t++) {
                            var R = arrayIndexOf(p.indices2, t - l);
                            if (0 > R) {
                                var A = !1;
                                if (x && C > 0) for (var _ = 0; C > _; _++) if (r = y[_], matchItems(d, v, r - l, t - l, n)) {
                                    u["_" + r].splice(1, 2, t, ARRAY_MOVE), m || (u["_" + r][0] = ""), i = t, a = new DiffContext(e.left[r], e.right[i]), e.push(a, i), y.splice(_, 1), A = !0;
                                    break
                                }
                                A || (u[t] = [f[t]])
                            } else r = p.indices1[R] + l, i = p.indices2[R] + l, a = new DiffContext(e.left[r], e.right[i]), e.push(a, i)
                        }
                        e.setResult(u).exit()
                    }
                };
            diffFilter.filterName = "arrays";
            var compare = {
                numerically: function (e, t) {
                    return e - t
                },
                numericallyBy: function (e) {
                    return function (t, r) {
                        return t[e] - r[e]
                    }
                }
            }, patchFilter = function (e) {
                if (e.nested && "a" === e.delta._t) {
                    var t, r, i = e.delta,
                        a = e.left,
                        n = [],
                        l = [],
                        s = [];
                    for (t in i) if ("_t" !== t) if ("_" === t[0]) {
                        if (0 !== i[t][2] && i[t][2] !== ARRAY_MOVE) throw new Error("only removal or move can be applied at original array indices, invalid diff type: " + i[t][2]);
                        n.push(parseInt(t.slice(1), 10))
                    } else 1 === i[t].length ? l.push({
                        index: parseInt(t, 10),
                        value: i[t][0]
                    }) : s.push({
                        index: parseInt(t, 10),
                        delta: i[t]
                    });
                    for (n = n.sort(compare.numerically), t = n.length - 1; t >= 0; t--) {
                        r = n[t];
                        var o = i["_" + r],
                            f = a.splice(r, 1)[0];
                        o[2] === ARRAY_MOVE && l.push({
                            index: o[1],
                            value: f
                        })
                    }
                    l = l.sort(compare.numericallyBy("index"));
                    var c = l.length;
                    for (t = 0; c > t; t++) {
                        var h = l[t];
                        a.splice(h.index, 0, h.value)
                    }
                    var u, d = s.length;
                    if (d > 0) for (t = 0; d > t; t++) {
                        var v = s[t];
                        u = new PatchContext(e.left[v.index], v.delta), e.push(u, v.index)
                    }
                    return e.children ? void e.exit() : void e.setResult(e.left).exit()
                }
            };
            patchFilter.filterName = "arrays";
            var collectChildrenPatchFilter = function (e) {
                if (e && e.children && "a" === e.delta._t) {
                    for (var t, r = e.children.length, i = 0; r > i; i++) t = e.children[i], e.left[t.childName] = t.result;
                    e.setResult(e.left).exit()
                }
            };
            collectChildrenPatchFilter.filterName = "arraysCollectChildren";
            var reverseFilter = function (e) {
                if (!e.nested) return void(e.delta[2] === ARRAY_MOVE && (e.newName = "_" + e.delta[1], e.setResult([e.delta[0], parseInt(e.childName.substr(1), 10), ARRAY_MOVE]).exit()));
                if ("a" === e.delta._t) {
                    var t, r;
                    for (t in e.delta) "_t" !== t && (r = new ReverseContext(e.delta[t]), e.push(r, t));
                    e.exit()
                }
            };
            reverseFilter.filterName = "arrays";
            var reverseArrayDeltaIndex = function (e, t, r) {
                if ("string" == typeof t && "_" === t[0]) return parseInt(t.substr(1), 10);
                if (isArray(r) && 0 === r[2]) return "_" + t;
                var i = +t;
                for (var a in e) {
                    var n = e[a];
                    if (isArray(n)) if (n[2] === ARRAY_MOVE) {
                        var l = parseInt(a.substr(1), 10),
                            s = n[1];
                        if (s === +t) return l;
                        i >= l && s > i ? i++ : l >= i && i > s && i--
                    } else if (0 === n[2]) {
                        var o = parseInt(a.substr(1), 10);
                        i >= o && i++
                    } else 1 === n.length && i >= a && i--
                }
                return i
            }, collectChildrenReverseFilter = function (e) {
                if (e && e.children && "a" === e.delta._t) {
                    for (var t, r = e.children.length, i = {
                        _t: "a"
                    }, a = 0; r > a; a++) {
                        t = e.children[a];
                        var n = t.newName;
                        "undefined" == typeof n && (n = reverseArrayDeltaIndex(e.delta, t.childName, t.result)), i[n] !== t.result && (i[n] = t.result)
                    }
                    e.setResult(i).exit()
                }
            };
            collectChildrenReverseFilter.filterName = "arraysCollectChildren", exports.diffFilter = diffFilter, exports.patchFilter = patchFilter, exports.collectChildrenPatchFilter = collectChildrenPatchFilter, exports.reverseFilter = reverseFilter, exports.collectChildrenReverseFilter = collectChildrenReverseFilter;
        }, {
            "../contexts/diff": 3,
            "../contexts/patch": 4,
            "../contexts/reverse": 5,
            "./lcs": 11
        }],
        10: [function (require, module, exports) {
            var diffFilter = function (t) {
                t.left instanceof Date ? (t.right instanceof Date ? t.left.getTime() !== t.right.getTime() ? t.setResult([t.left, t.right]) : t.setResult(void 0) : t.setResult([t.left, t.right]), t.exit()) : t.right instanceof Date && t.setResult([t.left, t.right]).exit()
            };
            diffFilter.filterName = "dates", exports.diffFilter = diffFilter;
        }, {}],
        11: [function (require, module, exports) {
            var defaultMatch = function (t, e, n, r) {
                return t[n] === e[r]
            }, lengthMatrix = function (t, e, n, r) {
                var c, a, i = t.length,
                    u = e.length,
                    f = [i + 1];
                for (c = 0; i + 1 > c; c++) for (f[c] = [u + 1], a = 0; u + 1 > a; a++) f[c][a] = 0;
                for (f.match = n, c = 1; i + 1 > c; c++) for (a = 1; u + 1 > a; a++) n(t, e, c - 1, a - 1, r) ? f[c][a] = f[c - 1][a - 1] + 1 : f[c][a] = Math.max(f[c - 1][a], f[c][a - 1]);
                return f
            }, backtrack = function (t, e, n, r, c, a) {
                if (0 === r || 0 === c) return {
                    sequence: [],
                    indices1: [],
                    indices2: []
                };
                if (t.match(e, n, r - 1, c - 1, a)) {
                    var i = backtrack(t, e, n, r - 1, c - 1, a);
                    return i.sequence.push(e[r - 1]), i.indices1.push(r - 1), i.indices2.push(c - 1), i
                }
                return t[r][c - 1] > t[r - 1][c] ? backtrack(t, e, n, r, c - 1, a) : backtrack(t, e, n, r - 1, c, a)
            }, get = function (t, e, n, r) {
                r = r || {};
                var c = lengthMatrix(t, e, n || defaultMatch, r),
                    a = backtrack(c, t, e, t.length, e.length, r);
                return "string" == typeof t && "string" == typeof e && (a.sequence = a.sequence.join("")), a
            };
            exports.get = get;
        }, {}],
        12: [function (require, module, exports) {
            var DiffContext = require("../contexts/diff").DiffContext,
                PatchContext = require("../contexts/patch").PatchContext,
                ReverseContext = require("../contexts/reverse").ReverseContext,
                collectChildrenDiffFilter = function (e) {
                    if (e && e.children) {
                        for (var t, l = e.children.length, r = e.result, i = 0; l > i; i++) t = e.children[i], "undefined" != typeof t.result && (r = r || {}, r[t.childName] = t.result);
                        r && e.leftIsArray && (r._t = "a"), e.setResult(r).exit()
                    }
                };
            collectChildrenDiffFilter.filterName = "collectChildren";
            var objectsDiffFilter = function (e) {
                if (!e.leftIsArray && "object" === e.leftType) {
                    var t, l, r = e.options.propertyFilter;
                    for (t in e.left) Object.prototype.hasOwnProperty.call(e.left, t) && (r && !r(t, e) || (l = new DiffContext(e.left[t], e.right[t]), e.push(l, t)));
                    for (t in e.right) Object.prototype.hasOwnProperty.call(e.right, t) && (r && !r(t, e) || "undefined" == typeof e.left[t] && (l = new DiffContext(void 0, e.right[t]), e.push(l, t)));
                    return e.children && 0 !== e.children.length ? void e.exit() : void e.setResult(void 0).exit()
                }
            };
            objectsDiffFilter.filterName = "objects";
            var patchFilter = function (e) {
                if (e.nested && !e.delta._t) {
                    var t, l;
                    for (t in e.delta) l = new PatchContext(e.left[t], e.delta[t]), e.push(l, t);
                    e.exit()
                }
            };
            patchFilter.filterName = "objects";
            var collectChildrenPatchFilter = function (e) {
                if (e && e.children && !e.delta._t) {
                    for (var t, l = e.children.length, r = 0; l > r; r++) t = e.children[r], Object.prototype.hasOwnProperty.call(e.left, t.childName) && void 0 === t.result ? delete e.left[t.childName] : e.left[t.childName] !== t.result && (e.left[t.childName] = t.result);
                    e.setResult(e.left).exit()
                }
            };
            collectChildrenPatchFilter.filterName = "collectChildren";
            var reverseFilter = function (e) {
                if (e.nested && !e.delta._t) {
                    var t, l;
                    for (t in e.delta) l = new ReverseContext(e.delta[t]), e.push(l, t);
                    e.exit()
                }
            };
            reverseFilter.filterName = "objects";
            var collectChildrenReverseFilter = function (e) {
                if (e && e.children && !e.delta._t) {
                    for (var t, l = e.children.length, r = {}, i = 0; l > i; i++) t = e.children[i], r[t.childName] !== t.result && (r[t.childName] = t.result);
                    e.setResult(r).exit()
                }
            };
            collectChildrenReverseFilter.filterName = "collectChildren", exports.collectChildrenDiffFilter = collectChildrenDiffFilter, exports.objectsDiffFilter = objectsDiffFilter, exports.patchFilter = patchFilter, exports.collectChildrenPatchFilter = collectChildrenPatchFilter, exports.reverseFilter = reverseFilter, exports.collectChildrenReverseFilter = collectChildrenReverseFilter;
        }, {
            "../contexts/diff": 3,
            "../contexts/patch": 4,
            "../contexts/reverse": 5
        }],
        13: [function (require, module, exports) {
            var TEXT_DIFF = 2,
                DEFAULT_MIN_LENGTH = 60,
                cachedDiffPatch = null,
                getDiffMatchPatch = function (t) {
                    if (!cachedDiffPatch) {
                        var e;
                        if ("undefined" != typeof diff_match_patch) e = "function" == typeof diff_match_patch ? new diff_match_patch : new diff_match_patch.diff_match_patch;
                        else if ("function" == typeof require) try {
                            var i = "diff_match_patch_uncompressed",
                                f = require("../../public/external/" + i);
                            e = new f.diff_match_patch
                        } catch (r) {
                            e = null
                        }
                        if (!e) {
                            if (!t) return null;
                            var a = new Error("text diff_match_patch library not found");
                            throw a.diff_match_patch_not_found = !0, a
                        }
                        cachedDiffPatch = {
                            diff: function (t, i) {
                                return e.patch_toText(e.patch_make(t, i))
                            },
                            patch: function (t, i) {
                                for (var f = e.patch_apply(e.patch_fromText(i), t), r = 0; r < f[1].length; r++) if (!f[1][r]) {
                                    var a = new Error("text patch failed");
                                    a.textPatchFailed = !0
                                }
                                return f[0]
                            }
                        }
                    }
                    return cachedDiffPatch
                }, diffFilter = function (t) {
                    if ("string" === t.leftType) {
                        var e = t.options && t.options.textDiff && t.options.textDiff.minLength || DEFAULT_MIN_LENGTH;
                        if (t.left.length < e || t.right.length < e) return void t.setResult([t.left, t.right]).exit();
                        var i = getDiffMatchPatch();
                        if (!i) return void t.setResult([t.left, t.right]).exit();
                        var f = i.diff;
                        t.setResult([f(t.left, t.right), 0, TEXT_DIFF]).exit()
                    }
                };
            diffFilter.filterName = "texts";
            var patchFilter = function (t) {
                if (!t.nested && t.delta[2] === TEXT_DIFF) {
                    var e = getDiffMatchPatch(!0).patch;
                    t.setResult(e(t.left, t.delta[0])).exit()
                }
            };
            patchFilter.filterName = "texts";
            var textDeltaReverse = function (t) {
                var e, i, f, r, a, c, l, n, h = null,
                    d = /^@@ +\-(\d+),(\d+) +\+(\d+),(\d+) +@@$/;
                for (f = t.split("\n"), e = 0, i = f.length; i > e; e++) {
                    r = f[e];
                    var o = r.slice(0, 1);
                    "@" === o ? (h = d.exec(r), c = e, l = null, n = null, f[c] = "@@ -" + h[3] + "," + h[4] + " +" + h[1] + "," + h[2] + " @@") : "+" === o ? (l = e, f[e] = "-" + f[e].slice(1), "+" === f[e - 1].slice(0, 1) && (a = f[e], f[e] = f[e - 1], f[e - 1] = a)) : "-" === o && (n = e, f[e] = "+" + f[e].slice(1))
                }
                return f.join("\n")
            }, reverseFilter = function (t) {
                t.nested || t.delta[2] === TEXT_DIFF && t.setResult([textDeltaReverse(t.delta[0]), 0, TEXT_DIFF]).exit()
            };
            reverseFilter.filterName = "texts", exports.diffFilter = diffFilter, exports.patchFilter = patchFilter, exports.reverseFilter = reverseFilter;
        }, {}],
        14: [function (require, module, exports) {
            var isArray = "function" == typeof Array.isArray ? Array.isArray : function (e) {
                    return e instanceof Array
                }, diffFilter = function (e) {
                    if (e.left === e.right) return void e.setResult(void 0).exit();
                    if ("undefined" == typeof e.left) {
                        if ("function" == typeof e.right) throw new Error("functions are not supported");
                        return void e.setResult([e.right]).exit()
                    }
                    if ("undefined" == typeof e.right) return void e.setResult([e.left, 0, 0]).exit();
                    if ("function" == typeof e.left || "function" == typeof e.right) throw new Error("functions are not supported");
                    return e.leftType = null === e.left ? "null" : typeof e.left, e.rightType = null === e.right ? "null" : typeof e.right, e.leftType !== e.rightType ? void e.setResult([e.left, e.right]).exit() : "boolean" === e.leftType || "number" === e.leftType ? void e.setResult([e.left, e.right]).exit() : ("object" === e.leftType && (e.leftIsArray = isArray(e.left)), "object" === e.rightType && (e.rightIsArray = isArray(e.right)), e.leftIsArray !== e.rightIsArray ? void e.setResult([e.left, e.right]).exit() : void 0)
                };
            diffFilter.filterName = "trivial";
            var patchFilter = function (e) {
                return "undefined" == typeof e.delta ? void e.setResult(e.left).exit() : (e.nested = !isArray(e.delta), e.nested ? void 0 : 1 === e.delta.length ? void e.setResult(e.delta[0]).exit() : 2 === e.delta.length ? void e.setResult(e.delta[1]).exit() : 3 === e.delta.length && 0 === e.delta[2] ? void e.setResult(void 0).exit() : void 0)
            };
            patchFilter.filterName = "trivial";
            var reverseFilter = function (e) {
                return "undefined" == typeof e.delta ? void e.setResult(e.delta).exit() : (e.nested = !isArray(e.delta), e.nested ? void 0 : 1 === e.delta.length ? void e.setResult([e.delta[0], 0, 0]).exit() : 2 === e.delta.length ? void e.setResult([e.delta[1], e.delta[0]]).exit() : 3 === e.delta.length && 0 === e.delta[2] ? void e.setResult([e.delta[0]]).exit() : void 0)
            };
            reverseFilter.filterName = "trivial", exports.diffFilter = diffFilter, exports.patchFilter = patchFilter, exports.reverseFilter = reverseFilter;
        }, {}],
        15: [function (require, module, exports) {
            var Pipe = function (t) {
                this.name = t, this.filters = []
            };
            Pipe.prototype.process = function (t) {
                if (!this.processor) throw new Error("add this pipe to a processor before using it");
                for (var e = this.debug, r = this.filters.length, i = t, s = 0; r > s; s++) {
                    var o = this.filters[s];
                    if (e && this.log("filter: " + o.filterName), o(i), "object" == typeof i && i.exiting) {
                        i.exiting = !1;
                        break
                    }
                }!i.next && this.resultCheck && this.resultCheck(i)
            }, Pipe.prototype.log = function (t) {
                console.log("[jsondiffpatch] " + this.name + " pipe, " + t)
            }, Pipe.prototype.append = function () {
                return this.filters.push.apply(this.filters, arguments), this
            }, Pipe.prototype.prepend = function () {
                return this.filters.unshift.apply(this.filters, arguments), this
            }, Pipe.prototype.indexOf = function (t) {
                if (!t) throw new Error("a filter name is required");
                for (var e = 0; e < this.filters.length; e++) {
                    var r = this.filters[e];
                    if (r.filterName === t) return e
                }
                throw new Error("filter not found: " + t)
            }, Pipe.prototype.list = function () {
                for (var t = [], e = 0; e < this.filters.length; e++) {
                    var r = this.filters[e];
                    t.push(r.filterName)
                }
                return t
            }, Pipe.prototype.after = function (t) {
                var e = this.indexOf(t),
                    r = Array.prototype.slice.call(arguments, 1);
                if (!r.length) throw new Error("a filter is required");
                return r.unshift(e + 1, 0), Array.prototype.splice.apply(this.filters, r), this
            }, Pipe.prototype.before = function (t) {
                var e = this.indexOf(t),
                    r = Array.prototype.slice.call(arguments, 1);
                if (!r.length) throw new Error("a filter is required");
                return r.unshift(e, 0), Array.prototype.splice.apply(this.filters, r), this
            }, Pipe.prototype.clear = function () {
                return this.filters.length = 0, this
            }, Pipe.prototype.shouldHaveResult = function (t) {
                if (t === !1) return void(this.resultCheck = null);
                if (!this.resultCheck) {
                    var e = this;
                    return this.resultCheck = function (t) {
                        if (!t.hasResult) {
                            console.log(t);
                            var r = new Error(e.name + " failed");
                            throw r.noResult = !0, r
                        }
                    }, this
                }
            }, exports.Pipe = Pipe;
        }, {}],
        16: [function (require, module, exports) {
            var Processor = function (e) {
                this.selfOptions = e || {}, this.pipes = {}
            };
            Processor.prototype.options = function (e) {
                return e && (this.selfOptions = e), this.selfOptions
            }, Processor.prototype.pipe = function (e, t) {
                if ("string" == typeof e) {
                    if ("undefined" == typeof t) return this.pipes[e];
                    this.pipes[e] = t
                }
                if (e && e.name) {
                    if (t = e, t.processor === this) return t;
                    this.pipes[t.name] = t
                }
                return t.processor = this, t
            }, Processor.prototype.process = function (e, t) {
                var s = e;
                s.options = this.options();
                for (var r, o, i = t || e.pipe || "default"; i;) "undefined" != typeof s.nextAfterChildren && (s.next = s.nextAfterChildren, s.nextAfterChildren = null), "string" == typeof i && (i = this.pipe(i)), i.process(s), o = s, r = i, i = null, s && s.next && (s = s.next, i = o.nextPipe || s.pipe || r);
                return s.hasResult ? s.result : void 0
            }, exports.Processor = Processor;
        }, {}]
    }, {}, [1])(1)
});

function hash(c) {
    for (var a = 0, b = 0; b < c.length; b++) var d = c.charCodeAt(b),
        a = (a << 5) - a + d,
        a = a & a;
    0 > a && (a += Math.pow(2, 32));
    return a
};

window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection || !1;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription || !1;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate || !1;

! function (z) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = z();
    else if ("function" == typeof define && define.amd) define([], z);
    else {
        var f;
        "undefined" != typeof window ? f = window : "undefined" != typeof global ? f = global : "undefined" != typeof self && (f = self);
        f.eio = z()
    }
}(function () {
    return function f(h, g, e) {
        function b(d, c) {
            if (!g[d]) {
                if (!h[d]) {
                    var l = "function" == typeof require && require;
                    if (!c && l) return l(d, !0);
                    if (a) return a(d, !0);
                    l = Error("Cannot find module '" + d + "'");
                    throw l.code = "MODULE_NOT_FOUND",
                    l;
                }
                l = g[d] = {
                    exports: {}
                };
                h[d][0].call(l.exports, function (a) {
                    var c = h[d][1][a];
                    return b(c ? c : a)
                }, l, l.exports, f, h, g, e)
            }
            return g[d].exports
        }
        for (var a = "function" == typeof require && require, c = 0; c < e.length; c++) b(e[c]);
        return b
    }({
        1: [function (f, h, g) {
            h.exports = f("./lib/")
        }, {
            "./lib/": 2
        }],
        2: [function (f, h, g) {
            h.exports = f("./socket");
            h.exports.parser = f("engine.io-parser")
        }, {
            "./socket": 3,
            "engine.io-parser": 20
        }],
        3: [function (f, h, g) {
            (function (e) {
                function b(p, a) {
                    if (!(this instanceof b)) return new b(p, a);
                    a = a || {};
                    p && "object" == typeof p && (a = p, p = null);
                    p ? (p = m(p), a.hostname = p.host, a.secure = "https" == p.protocol || "wss" == p.protocol, a.port = p.port, p.query && (a.query = p.query)) : a.host && (a.hostname = m(a.host).host);
                    this.secure = null != a.secure ? a.secure : e.location && "https:" == location.protocol;
                    a.hostname && !a.port && (a.port = this.secure ? "443" : "80");
                    this.agent = a.agent || !1;
                    this.hostname = a.hostname || (e.location ? location.hostname : "localhost");
                    this.port = a.port || (e.location && location.port ? location.port : this.secure ? 443 : 80);
                    this.query = a.query || {};
                    "string" == typeof this.query && (this.query = q.decode(this.query));
                    this.upgrade = !1 !== a.upgrade;
                    this.path = (a.path || "/engine.io").replace(/\/$/, "") + "/";
                    this.forceJSONP = !! a.forceJSONP;
                    this.jsonp = !1 !== a.jsonp;
                    this.forceBase64 = !! a.forceBase64;
                    this.enablesXDR = !! a.enablesXDR;
                    this.timestampParam = a.timestampParam || "t";
                    this.timestampRequests = a.timestampRequests;
                    this.transports = a.transports || ["polling", "websocket"];
                    this.readyState = "";
                    this.writeBuffer = [];
                    this.policyPort = a.policyPort || 843;
                    this.rememberUpgrade = a.rememberUpgrade || !1;
                    this.binaryType = null;
                    this.onlyBinaryUpgrades = a.onlyBinaryUpgrades;
                    this.perMessageDeflate = !1 !== a.perMessageDeflate ? a.perMessageDeflate || {} : !1;
                    !0 === this.perMessageDeflate && (this.perMessageDeflate = {});
                    this.perMessageDeflate && null == this.perMessageDeflate.threshold && (this.perMessageDeflate.threshold = 1024);
                    this.pfx = a.pfx || null;
                    this.key = a.key || null;
                    this.passphrase = a.passphrase || null;
                    this.cert = a.cert || null;
                    this.ca = a.ca || null;
                    this.ciphers = a.ciphers || null;
                    this.rejectUnauthorized = void 0 === a.rejectUnauthorized ? null : a.rejectUnauthorized;
                    var d = "object" == typeof e && e;
                    d.global === d && a.extraHeaders && 0 < Object.keys(a.extraHeaders).length && (this.extraHeaders = a.extraHeaders);
                    this.open()
                }
                var a = f("./transports"),
                    c = f("component-emitter"),
                    d = f("debug")("engine.io-client:socket"),
                    g = f("indexof"),
                    l = f("engine.io-parser"),
                    m = f("parseuri"),
                    k = f("parsejson"),
                    q = f("parseqs");
                h.exports = b;
                b.priorWebsocketSuccess = !1;
                c(b.prototype);
                b.protocol = l.protocol;
                b.Socket = b;
                b.Transport = f("./transport");
                b.transports = f("./transports");
                b.parser = f("engine.io-parser");
                b.prototype.createTransport = function (p) {
                    d('creating transport "%s"', p);
                    var b = this.query,
                        c = {}, e;
                    for (e in b) b.hasOwnProperty(e) && (c[e] = b[e]);
                    c.EIO = l.protocol;
                    c.transport = p;
                    this.id && (c.sid = this.id);
                    return new a[p]({
                        agent: this.agent,
                        hostname: this.hostname,
                        port: this.port,
                        secure: this.secure,
                        path: this.path,
                        query: c,
                        forceJSONP: this.forceJSONP,
                        jsonp: this.jsonp,
                        forceBase64: this.forceBase64,
                        enablesXDR: this.enablesXDR,
                        timestampRequests: this.timestampRequests,
                        timestampParam: this.timestampParam,
                        policyPort: this.policyPort,
                        socket: this,
                        pfx: this.pfx,
                        key: this.key,
                        passphrase: this.passphrase,
                        cert: this.cert,
                        ca: this.ca,
                        ciphers: this.ciphers,
                        rejectUnauthorized: this.rejectUnauthorized,
                        perMessageDeflate: this.perMessageDeflate,
                        extraHeaders: this.extraHeaders
                    })
                };
                b.prototype.open = function () {
                    var a;
                    if (this.rememberUpgrade && b.priorWebsocketSuccess && -1 != this.transports.indexOf("websocket")) a = "websocket";
                    else {
                        if (0 === this.transports.length) {
                            var d = this;
                            setTimeout(function () {
                                d.emit("error", "No transports available")
                            },
                            0);
                            return
                        }
                        a = this.transports[0]
                    }
                    this.readyState = "opening";
                    try {
                        a = this.createTransport(a)
                    } catch (c) {
                        this.transports.shift();
                        this.open();
                        return
                    }
                    a.open();
                    this.setTransport(a)
                };
                b.prototype.setTransport = function (a) {
                    d("setting transport %s", a.name);
                    var b = this;
                    this.transport && (d("clearing existing transport %s", this.transport.name), this.transport.removeAllListeners());
                    this.transport = a;
                    a.on("drain", function () {
                        b.onDrain()
                    }).on("packet", function (a) {
                        b.onPacket(a)
                    }).on("error", function (a) {
                        b.onError(a)
                    }).on("close",

                    function () {
                        b.onClose("transport close")
                    })
                };
                b.prototype.probe = function (a) {
                    function c() {
                        if (k.onlyBinaryUpgrades) {
                            var e = !this.supportsBinary && k.transport.supportsBinary;
                            n = n || e
                        }
                        n || (d('probe transport "%s" opened', a), r.send([{
                            type: "ping",
                            data: "probe"
                        }]), r.once("packet", function (c) {
                            n || ("pong" == c.type && "probe" == c.data ? (d('probe transport "%s" pong', a), k.upgrading = !0, k.emit("upgrading", r), r && (b.priorWebsocketSuccess = "websocket" == r.name, d('pausing current transport "%s"', k.transport.name), k.transport.pause(function () {
                                n ||
                                    "closed" == k.readyState || (d("changing transport and sending upgrade packet"), A(), k.setTransport(r), r.send([{
                                    type: "upgrade"
                                }]), k.emit("upgrade", r), r = null, k.upgrading = !1, k.flush())
                            }))) : (d('probe transport "%s" failed', a), c = Error("probe error"), c.transport = r.name, k.emit("upgradeError", c)))
                        }))
                    }
                    function e() {
                        n || (n = !0, A(), r.close(), r = null)
                    }
                    function g(b) {
                        var c = Error("probe error: " + b);
                        c.transport = r.name;
                        e();
                        d('probe transport "%s" failed because of error: %s', a, b);
                        k.emit("upgradeError", c)
                    }
                    function f() {
                        g("transport closed")
                    }

                    function m() {
                        g("socket closed")
                    }
                    function w(a) {
                        r && a.name != r.name && (d('"%s" works - aborting "%s"', a.name, r.name), e())
                    }
                    function A() {
                        r.removeListener("open", c);
                        r.removeListener("error", g);
                        r.removeListener("close", f);
                        k.removeListener("close", m);
                        k.removeListener("upgrading", w)
                    }
                    d('probing transport "%s"', a);
                    var r = this.createTransport(a, {
                        probe: 1
                    }),
                        n = !1,
                        k = this;
                    b.priorWebsocketSuccess = !1;
                    r.once("open", c);
                    r.once("error", g);
                    r.once("close", f);
                    this.once("close", m);
                    this.once("upgrading", w);
                    r.open()
                };
                b.prototype.onOpen = function () {
                    d("socket open");
                    this.readyState = "open";
                    b.priorWebsocketSuccess = "websocket" == this.transport.name;
                    this.emit("open");
                    this.flush();
                    if ("open" == this.readyState && this.upgrade && this.transport.pause) {
                        d("starting upgrade probes");
                        for (var a = 0, c = this.upgrades.length; a < c; a++) this.probe(this.upgrades[a])
                    }
                };
                b.prototype.onPacket = function (a) {
                    if ("opening" == this.readyState || "open" == this.readyState) switch (d('socket receive: type "%s", data "%s"', a.type, a.data), this.emit("packet", a), this.emit("heartbeat"),
                    a.type) {
                        case "open":
                            this.onHandshake(k(a.data));
                            break;
                        case "pong":
                            this.setPing();
                            this.emit("pong");
                            break;
                        case "error":
                            var b = Error("server error");
                            b.code = a.data;
                            this.onError(b);
                            break;
                        case "message":
                            this.emit("data", a.data), this.emit("message", a.data)
                    } else d('packet received with socket readyState "%s"', this.readyState)
                };
                b.prototype.onHandshake = function (a) {
                    this.emit("handshake", a);
                    this.id = a.sid;
                    this.transport.query.sid = a.sid;
                    this.upgrades = this.filterUpgrades(a.upgrades);
                    this.pingInterval = a.pingInterval;
                    this.pingTimeout = a.pingTimeout;
                    this.onOpen();
                    "closed" != this.readyState && (this.setPing(), this.removeListener("heartbeat", this.onHeartbeat), this.on("heartbeat", this.onHeartbeat))
                };
                b.prototype.onHeartbeat = function (a) {
                    clearTimeout(this.pingTimeoutTimer);
                    var b = this;
                    b.pingTimeoutTimer = setTimeout(function () {
                        if ("closed" != b.readyState) b.onClose("ping timeout")
                    }, a || b.pingInterval + b.pingTimeout)
                };
                b.prototype.setPing = function () {
                    var a = this;
                    clearTimeout(a.pingIntervalTimer);
                    a.pingIntervalTimer = setTimeout(function () {
                        d("writing ping packet - expecting pong within %sms",
                        a.pingTimeout);
                        a.ping();
                        a.onHeartbeat(a.pingTimeout)
                    }, a.pingInterval)
                };
                b.prototype.ping = function () {
                    var a = this;
                    this.sendPacket("ping", function () {
                        a.emit("ping")
                    })
                };
                b.prototype.onDrain = function () {
                    this.writeBuffer.splice(0, this.prevBufferLen);
                    this.prevBufferLen = 0;
                    0 === this.writeBuffer.length ? this.emit("drain") : this.flush()
                };
                b.prototype.flush = function () {
                    "closed" != this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length && (d("flushing %d packets in socket", this.writeBuffer.length),
                    this.transport.send(this.writeBuffer), this.prevBufferLen = this.writeBuffer.length, this.emit("flush"))
                };
                b.prototype.write = b.prototype.send = function (a, b, c) {
                    this.sendPacket("message", a, b, c);
                    return this
                };
                b.prototype.sendPacket = function (a, b, c, d) {
                    "function" == typeof b && (d = b, b = void 0);
                    "function" == typeof c && (d = c, c = null);
                    if ("closing" != this.readyState && "closed" != this.readyState) {
                        c = c || {};
                        c.compress = !1 !== c.compress;
                        a = {
                            type: a,
                            data: b,
                            options: c
                        };
                        this.emit("packetCreate", a);
                        this.writeBuffer.push(a);
                        if (d) this.once("flush",
                        d);
                        this.flush()
                    }
                };
                b.prototype.close = function () {
                    function a() {
                        e.onClose("forced close");
                        d("socket closing - telling transport to close");
                        e.transport.close()
                    }
                    function b() {
                        e.removeListener("upgrade", b);
                        e.removeListener("upgradeError", b);
                        a()
                    }
                    function c() {
                        e.once("upgrade", b);
                        e.once("upgradeError", b)
                    }
                    if ("opening" == this.readyState || "open" == this.readyState) {
                        this.readyState = "closing";
                        var e = this;
                        if (this.writeBuffer.length) this.once("drain", function () {
                            this.upgrading ? c() : a()
                        });
                        else this.upgrading ? c() : a()
                    }
                    return this
                };
                b.prototype.onError = function (a) {
                    d("socket error %j", a);
                    b.priorWebsocketSuccess = !1;
                    this.emit("error", a);
                    this.onClose("transport error", a)
                };
                b.prototype.onClose = function (a, b) {
                    if ("opening" == this.readyState || "open" == this.readyState || "closing" == this.readyState) d('socket close with reason: "%s"', a), clearTimeout(this.pingIntervalTimer), clearTimeout(this.pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), this.readyState = "closed", this.id = null, this.emit("close", a, b), this.writeBuffer = [], this.prevBufferLen = 0
                };
                b.prototype.filterUpgrades = function (a) {
                    for (var b = [], c = 0, d = a.length; c < d; c++)~g(this.transports, a[c]) && b.push(a[c]);
                    return b
                }
            }).call(this, "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : "undefined" !== typeof global ? global : {})
        }, {
            "./transport": 4,
            "./transports": 5,
            "component-emitter": 16,
            debug: 18,
            "engine.io-parser": 20,
            indexof: 24,
            parsejson: 27,
            parseqs: 28,
            parseuri: 29
        }],
        4: [function (f, h, g) {
            function e(a) {
                this.path = a.path;
                this.hostname = a.hostname;
                this.port = a.port;
                this.secure = a.secure;
                this.query = a.query;
                this.timestampParam = a.timestampParam;
                this.timestampRequests = a.timestampRequests;
                this.readyState = "";
                this.agent = a.agent || !1;
                this.socket = a.socket;
                this.enablesXDR = a.enablesXDR;
                this.pfx = a.pfx;
                this.key = a.key;
                this.passphrase = a.passphrase;
                this.cert = a.cert;
                this.ca = a.ca;
                this.ciphers = a.ciphers;
                this.rejectUnauthorized = a.rejectUnauthorized;
                this.extraHeaders = a.extraHeaders
            }
            var b = f("engine.io-parser");
            f = f("component-emitter");
            h.exports = e;
            f(e.prototype);
            e.prototype.onError = function (a, b) {
                var d = Error(a);
                d.type = "TransportError";
                d.description = b;
                this.emit("error", d);
                return this
            };
            e.prototype.open = function () {
                if ("closed" == this.readyState || "" == this.readyState) this.readyState = "opening", this.doOpen();
                return this
            };
            e.prototype.close = function () {
                if ("opening" == this.readyState || "open" == this.readyState) this.doClose(), this.onClose();
                return this
            };
            e.prototype.send = function (a) {
                if ("open" == this.readyState) this.write(a);
                else throw Error("Transport not open");
            };
            e.prototype.onOpen = function () {
                this.readyState = "open";
                this.writable = !0;
                this.emit("open")
            };
            e.prototype.onData = function (a) {
                a = b.decodePacket(a, this.socket.binaryType);
                this.onPacket(a)
            };
            e.prototype.onPacket = function (a) {
                this.emit("packet", a)
            };
            e.prototype.onClose = function () {
                this.readyState = "closed";
                this.emit("close")
            }
        }, {
            "component-emitter": 16,
            "engine.io-parser": 20
        }],
        5: [function (f, h, g) {
            (function (e) {
                var b = f("xmlhttprequest-ssl"),
                    a = f("./polling-xhr"),
                    c = f("./polling-jsonp"),
                    d = f("./websocket");
                g.polling = function (d) {
                    var g = !1,
                        f = !1,
                        k = !1 !== d.jsonp;
                    e.location && (f = "https:" == location.protocol, (g = location.port) || (g = f ? 443 : 80), g = d.hostname != location.hostname || g != d.port, f = d.secure != f);
                    d.xdomain = g;
                    d.xscheme = f;
                    if ("open" in new b(d) && !d.forceJSONP) return new a(d);
                    if (!k) throw Error("JSONP disabled");
                    return new c(d)
                };
                g.websocket = d
            }).call(this, "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : "undefined" !== typeof global ? global : {})
        }, {
            "./polling-jsonp": 6,
            "./polling-xhr": 7,
            "./websocket": 9,
            "xmlhttprequest-ssl": 10
        }],
        6: [function (f,
        h, g) {
            (function (e) {
                function b() {}
                function a(a) {
                    c.call(this, a);
                    this.query = this.query || {};
                    m || (e.___eio || (e.___eio = []), m = e.___eio);
                    this.index = m.length;
                    var d = this;
                    m.push(function (a) {
                        d.onData(a)
                    });
                    this.query.j = this.index;
                    e.document && e.addEventListener && e.addEventListener("beforeunload", function () {
                        d.script && (d.script.onerror = b)
                    }, !1)
                }
                var c = f("./polling"),
                    d = f("component-inherit");
                h.exports = a;
                var g = /\n/g,
                    l = /\\n/g,
                    m;
                d(a, c);
                a.prototype.supportsBinary = !1;
                a.prototype.doClose = function () {
                    this.script && (this.script.parentNode.removeChild(this.script),
                    this.script = null);
                    this.form && (this.form.parentNode.removeChild(this.form), this.iframe = this.form = null);
                    c.prototype.doClose.call(this)
                };
                a.prototype.doPoll = function () {
                    var a = this,
                        b = document.createElement("script");
                    this.script && (this.script.parentNode.removeChild(this.script), this.script = null);
                    b.async = !0;
                    b.src = this.uri();
                    b.onerror = function (b) {
                        a.onError("jsonp poll error", b)
                    };
                    var c = document.getElementsByTagName("script")[0];
                    c ? c.parentNode.insertBefore(b, c) : (document.head || document.body).appendChild(b);
                    this.script = b;
                    "undefined" != typeof navigator && /gecko/i.test(navigator.userAgent) && setTimeout(function () {
                        var a = document.createElement("iframe");
                        document.body.appendChild(a);
                        document.body.removeChild(a)
                    }, 100)
                };
                a.prototype.doWrite = function (a, b) {
                    function c() {
                        d();
                        b()
                    }
                    function d() {
                        if (e.iframe) try {
                            e.form.removeChild(e.iframe)
                        } catch (a) {
                            e.onError("jsonp polling iframe removal error", a)
                        }
                        try {
                            w = document.createElement('<iframe src="javascript:0" name="' + e.iframeId + '">')
                        } catch (a) {
                            w = document.createElement("iframe"),
                            w.name = e.iframeId, w.src = "javascript:0"
                        }
                        w.id = e.iframeId;
                        e.form.appendChild(w);
                        e.iframe = w
                    }
                    var e = this;
                    if (!this.form) {
                        var f = document.createElement("form"),
                            m = document.createElement("textarea"),
                            h = this.iframeId = "eio_iframe_" + this.index,
                            w;
                        f.className = "socketio";
                        f.style.position = "absolute";
                        f.style.top = "-1000px";
                        f.style.left = "-1000px";
                        f.target = h;
                        f.method = "POST";
                        f.setAttribute("accept-charset", "utf-8");
                        m.name = "d";
                        f.appendChild(m);
                        document.body.appendChild(f);
                        this.form = f;
                        this.area = m
                    }
                    this.form.action = this.uri();
                    d();
                    a = a.replace(l, "\\\n");
                    this.area.value = a.replace(g, "\\n");
                    try {
                        this.form.submit()
                    } catch (A) {}
                    this.iframe.attachEvent ? this.iframe.onreadystatechange = function () {
                        "complete" == e.iframe.readyState && c()
                    } : this.iframe.onload = c
                }
            }).call(this, "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : "undefined" !== typeof global ? global : {})
        }, {
            "./polling": 8,
            "component-inherit": 17
        }],
        7: [function (f, h, g) {
            (function (e) {
                function b() {}
                function a(a) {
                    l.call(this, a);
                    if (e.location) {
                        var b = "https:" == location.protocol,
                            c = location.port;
                        c || (c = b ? 443 : 80);
                        this.xd = a.hostname != e.location.hostname || c != a.port;
                        this.xs = a.secure != b
                    } else this.extraHeaders = a.extraHeaders
                }
                function c(a) {
                    this.method = a.method || "GET";
                    this.uri = a.uri;
                    this.xd = !! a.xd;
                    this.xs = !! a.xs;
                    this.async = !1 !== a.async;
                    this.data = void 0 != a.data ? a.data : null;
                    this.agent = a.agent;
                    this.isBinary = a.isBinary;
                    this.supportsBinary = a.supportsBinary;
                    this.enablesXDR = a.enablesXDR;
                    this.pfx = a.pfx;
                    this.key = a.key;
                    this.passphrase = a.passphrase;
                    this.cert = a.cert;
                    this.ca = a.ca;
                    this.ciphers = a.ciphers;
                    this.rejectUnauthorized = a.rejectUnauthorized;
                    this.extraHeaders = a.extraHeaders;
                    this.create()
                }
                function d() {
                    for (var a in c.requests) c.requests.hasOwnProperty(a) && c.requests[a].abort()
                }
                var g = f("xmlhttprequest-ssl"),
                    l = f("./polling"),
                    m = f("component-emitter"),
                    k = f("component-inherit"),
                    q = f("debug")("engine.io-client:polling-xhr");
                h.exports = a;
                h.exports.Request = c;
                k(a, l);
                a.prototype.supportsBinary = !0;
                a.prototype.request = function (a) {
                    a = a || {};
                    a.uri = this.uri();
                    a.xd = this.xd;
                    a.xs = this.xs;
                    a.agent = this.agent || !1;
                    a.supportsBinary = this.supportsBinary;
                    a.enablesXDR = this.enablesXDR;
                    a.pfx = this.pfx;
                    a.key = this.key;
                    a.passphrase = this.passphrase;
                    a.cert = this.cert;
                    a.ca = this.ca;
                    a.ciphers = this.ciphers;
                    a.rejectUnauthorized = this.rejectUnauthorized;
                    a.extraHeaders = this.extraHeaders;
                    return new c(a)
                };
                a.prototype.doWrite = function (a, b) {
                    var c = this.request({
                        method: "POST",
                        data: a,
                        isBinary: "string" !== typeof a && void 0 !== a
                    }),
                        d = this;
                    c.on("success", b);
                    c.on("error", function (a) {
                        d.onError("xhr post error", a)
                    });
                    this.sendXhr = c
                };
                a.prototype.doPoll = function () {
                    q("xhr poll");
                    var a = this.request(),
                        b = this;
                    a.on("data", function (a) {
                        b.onData(a)
                    });
                    a.on("error", function (a) {
                        b.onError("xhr poll error", a)
                    });
                    this.pollXhr = a
                };
                m(c.prototype);
                c.prototype.create = function () {
                    var a = {
                        agent: this.agent,
                        xdomain: this.xd,
                        xscheme: this.xs,
                        enablesXDR: this.enablesXDR
                    };
                    a.pfx = this.pfx;
                    a.key = this.key;
                    a.passphrase = this.passphrase;
                    a.cert = this.cert;
                    a.ca = this.ca;
                    a.ciphers = this.ciphers;
                    a.rejectUnauthorized = this.rejectUnauthorized;
                    var b = this.xhr = new g(a),
                        d = this;
                    try {
                        q("xhr open %s: %s",
                        this.method, this.uri);
                        b.open(this.method, this.uri, this.async);
                        try {
                            if (this.extraHeaders) {
                                b.setDisableHeaderCheck(!0);
                                for (var f in this.extraHeaders) this.extraHeaders.hasOwnProperty(f) && b.setRequestHeader(f, this.extraHeaders[f])
                            }
                        } catch (m) {}
                        this.supportsBinary && (b.responseType = "arraybuffer");
                        if ("POST" == this.method) try {
                            this.isBinary ? b.setRequestHeader("Content-type", "application/octet-stream") : b.setRequestHeader("Content-type", "text/plain;charset=UTF-8")
                        } catch (m) {}
                        "withCredentials" in b && (b.withCredentials = !0);
                        this.hasXDR() ? (b.onload = function () {
                            d.onLoad()
                        }, b.onerror = function () {
                            d.onError(b.responseText)
                        }) : b.onreadystatechange = function () {
                            if (4 == b.readyState) if (200 == b.status || 1223 == b.status) d.onLoad();
                            else setTimeout(function () {
                                d.onError(b.status)
                            }, 0)
                        };
                        q("xhr data %s", this.data);
                        b.send(this.data)
                    } catch (m) {
                        setTimeout(function () {
                            d.onError(m)
                        }, 0);
                        return
                    }
                    e.document && (this.index = c.requestsCount++, c.requests[this.index] = this)
                };
                c.prototype.onSuccess = function () {
                    this.emit("success");
                    this.cleanup()
                };
                c.prototype.onData = function (a) {
                    this.emit("data", a);
                    this.onSuccess()
                };
                c.prototype.onError = function (a) {
                    this.emit("error", a);
                    this.cleanup(!0)
                };
                c.prototype.cleanup = function (a) {
                    if ("undefined" != typeof this.xhr && null !== this.xhr) {
                        this.hasXDR() ? this.xhr.onload = this.xhr.onerror = b : this.xhr.onreadystatechange = b;
                        if (a) try {
                            this.xhr.abort()
                        } catch (d) {}
                        e.document && delete c.requests[this.index];
                        this.xhr = null
                    }
                };
                c.prototype.onLoad = function () {
                    var a;
                    try {
                        var b;
                        try {
                            b = this.xhr.getResponseHeader("Content-Type").split(";")[0]
                        } catch (c) {}
                        if ("application/octet-stream" === b) a = this.xhr.response;
                        else if (this.supportsBinary) try {
                            a = String.fromCharCode.apply(null, new Uint8Array(this.xhr.response))
                        } catch (c) {
                            var d = new Uint8Array(this.xhr.response);
                            b = [];
                            for (var e = 0, g = d.length; e < g; e++) b.push(d[e]);
                            a = String.fromCharCode.apply(null, b)
                        } else a = this.xhr.responseText
                    } catch (c) {
                        this.onError(c)
                    }
                    if (null != a) this.onData(a)
                };
                c.prototype.hasXDR = function () {
                    return "undefined" !== typeof e.XDomainRequest && !this.xs && this.enablesXDR
                };
                c.prototype.abort = function () {
                    this.cleanup()
                };
                e.document && (c.requestsCount = 0, c.requests = {}, e.attachEvent ? e.attachEvent("onunload", d) : e.addEventListener && e.addEventListener("beforeunload", d, !1))
            }).call(this, "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : "undefined" !== typeof global ? global : {})
        }, {
            "./polling": 8,
            "component-emitter": 16,
            "component-inherit": 17,
            debug: 18,
            "xmlhttprequest-ssl": 10
        }],
        8: [function (f, h, g) {
            function e(a) {
                var c = a && a.forceBase64;
                if (!l || c) this.supportsBinary = !1;
                b.call(this, a)
            }
            var b = f("../transport"),
                a = f("parseqs"),
                c = f("engine.io-parser");
            g = f("component-inherit");
            var d = f("yeast"),
                n = f("debug")("engine.io-client:polling");
            h.exports = e;
            var l = null != (new(f("xmlhttprequest-ssl"))({
                xdomain: !1
            })).responseType;
            g(e, b);
            e.prototype.name = "polling";
            e.prototype.doOpen = function () {
                this.poll()
            };
            e.prototype.pause = function (a) {
                function b() {
                    n("paused");
                    c.readyState = "paused";
                    a()
                }
                var c = this;
                this.readyState = "pausing";
                if (this.polling || !this.writable) {
                    var d = 0;
                    this.polling && (n("we are currently polling - waiting to pause"), d++, this.once("pollComplete", function () {
                        n("pre-pause polling complete");
                        --d || b()
                    }));
                    this.writable || (n("we are currently writing - waiting to pause"), d++, this.once("drain", function () {
                        n("pre-pause writing complete");
                        --d || b()
                    }))
                } else b()
            };
            e.prototype.poll = function () {
                n("polling");
                this.polling = !0;
                this.doPoll();
                this.emit("poll")
            };
            e.prototype.onData = function (a) {
                var b = this;
                n("polling got data %s", a);
                c.decodePayload(a, this.socket.binaryType, function (a, c, d) {
                    if ("opening" == b.readyState) b.onOpen();
                    if ("close" == a.type) return b.onClose(), !1;
                    b.onPacket(a)
                });
                "closed" != this.readyState && (this.polling = !1, this.emit("pollComplete"), "open" == this.readyState ? this.poll() : n('ignoring poll - transport state "%s"', this.readyState))
            };
            e.prototype.doClose = function () {
                function a() {
                    n("writing close packet");
                    b.write([{
                        type: "close"
                    }])
                }
                var b = this;
                "open" == this.readyState ? (n("transport open - closing"), a()) : (n("transport not open - deferring close"), this.once("open", a))
            };
            e.prototype.write = function (a) {
                var b = this;
                this.writable = !1;
                var d = function () {
                    b.writable = !0;
                    b.emit("drain")
                }, b = this;
                c.encodePayload(a,
                this.supportsBinary, function (a) {
                    b.doWrite(a, d)
                })
            };
            e.prototype.uri = function () {
                var b = this.query || {}, c = this.secure ? "https" : "http",
                    e = "";
                !1 !== this.timestampRequests && (b[this.timestampParam] = d());
                this.supportsBinary || b.sid || (b.b64 = 1);
                b = a.encode(b);
                this.port && ("https" == c && 443 != this.port || "http" == c && 80 != this.port) && (e = ":" + this.port);
                b.length && (b = "?" + b);
                var g = -1 !== this.hostname.indexOf(":");
                return c + "://" + (g ? "[" + this.hostname + "]" : this.hostname) + e + this.path + b
            }
        }, {
            "../transport": 4,
            "component-inherit": 17,
            debug: 18,
                "engine.io-parser": 20,
            parseqs: 28,
            "xmlhttprequest-ssl": 10,
            yeast: 31
        }],
        9: [function (f, h, g) {
            (function (e) {
                function b(b) {
                    b && b.forceBase64 && (this.supportsBinary = !1);
                    this.perMessageDeflate = b.perMessageDeflate;
                    a.call(this, b)
                }
                var a = f("../transport"),
                    c = f("engine.io-parser"),
                    d = f("parseqs"),
                    g = f("component-inherit"),
                    l = f("yeast"),
                    m = f("debug")("engine.io-client:websocket"),
                    k = e.WebSocket || e.MozWebSocket,
                    q = k || ("undefined" !== typeof window ? null : f("ws"));
                h.exports = b;
                g(b, a);
                b.prototype.name = "websocket";
                b.prototype.supportsBinary = !0;
                b.prototype.doOpen = function () {
                    if (this.check()) {
                        var a = this.uri(),
                            b = {
                                agent: this.agent,
                                perMessageDeflate: this.perMessageDeflate
                            };
                        b.pfx = this.pfx;
                        b.key = this.key;
                        b.passphrase = this.passphrase;
                        b.cert = this.cert;
                        b.ca = this.ca;
                        b.ciphers = this.ciphers;
                        b.rejectUnauthorized = this.rejectUnauthorized;
                        this.extraHeaders && (b.headers = this.extraHeaders);
                        this.ws = k ? new q(a) : new q(a, void 0, b);
                        void 0 === this.ws.binaryType && (this.supportsBinary = !1);
                        this.ws.supports && this.ws.supports.binary ? (this.supportsBinary = !0, this.ws.binaryType =
                            "buffer") : this.ws.binaryType = "arraybuffer";
                        this.addEventListeners()
                    }
                };
                b.prototype.addEventListeners = function () {
                    var a = this;
                    this.ws.onopen = function () {
                        a.onOpen()
                    };
                    this.ws.onclose = function () {
                        a.onClose()
                    };
                    this.ws.onmessage = function (b) {
                        a.onData(b.data)
                    };
                    this.ws.onerror = function (b) {
                        a.onError("websocket error", b)
                    }
                };
                "undefined" != typeof navigator && /iPad|iPhone|iPod/i.test(navigator.userAgent) && (b.prototype.onData = function (b) {
                    var c = this;
                    setTimeout(function () {
                        a.prototype.onData.call(c, b)
                    }, 0)
                });
                b.prototype.write = function (a) {
                    function b() {
                        d.emit("flush");
                        setTimeout(function () {
                            d.writable = !0;
                            d.emit("drain")
                        }, 0)
                    }
                    var d = this;
                    this.writable = !1;
                    for (var g = a.length, f = 0, n = g; f < n; f++)(function (a) {
                        c.encodePacket(a, d.supportsBinary, function (c) {
                            if (!k) {
                                var f = {};
                                a.options && (f.compress = a.options.compress);
                                d.perMessageDeflate && ("string" == typeof c ? e.Buffer.byteLength(c) : c.length) < d.perMessageDeflate.threshold && (f.compress = !1)
                            }
                            try {
                                k ? d.ws.send(c) : d.ws.send(c, f)
                            } catch (n) {
                                m("websocket closed before onclose event")
                            }--g || b()
                        })
                    })(a[f])
                };
                b.prototype.onClose = function () {
                    a.prototype.onClose.call(this)
                };
                b.prototype.doClose = function () {
                    "undefined" !== typeof this.ws && this.ws.close()
                };
                b.prototype.uri = function () {
                    var a = this.query || {}, b = this.secure ? "wss" : "ws",
                        c = "";
                    this.port && ("wss" == b && 443 != this.port || "ws" == b && 80 != this.port) && (c = ":" + this.port);
                    this.timestampRequests && (a[this.timestampParam] = l());
                    this.supportsBinary || (a.b64 = 1);
                    a = d.encode(a);
                    a.length && (a = "?" + a);
                    var e = -1 !== this.hostname.indexOf(":");
                    return b + "://" + (e ? "[" + this.hostname + "]" : this.hostname) + c + this.path + a
                };
                b.prototype.check = function () {
                    return !!q && !("__initialize" in q && this.name === b.prototype.name)
                }
            }).call(this, "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : "undefined" !== typeof global ? global : {})
        }, {
            "../transport": 4,
            "component-inherit": 17,
            debug: 18,
            "engine.io-parser": 20,
            parseqs: 28,
            ws: 15,
            yeast: 31
        }],
        10: [function (f, h, g) {
            var e = f("has-cors");
            h.exports = function (b) {
                var a = b.xdomain,
                    c = b.xscheme;
                b = b.enablesXDR;
                try {
                    if ("undefined" != typeof XMLHttpRequest && (!a || e)) return new XMLHttpRequest
                } catch (d) {}
                try {
                    if ("undefined" != typeof XDomainRequest && !c && b) return new XDomainRequest
                } catch (d) {}
                if (!a) try {
                    return new ActiveXObject("Microsoft.XMLHTTP")
                } catch (d) {}
            }
        }, {
            "has-cors": 23
        }],
        11: [function (f, h, g) {
            function e() {}
            h.exports = function (b, a, c) {
                function d(b, e) {
                    if (0 >= d.count) throw Error("after called too many times");
                    --d.count;
                    b ? (g = !0, a(b), a = c) : 0 !== d.count || g || a(null, e)
                }
                var g = !1;
                c = c || e;
                d.count = b;
                return 0 === b ? a() : d
            }
        }, {}],
        12: [function (f, h, g) {
            h.exports = function (e, b, a) {
                var c = e.byteLength;
                b = b || 0;
                a = a || c;
                if (e.slice) return e.slice(b, a);
                0 > b && (b += c);
                0 > a && (a += c);
                a > c && (a = c);
                if (b >= c || b >= a || 0 === c) return new ArrayBuffer(0);
                e = new Uint8Array(e);
                for (var c = new Uint8Array(a - b), d = 0; b < a; b++, d++) c[d] = e[b];
                return c.buffer
            }
        }, {}],
        13: [function (f, h, g) {
            (function (e) {
                g.encode = function (b) {
                    b = new Uint8Array(b);
                    var a, c = b.length,
                        d = "";
                    for (a = 0; a < c; a += 3) d += e[b[a] >> 2], d += e[(b[a] & 3) << 4 | b[a + 1] >> 4], d += e[(b[a + 1] & 15) << 2 | b[a + 2] >> 6], d += e[b[a + 2] & 63];
                    2 === c % 3 ? d = d.substring(0, d.length - 1) + "=" : 1 === c % 3 && (d = d.substring(0, d.length - 2) + "==");
                    return d
                };
                g.decode = function (b) {
                    var a = .75 * b.length,
                        c = b.length,
                        d = 0,
                        g, f, m, k;
                    "=" === b[b.length - 1] && (a--, "=" === b[b.length - 2] && a--);
                    for (var h = new ArrayBuffer(a), p = new Uint8Array(h), a = 0; a < c; a += 4) g = e.indexOf(b[a]), f = e.indexOf(b[a + 1]), m = e.indexOf(b[a + 2]), k = e.indexOf(b[a + 3]), p[d++] = g << 2 | f >> 4, p[d++] = (f & 15) << 4 | m >> 2, p[d++] = (m & 3) << 6 | k & 63;
                    return h
                }
            })("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/")
        }, {}],
        14: [function (f, h, g) {
            (function (e) {
                function b(a) {
                    for (var b = 0; b < a.length; b++) {
                        var c = a[b];
                        if (c.buffer instanceof ArrayBuffer) {
                            var d = c.buffer;
                            if (c.byteLength !== d.byteLength) {
                                var e = new Uint8Array(c.byteLength);
                                e.set(new Uint8Array(d, c.byteOffset, c.byteLength));
                                d = e.buffer
                            }
                            a[b] = d
                        }
                    }
                }
                function a(a, c) {
                    c = c || {};
                    var e = new d;
                    b(a);
                    for (var g = 0; g < a.length; g++) e.append(a[g]);
                    return c.type ? e.getBlob(c.type) : e.getBlob()
                }
                function c(a, c) {
                    b(a);
                    return new Blob(a, c || {})
                }
                var d = e.BlobBuilder || e.WebKitBlobBuilder || e.MSBlobBuilder || e.MozBlobBuilder,
                    g;
                try {
                    g = 2 === (new Blob(["hi"])).size
                } catch (f) {
                    g = !1
                }
                var l;
                if (l = g) try {
                    l = 2 === (new Blob([new Uint8Array([1, 2])])).size
                } catch (f) {
                    l = !1
                }
                var m = d && d.prototype.append && d.prototype.getBlob;
                e = g ? l ? e.Blob : c : m ? a : void 0;
                h.exports = e
            }).call(this, "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : "undefined" !== typeof global ? global : {})
        }, {}],
        15: [function (f, h, g) {}, {}],
        16: [function (f, h, g) {
            function e(b) {
                if (b) {
                    for (var a in e.prototype) b[a] = e.prototype[a];
                    return b
                }
            }
            h.exports = e;
            e.prototype.on = e.prototype.addEventListener = function (b, a) {
                this._callbacks = this._callbacks || {};
                (this._callbacks[b] = this._callbacks[b] || []).push(a);
                return this
            };
            e.prototype.once = function (b, a) {
                function c() {
                    d.off(b, c);
                    a.apply(this, arguments)
                }
                var d = this;
                this._callbacks = this._callbacks || {};
                c.fn = a;
                this.on(b, c);
                return this
            };
            e.prototype.off = e.prototype.removeListener = e.prototype.removeAllListeners = e.prototype.removeEventListener = function (b, a) {
                this._callbacks = this._callbacks || {};
                if (0 == arguments.length) return this._callbacks = {}, this;
                var c = this._callbacks[b];
                if (!c) return this;
                if (1 == arguments.length) return delete this._callbacks[b], this;
                for (var d, e = 0; e < c.length; e++) if (d = c[e], d === a || d.fn === a) {
                    c.splice(e, 1);
                    break
                }
                return this
            };
            e.prototype.emit = function (b) {
                this._callbacks = this._callbacks || {};
                var a = [].slice.call(arguments, 1),
                    c = this._callbacks[b];
                if (c) for (var c = c.slice(0), d = 0, e = c.length; d < e; ++d) c[d].apply(this, a);
                return this
            };
            e.prototype.listeners = function (b) {
                this._callbacks = this._callbacks || {};
                return this._callbacks[b] || []
            };
            e.prototype.hasListeners = function (b) {
                return !!this.listeners(b).length
            }
        }, {}],
        17: [function (f, h, g) {
            h.exports = function (e, b) {
                var a = function () {};
                a.prototype = b.prototype;
                e.prototype = new a;
                e.prototype.constructor = e
            }
        }, {}],
        18: [function (f, h, g) {
            function e() {
                var a;
                try {
                    a = g.storage.debug
                } catch (b) {}
                return a
            }
            g = h.exports = f("./debug");
            g.log = function () {
                return "object" === typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments)
            };
            g.formatArgs = function () {
                var a = arguments,
                    b = this.useColors;
                a[0] = (b ? "%c" : "") + this.namespace + (b ? " %c" : " ") + a[0] + (b ? "%c " : " ") + "+" + g.humanize(this.diff);
                if (!b) return a;
                var b = "color: " + this.color,
                    a = [a[0], b, "color: inherit"].concat(Array.prototype.slice.call(a,
                    1)),
                    d = 0,
                    e = 0;
                a[0].replace(/%[a-z%]/g, function (a) {
                    "%%" !== a && (d++, "%c" === a && (e = d))
                });
                a.splice(e, 0, b);
                return a
            };
            g.save = function (a) {
                try {
                    null == a ? g.storage.removeItem("debug") : g.storage.debug = a
                } catch (b) {}
            };
            g.load = e;
            g.useColors = function () {
                return "WebkitAppearance" in document.documentElement.style || window.console && (console.firebug || console.exception && console.table) || navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && 31 <= parseInt(RegExp.$1, 10)
            };
            var b;
            if ("undefined" != typeof chrome && "undefined" != typeof chrome.storage) b = chrome.storage.local;
            else a: {
                try {
                    b = window.localStorage;
                    break a
                } catch (a) {}
                b = void 0
            }
            g.storage = b;
            g.colors = "lightseagreen forestgreen goldenrod dodgerblue darkorchid crimson".split(" ");
            g.formatters.j = function (a) {
                return JSON.stringify(a)
            };
            g.enable(e())
        }, {
            "./debug": 19
        }],
        19: [function (f, h, g) {
            g = h.exports = function (a) {
                function c() {}
                function d() {
                    var a = +new Date;
                    d.diff = a - (b || a);
                    d.prev = b;
                    b = d.curr = a;
                    null == d.useColors && (d.useColors = g.useColors());
                    null == d.color && d.useColors && (d.color = g.colors[e++ % g.colors.length]);
                    var c = Array.prototype.slice.call(arguments);
                    c[0] = g.coerce(c[0]);
                    "string" !== typeof c[0] && (c = ["%o"].concat(c));
                    var f = 0;
                    c[0] = c[0].replace(/%([a-z%])/g, function (a, b) {
                        if ("%%" === a) return a;
                        f++;
                        var e = g.formatters[b];
                        "function" === typeof e && (a = e.call(d, c[f]), c.splice(f, 1), f--);
                        return a
                    });
                    "function" === typeof g.formatArgs && (c = g.formatArgs.apply(d, c));
                    (d.log || g.log || console.log.bind(console)).apply(d, c)
                }
                c.enabled = !1;
                d.enabled = !0;
                var f = g.enabled(a) ? d : c;
                f.namespace = a;
                return f
            };
            g.coerce = function (a) {
                return a instanceof
                Error ? a.stack || a.message : a
            };
            g.disable = function () {
                g.enable("")
            };
            g.enable = function (a) {
                g.save(a);
                for (var b = (a || "").split(/[\s,]+/), d = b.length, e = 0; e < d; e++) b[e] && (a = b[e].replace(/\*/g, ".*?"), "-" === a[0] ? g.skips.push(new RegExp("^" + a.substr(1) + "$")) : g.names.push(new RegExp("^" + a + "$")))
            };
            g.enabled = function (a) {
                var b, d;
                b = 0;
                for (d = g.skips.length; b < d; b++) if (g.skips[b].test(a)) return !1;
                b = 0;
                for (d = g.names.length; b < d; b++) if (g.names[b].test(a)) return !0;
                return !1
            };
            g.humanize = f("ms");
            g.names = [];
            g.skips = [];
            g.formatters = {};
            var e = 0,
                b
        }, {
            ms: 26
        }],
        20: [function (f, h, g) {
            (function (e) {
                function b(a, b, c) {
                    if (!b) return g.encodeBase64Packet(a, c);
                    var d = new FileReader;
                    d.onload = function () {
                        a.data = d.result;
                        g.encodePacket(a, b, !0, c)
                    };
                    return d.readAsArrayBuffer(a.data)
                }
                function a(a, b, c) {
                    var d = Array(a.length);
                    c = m(a.length, c);
                    for (var e = function (a, c, e) {
                        b(c, function (b, c) {
                            d[a] = c;
                            e(b, d)
                        })
                    }, g = 0; g < a.length; g++) e(g, a[g], c)
                }
                var c = f("./keys"),
                    d = f("has-binary"),
                    h = f("arraybuffer.slice"),
                    l = f("base64-arraybuffer"),
                    m = f("after"),
                    k = f("utf8"),
                    q = navigator.userAgent.match(/Android/i),
                    p = /PhantomJS/i.test(navigator.userAgent),
                    y = q || p;
                g.protocol = 3;
                var u = g.packets = {
                    open: 0,
                    close: 1,
                    ping: 2,
                    pong: 3,
                    message: 4,
                    upgrade: 5,
                    noop: 6
                }, x = c(u),
                    t = {
                        type: "error",
                        data: "parser error"
                    }, v = f("blob");
                g.encodePacket = function (a, c, d, f) {
                    "function" == typeof c && (f = c, c = !1);
                    "function" == typeof d && (f = d, d = null);
                    var h = void 0 === a.data ? void 0 : a.data.buffer || a.data;
                    if (e.ArrayBuffer && h instanceof ArrayBuffer) {
                        if (c) {
                            d = a.data;
                            c = new Uint8Array(d);
                            d = new Uint8Array(1 + d.byteLength);
                            d[0] = u[a.type];
                            for (a = 0; a < c.length; a++) d[a + 1] = c[a];
                            a = f(d.buffer)
                        } else a = g.encodeBase64Packet(a, f);
                        return a
                    }
                    if (v && h instanceof e.Blob) return c ? y ? a = b(a, c, f) : (c = new Uint8Array(1), c[0] = u[a.type], a = new v([c.buffer, a.data]), a = f(a)) : a = g.encodeBase64Packet(a, f), a;
                    if (h && h.base64) return f("b" + g.packets[a.type] + a.data.data);
                    c = u[a.type];
                    void 0 !== a.data && (c += d ? k.encode(String(a.data)) : String(a.data));
                    return f("" + c)
                };
                g.encodeBase64Packet = function (a, b) {
                    var c = "b" + g.packets[a.type];
                    if (v && a.data instanceof e.Blob) {
                        var d = new FileReader;
                        d.onload = function () {
                            var a = d.result.split(",")[1];
                            b(c + a)
                        };
                        return d.readAsDataURL(a.data)
                    }
                    var f;
                    try {
                        f = String.fromCharCode.apply(null, new Uint8Array(a.data))
                    } catch (h) {
                        f = new Uint8Array(a.data);
                        for (var m = Array(f.length), t = 0; t < f.length; t++) m[t] = f[t];
                        f = String.fromCharCode.apply(null, m)
                    }
                    c += e.btoa(f);
                    return b(c)
                };
                g.decodePacket = function (a, b, c) {
                    if ("string" == typeof a || void 0 === a) {
                        if ("b" == a.charAt(0)) return g.decodeBase64Packet(a.substr(1), b);
                        if (c) try {
                            a = k.decode(a)
                        } catch (d) {
                            return t
                        }
                        c = a.charAt(0);
                        return Number(c) == c && x[c] ? 1 < a.length ? {
                            type: x[c],
                            data: a.substring(1)
                        } : {
                            type: x[c]
                        } : t
                    }
                    c = (new Uint8Array(a))[0];
                    a = h(a, 1);
                    v && "blob" === b && (a = new v([a]));
                    return {
                        type: x[c],
                        data: a
                    }
                };
                g.decodeBase64Packet = function (a, b) {
                    var c = x[a.charAt(0)];
                    if (!e.ArrayBuffer) return {
                        type: c,
                        data: {
                            base64: !0,
                            data: a.substr(1)
                        }
                    };
                    var d = l.decode(a.substr(1));
                    "blob" === b && v && (d = new v([d]));
                    return {
                        type: c,
                        data: d
                    }
                };
                g.encodePayload = function (b, c, e) {
                    "function" == typeof c && (e = c, c = null);
                    var f = d(b);
                    if (c && f) return v && !y ? g.encodePayloadAsBlob(b, e) : g.encodePayloadAsArrayBuffer(b, e);
                    if (!b.length) return e("0:");
                    a(b, function (a,
                    b) {
                        g.encodePacket(a, f ? c : !1, !0, function (a) {
                            b(null, a.length + ":" + a)
                        })
                    }, function (a, b) {
                        return e(b.join(""))
                    })
                };
                g.decodePayload = function (a, b, c) {
                    if ("string" != typeof a) return g.decodePayloadAsBinary(a, b, c);
                    "function" === typeof b && (c = b, b = null);
                    var d;
                    if ("" == a) return c(t, 0, 1);
                    d = "";
                    for (var e, f, h = 0, m = a.length; h < m; h++) if (f = a.charAt(h), ":" != f) d += f;
                    else {
                        if ("" == d || d != (e = Number(d))) return c(t, 0, 1);
                        f = a.substr(h + 1, e);
                        if (d != f.length) return c(t, 0, 1);
                        if (f.length) {
                            d = g.decodePacket(f, b, !0);
                            if (t.type == d.type && t.data == d.data) return c(t,
                            0, 1);
                            if (!1 === c(d, h + e, m)) return
                        }
                        h += e;
                        d = ""
                    }
                    if ("" != d) return c(t, 0, 1)
                };
                g.encodePayloadAsArrayBuffer = function (b, c) {
                    if (!b.length) return c(new ArrayBuffer(0));
                    a(b, function (a, b) {
                        g.encodePacket(a, !0, !0, function (a) {
                            return b(null, a)
                        })
                    }, function (a, b) {
                        var d = b.reduce(function (a, b) {
                            var c;
                            c = "string" === typeof b ? b.length : b.byteLength;
                            return a + c.toString().length + c + 2
                        }, 0),
                            e = new Uint8Array(d),
                            f = 0;
                        b.forEach(function (a) {
                            var b = "string" === typeof a,
                                c = a;
                            if (b) {
                                for (var c = new Uint8Array(a.length), d = 0; d < a.length; d++) c[d] = a.charCodeAt(d);
                                c = c.buffer
                            }
                            b ? e[f++] = 0 : e[f++] = 1;
                            a = c.byteLength.toString();
                            for (d = 0; d < a.length; d++) e[f++] = parseInt(a[d]);
                            e[f++] = 255;
                            c = new Uint8Array(c);
                            for (d = 0; d < c.length; d++) e[f++] = c[d]
                        });
                        return c(e.buffer)
                    })
                };
                g.encodePayloadAsBlob = function (b, c) {
                    a(b, function (a, b) {
                        g.encodePacket(a, !0, !0, function (a) {
                            var c = new Uint8Array(1);
                            c[0] = 1;
                            if ("string" === typeof a) {
                                for (var d = new Uint8Array(a.length), e = 0; e < a.length; e++) d[e] = a.charCodeAt(e);
                                a = d.buffer;
                                c[0] = 0
                            }
                            for (var d = (a instanceof ArrayBuffer ? a.byteLength : a.size).toString(), f = new Uint8Array(d.length + 1), e = 0; e < d.length; e++) f[e] = parseInt(d[e]);
                            f[d.length] = 255;
                            v && (a = new v([c.buffer, f.buffer, a]), b(null, a))
                        })
                    }, function (a, b) {
                        return c(new v(b))
                    })
                };
                g.decodePayloadAsBinary = function (a, b, c) {
                    "function" === typeof b && (c = b, b = null);
                    for (var d = [], e = !1; 0 < a.byteLength;) {
                        for (var f = new Uint8Array(a), m = 0 === f[0], k = "", l = 1; 255 != f[l]; l++) {
                            if (310 < k.length) {
                                e = !0;
                                break
                            }
                            k += f[l]
                        }
                        if (e) return c(t, 0, 1);
                        a = h(a, 2 + k.length);
                        k = parseInt(k);
                        f = h(a, 0, k);
                        if (m) try {
                            f = String.fromCharCode.apply(null, new Uint8Array(f))
                        } catch (v) {
                            for (m = new Uint8Array(f),
                            f = "", l = 0; l < m.length; l++) f += String.fromCharCode(m[l])
                        }
                        d.push(f);
                        a = h(a, k)
                    }
                    var p = d.length;
                    d.forEach(function (a, d) {
                        c(g.decodePacket(a, b, !0), d, p)
                    })
                }
            }).call(this, "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : "undefined" !== typeof global ? global : {})
        }, {
            "./keys": 21,
            after: 11,
            "arraybuffer.slice": 12,
            "base64-arraybuffer": 13,
            blob: 14,
            "has-binary": 22,
            utf8: 30
        }],
        21: [function (f, h, g) {
            h.exports = Object.keys || function (e) {
                var b = [],
                    a = Object.prototype.hasOwnProperty,
                    c;
                for (c in e) a.call(e, c) && b.push(c);
                return b
            }
        }, {}],
        22: [function (f, h, g) {
            (function (e) {
                var b = f("isarray");
                h.exports = function (a) {
                    function c(a) {
                        if (!a) return !1;
                        if (e.Buffer && e.Buffer.isBuffer(a) || e.ArrayBuffer && a instanceof ArrayBuffer || e.Blob && a instanceof Blob || e.File && a instanceof File) return !0;
                        if (b(a)) for (var f = 0; f < a.length; f++) {
                            if (c(a[f])) return !0
                        } else if (a && "object" == typeof a) for (f in a.toJSON && (a = a.toJSON()), a) if (Object.prototype.hasOwnProperty.call(a, f) && c(a[f])) return !0;
                        return !1
                    }
                    return c(a)
                }
            }).call(this, "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : "undefined" !== typeof global ? global : {})
        }, {
            isarray: 25
        }],
        23: [function (f, h, g) {
            try {
                h.exports = "undefined" !== typeof XMLHttpRequest && "withCredentials" in new XMLHttpRequest
            } catch (e) {
                h.exports = !1
            }
        }, {}],
        24: [function (f, h, g) {
            var e = [].indexOf;
            h.exports = function (b, a) {
                if (e) return b.indexOf(a);
                for (var c = 0; c < b.length; ++c) if (b[c] === a) return c;
                return -1
            }
        }, {}],
        25: [function (f, h, g) {
            h.exports = Array.isArray || function (e) {
                return "[object Array]" == Object.prototype.toString.call(e)
            }
        }, {}],
        26: [function (f, h, g) {
            function e(a) {
                a =
                    "" + a;
                if (!(1E4 < a.length) && (a = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(a))) {
                    var b = parseFloat(a[1]);
                    switch ((a[2] || "ms").toLowerCase()) {
                        case "years":
                        case "year":
                        case "yrs":
                        case "yr":
                        case "y":
                            return 315576E5 * b;
                        case "days":
                        case "day":
                        case "d":
                            return 864E5 * b;
                        case "hours":
                        case "hour":
                        case "hrs":
                        case "hr":
                        case "h":
                            return 36E5 * b;
                        case "minutes":
                        case "minute":
                        case "mins":
                        case "min":
                        case "m":
                            return 6E4 * b;
                        case "seconds":
                        case "second":
                        case "secs":
                        case "sec":
                        case "s":
                            return 1E3 * b;
                        case "milliseconds":
                        case "millisecond":
                        case "msecs":
                        case "msec":
                        case "ms":
                            return b
                    }
                }
            }
            function b(a, b, d) {
                if (!(a < b)) return a < 1.5 * b ? Math.floor(a / b) + " " + d : Math.ceil(a / b) + " " + d + "s"
            }
            h.exports = function (a, c) {
                c = c || {};
                return "string" == typeof a ? e(a) : c["long"] ? b(a, 864E5, "day") || b(a, 36E5, "hour") || b(a, 6E4, "minute") || b(a, 1E3, "second") || a + " ms" : 864E5 <= a ? Math.round(a / 864E5) + "d" : 36E5 <= a ? Math.round(a / 36E5) + "h" : 6E4 <= a ? Math.round(a / 6E4) + "m" : 1E3 <= a ? Math.round(a / 1E3) + "s" : a + "ms"
            }
        }, {}],
        27: [function (f, h, g) {
            (function (e) {
                var b =
                    /^[\],:{}\s]*$/,
                    a = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
                    c = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                    d = /(?:^|:|,)(?:\s*\[)+/g,
                    f = /^\s+/,
                    g = /\s+$/;
                h.exports = function (h) {
                    if ("string" != typeof h || !h) return null;
                    h = h.replace(f, "").replace(g, "");
                    if (e.JSON && JSON.parse) return JSON.parse(h);
                    if (b.test(h.replace(a, "@").replace(c, "]").replace(d, ""))) return (new Function("return " + h))()
                }
            }).call(this, "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : "undefined" !== typeof global ? global : {})
        }, {}],
        28: [function (f, h, g) {
            g.encode = function (e) {
                var b = "",
                    a;
                for (a in e) e.hasOwnProperty(a) && (b.length && (b += "&"), b += encodeURIComponent(a) + "=" + encodeURIComponent(e[a]));
                return b
            };
            g.decode = function (e) {
                var b = {};
                e = e.split("&");
                for (var a = 0, c = e.length; a < c; a++) {
                    var d = e[a].split("=");
                    b[decodeURIComponent(d[0])] = decodeURIComponent(d[1])
                }
                return b
            }
        }, {}],
        29: [function (f, h, g) {
            var e = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
                b = "source protocol authority userInfo user password host port relative path directory file query anchor".split(" ");
            h.exports = function (a) {
                var c = a,
                    d = a.indexOf("["),
                    f = a.indexOf("]"); - 1 != d && -1 != f && (a = a.substring(0, d) + a.substring(d, f).replace(/:/g, ";") + a.substring(f, a.length));
                a = e.exec(a || "");
                for (var g = {}, h = 14; h--;) g[b[h]] = a[h] || ""; - 1 != d && -1 != f && (g.source = c, g.host = g.host.substring(1, g.host.length - 1).replace(/;/g, ":"), g.authority = g.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), g.ipv6uri = !0);
                return g
            }
        }, {}],
        30: [function (f, h, g) {
            (function (e) {
                (function (b) {
                    function a(a) {
                        for (var b = [], c = 0, d = a.length, e, f; c < d;) e = a.charCodeAt(c++), 55296 <= e && 56319 >= e && c < d ? (f = a.charCodeAt(c++), 56320 == (f & 64512) ? b.push(((e & 1023) << 10) + (f & 1023) + 65536) : (b.push(e), c--)) : b.push(e);
                        return b
                    }
                    function c(a) {
                        if (55296 <= a && 57343 >= a) throw Error("Lone surrogate U+" + a.toString(16).toUpperCase() + " is not a scalar value");
                    }
                    function d() {
                        if (u >= y) throw Error("Invalid byte index");
                        var a = p[u] & 255;
                        u++;
                        if (128 == (a & 192)) return a & 63;
                        throw Error("Invalid continuation byte");
                    }
                    function f() {
                        var a, b, e, g;
                        if (u > y) throw Error("Invalid byte index");
                        if (u == y) return !1;
                        a = p[u] & 255;
                        u++;
                        if (0 == (a & 128)) return a;
                        if (192 == (a & 224)) {
                            b = d();
                            a = (a & 31) << 6 | b;
                            if (128 <= a) return a;
                            throw Error("Invalid continuation byte");
                        }
                        if (224 == (a & 240)) {
                            b = d();
                            e = d();
                            a = (a & 15) << 12 | b << 6 | e;
                            if (2048 <= a) return c(a), a;
                            throw Error("Invalid continuation byte");
                        }
                        if (240 == (a & 248) && (b = d(), e = d(), g = d(), a = (a & 15) << 18 | b << 12 | e << 6 | g, 65536 <= a && 1114111 >= a)) return a;
                        throw Error("Invalid UTF-8 detected");
                    }
                    var l = "object" == typeof g && g,
                        m = "object" == typeof h && h && h.exports == l && h,
                        k = "object" == typeof e && e;
                    if (k.global === k || k.window === k) b = k;
                    var q = String.fromCharCode,
                        p, y, u, k = {
                            version: "2.0.0",
                            encode: function (b) {
                                b = a(b);
                                for (var d = b.length, e = -1, f, g = ""; ++e < d;) {
                                    f = b[e];
                                    if (0 == (f & 4294967168)) f = q(f);
                                    else {
                                        var h = "";
                                        0 == (f & 4294965248) ? h = q(f >> 6 & 31 | 192) : 0 == (f & 4294901760) ? (c(f), h = q(f >> 12 & 15 | 224), h += q(f >> 6 & 63 | 128)) : 0 == (f & 4292870144) && (h = q(f >> 18 & 7 | 240), h += q(f >> 12 & 63 | 128), h += q(f >> 6 & 63 | 128));
                                        f = h += q(f & 63 | 128)
                                    }
                                    g += f
                                }
                                return g
                            },
                            decode: function (b) {
                                p = a(b);
                                y = p.length;
                                u = 0;
                                b = [];
                                for (var c; !1 !== (c = f());) b.push(c);
                                c = b.length;
                                for (var d = -1, e, g = ""; ++d < c;) e = b[d], 65535 < e && (e -= 65536, g += q(e >>> 10 & 1023 | 55296), e = 56320 | e & 1023), g += q(e);
                                return g
                            }
                        };
                    if (l && !l.nodeType) if (m) m.exports = k;
                    else {
                        b = {}.hasOwnProperty;
                        for (var x in k) b.call(k, x) && (l[x] = k[x])
                    } else b.utf8 = k
                })(this)
            }).call(this, "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : "undefined" !== typeof global ? global : {})
        }, {}],
        31: [function (f, h, g) {
            function e(b) {
                var c = "";
                do c = a[b % 64] + c, b = Math.floor(b / 64);
                while (0 < b);
                return c
            }
            function b() {
                var a = e(+new Date);
                return a !== l ? (d = 0, l = a) : a + "." + e(d++)
            }
            for (var a = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split(""), c = {}, d = 0, n = 0, l; 64 > n; n++) c[a[n]] = n;
            b.encode = e;
            b.decode = function (a) {
                var b = 0;
                for (n = 0; n < a.length; n++) b = 64 * b + c[a.charAt(n)];
                return b
            };
            h.exports = b
        }, {}]
    }, {}, [1])(1)
});

(function (c) {
    "function" === typeof define && define.amd ? define(["jquery"], c) : "object" === typeof exports ? c(require("jquery")) : c(jQuery)
})(function (c) {
    function p(a) {
        a = e.json ? JSON.stringify(a) : String(a);
        return e.raw ? a : encodeURIComponent(a)
    }
    function n(a, g) {
        var b;
        if (e.raw) b = a;
        else a: {
            var d = a;
            0 === d.indexOf('"') && (d = d.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
            try {
                d = decodeURIComponent(d.replace(l, " "));
                b = e.json ? JSON.parse(d) : d;
                break a
            } catch (h) {}
            b = void 0
        }
        return c.isFunction(g) ? g(b) : b
    }
    var l = /\+/g,
        e = c.cookie = function (a, g, b) {
            if (1 < arguments.length && !c.isFunction(g)) {
                b = c.extend({}, e.defaults, b);
                if ("number" === typeof b.expires) {
                    var d = b.expires,
                        h = b.expires = new Date;
                    h.setTime(+h + 864E5 * d)
                }
                return document.cookie = [e.raw ? a : encodeURIComponent(a), "=", p(g), b.expires ? "; expires=" + b.expires.toUTCString() : "", b.path ? "; path=" + b.path : "", b.domain ? "; domain=" + b.domain : "", b.secure ? "; secure" : ""].join("")
            }
            for (var d = a ? void 0 : {}, h = document.cookie ? document.cookie.split("; ") : [], m = 0, l = h.length; m < l; m++) {
                var f = h[m].split("="),
                    k;
                k = f.shift();
                k = e.raw ? k : decodeURIComponent(k);
                f = f.join("=");
                if (a && a === k) {
                    d = n(f, g);
                    break
                }
                a || void 0 === (f = n(f)) || (d[k] = f)
            }
            return d
        };
    e.defaults = {};
    c.removeCookie = function (a, e) {
        if (void 0 === c.cookie(a)) return !1;
        c.cookie(a, "", c.extend({}, e, {
            expires: -1
        }));
        return !c.cookie(a)
    }
});

(function (f) {
    function e(a, b, c) {
        var d = document.createElement("source");
        d.src = c;
        d.type = "video/" + b;
        a.appendChild(d)
    }
    var c = function (a) {
        this.enabled = !1;
        "web" == a.app && (a.ua.os && "iOS" == a.ua.os.name && a.ua.browser && "Safari" == a.ua.browser.name ? "0" != $.cookie("nosleep") && (this.mechanism = "refresh") : a.ua.os && "iOS" == a.ua.os.name || (this.mechanism = "video", this.video = document.createElement("video"), this.video.setAttribute("loop", ""), e(this.video, "webm", "data:video/webm;base64,GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYU4BnQI0VSalmQCgq17FAAw9CQE2AQAZ3aGFtbXlXQUAGd2hhbW15RIlACECPQAAAAAAAFlSua0AxrkAu14EBY8WBAZyBACK1nEADdW5khkAFVl9WUDglhohAA1ZQOIOBAeBABrCBCLqBCB9DtnVAIueBAKNAHIEAAIAwAQCdASoIAAgAAUAmJaQAA3AA/vz0AAA="),
        e(this.video, "mp4", "data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAAG21kYXQAAAGzABAHAAABthADAowdbb9/AAAC6W1vb3YAAABsbXZoZAAAAAB8JbCAfCWwgAAAA+gAAAAAAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIVdHJhawAAAFx0a2hkAAAAD3wlsIB8JbCAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAIAAAACAAAAAABsW1kaWEAAAAgbWRoZAAAAAB8JbCAfCWwgAAAA+gAAAAAVcQAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAAVxtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAEcc3RibAAAALhzdHNkAAAAAAAAAAEAAACobXA0dgAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAIAAgASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAAFJlc2RzAAAAAANEAAEABDwgEQAAAAADDUAAAAAABS0AAAGwAQAAAbWJEwAAAQAAAAEgAMSNiB9FAEQBFGMAAAGyTGF2YzUyLjg3LjQGAQIAAAAYc3R0cwAAAAAAAAABAAAAAQAAAAAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAFHN0c3oAAAAAAAAAEwAAAAEAAAAUc3RjbwAAAAAAAAABAAAALAAAAGB1ZHRhAAAAWG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAAK2lsc3QAAAAjqXRvbwAAABtkYXRhAAAAAQAAAABMYXZmNTIuNzguMw==")));
        return this
    };
    c.prototype.enable = function (a) {
        if (!this.enabled) if (this.enabled = !0, "video" == this.mechanism) this.video.play();
        else if ("refresh" == this.mechanism) {
            for (var b = window; b.parent != b;) b = b.parent;
            this.refresh = window.setInterval(function () {
                b.document.location.href = "/nosleep";
                b.setTimeout(window.stop, 0)
            }, 1E4)
        }
    };
    c.prototype.disable = function () {
        this.enabled && (this.enabled = !1, "video" == this.mechanism ? this.video.pause() : "refresh" == this.mechanism && window.clearInterval(this.refresh))
    };
    f.NoSleep = c
})(this);

function NanoSlider(b, c) {
    var a = this;
    a.options = c || {};
    a.options.transition = a.options.transition || "left 0.3s ease-out";
    a.items = [];
    a.bullets = [];
    a.position = 0;
    a.click_event = "touchstart";
    "ontouchstart" in document.createElement("div") || (a.click_event = "click");
    for (var e = b.getElementsByTagName("div"), d = 0; d < e.length; ++d) e[d].parentNode == b && a.items.push(e[d]);
    e = a.createElement_("div", {
        position: "absolute",
        left: "0",
        top: "0",
        height: "100%",
        width: "100%",
        overflow: "hidden"
    });
    a.sled = a.createElement_("div", {
        position: "absolute",
        left: "0%",
        top: "0",
        height: "100%",
        width: 100 * a.items.length + "%",
        transition: a.options.transition
    });
    var g = document.createElement("div");
    a.options.bullet_container_class ? g.className = a.options.bullet_container_class : a.setStyles_(g, {
        position: "absolute",
        left: "0",
        bottom: "5%",
        width: "100%",
        textAlign: "center"
    });
    for (d = 0; d < a.items.length; ++d) {
        var m = a.items[d],
            k = a.createElement_("div", {
                position: "absolute",
                left: 100 * d / a.items.length + "%",
                width: 100 / a.items.length + "%",
                top: "0",
                height: "100%"
            });
        a.items[d] = k;
        b.removeChild(m);
        k.appendChild(m);
        a.sled.appendChild(k);
        var f = document.createElement("div");
        a.options.bullet_active_class && a.options.bullet_inactive_class ? f.className = a.options.bullet_inactive_class : a.setStyles_(f, {
            display: "inline-block",
            width: "10px",
            height: "10px",
            backgroundColor: "white",
            borderRadius: "5px",
            marginLeft: "4px",
            marginRight: "4px",
            cursor: "pointer"
        });
        (function (b) {
            f.addEventListener(a.click_event, function () {
                a.autoplay_interval && (window.clearInterval(a.autoplay_interval), a.autoplay_interval = null);
                a.navigateTo(b)
            })
        })(d);
        g.appendChild(f);
        a.bullets.push(f)
    }
    e.appendChild(a.sled);
    b.appendChild(e);
    1 < a.items.length && b.appendChild(g);
    a.options.arrow_left_class && (a.arrow_left = a.createElement_("div"), a.arrow_left.className = a.options.arrow_left_class, a.arrow_left.addEventListener(a.click_event, function () {
        a.autoplay_interval && (window.clearInterval(a.autoplay_interval), a.autoplay_interval = null);
        a.navigate(-1)
    }), b.appendChild(a.arrow_left));
    a.options.arrow_right_class && (a.arrow_right = a.createElement_("div"), a.arrow_right.className = a.options.arrow_right_class, a.arrow_right.addEventListener(a.click_event, function () {
        a.autoplay_interval && (window.clearInterval(a.autoplay_interval), a.autoplay_interval = null);
        a.navigate(1)
    }), b.appendChild(a.arrow_right));
    var n, l, h;
    a.sled.addEventListener("touchstart", function (b) {
        b = b.originalEvent || b;
        h = l = b.touches[0].pageX;
        a.sled.style.transition = "";
        n = a.sled.getBoundingClientRect();
        a.autoplay_interval && (window.clearInterval(a.autoplay_interval), a.autoplay_interval = null)
    });
    a.sled.addEventListener("touchmove",

    function (b) {
        b = b.originalEvent || b;
        h = b.touches[0].pageX;
        a.sled.style.left = 100 * (-a.position + (h - l) / n.width * a.items.length) + "%"
    });
    a.sled.addEventListener("touchend", function (b) {
        var c = l - h;
        a.sled.style.transition = a.options.transition;
        10 < Math.abs(c) ? window.setTimeout(function () {
            a.navigate(0 > c ? -1 : 1)
        }) : window.setTimeout(function () {
            a.navigateTo(a.position)
        })
    });
    a.navigateTo(0);
    c.auto_play && a.autoPlay(c.auto_play)
}
NanoSlider.prototype.navigate = function (b) {
    this.navigateTo(this.position + b)
};
NanoSlider.prototype.navigateTo = function (b) {
    this.position = Math.min(this.items.length - 1, Math.max(0, b));
    this.sled.style.left = 100 * -this.position + "%";
    this.arrow_left && (this.options.arrow_inactive_class ? this.arrow_left.className = this.options.arrow_left_class + (0 == this.position ? " " + this.options.arrow_inactive_class : "") : this.arrow_left.style.display = 0 == this.position ? "none" : "");
    this.arrow_right && (this.options.arrow_inactive_class ? this.arrow_right.className = this.options.arrow_right_class + (this.position == this.items.length - 1 ? " " + this.options.arrow_inactive_class : "") : this.arrow_right.style.display = this.position == this.items.length - 1 ? "none" : "");
    for (b = 0; b < this.bullets.length; ++b) this.options.bullet_active_class && this.options.bullet_inactive_class ? this.bullets[b].className = b == this.position ? this.options.bullet_active_class : this.options.bullet_inactive_class : this.bullets[b].style.opacity = b == this.position ? 1 : .5
};
NanoSlider.prototype.autoPlay = function (b) {
    var c = this;
    c.autoplay_interval && window.clearInterval(c.autoplay_interval);
    c.autoplay_interval = window.setInterval(function () {
        c.navigateTo(c.position + 1)
    }, b)
};
NanoSlider.prototype.createElement_ = function (b, c) {
    var a = document.createElement(b);
    c && this.setStyles_(a, c);
    return a
};
NanoSlider.prototype.setStyles_ = function (b, c) {
    for (var a in c) b.style[a] = c[a]
};

(function (d) {
    d.GameConsole = function (a, b, c, d) {
        this.code = b;
        this.id = c;
        (this.data = d) && (this.data.version = 1);
        this.devices = null;
        this.setProxy();
        this.keep_alive = void 0;
        this.last_ignore = this.last_activity = 0;
        this.send_queue = [];
        this.rate_limit_randomness = 1E3 * Math.random() | 0;
        this.setupSocket(a)
    };
    d.GameConsole.prototype.setupSocket = function (a, b) {
        var c = this,
            e = "ws://";
        "undefined" !== typeof document && "https:" == document.location.protocol && (e = "wss://");
        var g = d.GameConsole.parseCode(c.code),
            f = new eio.Socket(e + a[g.server_id].ip);
        c.socket = f;
        f.on("open", function () {
            c.send(d.GameConsole.COMMAND.CONNECT, c.id, {
                code: g.server_code,
                data: c.data,
                reconnect: b
            });
            if (void 0 !== c.reconnect_queue) {
                var a = c.reconnect_queue;
                c.reconnect_queue = void 0;
                for (var e = 0; e < a.length; ++e) c.onproxy(a[e])
            }
            c.keep_alive = window.setInterval(function () {
                var a = (new Date).getTime();
                if (a - 200 > c.last_activity) {
                    var b = 200;
                    a - 2E4 > c.last_activity && (b = 900);
                    if (a - 12E4 > c.last_activity || !c.shouldSendIgnore()) b = 4900;
                    a - b >= c.last_ignore && (c.send(d.GameConsole.COMMAND.IGNORE), c.last_ignore = a)
                }
            }, 100)
        });
        f.on("message", function (a) {
            c.onMessage(a)
        });
        f.on("error", function () {
            window.console && console.log("Socket error");
            c.callMethod_("onerror")
        });
        f.on("close", function (b) {
            f == c.socket && (c.devices && c.devices[d.GameConsole.SCREEN] && void 0 == c.reconnect_queue ? (c.reconnect_queue = [], b = (new Date).getTime(), window.setTimeout(function () {
                c.setupSocket(a, !0)
            }, Math.max(500 - (b - (c.last_reconnect || 0)), 0)), c.last_reconnect = b) : (c.setProxy(), c.reconnect_queue = void 0, c.last_reconnect = void 0, c.callMethod_("onclose",
            b)), void 0 !== c.keep_alive && (window.clearInterval(c.keep_alive), c.keep_alive = void 0))
        })
    };
    d.GameConsole.prototype.onMessage = function (a) {
        a = d.GameConsole.parseMessage(a);
        if (a.command == d.GameConsole.COMMAND.MESSAGE) this.callMethod_("onmessage", a.id, a.data), this.callProxy({
            action: "message",
            from: a.id,
            data: a.data
        });
        else if (a.command == d.GameConsole.COMMAND.UPDATE) {
            var b = a.data;
            if (b && b.diff) {
                if (!this.devices[a.id]) return;
                try {
                    jsondiffpatch.patch(this.devices[a.id], b.diff)
                } catch (c) {
                    throw this.presence(), "jsondiffpatch failed!";
                }
                b = this.devices[a.id]
            } else this.setDeviceData(a.id, b);
            this.callMethod_("onupdate", a.id, b);
            this.callProxy({
                action: "update",
                device_id: a.id,
                device_data: b
            });
            this.callAdProxy({
                action: "update",
                device_id: a.id,
                device_data: b
            })
        } else a.command == d.GameConsole.COMMAND.PRESENCE ? this.send(d.GameConsole.COMMAND.UPDATE, a.id, this.data) : a.command == d.GameConsole.COMMAND.CONNECT ? null == a.data.code ? this.callMethod_("oninvalidcode") : (this.code = d.GameConsole.getCode(d.GameConsole.parseCode(this.code).server_id, a.data.code),
        this.id = a.data.id, this.devices = [], this.setDeviceData(this.id, this.data), this.presence(), this.callMethod_("onconnect")) : a.command == d.GameConsole.COMMAND.ECHO ? this.callMethod_("onecho", a.data) : a.command == d.GameConsole.COMMAND.TIME ? (b = (new Date).getTime(), b = (a.data.server_timestamp - a.data.device_timestamp + a.data.server_timestamp - b) / 2, a.data.offset || (a.data.offset = []), a.data.offset.push(b), 7 == a.data.offset.length ? (a.data.offset.sort(function (a, b) {
            return a - b
        }), b = Math.round(a.data.offset[3]) | 0, this.data.location = this.proxy_location, this.data.custom && delete this.data.custom, this.updatePresence(this.data), this.callMethod_("onready", {
            device_id: this.id,
            code: this.code,
            devices: this.devices,
            server_time_offset: b,
            device_motion: this.device_motion
        }), this.callProxy({
            action: "ready",
            device_id: this.id,
            code: this.code,
            devices: this.devices,
            server_time_offset: b
        })) : (a.data.device_timestamp = (new Date).getTime(), this.send(d.GameConsole.COMMAND.TIME, void 0, a.data))) : a.command == d.GameConsole.COMMAND.RTC_CANDIDATE ? this.callMethod_("onrtccandidate",
        a.id, a.data) : a.command == d.GameConsole.COMMAND.RTC_OFFER ? this.callMethod_("onrtcoffer", a.id, a.data) : a.command == d.GameConsole.COMMAND.RTC_ANSWER ? this.callMethod_("onrtcanswer", a.id, a.data) : a.command == d.GameConsole.COMMAND.ADMESSAGE && this.callAdProxy({
            action: "admessage",
            from: a.id,
            data: a.data
        });
        if (a.command == d.GameConsole.COMMAND.MESSAGE || a.command == d.GameConsole.COMMAND.UPDATE || a.command == d.GameConsole.COMMAND.ADMESSAGE) this.last_activity = (new Date).getTime()
    };
    d.GameConsole.parseCode = function (a) {
        var b = {};
        a = a.replace(/[^0-9]/g, "");
        if (a.length) {
            var c = parseInt(a[0]);
            c && c + 1 <= a.length && (b.server_id = parseInt(a.substr(1, c)));
            a.length > c + 1 && (b.server_code = parseInt(a.substr(c + 1)))
        }
        return b
    };
    d.GameConsole.getCode = function (a, b) {
        var c = "";
        if (void 0 !== a) {
            c = a.toString();
            if (9 < c.length) throw "Too long server id!";
            c = c.length + c
        } else void 0 !== b && (c = "0");
        void 0 !== b && (c += b.toString());
        if (5 <= c.length) for (var d = c.length - 1; 0 <= d; --d) d && 0 == d % 3 && (c = c.substr(0, d) + " " + c.substr(d));
        return c
    };
    d.GameConsole.prototype.shouldSendIgnore = function () {
        return !0
    };
    d.GameConsole.prototype.shouldSendMessage = function (a, b, c) {
        return !0
    };
    d.GameConsole.prototype.send = function (a, b, c) {
        this.shouldSendMessage(a, b, c) && (b = d.GameConsole.createMessage(a, b, c), a == d.GameConsole.COMMAND.MESSAGE || a == d.GameConsole.COMMAND.UPDATE || b.command == d.GameConsole.COMMAND.ADMESSAGE ? (this.last_activity = (new Date).getTime(), this.send_queue.push(b), this.sendNextInQueue()) : this.socket.send(b))
    };
    d.GameConsole.prototype.sendNextInQueue = function () {
        var a = (new Date).getTime() + this.rate_limit_randomness,
            b = a / 1E3 | 0;
        this.rate_limit_second != b && (this.rate_limit_second = b, this.rate_limit_count = 0);
        if (10 > this.rate_limit_count) this.rate_limit_count++, this.send_queue.length && (this.socket.send(this.send_queue.shift()), this.send_queue.length && this.sendNextInQueue());
        else if (!this.send_queue_timeout) {
            b = void 0;
            if (this.send_queue && this.send_queue.length) {
                var c = d.GameConsole.parseMessageRaw(this.send_queue[0]);
                c.command == d.GameConsole.COMMAND.UPDATE ? b = "Device Update: " + c.data : c.command == d.GameConsole.COMMAND.MESSAGE && (b = void 0 == c.id ? "Broadcast: " + c.data : "Message to " + c.id + ": " + c.data)
            }
            window.console && window.console.error && window.console.error("Rate limiting to 10 messages/updates per second.", b);
            var e = this;
            this.send_queue_timeout = window.setTimeout(function () {
                e.send_queue_timeout = null;
                e.sendNextInQueue()
            }, 1E3 - a % 1E3);
            e.callMethod_("onratelimit", b)
        }
    };
    d.GameConsole.prototype.callProxy = function (a) {
        this.proxy && this.proxy.postMessage(a, "*")
    };
    d.GameConsole.prototype.callAdProxy = function (a) {
        this.ad_proxy && this.ad_proxy.postMessage(a, "*")
    };
    d.GameConsole.parseMessageRaw = function (a) {
        var b = a.indexOf(";"); - 1 == b && (b = void 0);
        var c = parseInt(a.substring(1, b));
        c || 0 === c || (c = void 0);
        b = void 0 !== b ? a.substr(b + 1) : void 0;
        return {
            command: a[0],
            id: c,
            data: b
        }
    };
    d.GameConsole.parseMessage = function (a) {
        a = d.GameConsole.parseMessageRaw(a);
        void 0 !== a.data && (a.data = JSON.parse(a.data));
        return a
    };
    d.GameConsole.createMessageRaw = function (a, b, c) {
        return a + (void 0 === b ? "" : b) + (void 0 === c ? "" : ";" + c)
    };
    d.GameConsole.createMessage = function (a,
    b, c) {
        return d.GameConsole.createMessageRaw(a, b, JSON.stringify(c))
    };
    d.GameConsole.COMMAND = {
        IGNORE: "i",
        ECHO: "e",
        CONNECT: "c",
        MESSAGE: "m",
        PRESENCE: "p",
        UPDATE: "u",
        TIME: "t",
        RTC_CANDIDATE: "r",
        RTC_OFFER: "o",
        RTC_ANSWER: "a",
        ADMESSAGE: "d"
    };
    d.GameConsole.SCREEN = 0;
    d.GameConsole.prototype.callMethod_ = function (a, b, c) {
        if (this[a]) this[a](b, c)
    };
    d.GameConsole.prototype.close = function () {
        this.socket.close()
    };
    d.GameConsole.prototype.setProxy = function (a) {
        var b = this;
        a ? (b.setProxy(), b.proxy = a, b.proxy_listener = function (a) {
            b.onproxy(a.data)
        },
        window.addEventListener("message", b.proxy_listener, !1)) : this.proxy_listener && (window.removeEventListener("message", this.proxy_listener), b.proxy_listener = null, b.proxy = null)
    };
    d.GameConsole.prototype.onproxy = function (a) {
        void 0 !== this.reconnect_queue ? this.reconnect_queue.push(a) : "message" == a.action ? this.message(a.to, a.data) : "presence" == a.action ? this.callProxy({
            action: "presence",
            devices: this.devices
        }) : "ready" == a.action ? (this.proxy_version = a.version, this.proxy_location = a.location, this.device_motion = a.device_motion,
        a.synchronize_time ? this.send(d.GameConsole.COMMAND.TIME, void 0, {
            device_timestamp: (new Date).getTime()
        }) : (this.data.location = this.proxy_location, this.data.custom && delete this.data.custom, this.updatePresence(this.data), this.callMethod_("onready", {
            device_id: this.id,
            code: this.code,
            devices: this.devices,
            device_motion: this.device_motion
        }), this.callProxy({
            action: "ready",
            device_id: this.id,
            code: this.code,
            devices: this.devices
        }))) : "set" == a.action ? this.callMethod_("onproxyset", a.key, a.value) : "jserror" == a.action && this.callMethod_("onproxyjserror", a)
    };
    d.GameConsole.prototype.onadproxy = function (a) {
        "adready" == a.action ? (this.data.ad || (this.data.ad = {}), this.data.ad.loaded = !0, this.updatePresence(this.data), this.callMethod_("onadready"), this.callAdProxy({
            action: "adready",
            device_id: this.id,
            code: this.code,
            devices: this.devices
        })) : "admessage" == a.action && this.send(d.GameConsole.COMMAND.ADMESSAGE, a.to, a.data)
    };
    d.GameConsole.prototype.setAdProxy = function (a) {
        var b = this;
        a ? (b.setAdProxy(), b.ad_proxy = a, b.ad_proxy_listener = function (a) {
            b.onadproxy(a.data)
        }, window.addEventListener("message", b.ad_proxy_listener, !1)) : this.ad_proxy_listener && (window.removeEventListener("message", this.ad_proxy_listener), b.ad_proxy_listener = null, b.ad_proxy = null)
    };
    d.GameConsole.prototype.presence = function () {
        this.send(d.GameConsole.COMMAND.PRESENCE)
    };
    d.GameConsole.prototype.echo = function (a) {
        this.send(d.GameConsole.COMMAND.ECHO, void 0, a)
    };
    d.GameConsole.prototype.setDeviceData = function (a, b) {
        for (; a >= this.devices.length;) this.devices.push(null);
        this.devices[a] = b
    };
    d.GameConsole.prototype.updateProfile = function () {
        this.updatePresence(this.data, "profile");
        this.callProxy({
            action: "profile",
            nickname: this.data.nickname,
            auth: this.data.auth,
            picture: this.data.picture
        });
        this.callAdProxy({
            action: "profile",
            nickname: this.data.nickname,
            auth: this.data.auth,
            picture: this.data.picture
        })
    };
    d.GameConsole.prototype.updatePresence = function (a, b, c) {
        a._is_custom_update && delete a._is_custom_update;
        a._is_players_update && delete a._is_players_update;
        a._is_profile_update && delete a._is_profile_update;
        a._is_ad_update && delete a._is_ad_update;
        a._is_ad_custom_update && delete a._is_ad_custom_update;
        a._is_premium_update && delete a._is_premium_update;
        a._is_player_limit_action_update && delete a._is_player_limit_action_update;
        b && (a["_is_" + b + "_update"] = c || 1);
        b = this.data = a;
        for (c = 0; c < this.devices.length; ++c) if (this.devices[c] && !this.devices[c].version) return;
        if (void 0 != this.last_sent_update) {
            b = {
                diff: jsondiffpatch.diff(this.last_sent_update, a)
            };
            if (!b.diff) return;
            this.id == d.GameConsole.SCREEN && (b.url = this.data.url)
        }
        this.last_sent_update = JSON.parse(JSON.stringify(this.data));
        this.setDeviceData(this.id, a);
        this.send(d.GameConsole.COMMAND.UPDATE, void 0, b)
    };
    d.GameConsole.prototype.message = function (a, b) {
        this.send(d.GameConsole.COMMAND.MESSAGE, a, b)
    };
    d.GameConsole.lowestPing = function (a, b, c, e) {
        c = c || 1;
        var g = "ws://";
        "undefined" !== typeof document && "https:" == document.location.protocol && (g = "wss://");
        var f = new eio.Socket(g + a),
            k, h = void 0,
            l = function () {
                0 < c && (c--, k = (new Date).getTime(), f.send(d.GameConsole.createMessage(d.GameConsole.COMMAND.ECHO)))
            };
        f.on("open", l);
        f.on("message", function (a) {
            if (d.GameConsole.parseMessage(a).command == d.GameConsole.COMMAND.ECHO) {
                a = (new Date).getTime() - k;
                if (void 0 === h || a < h) h = a;
                0 === c ? (b(h), f.close()) : e && b(h);
                l()
            }
        })
    };
    d.GameConsole.prototype.getNumberOfControllers = function () {
        for (var a = 0, b = 1; b < this.devices.length; ++b) this.devices[b] && a++;
        return a
    };
    d.GameConsole.prototype.hasPremiumController = function () {
        for (var a = 1; a < this.devices.length; ++a) if (this.devices[a] && this.devices[a].premium) return !0;
        return !1
    };
    d.GameConsole.getGameUrl = function (a) {
        if (a) return a = a.split("#")[0], a = a.split("?")[0], -1 !== a.indexOf("screen.html", a.length - 11) && (a = a.substr(0, a.length - 11)), -1 !== a.indexOf("controller.html", a.length - 15) && (a = a.substr(0, a.length - 15)), 0 == a.indexOf("https://") && (a = "http://" + a.substr(8)), a
    };
    d.GameConsole.gameName = function (a) {
        a = a.split("?")[0];
        a = a.split("#")[0];
        0 == a.indexOf("debug:") && (a = a.substr(6));
        0 == a.indexOf("https://") && (a = "http://" + a.substr(8));
        if ("undefined" !== typeof document && -1 != document.location.search.indexOf("simulator=true")) return "com.airconsole.developers";
        var b = a.split("/")[2];
        if (void 0 === b) return "com.airconsole.developers";
        if (0 == a.indexOf("http://storage.googleapis.com/") || 0 == a.indexOf("http://game.airconsole.com/")) b = a.split("/")[3];
        return -1 !== b.indexOf(".cdn.airconsole.com", b.length - 19) ? b.substr(0, b.length - 19) : "com.airconsole.developers"
    }
})("undefined" === typeof exports ? window : exports);

(function () {
    var a = {
        supportsFullScreen: !1,
        isFullScreen: function () {
            return !1
        },
        requestFullScreen: function () {},
        cancelFullScreen: function () {},
        toggleFullScreen: function (b) {
            a.isFullScreen() ? a.cancelFullScreen() : a.requestFullScreen(b)
        },
        fullScreenEventName: "",
        prefix: ""
    }, d = ["webkit", "moz", "o", "ms", "khtml"];
    if ("undefined" != typeof document.cancelFullScreen) a.supportsFullScreen = !0;
    else for (var c = 0, e = d.length; c < e; c++) if (a.prefix = d[c], "undefined" != typeof document[a.prefix + "CancelFullScreen"]) {
        a.supportsFullScreen = !0;
        break
    }
    a.supportsFullScreen && (a.fullScreenEventName = a.prefix + "fullscreenchange", a.isFullScreen = function () {
        switch (this.prefix) {
            case "":
                return document.fullScreen;
            case "webkit":
                return document.webkitIsFullScreen;
            default:
                return document[this.prefix + "FullScreen"]
        }
    }, a.requestFullScreen = function (b) {
        b = "" === this.prefix ? b.requestFullScreen() : b[this.prefix + "RequestFullScreen"]();
        a.was_fullscreen = !0;
        return b
    }, a.cancelFullScreen = function (a) {
        return "" === this.prefix ? document.cancelFullScreen() : document[this.prefix +
            "CancelFullScreen"]()
    });
    window.fullScreenApi = a
})();

function App() {
    ga("create", {
        trackingId: "UA-61986786-2",
        cookieDomain: "auto",
        userId: user_data.uid
    });
    ga("set", "dimension1", client.app);
    ga("set", "dimension2", user_data.premium ? "hero" : "normal");
    var a = "ontouchstart" in document.documentElement ? "touchstart" : "mousedown",
        b = "ontouchstart" in document.documentElement ? "touchend" : "mouseup",
        c = this;
    c.role = "controller";
    c.reported_exceptions = {};
    c.reported_relationships = {};
    c.games_allowed_to_access_email = ["com.airconsole.apps.karaoke", "com.airconsole.games.quiz", "com.airconsole.ads.schedule",
        "com.airconsole.ads.photobooth", "com.airconsole.ads.combined"];
    window.addEventListener("error", function (b) {
        c.reportException("com.airconsole.platform", b, static_path)
    });
    ga("send", "pageview", "/");
    DataCrunchIO.event("start", {
        client: {
            app: client.app,
            version: client.version
        },
        auth: user_data.auth
    });
    user_data.first_visit && (DataCrunchIO.tag("client", client.app), DataCrunchIO.tag("full", "true"));
    c.debug = !1;
    c.game = $("#iframe");
    c.orientation_div = $("#orientation");
    c.menu = $("#menu-container");
    c.has_shown_menu_button_tooltip = !1;
    c.menu_tooltip_ele = $("#home-button-tooltip");
    c.menu_tooltip_ele.on(a, function () {
        c.toggleMenuButtonTooltip(!1)
    });
    c.requested_orientation = null;
    c.no_sleep = new NoSleep(client);
    $(window).resize(function () {
        c.checkOrientation()
    });
    $(window).on("orientationchange", function () {
        c.checkOrientation()
    });
    c.setOrientation("portrait");
    c.code_div = $("#code-code");
    if (-1 != document.location.hash.indexOf("code=")) {
        c.showPage("code");
        var d = document.location.hash.split("code=")[1].split("&")[0];
        d && (c.setCodeValue(d), c.codePad(void 0,
            "enter"))
    } else !user_data.auth || c.shouldDownloadApp() ? c.showPage("welcome") : c.showInstructionsOrCode();
    window.addEventListener("message", function (b) {
        c.onWindowMessage(b.data)
    }, !1);
    c.renderMenu();
    c.reportStart("com.airconsole.platform", static_path);
    client.app == Clients.App.IntelXdk && window.parent && window.parent != window && 1.5 <= client.version && (d = "herosubscriptionmonthly3v1 herosubscriptionmonthly3v2 herosubscriptionmonthly5v1 herosubscriptionmonthly5v2 herosubscriptionmonthly1v1 herosubscriptionmonthly1v2".split(" "),
    1.6 <= client.version && d.push("herosubscriptionweek2v1"), 1.7 <= client.version && d.push("herosubscriptionyear30v1"), window.parent.parent.postMessage({
        action: "client_set_purchasable_items",
        items: d
    }, "*"), "Android" == client.ua.platform.name ? $("#premium-plans-store").html("Google Play Store") : $("#premium-plans-store").html("Account Settings"), $(".herosubscriptionmonthly").on(a, function () {
        var b = "herosubscriptionmonthly3v1";
        c.gc && c.gc.devices && c.gc.devices[GameConsole.SCREEN] && c.gc.devices[GameConsole.SCREEN].pricing && (b = c.gc.devices[GameConsole.SCREEN].pricing);
        c.buyPremium(b)
    }));
    user_data.auth && user_data.tz != (new Date).getTimezoneOffset() && $.post("/profile/tz", {
        tz: (new Date).getTimezoneOffset()
    });
    d = $("body");
    d.addClass("load");
    "iOS" == client.ua.platform.name && d.addClass("ios");
    $(".app-button, .menu-button, .menu-button-2").on(a, function () {
        $(this).addClass("app-button-active")
    }).on(b, function () {
        $(this).removeClass("app-button-active")
    })
}
App.prototype.keyboardInstance = function () {
    var a = this;
    if (this.keyboard) return this.keyboard;
    var b = AirConsoleKeyboard.defaultKeyboard(),
        c = {
            action: AirConsoleKeyboard.BACKSPACE,
            label: "&nbsp;",
            className: "airconsole-keyboard-backspace"
        };
    b.push(["0123456789".split(""), "qwertyuiop".split(""), "asdfghjkl".split(""), ["-", "z", "x", "c", "v", "b", "n", "m", c, c],
        ["@", "@", "_", ".", {
            action: AirConsoleKeyboard.DONE,
            label: "Done"
        }, {
            action: AirConsoleKeyboard.DONE,
            label: "Done"
        }]
    ]);
    var d = new AirConsoleKeyboard("keyboard", {
        layouts: b
    });
    this.keyboard = d;
    d.onActive = function () {
        $("#profile").addClass("profile-keyboard-active")
    };
    d.onInActive = function () {
        $("#profile").removeClass("profile-keyboard-active")
    };
    d.bind("profile-nickname", {
        onShow: function () {
            d.onActive()
        },
        onHide: function () {
            d.onInActive()
        }
    });
    d.bind("profile-email", {
        layout: b.length - 1,
        onShow: function () {
            "landscape" === a.orientation && $("#profile-nickname").hide();
            d.onActive()
        },
        onHide: function () {
            "landscape" === a.orientation && $("#profile-nickname").show();
            d.onInActive()
        }
    });
    return d
};
App.prototype.onWindowMessage = function (a) {
    var b = this;
    if ("facebook" == a.action) {
        if ("login" == a.facebook_action) {
            var c = a.facebook_success;
            c ? "connected" == c.status && (document.location.href = "/login/facebook?token=" + escape(c.authResponse.accessToken)) : a.facebook_error && alert("Error: " + a.facebook_error)
        }
    } else if ("device_motion_data" == a.action) this.gc && this.gc.callProxy({
        action: "device_motion",
        data: a.data
    });
    else if ("client_ad_show" == a.action || "client_ad_prepare" == a.action) client.app == Clients.App.IntelXdk && 1.3 <= client.version && window.parent && window.parent != window ? window.parent.postMessage(a, "*") : "client_ad_show" == a.action && this.gc && this.gc.callAdProxy({
        action: "client_ad_complete",
        success: !1
    });
    else if ("client_ad_complete" == a.action || "client_ad_start" == a.action) this.gc && this.gc.callAdProxy(a);
    else if ("client_email" == a.action) a.email ? ($("#device-loading").fadeIn(), document.location.href = "/client?email=" + encodeURIComponent(a.email)) : this.showInstructionsOrCode();
    else if ("client_purchased_item" == a.action) if (a.success) {
        c = null;
        b.url && (c = GameConsole.gameName(b.url));
        b.gc && b.gc.devices[GameConsole.SCREEN] && b.gc.devices[GameConsole.SCREEN].ad && b.gc.devices[GameConsole.SCREEN].ad.unlock && (c = b.gc.devices[GameConsole.SCREEN].ad.unlock);
        var d = {};
        b.gc && b.gc.devices && b.gc.devices[GameConsole.SCREEN] && b.gc.devices[GameConsole.SCREEN].experiments && (d = JSON.stringify(b.gc.devices[GameConsole.SCREEN].experiments));
        $.post("/purchase", {
            products: JSON.stringify([a.product]),
            receipt: a.product.receipt,
            platform: a.platform,
            game_id: c,
            id: a.id,
            experiments: d
        }, function (c) {
            c ? (b.becomePremium(a.id), $("#premium-status").html("You are a <span class=punch>Hero</span> now!"), window.setTimeout(function () {
                $("#premium").fadeOut()
            }, 2E3)) : ($("#premium-status").html("Verification <span class=error>failed</span>.<br><span class=punch>Restart</span> the app."), ga("send", "event", "Premium", "Fail.Invalid"), DataCrunchIO.event("Premium.Fail", {
                type: "Invalid"
            }))
        })
    } else ga("send", "event", "Premium", "Fail." + (a.log_id || "Cancel")), DataCrunchIO.event("Premium.Fail", {
        type: a.log_id || "Cancel"
    }), $("#premium-status").html("You are <span class=punch>missing</span> out."), $("#premium-plans").hide(), window.setTimeout(function () {
        $("#premium").fadeOut()
    }, 2E3);
    else "client_purchased_items" == a.action ? a.products && a.products.length && $.post("/purchase", {
        products: JSON.stringify(a.products),
        receipt: a.receipt,
        platform: a.platform
    }, function (a) {
        a && b.becomePremium()
    }) : "client_purchasable_items" == a.action && (user_data.premium || window.parent.postMessage({
        action: "client_get_purchases"
    },
        "*"))
};
App.prototype.setOrientation = function (a) {
    this.orientation = a;
    if (window.parent && window.parent != window) try {
        window.parent.postMessage({
            action: "orientation",
            orientation: a,
            uid: user_data.uid
        }, "*")
    } catch (b) {}
    this.checkOrientation()
};
App.prototype.checkOrientation = function () {
    var a = this,
        b = window.innerWidth,
        c = window.innerHeight;
    if (b && c) {
        "web" == client.app && client.ua.platform && "Android" == client.ua.platform.name && fullScreenApi.was_fullscreen && (fullScreenApi.isFullScreen() ? $("#device-fullscreen").hide() : (ga("send", "pageview", "/#!view=fullscreen_dropout"), DataCrunchIO.event("view", {
            id: "fullscreen-dropout"
        }), $("#device-fullscreen").show()));
        var d = c;
        if (!client.ua.platform || "Android" != client.ua.platform.name || client.ua.browser && "Chrome" === client.ua.browser.name && 46 <= parseFloat(client.ua.browser.version, 10)) {
            if (window.screen && window.screen.orientation && window.screen.orientation.lock && "web" == client.app) try {
                window.screen.orientation.lock("portrait-primary")["catch"](function (b) {})
            } catch (g) {}
            var d = b,
                e = c,
                f = "none";
            "portrait" == a.orientation && b > c && (f = "rotate(-90deg)", d = c, e = b);
            "landscape" == a.orientation && b < c && (f = "rotate(90deg)", d = c, e = b);
            a.orientation_div.css({
                "-webkit-transform": f,
                "-moz-transform": f,
                "-ms-transform": f,
                transform: f,
                "margin-top": -e / 2 + "px",
                "margin-left": -d / 2 + "px",
                width: d + "px",
                height: e + "px",
                left: "50%",
                top: "50%"
            });
            client.ua.browser && "Safari" === client.ua.browser.name && 8 > parseFloat(client.ua.browser.version, 10) && client.ua.dist && ("iPhone" === client.ua.dist.name || "iPod" === client.ua.dist.name) && window.scrollTo(0, 0);
            d = e
        } else a.orientation_div.css({
            left: "0px",
            top: "0px",
            width: b + "px",
            height: c + "px"
        }), "portrait" == a.orientation && b > c ? $("#device-rotate-portrait").show() : $("#device-rotate-portrait").hide(), "landscape" == a.orientation && b < c ? $("#device-rotate-landscape").show() : $("#device-rotate-landscape").hide();
        460 > d ? $("#keyboard").addClass("keyboard-small") : $("#keyboard").removeClass("keyboard-small");
        a.orientation_div[0].className = "orientation-" + a.orientation
    } else window.setTimeout(function () {
        a.checkOrientation()
    }, 0)
};
App.prototype.requestFullScreen = function () {
    this.no_sleep && this.no_sleep.enable();
    fullScreenApi.requestFullScreen(document.documentElement);
    $("#device-fullscreen").hide()
};
App.prototype.confirmEMail = function () {
    user_data.email ? ($.post("/profile/confirm"), this.showPage("code")) : this.editProfile()
};
App.prototype.fetchMagicCode = function () {
    var a = this;
    if (!a.magic_code_interval && -1 == document.location.hash.indexOf("code=") && user_data.auth && user_data.played_screen_uids) {
        var b = function () {
            a.code_div.hasClass("code-code-instructions") ? $.get("/profile/screen?uids=" + user_data.played_screen_uids, function (b) {
                b.length && a.code_div.hasClass("code-code-instructions") && (a.setCodeValue(b), window.clearTimeout(a.magic_code_interval), a.code_delete_on_input = !0)
            }) : window.clearTimeout(a.magic_code_interval)
        };
        b();
        a.magic_code_interval = window.setInterval(b, 1E3);
        window.setTimeout(function () {
            window.clearTimeout(a.magic_code_interval)
        }, 1E4)
    }
};
App.prototype.showPage = function (a) {
    var b = "welcome screen code game email preview-play".split(" ");
    for (var c = 0; c < b.length; ++c) {
        var d = b[c];
        d != a ? $("#" + d).fadeOut() : $("#" + d).fadeIn()
    }
    "code" == a && (this.codeInstructions("Enter the code"), this.setOrientation("portrait"), this.fetchMagicCode());
    c = $("#welcome-video");
    "welcome" == a ? (this.shouldDownloadApp() ? ($("#welcome-login-download").show(), $("#welcome-login-account").hide()) : ($("#welcome-login-download").hide(), $("#welcome-login-account").show()), b = "https://www.youtube.com/embed/ZZPtU-SjOMM?rel=0&modestbranding=1&showinfo=0",
    c.attr("src") != b && (c.attr("src", b), $("#welcome-loading-spinner").addClass("welcome-loading-spinner")), $("#welcome-video-row").height(c.height())) : (c.attr("src", ""), $("#welcome-loading-spinner").removeClass("welcome-loading-spinner"));
    d = $("#preview-play-video");
    "preview_play" == a ? (b = "https://www.youtube.com/embed/ZZPtU-SjOMM?rel=0&modestbranding=1&showinfo=0", d.attr("src") != b && d.attr("src", b), $("#preview-video-row").height(c.height()), $("#preview-play").show()) : d.attr("src", "");
    ga("send", "pageview",
        "/#!view=" + a);
    DataCrunchIO.event("view", {
        id: a
    })
};
App.prototype.shouldDownloadApp = function () {
    return "web" == client.app && client.ua.platform && ("Android" == client.ua.platform.name || "iOS" == client.ua.platform.name)
};
App.prototype.codeInstructions = function (a) {
    this.code_div.removeClass("bright");
    this.code_div.addClass("shade-text");
    this.code_div.addClass("code-code-instructions");
    this.code_div.text(a)
};
App.prototype.showInstructionsOrCode = function () {
    user_data.first_visit ? this.showPage("screen") : !user_data.email && user_data.auth ? this.showPage("email") : this.showPage("code")
};
App.prototype.becomePremium = function (a) {
    ga("set", "dimension2", "hero");
    user_data.premium = !0;
    this.gc && (this.gc.data.premium = !0, this.gc.updatePresence(this.gc.data, "premium", a), this.gc.callProxy({
        action: "premium",
        device_id: this.gc.id
    }), this.gc.callAdProxy({
        action: "premium",
        device_id: this.gc.id
    }));
    a && (ga("send", "event", "Premium", "Success", a), DataCrunchIO.event("Premium.Success", {
        product: a
    }))
};
App.prototype.buyPremium = function (a) {
    client.app == Clients.App.IntelXdk && (1.6 > client.version && "herosubscriptionweek2v1" == a || 1.7 > client.version && "herosubscriptionyear30v1" == a) ? (alert("You need to update your app before you can buy this product."), this.downloadApp()) : (ga("send", "event", "Premium", "Store", a), DataCrunchIO.event("Premium.Store", {
        product: a
    }), $("#premium-plans").hide(), window.parent.postMessage({
        action: "client_purchase_item",
        id: a
    }, "*"))
};
App.prototype.getExperimentVariation = function (a) {
    if (this.gc && this.gc.devices && this.gc.devices[GameConsole.SCREEN] && this.gc.devices[GameConsole.SCREEN].experiments) return this.gc.devices[GameConsole.SCREEN].experiments[a]
};
App.prototype.connect = function (a) {
    var b = this,
        c = GameConsole.parseCode(a);
    if (void 0 === c.server_id || void 0 === c.server_code) window.setTimeout(function () {
        b.codeInstructions("Invalid code");
        ga("send", "event", "Code", "Invalid Syntax");
        DataCrunchIO.event("connect", {
            type: "invalid syntax"
        })
    }, 0);
    else if (void 0 === game_servers[c.server_id]) ga("send", "event", "Code", "Unknown Server", {
        hitCallback: function () {
            DataCrunchIO.event("connect", {
                type: "invalid server"
            }, function () {
                b.onunknownserver(a)
            })
        }
    });
    else if (window.setTimeout(function () {
        b.codeInstructions("Connecting ...")
    }), !b.gc) {
        this.requestFullScreen();
        var d = void 0;
        if (-1 == document.location.hash.indexOf("code=") || -1 != document.location.search.indexOf("http=1")) {
            var e = $.cookie("airconsole_session");
            e && (e = e.split("."), e[0] == GameConsole.getCode(c.server_id, c.server_code) && (d = parseInt(e[1])))
        } - 1 != document.location.search.indexOf("simulator=true") && (d = parseInt(user_data.uid.substr(3)));
        try {
            for (var c = {}, e = "uid nickname auth gender picture token premium".split(" "), f = 0; f < e.length; ++f) user_data[e[f]] && (c[e[f]] = user_data[e[f]]);
            c.client = {
                app: client.app,
                pass_external_url: client.pass_external_url
            };
            void 0 !== client.version && (c.client.version = client.version);
            RTCPeerConnection && -1 == document.location.search.indexOf("server=") && (c.rtc = 1);
            b.gc = new GameConsole(game_servers, a, d, c);
            b.gc.oninvalidcode = function () {
                ga("send", "event", "Code", "Unknown Game", {
                    hitCallback: function () {
                        DataCrunchIO.event("connect", {
                            type: "unknown game"
                        }, function () {
                            b.onunknownserver(a)
                        })
                    }
                })
            };
            b.gc.onconnect = function () {
                b.code = a;
                b.onconnect();
                ga("send", "event", "Code",
                    "Valid");
                DataCrunchIO.event("connect", {
                    type: "success",
                    device_id: b.gc.id
                })
            };
            b.gc.onclose = function () {
                b.code = void 0;
                b.onclose()
            };
            b.gc.onupdate = function (a, c) {
                b.onupdate(a, c)
            };
            b.gc.onecho = function (a) {
                b.onecho()
            };
            b.gc.onready = function (a) {
                $("#device-loading").fadeOut();
                b.gc.proxy_version || b.gc.callProxy({
                    action: "navigate"
                });
                b.tryActivateRTCForGame();
                a.device_motion && ("web" == client.app ? (gyro.frequency = a.device_motion, gyro.startTracking(function (a) {
                    b.gc && b.gc.callProxy({
                        action: "device_motion",
                        data: a
                    })
                })) : client.app == Clients.App.IntelXdk && (1.1 <= client.version ? window.parent.postMessage({
                    action: "device_motion",
                    device_motion: a.device_motion
                }, "*") : (gyro.frequency = a.device_motion, gyro.startTracking(function (a) {
                    b.gc && b.gc.callProxy({
                        action: "device_motion",
                        data: a
                    })
                }))))
            };
            b.gc.onproxyset = function (a, c) {
                if ("orientation" == a) b.ad_active ? b.requested_orientation = c : b.setOrientation(c);
                else if ("vibrate" === a) {
                    var d = c ? parseInt(c, 10) : 300;
                    client.app == Clients.App.IntelXdk ? window.parent.postMessage({
                        action: "vibrate",
                        vibrate: d
                    },
                        "*") : "vibrate" in navigator && navigator.vibrate(d)
                } else if ("pass_external_url" == a) client.app == Clients.App.IntelXdk && (1.2 <= client.version ? window.parent.postMessage({
                    action: "pass_external_url",
                    url: c
                }, "*") : alert("Please upgrade the AirConsole App to enable this functionality!"));
                else if ("home" == a)!0 === c ? b.home() : !1 === c ? (b.url = void 0, b.gc && b.gc.devices[0] && b.loadGame(b.gc.devices[0].url)) : b.home(c);
                else if ("disconnect" == a) document.location.hash = "", document.location.reload();
                else if ("custom" == a) b.gc.data.custom = c, b.gc.updatePresence(b.gc.data, "custom");
                else if ("default_ui" == a) c ? $("#home-button-container").show() : $("#home-button-container").hide();
                else if ("email" == a || "ademail" == a) {
                    d = b.url;
                    var f = b.gc.devices[GameConsole.SCREEN];
                    if ("ademail" == a) if (f.ad && f.ad.url && b.gc.data.ad.loaded) d = f.ad.url;
                    else return;
                    else if (!b.gc.proxy_version) return;
                    d && (f = d.split("/")[2].split(":")[0], -1 !== b.games_allowed_to_access_email.indexOf(GameConsole.gameName(d)) || "localhost" == f || f == document.location.hostname || f.match(/^(10\.0|192\.168)\.\d+.\d+$/)) && (d = {
                        action: a,
                        email: user_data.email
                    }, "ademail" == a ? b.gc.callAdProxy(d) : b.gc.callProxy(d))
                } else if ("login" == a) b.editProfile();
                else if ("premium" == a) {
                    var e = !1;
                    if (d = b.url) if (f = d.split("/")[2].split(":")[0], "localhost" == f || f == document.location.hostname || f.match(/^(10\.\d+|192\.168|172\.1[6-9]|172\.2\d|172\.3[0-1])\.\d+.\d+$/)) e = !0;
                    e || b.gc && b.gc.data.premium ? (b.gc.data.premium || (f != document.location.hostname && alert("Development Mode: Enabled premium"), b.exit_before_navigating = !0), b.becomePremium()) : (ga("send",
                        "event", "Premium", "Start"), DataCrunchIO.event("Premium.Start"), client.app == Clients.App.IntelXdk && 1.5 <= client.version ? ($("#premium").show(), "block-3p-yes" == b.getExperimentVariation("region") ? ($("#premium-details-content-player-limit-no").hide(), $("#premium-details-content-player-limit-yes").show()) : ($("#premium-details-content-player-limit-yes").hide(), $("#premium-details-content-player-limit-no").show()), $("#premium-status").html("Loading"), window.setTimeout(function () {
                        $("#premium-plans").show()
                    },
                    1E3), ga("send", "event", "Premium", "Plan"), DataCrunchIO.event("Premium.Plan", {})) : b.downloadApp() ? (ga("send", "event", "Premium", "Fail.App"), DataCrunchIO.event("Premium.Fail", {
                        type: "App"
                    }), window.setTimeout(function () {
                        document.location.hash = "";
                        document.location.reload()
                    }, 1E4)) : (ga("send", "event", "Premium", "Fail.Platform"), DataCrunchIO.event("Premium.Fail", {
                        type: "Platform"
                    }), alert("Unfortunately AirConsole Hero is not available for this device.")))
                } else b.onProxySet(a, c)
            };
            b.gc.onproxyjserror = function (a) {
                b.reportException(GameConsole.gameName(a.url),
                a.exception, GameConsole.getGameUrl(a.url))
            };
            b.gc.onrtccandidate = function (a, c) {
                b.onrtccandidate(a, c)
            };
            b.gc.onrtcanswer = function (a, c) {
                b.onrtcanswer(a, c)
            };
            b.gc.shouldSendMessage = function (a, c, d) {
                return b.rtc_data_channel && a == GameConsole.COMMAND.MESSAGE && c == GameConsole.SCREEN && 2 == b.gc.data.rtc && b.gc.devices[GameConsole.SCREEN] && 2 == b.gc.devices[GameConsole.SCREEN].rtc && (a = GameConsole.createMessage(GameConsole.COMMAND.MESSAGE, b.gc.id, d), 8E3 > a.length) ? (b.rtc_data_channel.send(a), !1) : !0
            };
            b.gc.shouldSendIgnore = function () {
                return b.rtc_data_channel && 2 == b.gc.data.rtc && b.gc.devices[GameConsole.SCREEN] && 2 == b.gc.devices[GameConsole.SCREEN].rtc ? !1 : !0
            };
            b.gc.onadready = function () {
                b.ad_active = !0;
                $("#ad").show();
                b.gc.devices[GameConsole.SCREEN] && b.gc.devices[GameConsole.SCREEN].ad && b.gc.devices[GameConsole.SCREEN].url == b.gc.devices[GameConsole.SCREEN].ad.game && b.gc.callProxy({
                    action: "ad"
                })
            };
            b.gc.onratelimit = function (a) {
                b.onRateLimit(a)
            }
        } catch (g) {
            b.onclose()
        }
    }
};
App.prototype.onclose = function () {
    this.gc && (this.url = void 0, this.gc = null);
    this.resetRTC();
    $("#ad").html("").hide();
    this.ad_active = !1;
    this.requested_orientation = null;
    this.showPage("code");
    this.handlePlayerLimit();
    window.clearInterval(this.latency_interval)
};
App.prototype.onconnect = function () {
    var a = this;
    a.url = "";
    var b = store_url;
    if (1 == a.gc.id) {
        var c = document.location.hash;
        if (0 == c.indexOf("#!play=") || 0 == c.indexOf("#!exclusive=")) b += c.split("&")[0]
    }
    this.loadGame(b);
    this.latency_interval = window.setInterval(function () {
        a.latencyTest()
    }, 15E3); - 1 == document.location.hash.indexOf("code=") && $.cookie("airconsole_session", a.gc.code + "." + a.gc.id, {
        expires: 7
    })
};
App.prototype.latencyTest = function () {
    this.gc && (this.latencies = [], this.latency_start = (new Date).getTime(), this.gc.echo())
};
App.prototype.onecho = function () {
    var a = (new Date).getTime() - this.latency_start;
    this.latencies.push(a);
    if (3 > this.latencies.length) this.latency_start = (new Date).getTime(), this.gc.echo();
    else {
        var b = 0;
        $.each(this.latencies, function (a, d) {
            b += d
        });
        this.latencies.length && (b /= this.latencies.length, (a = 100 < b) && window.console && console.log("Slow connection: " + b + "ms"), this.reported_latency_to_ga || (this.reported_latency_to_ga = !0, ga("send", "timing", "Game Servers", "Latency", b), DataCrunchIO.event("latency", {
            latency: b
        })),
        this.gc.data.slow_connection != a && (this.gc.data.slow_connection = a, this.gc.updatePresence(this.gc.data)))
    }
};
App.prototype.loadGame = function (a) {
    var b = this;
    a = a || store_url;
    if (a != b.url) {
        b.url && !0 !== b.url && a.split("#")[0] == b.url.split("#")[0] && b.game.attr("src", "");
        b.url = a;
        b.showPage("game");
        var c = GameConsole.gameName(a);
        ga("send", "pageview", "/#!play=" + c);
        DataCrunchIO.event("play", {
            name: c,
            url: a,
            players: b.gc.getNumberOfControllers()
        });
        b.gc.setProxy(b.game[0].contentWindow);
        b.gc.data.rtc && (b.gc.data.rtc = 1, b.gc.updatePresence(b.gc.data));
        b.gc.proxy_version = void 0;
        "web" == client.app ? gyro.stopTracking() : client.app == Clients.App.IntelXdk && (1.1 <= client.version ? window.parent.postMessage({
            action: "device_motion",
            device_motion: !1
        }, "*") : gyro.stopTracking());
        var d = a;
        0 == a.indexOf("debug:") ? (d = a.substr(6), this.setDebug(!0)) : this.setDebug(!1);
        a = b.splitUrlForRole(d);
        var d = a[0],
            e = a[1];
        window.setTimeout(function () {
            var a = d;
            if ("https:" == document.location.protocol && 0 == a.indexOf("http://")) {
                if (b.gc.devices[GameConsole.SCREEN] && b.gc.devices[GameConsole.SCREEN].http) {
                    a = document; - 1 != document.location.search.indexOf("parent=fullscreen-ios") && (a = window.parent.document);
                    var c = a.location.search;
                    0 == c.indexOf("?") && (c = "&" + c.substr(1));
                    a.location.href = "http://" + a.location.hostname + a.location.pathname + ("?http=1" + c) + "#!code=" + b.gc.code;
                    return
                }
                a = "https://" + a.substr(7)
            }
            b.exit_before_navigating ? document.location.reload() : b.game.attr("src", a + "controller.html" + e)
        }, 400);
        $("#home-button-container").show();
        d != store_url && (b.toggleMenuButtonTooltip(!0), $("#device-loading").fadeIn(400).delay(1E3));
        b.reportStart(GameConsole.gameName(d), GameConsole.getGameUrl(d))
    }
};
App.prototype.splitUrlForRole = function (a) {
    a = a.split("#");
    var b = a.shift().split("?"),
        c = b.shift(),
        d = "";
    b.length && (d += "?" + b.join("?"));
    a.length && (d += "#" + a.join("#"));
    return [c, d]
};
App.prototype.dataChannelSetup = function (a) {
    var b = this;
    a.onmessage = function (a) {
        b.gc.onMessage(a.data)
    };
    a.onopen = function () {
        b.rtc_data_channel || (window.console && console.log("WebRTC active"), b.rtc_data_channel = a, b.rtc_timer = window.setInterval(function () {
            b.rtc_data_channel && (b.gc ? b.rtc_data_channel.send(GameConsole.createMessageRaw(GameConsole.COMMAND.IGNORE, b.gc.id)) : b.resetRTC())
        }, 200))
    };
    a.onclose = function () {
        b.resetRTC()
    };
    a.onerror = function () {
        try {
            b.rtc_peer_connection.close()
        } catch (c) {}
        b.resetRTC()
    }
};
App.prototype.resetRTC = function () {
    this.rtc_data_channel && this.rtc_data_channel.close();
    this.rtc_data_channel = !1;
    this.rtc_peer_connection && this.rtc_peer_connection.close();
    this.rtc_peer_connection = !1;
    this.rtc_timer && (window.clearInterval(this.rtc_timer), this.rtc_timer = null)
};
App.prototype.onrtccandidate = function (a, b) {
    this.rtc_peer_connection.addIceCandidate(new RTCIceCandidate(b))
};
App.prototype.onrtcanswer = function (a, b) {
    this.rtc_peer_connection.setRemoteDescription(new RTCSessionDescription(b))
};
App.prototype.openRTCDataChannel = function (a) {
    var b = this;
    if (!b.rtc_peer_connection && b.gc) {
        var c = new RTCPeerConnection({
            iceServers: [{
                url: "stun:stun.l.google.com:19302"
            }]
        }),
            d = c.createDataChannel("datachannel-" + a + "-" + b.gc.id);
        b.dataChannelSetup(d);
        c.oniceconnectionstatechange = function () {
            "disconnected" == c.iceConnectionState && b.resetRTC()
        };
        c.onicecandidate = function (c) {
            (c = c.candidate) && b.gc.send(GameConsole.COMMAND.RTC_CANDIDATE, a, c)
        };
        c.createOffer(function (d) {
            c.setLocalDescription(d);
            b.gc.send(GameConsole.COMMAND.RTC_OFFER,
            a, d)
        }, function () {}, {});
        this.rtc_peer_connection = c
    }
};
App.prototype.onupdate = function (a, b) {
    if (a == GameConsole.SCREEN && b) {
        user_data.played_screen_uids || (user_data.played_screen_uids = "");
        user_data.auth && -1 == user_data.played_screen_uids.indexOf(b.uid) && (user_data.played_screen_uids && (user_data.played_screen_uids += ","), user_data.played_screen_uids += b.uid, $.post("/profile/screen", {
            uid: b.uid
        }));
        b.url && this.loadGame(b.url);
        RTCPeerConnection && b.rtc && this.openRTCDataChannel(GameConsole.SCREEN);
        this.tryActivateRTCForGame();
        if (b.ad && b.ad.url) {
            var c = $(".ad");
            if (b.ad.url && (!c.length || c.attr("src").replace("controller.html", "").replace("https://", "http://") != b.ad.url.replace("https://", "http://"))) {
                var d = $("#ad");
                d.html("");
                var c = this.splitUrlForRole(b.ad.url),
                    e = c[0],
                    f = c[1];
                "https:" == document.location.protocol && 0 == e.indexOf("http://") && (e = "https://" + e.substr(7));
                c = $("<iframe></iframe>");
                c.attr("frameborder", "0");
                c.addClass("ad");
                c.attr("src", e + "controller.html" + f);
                d.append(c);
                this.gc.setAdProxy(c[0].contentWindow);
                d = GameConsole.gameName(b.ad.url);
                e = GameConsole.getGameUrl(b.ad.url);
                this.reportStart(d, e);
                ga("send", "pageview", "/#!ad=" + d);
                DataCrunchIO.event("ad", {
                    name: d,
                    url: e,
                    players: this.gc.getNumberOfControllers()
                });
                this.menu_tooltip_ele.hasClass("visible") && (this.menu_tooltip_ele.clearQueue(), this.hide_menu_tooltip_after_ad = !0)
            }
        }
        b._is_ad_update && void 0 != b.ad.complete && (this.gc.devices[GameConsole.SCREEN] && this.gc.devices[GameConsole.SCREEN].ad && this.gc.devices[GameConsole.SCREEN].url == this.gc.devices[GameConsole.SCREEN].ad.game && this.gc.callProxy({
            action: "ad",
            complete: b.ad.complete
        }),
        this.gc.setAdProxy(), delete this.gc.data.ad, this.gc.updatePresence(this.gc.data), $("#ad").hide().html(""), this.ad_active = !1, null != this.requested_orientation && (this.setOrientation(this.requested_orientation), this.requested_orientation = null), this.hide_menu_tooltip_after_ad && this.menu_tooltip_ele.delay(6E3).fadeOut());
        (d = this.getExperimentVariation("region")) && ga("set", "dimension3", d);
        ga("set", "dimension4", b.pricing);
        "herosubscriptionmonthly5v1" == b.pricing ? $(".herosubscriptionmonthlyprice").html("$4.99") : $(".herosubscriptionmonthlyprice").html("$2.99")
    }
    b && (b._is_custom_update || b._is_ad_update || b._is_ad_custom_update || b._is_players_update) || (this.renderMenu(), a != GameConsole.SCREEN && b && user_data.auth && b.auth && user_data.uid < b.uid && !this.reported_relationships[b.uid] && (this.reported_relationships[b.uid] = !0, $.post("/relationship", {
        uid: b.uid
    })));
    this.handlePlayerLimit()
};
App.prototype.handlePlayerLimit = function () {
    if ("block-3p-yes" == this.getExperimentVariation("region")) {
        for (var a = 0, b = GameConsole.SCREEN, c = 1; c < this.gc.devices.length; ++c) {
            var d = this.gc.devices[c];
            if (d) {
                if (d.premium) {
                    var e = !1;
                    break
                }
                a += 1
            }
            c == this.gc.id && (b = a)
        }
        void 0 == e && 2 < a && (e = 2 < b ? "instructions" : "button")
    } else e = !1;
    this.last_player_limit_view != e && (this.last_player_limit_view = e, $("#player-limit-instructions-container").css("display", "instructions" == e ? "block" : "none"), $("#player-limit-button-container").css("display",
        "button" == e ? "block" : "none"), "button" == e ? $("#player-limit-button-container").addClass("player-limit-button-blink-active") : $("#player-limit-button-container").removeClass("player-limit-button-blink-active"))
};
App.prototype.requestPlayerLimitAction = function (a) {
    this.gc && (this.gc.updatePresence(this.gc.data, "player_limit_action", a), this.gc.updatePresence(this.gc.data))
};
App.prototype.onunknownserver = function (a) {
    var b = this;
    if (-1 == document.location.hash.indexOf("code=")) {
        var c = document.location.hash;
        document.location.hash = (c ? c + "&" : "#!") + "code=" + a;
        fullScreenApi.cancelFullScreen();
        window.setTimeout(function () {
            document.location.reload()
        }, 0)
    } else c = document.location.hash, a = c.split("code=")[1].split("&")[0], document.location.hash = c.replace("#!code=" + a, "").replace("&code=" + a, ""), window.setTimeout(function () {
        b.codeInstructions("Invalid code")
    }, 0);
    this.codeInstructions("Invalid code");
    this.gc = null
};
App.prototype.tryActivateRTCForGame = function () {
    1 == this.gc.data.rtc && this.gc.devices[GameConsole.SCREEN] && this.gc.devices[GameConsole.SCREEN].rtc && GameConsole.getGameUrl(this.gc.devices[GameConsole.SCREEN].location) == GameConsole.getGameUrl(this.gc.data.location) && (this.gc.data.rtc = 2, this.gc.updatePresence(this.gc.data))
};
App.prototype.codePad = function (a, b) {
    var c = this;
    a && (a = $(a), a.removeClass("shade-bg").addClass("punch-bg"), window.setTimeout(function () {
        a.removeClass("punch-bg").addClass("shade-bg")
    }, 100));
    if (!this.gc) {
        var d = "";
        this.code_div.hasClass("code-code-instructions") || (d = this.code_div.html().replace(/[^0-9]/g, ""));
        if ("enter" == b) if ("9" == d[0]) client.app != Clients.App.IntelXdk && (client.ua.platform && "Android" == client.ua.platform.name || client.ua.platform && "iOS" == client.ua.platform.name) ? c.downloadApp() : $.post("/promocode", {
            code: d
        }, function (a) {
            c.setCodeValue("");
            if ("invalid" == a) c.codeInstructions("Invalid promo");
            else if ("rate-limit" == a) c.codeInstructions("Try again in 1h");
            else if (parseInt(a) + "" == a) {
                c.codeInstructions("Hero enabled!");
                c.becomePremium();
                var b = $("#code-description-text"),
                    d = b.html();
                b.html("\"We can be heroes, just for <span class='punch'>" + a + ' days</span>!"<br><span class=shade>Quote: David Bowie</span>');
                window.setTimeout(function () {
                    b.html(d)
                }, 5E3)
            }
        });
        else if (0 == d.indexOf("666")) if ("666" == d) user_data.premium = void 0, window.setTimeout(function () {
            c.setCodeValue("");
            c.codeInstructions("Hero disabled")
        }, 100);
        else {
            var e = "10.0.1." + d.substr(3),
                f = client.app;
            void 0 != client.version && (f += "-" + client.version);
            document.location.href = "http://" + e + ":8080/client?id=" + f;
            window.setTimeout(function () {
                c.setCodeValue("");
                c.codeInstructions(e)
            }, 100)
        } else this.connect(d);
        else if ("del" == b) d && (d = d.substr(0, d.length - 1)), c.code_delete_on_input && (d = "");
        else if (c.code_delete_on_input && (d = ""), d = (d + b).substr(0, 10), d.length && "9" != d[0]) f = GameConsole.parseCode(d), d = GameConsole.getCode(f.server_id, f.server_code) || d;
        else {
            for (var f = "", g = 0; g < d.length; ++g) g && 0 == g % 3 && (f += " "), f += d[g];
            d = f
        }
        d.length ? this.setCodeValue(d) : this.code_div.hasClass("code-code-instructions") || this.codeInstructions("Enter the code");
        c.code_delete_on_input = !1
    }
};
App.prototype.setCodeValue = function (a) {
    this.code_div.removeClass("code-code-instructions");
    this.code_div.removeClass("shade-text");
    this.code_div.addClass("bright");
    this.code_div.text(a)
};
App.prototype.home = function (a) {
    this.gc.data._home = a || !0;
    this.gc.updatePresence(this.gc.data);
    delete this.gc.data._home;
    this.gc.updatePresence(this.gc.data)
};
App.prototype.masterDeviceID = function () {
    for (var a = 1; a < this.gc.devices.length; ++a) if (this.gc.devices[a] && this.gc.devices[a].premium) return a;
    for (a = 1; a < this.gc.devices.length; ++a) if (this.gc.devices[a]) return a
};
App.prototype.menuVisible = function () {
    return !!this.menu.height()
};
App.prototype.menuHome = function () {
    this.gc.id == this.masterDeviceID() && (this.home(), this.menu.height("0%"))
};
App.prototype.renderMenu = function (a) {
    if (a || this.menuVisible()) if (a = $("#menu"), a.show(), this.gc) {
        var b = this.masterDeviceID(),
            c = user_data.premium,
            d = this.isInGame(),
            e = this.gc.devices[b].nickname || "Guest " + b;
        this.gc.id == b ? a.addClass("is-master-menu") : (a.removeClass("is-master-menu"), $(".master-player-name").html(e));
        d ? a.removeClass("menu-no-active-game") : a.addClass("menu-no-active-game");
        c ? a.addClass("is-hero-menu") : a.removeClass("is-hero-menu");
        "web" === client.app && ($(".menu-hero").hide(), $(".menu-app-download").show())
    } else this.menu.addClass("menu-no-active-game")
};
App.prototype.getCurrentGameId = function () {
    var a = null;
    this.gc && this.gc.devices && this.gc.devices[0] && (a = GameConsole.gameName(this.gc.devices[0].url));
    return a
};
App.prototype.isInGame = function () {
    var a = !1,
        b = this.getCurrentGameId();
    b && (a = "com.airconsole.store" !== b);
    return a
};
App.prototype.menuBecomeHero = function () {
    if (this.gc) this.gc.onproxyset("premium", !0)
};
App.prototype.editProfile = function () {
    setTimeout(function () {
        $("#profile-overlay-click").hide()
    }, 800);
    var a = $("#profile");
    this.keyboardInstance();
    var b = "/api/profile-picture?uid=" + user_data.uid + "&size=320";
    this.rotateProfilePicturePreview();
    this.gc && this.gc.data.picture && (b += "&v=" + this.gc.data.picture);
    $("#profile-picture").css("background-image", "url(" + b + ")");
    user_data.nickname ? this.keyboardInstance().setValue("profile-nickname", user_data.nickname) : $("#profile-nickname-placeholder").html("Guest " + (this.gc ? this.gc.id : ""));
    $("#profile-nickname").removeClass("error-bg").addClass("shade-bg");
    user_data.email && this.keyboardInstance().setValue("profile-email", user_data.email);
    $("#profile-email").removeClass("error-bg").addClass("shade-bg");
    a.show();
    $("#home-button-container").hide();
    !this.gc || this.gc.devices && this.gc.devices[GameConsole.SCREEN] && this.gc.devices[GameConsole.SCREEN].ad && this.gc.devices[GameConsole.SCREEN].ad.url && "com.airconsole.ads.login" == GameConsole.gameName(this.gc.devices[GameConsole.SCREEN].ad.url) && (client.app != Clients.App.IntelXdk || !client.ua.platform || "iOS" != client.ua.platform.name) ? $("#profile-cancel").hide() : $("#profile-cancel").show()
};
App.prototype.rotateProfilePicturePreview = function (a) {
    3 == a || 4 == a ? $("#profile-picture").css("transform", "rotate(180deg)") : 5 == a || 6 == a ? $("#profile-picture").css("transform", "rotate(90deg)") : 7 == a || 8 == a ? $("#profile-picture").css("transform", "rotate(270deg)") : $("#profile-picture").css("transform", "none")
};
App.prototype.profilePicturePreview = function (a) {
    if (a.files && a.files[0]) {
        var b = new FileReader;
        b.onload = function (a) {
            $("#profile-picture").css("background-image", "url(" + a.target.result + ")")
        };
        b.readAsDataURL(a.files[0]);
        var c = this,
            b = new FileReader;
        b.onload = function (a) {
            a = new DataView(a.target.result);
            if (65496 != a.getUint16(0, !1)) return c.rotateProfilePicturePreview(-2);
            for (var b = a.byteLength, d = 2; d < b;) {
                var g = a.getUint16(d, !1),
                    d = d + 2;
                if (65505 == g) for (var g = 18761 == a.getUint16(d += 8, !1), d = d + a.getUint32(d + 4, g),
                k = a.getUint16(d, g), d = d + 2, h = 0; h < k; h++) {
                    if (274 == a.getUint16(d + 12 * h, g)) return c.rotateProfilePicturePreview(a.getUint16(d + 12 * h + 8, g))
                } else if (65280 != (g & 65280)) break;
                else d += a.getUint16(d, !1)
            }
            return c.rotateProfilePicturePreview(-1)
        };
        b.readAsArrayBuffer(a.files[0].slice(0, 65536))
    }
};
App.prototype.saveProfile = function () {
    var a = this.keyboardInstance().valueText("profile-nickname"),
        b = $(".profile-error-msg");
    this.resetProfileErrorMsg();
    var c = function (a) {
        a.addClass("error-bg").addClass("error-shade-border").removeClass("shade-bg")
    }, d = function (a) {
        a.removeClass("error-bg").removeClass("error-shade-border").addClass("shade-bg")
    };
    if (a.length) {
        d($("#profile-nickname"));
        var e = this.keyboardInstance().valueText("profile-email");
        /^[0-9a-z\-_\.]+@[0-9a-z\-]+\.[a-z][a-z]+$/.test(e) ? (d($("#profile-email")),
        $("#profile-nickname-field").val(a), $("#profile-email-field").val(e), $("#profile-uid").val(user_data.uid), $("#profile-tz").val((new Date).getTimezoneOffset()), $("#profile-played-screen-uids").val(user_data.played_screen_uids || ""), $("#profile-picture-field"), a = $("#profile-form"), a.attr("action", "/profile"), a[0].submit(), $("#device-loading").show(), this.closeProfile()) : (b.addClass("error-email").show(), c($("#profile-email")))
    } else b.addClass("error-nickname").show(), c($("#profile-nickname"))
};
App.prototype.toggleMenuButtonTooltip = function (a) {
    a ? this.has_shown_menu_button_tooltip || (this.has_shown_menu_button_tooltip = !0, this.menu_tooltip_ele.addClass("visible"), $(".ad").length ? this.hide_menu_tooltip_after_ad = !0 : this.menu_tooltip_ele.delay(6E3).fadeOut()) : this.menu_tooltip_ele.removeClass("visible")
};
App.prototype.profileUpdate = function (a) {
    $("#device-loading").hide();
    a.updated ? (a.picture && (user_data.picture = a.picture), user_data.email = a.email, user_data.nickname = a.nickname, user_data.auth = !0, this.gc ? (a.picture && (this.gc.data.picture = a.picture), this.gc.data.nickname = a.nickname, this.gc.data.auth = !0, this.gc.updateProfile()) : this.showPage("code"), a.premium && !user_data.premium && this.becomePremium(), this.closeProfile()) : this.editProfile()
};
App.prototype.resetProfileErrorMsg = function () {
    $(".profile-error-msg").removeClass("error-nickname").removeClass("error-email").hide()
};
App.prototype.closeProfile = function () {
    var a = this.keyboardInstance();
    a.hide();
    a.onInActive();
    $("#home-button-container").show();
    $("#profile-overlay-click").show();
    $("#profile").hide();
    this.resetProfileErrorMsg()
};
App.prototype.menuButton = function () {
    if (this.debug) {
        var a = this.url;
        this.url = !0;
        this.loadGame(a)
    } else this.menuVisible() ? this.menu.height("0%") : (this.menu.height("100%"), this.renderMenu(!0))
};
App.prototype.loginFacebook = function () {
    client.app == Clients.App.IntelXdk ? window.parent.postMessage({
        action: "facebook",
        facebook_action: "login",
        facebook_permissions: ["user_friends", "public_profile", "email"]
    }, "*") : window.top.location.href = "/login/facebook"
};
App.prototype.loginOther = function () {
    client.app == Clients.App.IntelXdk && 1.4 <= client.version ? window.parent.postMessage({
        action: "client_email"
    }, "*") : this.showInstructionsOrCode()
};
App.prototype.downloadApp = function () {
    var a;
    client.ua.platform && "Android" == client.ua.platform.name && (a = "https://play.google.com/store/apps/details?id=com.airconsole.controller");
    client.ua.platform && "iOS" == client.ua.platform.name && (a = "https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=1017688554&mt=8");
    if (client.app == Clients.App.IntelXdk && 1.2 <= client.version) return window.parent.postMessage({
        action: "pass_external_url",
        url: a
    }, "*"), !0;
    if (client.ua.platform && "Android" == client.ua.platform.name) return document.location.href = a, !0;
    if (client.ua.platform && "iOS" == client.ua.platform.name) return window.parent.location.href = a, !0
};
App.prototype.setDebug = function (a) {
    this.debug != a && (this.debug = a, $("#home-button").css("background-image", "url('/file/" + (a ? "home-refresh.png" : "controller/home-button.png") + "')"))
};

App.prototype.reportNoLog = function () {
    return ""
};
App.prototype.reportException = function (c, a, b) {
    ga("send", "exception", {
        exDescription: c
    });
    var d = a.stack;
    a.error && a.error.stack && (d = a.error.stack);
    var e = c + a.filename + a.lineno + ":" + a.colno;
    this.reported_exceptions[e] || (this.reported_exceptions[e] = 1, a = {
        role: this.role,
        id: c,
        url: b,
        message: a.message,
        filename: a.filename,
        lineno: a.lineno,
        colno: a.colno,
        nolog: this.reportNoLog()
    }, d && (a.stack = d), $.post("/jserror", a), DataCrunchIO.event("error", {
        id: c,
        url: b
    }))
};
App.prototype.reportStart = function (c, a) {
    $.post("/jserror", {
        role: this.role,
        id: c,
        url: a,
        start: 1,
        nolog: this.reportNoLog()
    })
};
App.prototype.getDevelopmentGameId = function () {
    for (; !this.development_game_id;)(this.development_game_id = prompt("[Development Mode]\nYou are trying to access or store game specific data.\nPlease specify your Game ID (e.g. com.example.game)\n(Note that data in development mode will not affectproduction data)", $.cookie("development_game_id"))) && $.cookie("development_game_id", this.development_game_id, {
        expires: 365
    });
    return this.development_game_id
};
App.prototype.getStorageId = function (c) {
    c = c ? GameConsole.gameName(this.gc.devices[GameConsole.SCREEN].ad.url) : GameConsole.gameName(this.gc.devices[GameConsole.SCREEN].url);
    "com.airconsole.developers" == c && (c = "dev~" + this.getDevelopmentGameId());
    return c
};
App.prototype.getTokens = function () {
    for (var c = {}, a = 0; a < this.gc.devices.length; ++a) {
        var b = this.gc.devices[a];
        b && (c[b.uid] = b.token)
    }
    return c
};
App.prototype.fillInHighScoreNames = function (c) {
    for (var a = {}, b = 1; b < this.gc.devices.length; ++b) {
        var d = this.gc.devices[b];
        d && !d.nickname && (a[d.uid] = "Guest " + b)
    }
    for (b = 0; b < c.length; ++b) if (d = c[b], 1 == d.uids.length) {
        var e = a[d.uids[0]];
        e && (d.nicknames = [e])
    }
};
App.prototype.onProxySet = function (c, a) {
    var b = this;
    if ("adcustom" == c && b.gc.data.ad) b.gc.data.ad.custom = a, b.gc.updatePresence(b.gc.data, "ad_custom");
    else if ("highscore" == c && b.gc.devices[GameConsole.SCREEN]) {
        a.game = b.getStorageId();
        void 0 == a.data ? delete a.data : a.data = JSON.stringify(a.data);
        var d = 0;
        for (var e = ["game", "uid", "level_name", "level_version", "score"], g = 0; g < e.length; ++g) for (var k = a[e[g]] + "", h = 0; h < k.length; ++h) d += k.charCodeAt(h);
        g = a.uid.split("|");
        e = [];
        k = b.getTokens();
        for (h = 0; h < g.length; ++h) e.push(k[g[h]]);
        g = [];
        for (f in e) g.push(f);
        a.token = e.join("|");
        a.timestamp = (new Date).getTime();
        a.timestamp -= a.timestamp % 1E3;
        a.timestamp += d % 1E3;
        a.present = g.join("|");
        $.post("/highscore", a, function (a) {
            a && b.fillInHighScoreNames([a]);
            b.gc.callProxy({
                action: "highscore",
                highscore: a
            })
        }, "json")
    } else if ("highscores" == c && b.gc.devices[GameConsole.SCREEN]) a.game = b.getStorageId(), a.uids = a.uids.join(","), a.ranks = a.ranks.join(","), $.get("/highscore", a, function (a) {
        b.fillInHighScoreNames(a);
        b.gc.callProxy({
            action: "highscores",
            highscores: a
        })
    },
        "json");
    else if ("persistentstore" == c || "adpersistentstore" == c) {
        var f = b.getStorageId("adpersistentstore" == c);
        "cache" == a.uid ? (b.persistent_cache || (b.persistent_cache = {}), b.persistent_cache[f] || (b.persistent_cache[f] = {}), b.persistent_cache[f][a.key] = a.value, d = {
            action: c,
            uid: a.uid
        }, "adpersistentstore" == c ? b.gc.callAdProxy(d) : b.gc.callProxy(d)) : (a.value = JSON.stringify(a.value), a.token = b.getTokens()[a.uid], a.game = f, $.post("/persistent", a, function () {
            var d = {
                action: c,
                uid: a.uid
            };
            "adpersistentstore" == c ? b.gc.callAdProxy(d) : b.gc.callProxy(d)
        }))
    } else "persistentrequest" == c || "adpersistentrequest" == c ? (f = b.getStorageId("adpersistentrequest" == c), a.uids = a.uids.join(","), "cache" == a.uids ? (d = {
        cache: {}
    }, b.persistent_cache && b.persistent_cache[f] && (d = {
        cache: b.persistent_cache[f]
    }), d = {
        action: c,
        data: d
    }, "adpersistentrequest" == c ? b.gc.callAdProxy(d) : b.gc.callProxy(d)) : (a.game = f, $.get("/persistent", a, function (a) {
        a = {
            action: c,
            data: a
        };
        "adpersistentrequest" == c ? b.gc.callAdProxy(a) : b.gc.callProxy(a)
    }))) : "ga" == c && ga.apply(this, a)
};
App.prototype.onRateLimit = function (c) {
    if (this.gc.devices[GameConsole.SCREEN]) {
        c = {
            message: "Rate limiting to 10 messages/updates per second.",
            filename: "System-Rate-Limiter",
            lineno: 0,
            colno: 0,
            stack: c
        };
        var a = this.gc.devices[GameConsole.SCREEN],
            b = GameConsole.gameName(a.url);
        this.reportException(b, c, GameConsole.getGameUrl(a.url))
    }
};

function AirConsoleKeyboard(a, b) {
    var c = this;
    b || (b = {});
    b.layouts = b.layouts || AirConsoleKeyboard.DEFAULT_KEYBOARD;
    c.container = document.getElementById(a);
    c.container.className += " airconsole-keyboard";
    c.container.addEventListener("click", function (a) {
        a.stopPropagation()
    });
    document.body.addEventListener("click", function () {
        c.hide()
    });
    c.layouts = [];
    c.keys = [];
    for (var d = 0; d < b.layouts.length; ++d) {
        var e = b.layouts[d],
            f = document.createElement("div");
        f.className = "airconsole-keyboard-layout";
        for (var h = 0; h < e.length; ++h) {
            var k = e[h],
                l = document.createElement("div");
            l.className = "airconsole-keyboard-row";
            for (var g = 0; g < k.length; ++g) {
                for (var m = 100 / k.length; g + 1 < k.length && c.keysEqual_(k[g], k[g + 1]);) m += 100 / k.length, g++;
                l.appendChild(c.createKey_(k[g], m))
            }
            f.appendChild(l)
        }
        d && (f.style.display = "none");
        c.layouts.push(f);
        c.container.appendChild(f);
        c.values = {};
        c.placeholders = {};
        c.carret = document.createElement("span");
        c.carret.className = "airconsole-keyboard-carret-container";
        c.carret.innerHTML = "&nbsp";
        e = document.createElement("div");
        e.className =
            "airconsole-keyboard-carret";
        c.carret.appendChild(e)
    }
}
AirConsoleKeyboard.DONE = 1;
AirConsoleKeyboard.HIDE = 2;
AirConsoleKeyboard.BACKSPACE = 3;
AirConsoleKeyboard.CANCEL = 4;
AirConsoleKeyboard.prototype.bind = function (a, b) {
    var c = this,
        d = document.getElementById(a);
    d.addEventListener("click", function (d) {
        c.show(a, b);
        d.stopPropagation()
    });
    d.innerHTML || (d.innerHTML = "&nbsp;");
    d.style.mozUserSelect = "none";
    d.style.webkitUserSelect = "none";
    d.style.msUserSelect = "none";
    d.style.userSelect = "none"
};
AirConsoleKeyboard.prototype.valueText = function (a) {
    var b = document.createElement("textarea");
    b.innerHTML = this.valueHTML(a);
    return b.value
};
AirConsoleKeyboard.prototype.valueHTML = function (a) {
    return this.values[a] ? this.values[a].join("") : ""
};
AirConsoleKeyboard.prototype.setValue = function (a, b) {
    this.removePlaceholder_(a);
    this.active_input_id == a && this.removeCarret_();
    for (var c = document.getElementById(a); c.childNodes.length;) c.removeChild(c.childNodes[0]);
    c = document.createElement("div");
    c.innerHTML = b;
    this.values[a] = [];
    for (var c = c.childNodes, d = c.length - 1; 0 <= d; --d) {
        var e = c[d];
        if (3 == e.nodeType) for (var f = e.nodeValue.length - 1; 0 <= f; --f) this.addKey_(a, 0, "&#" + e.nodeValue.charCodeAt(f) + ";");
        else f = document.createElement("div"), e.parentNode.removeChild(e),
        f.appendChild(e), this.addKey_(a, 0, f.innerHTML)
    }
    this.active_input_id == a ? this.setCarret() : b || this.addPlaceholder_(a)
};
AirConsoleKeyboard.prototype.switchLayout = function (a) {
    for (var b = 0; b < this.layouts.length; ++b) this.layouts[b].style.display = b == a ? "inline-block" : "none"
};
AirConsoleKeyboard.prototype.show = function (a, b) {
    if (a == this.active_input_id) this.setCarret();
    else if (this.active_input_id && this.addPlaceholder_(this.active_input_id), b = b || {}, this.switchLayout(b.layout || 0), this.active_input_id = a, this.active_input_div = document.getElementById(a), this.active_opts = b, this.container.style.display = "block", this.removePlaceholder_(a), this.setCarret(), b.onShow) b.onShow(a)
};
AirConsoleKeyboard.prototype.hide = function () {
    if (this.active_input_id) {
        this.container.style.display = "none";
        this.removeCarret_();
        this.addPlaceholder_(this.active_input_id);
        if (this.active_opts.onHide) this.active_opts.onHide(this.active_input_id, this.valueText(this.active_input_id), this.valueHTML(this.active_input_id));
        this.active_input_div = this.active_input_id = void 0
    }
};
AirConsoleKeyboard.prototype.setCarret = function (a) {
    var b = this;
    b.removeCarret_();
    var c = this.active_input_div.childNodes;
    void 0 === a && (a = c.length);
    a = Math.min(a, c.length);
    a = Math.max(a, 0);
    var d = this.carret.style.opacity = 0;
    this.carret_interval = window.setInterval(function () {
        d++;
        b.carret.style.opacity = d % 2
    }, 500);
    b.insert_pos = a;
    for (var e = 0, f = 0; f < c.length; ++f) if (c[f] != this.carret && (e++, e == a + 1)) {
        this.active_input_div.insertBefore(this.carret, c[f]);
        break
    }
    this.carret.parentNode || b.active_input_div.appendChild(this.carret);
    window.setTimeout(function () {
        b.carret.style.marginLeft = Math.ceil(1 - b.carret.offsetWidth / 2) + "px";
        b.carret.style.marginRight = Math.floor(-b.carret.offsetWidth / 2) + "px"
    });
    b.disableKeys()
};
AirConsoleKeyboard.defaultKeyboard = function (a, b) {
    var c = {
        action: AirConsoleKeyboard.DONE
    };
    void 0 === a && void 0 == b && (c.label = "Done");
    a && (c.label = a);
    b && (c.className = b);
    var d = {
        action: AirConsoleKeyboard.BACKSPACE,
        label: "&nbsp;",
        className: "airconsole-keyboard-backspace"
    };
    return [["qwertyuiop".split(""), "asdfghjkl.".split(""), [{
        layout: 1,
        label: "&nbsp;",
        className: "airconsole-keyboard-shift"
    }, "z", "x", "c", "v", "b", "n", "m", d, d],
        [{
            action: AirConsoleKeyboard.HIDE,
            label: "Hide"
        }, "&nbsp;", "&nbsp;", {
            layout: 2,
            label: "#123"
        },
        c]
    ], ["QWERTYUIOP".split(""), "ASDFGHJKL,".split(""), [{
        layout: 0,
        label: "&nbsp;",
        className: "airconsole-keyboard-layout-key-active airconsole-keyboard-shift"
    }, "Z", "X", "C", "V", "B", "N", "M", d, d],
        [{
            action: AirConsoleKeyboard.HIDE,
            label: "Hide"
        }, "&nbsp;", "&nbsp;", {
            layout: 2,
            label: "#123"
        },
        c]
    ], ["1234567890".split(""), "@ # $ ' \" &amp; ( ) - _".split(" "), [{
        layout: 3,
        label: "{[&deg;&euro;"
    }, {
        layout: 3,
        label: "{[&deg;&euro;"
    }, "!", "+", "=", "?", ":", ";", {
        layout: 4,
        label: "&auml;&eacute;&oslash;"
    }, {
        layout: 4,
        label: "&auml;&eacute;&oslash;"
    }],
        [{
            action: AirConsoleKeyboard.HIDE,
            label: "Hide"
        }, "&nbsp;", "&nbsp;", {
            layout: 0,
            label: "#123",
            className: "airconsole-keyboard-layout-key-active"
        },
        c]
    ], ["&pound; &euro; &yen; &cent; &copy; &reg; &trade;".split(" "), "[ ] { } &lt; &gt; ^".split(" "), "~ &iquest \\ &iexcl; &deg; &sect; &para;".split(" "), [{
        action: AirConsoleKeyboard.HIDE,
        label: "Hide"
    }, "&nbsp;", "&nbsp;", {
        layout: 0,
        label: "{[&deg;&euro;",
        className: "airconsole-keyboard-layout-key-active"
    },
    c]], ["&aacute; &agrave; &acirc; &aring; &atilde; &auml; &aelig; &ccedil; &eacute; &egrave;".split(" "),
        "&ecirc; &euml; &iacute; &igrave; &icirc; &iuml; &ntilde; &oacute; &ograve; &ocirc;".split(" "), [{
        layout: 5,
        label: "&#x21E7;"
    }, "&oslash;", "&otilde;", "&ouml;", "&szlig;", "&uacute;", "&ugrave;", "&ucirc;", "&uuml;", "&yuml"],
        [{
            action: AirConsoleKeyboard.HIDE,
            label: "Hide"
        }, "&nbsp;", "&nbsp;", {
            layout: 0,
            label: "&auml;&eacute;&oslash;",
            className: "airconsole-keyboard-layout-key-active"
        },
        c]
    ], ["&Aacute; &Agrave; &Acirc; &Aring; &Atilde; &Auml; &AElig; &Ccedil; &Eacute; &Egrave;".split(" "), "&Ecirc; &Euml; &Iacute; &Igrave; &Icirc; &Iuml; &Ntilde; &Oacute; &Ograve; &Ocirc;".split(" "), [{
        layout: 4,
        label: "&#x21E7;",
        className: "airconsole-keyboard-layout-key-active"
    }, "&Oslash;", "&Otilde;", "&Ouml;", "&szlig;", "&Uacute;", "&Ugrave;", "&Ucirc;", "&Uuml;", "&yuml"],
        [{
            action: AirConsoleKeyboard.HIDE,
            label: "Hide"
        }, "&nbsp;", "&nbsp;", {
            layout: 0,
            label: "&auml;&eacute;&oslash;",
            className: "airconsole-keyboard-layout-key-active"
        },
        c]
    ]]
};
AirConsoleKeyboard.DEFAULT_KEYBOARD = AirConsoleKeyboard.defaultKeyboard();
AirConsoleKeyboard.prototype.disableKeys = function () {
    if (this.active_opts.keyDisabled) {
        for (var a = "", b = "", c = this.values[this.active_input_id], d = 0; d < c.length; ++d) d < this.insert_pos ? a += c[d] : b += c[d];
        for (d = 0; d < this.keys.length; ++d) c = this.keys[d], this.active_opts.keyDisabled(c, a, b) ? -1 == c.container.className.indexOf("airconsole-keyboard-key-disabled") && (c.container.className += " airconsole-keyboard-key-disabled") : c.container.className = c.container.className.replace(/ airconsole\-keyboard\-key\-disabled/g, "")
    }
};
AirConsoleKeyboard.prototype.removePlaceholder_ = function (a) {
    var b = document.getElementById(a);
    if (!this.valueText(a).length) for (this.values[a] = [], this.placeholders[a] = []; b.childNodes.length;) this.placeholders[a].push(b.childNodes[0]), b.removeChild(b.childNodes[0])
};
AirConsoleKeyboard.prototype.addPlaceholder_ = function (a) {
    if (!this.valueText(a).length && this.placeholders[a]) {
        var b = document.getElementById(a);
        delete this.values[a];
        for (var c = 0; c < this.placeholders[a].length; ++c) b.appendChild(this.placeholders[a][c]);
        delete this.placeholders[a]
    }
};
AirConsoleKeyboard.prototype.removeCarret_ = function () {
    this.carret_interval && (window.clearInterval(this.carret_interval), this.carret_interval = null, this.carret.parentNode && this.carret.parentNode.removeChild(this.carret))
};
AirConsoleKeyboard.prototype.keysEqual_ = function (a, b) {
    a = this.convertKey_(a);
    b = this.convertKey_(b);
    return a.label == b.label && a.action == b.action && a.className == b.className && a.layout == b.layout
};
AirConsoleKeyboard.prototype.convertKey_ = function (a) {
    return "string" == typeof a ? {
        html: a,
        label: a
    } : a
};
AirConsoleKeyboard.prototype.createKey_ = function (a, b) {
    var c = this,
        d = document.createElement("div");
    d.className = "airconsole-keyboard-key";
    var e = document.createElement("div");
    e.className = "airconsole-keyboard-key-label";
    a = c.convertKey_(a);
    var f = document.createElement("div");
    f.className = "airconsole-keyboard-key-html-container";
    f.innerHTML = a.label;
    e.appendChild(f);
    a.className && (e.className += " " + a.className);
    var f = "touchstart",
        h = "touchend",
        k = "mousedown",
        l = "mouseup";
    "ontouchstart" in document.documentElement || (f = "mousedown", h = "mouseup", k = "touchstart", l = "touchend");
    void 0 !== a.html && d.addEventListener(f, function (b) {
        if (-1 == a.container.className.indexOf(" airconsole-keyboard-key-disabled")) c.onKey_(a, e);
        b.stopPropagation()
    });
    if (void 0 !== a.action) {
        var g;
        a.action == AirConsoleKeyboard.BACKSPACE && d.addEventListener(f, function (b) {
            -1 == a.container.className.indexOf(" airconsole-keyboard-key-disabled") && (g = window.setTimeout(function () {
                c.setValue(c.active_input_id, "")
            }, 500))
        });
        d.addEventListener(h, function (b) {
            -1 == a.container.className.indexOf(" airconsole-keyboard-key-disabled") && (g && (window.clearTimeout(g), g = null), window.setTimeout(function () {
                c.onAction_(a.action, e)
            }, a.action == AirConsoleKeyboard.BACKSPACE ? 0 : 100));
            b.stopPropagation()
        })
    }
    void 0 !== a.layout && d.addEventListener(f, function (b) {
        -1 == a.container.className.indexOf(" airconsole-keyboard-key-disabled") && c.switchLayout(a.layout);
        b.stopPropagation()
    });
    d.addEventListener(k, function (a) {
        a.stopPropagation()
    });
    d.addEventListener(l, function (a) {
        a.stopPropagation()
    });
    d.addEventListener("click", function (a) {
        a.stopPropagation()
    });
    d.addEventListener("dblclick", function (a) {
        a.stopPropagation()
    });
    d.appendChild(e);
    d.style.width = b + "%";
    a.container = d;
    c.keys.push(a);
    return d
};
AirConsoleKeyboard.prototype.spanToInsertPos_ = function (a) {
    for (var b = this.active_input_div.childNodes, c = 0, d = 0; d < b.length && (b[d] != this.carret && c++, b[d] != a); ++d);
    return c
};
AirConsoleKeyboard.prototype.onAction_ = function (a, b) {
    b.className += " airconsole-keyboard-key-label-active";
    window.setTimeout(function () {
        b.className = b.className.replace(/ airconsole\-keyboard\-key\-label\-active/g, "")
    }, 100);
    if (a == AirConsoleKeyboard.DONE) {
        if (this.active_opts.onDone) this.active_opts.onDone(this.active_input_id, this.valueText(this.active_input_id), this.valueHTML(this.active_input_id));
        this.hide()
    } else if (a == AirConsoleKeyboard.HIDE) this.hide();
    else if (a == AirConsoleKeyboard.CANCEL) {
        this.setValue(this.active_input_id,
            "");
        if (this.active_opts.onCancel) this.active_opts.onCancel(this.active_input_id);
        this.hide()
    } else a == AirConsoleKeyboard.BACKSPACE && 1 <= this.insert_pos && (this.insert_pos--, this.values[this.active_input_id].splice(this.insert_pos, 1), this.active_input_div.removeChild(this.active_input_div.childNodes[this.insert_pos]), this.onChange_(), this.disableKeys())
};
AirConsoleKeyboard.prototype.addKey_ = function (a, b, c) {
    var d = this;
    d.values[a].splice(b, 0, c);
    var e = document.createElement("span");
    e.innerHTML = c;
    e.addEventListener("click", function (a) {
        var b = 0;.5 > (a.pageX - e.offsetLeft) / e.offsetWidth && --b;
        window.setTimeout(function () {
            var a = d.spanToInsertPos_(e) + b;
            d.setCarret(a)
        })
    });
    c = document.getElementById(a);
    var f = c.childNodes;
    if (this.active_input_id != a) f[b] ? c.insertBefore(e, f[b]) : c.appendChild(e);
    else if (b == f.length - 1) c.appendChild(e);
    else for (var h = a = 0; h < f.length; ++h) f[h] != d.carret && a++, a == b && c.insertBefore(e, f[h + 1]);
    return e
};
AirConsoleKeyboard.prototype.onKey_ = function (a, b) {
    b.className += " airconsole-keyboard-key-label-active";
    window.setTimeout(function () {
        b.className = b.className.replace(/ airconsole\-keyboard\-key\-label\-active/g, "")
    }, 100);
    var c = this.addKey_(this.active_input_id, this.insert_pos, a.html);
    this.setCarret(this.spanToInsertPos_(c));
    this.onChange_()
};
AirConsoleKeyboard.prototype.onChange_ = function () {
    if (this.active_opts.onChange) this.active_opts.onChange(this.active_input_id, this.valueText(this.active_input_id), this.valueHTML(this.active_input_id))
};

/*
 Tom Gallacher <http://www.tomg.co>
 @version 0.0.1a
 @license MIT License
 @options frequency, callback
*/
(function (p, m) {
    "function" === typeof define && define.amd ? define(m) : "object" === typeof exports ? module.exports = m() : p.gyro = m()
})(this, function () {
    function p(a) {
        var b = Math.PI / 180,
            c = a.beta * b,
            h = a.gamma * b,
            n = a.alpha * b;
        a = Math.cos(c / 2);
        var b = Math.cos(h / 2),
            q = Math.cos(n / 2),
            c = Math.sin(c / 2),
            h = Math.sin(h / 2),
            n = Math.sin(n / 2);
        return {
            x: c * b * q - a * h * n,
            y: a * h * q + c * b * n,
            z: a * b * n + c * h * q,
            w: a * b * q - c * h * n
        }
    }
    function m(a, b) {
        return {
            w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
            x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
            y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
            z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w
        }
    }
    function t(a, b) {
        a = m(b, {
            x: a.x,
            y: a.y,
            z: a.z,
            w: 0
        });
        a = m(a, {
            w: b.w,
            x: -b.x,
            y: -b.y,
            z: -b.z
        });
        return {
            x: a.x,
            y: a.y,
            z: a.z
        }
    }
    var c = {
        x: null,
        y: null,
        z: null,
        alpha: null,
        beta: null,
        gamma: null
    }, g = {
        x: 0,
        y: 0,
        z: 0,
        alpha: 0,
        beta: 0,
        gamma: 0,
        rawAlpha: 0,
        rawBeta: 0,
        rawGamma: 0
    }, r = null,
        k = [],
        l = {
            frequency: 500,
            calibrate: function () {
                for (var a in c) g[a] = "number" === typeof c[a] ? c[a] : 0
            },
            getOrientation: function () {
                return c
            },
            startTracking: function (a) {
                r = setInterval(function () {
                    a(c)
                }, l.frequency)
            },
            stopTracking: function () {
                clearInterval(r)
            },
            hasFeature: function (a) {
                for (var b in k) if (a == k[b]) return !0;
                return !1
            },
            getFeatures: function () {
                return k
            }
        };
    l.eulerToQuaternion = p;
    window && window.addEventListener && function () {
        function a(b) {
            k.push("MozOrientation");
            b.target.removeEventListener("MozOrientation", a, !0);
            b.target.addEventListener("MozOrientation", function (a) {
                c.x = a.x - g.x;
                c.y = a.y - g.y;
                c.z = a.z - g.z
            }, !0)
        }
        function b(a) {
            k.push("devicemotion");
            a.target.removeEventListener("devicemotion", b, !0);
            a.target.addEventListener("devicemotion", function (a) {
                c.x = a.accelerationIncludingGravity.x - g.x;
                c.y = a.accelerationIncludingGravity.y - g.y;
                c.z = a.accelerationIncludingGravity.z - g.z
            }, !0)
        }
        function l(a) {
            k.push("deviceorientation");
            a.target.removeEventListener("deviceorientation", l, !0);
            a.target.addEventListener("deviceorientation", function (a) {
                var b = p({
                    alpha: g.rawAlpha,
                    beta: g.rawBeta,
                    gamma: g.rawGamma
                });
                b.x *= -1;
                b.y *= -1;
                b.z *= -1;
                var e = p({
                    alpha: a.alpha,
                    beta: a.beta,
                    gamma: a.gamma
                }),
                    f = m(b, e),
                    b = 180 / Math.PI,
                    d = t({
                        x: 0,
                        y: 1,
                        z: 0
                    }, f),
                    e = 0 == d.x && 0 == d.y ? 0 : -Math.atan2(d.x, d.y),
                    d = Math.atan2(d.z, Math.sqrt(d.x * d.x + d.y * d.y)),
                    h = Math.cos(e),
                    k = Math.sin(e),
                    l = Math.sin(e) * Math.sin(d),
                    r = -Math.cos(e) * Math.sin(d),
                    u = Math.cos(d),
                    f = t({
                        x: 0,
                        y: 0,
                        z: 1
                    }, f),
                    f = Math.atan2(f.x * h + f.y * k + 0 * f.z, f.x * l + f.y * r + f.z * u);
                0 > e && (e += 2 * Math.PI);
                f >= .5 * Math.PI ? (f -= Math.PI, e += Math.PI, d = 0 < d ? Math.PI - d : -Math.PI - d) : f < -.5 * Math.PI && (f += Math.PI, e += Math.PI, d = 0 < d ? Math.PI - d : -Math.PI - d);
                e >= 2 * Math.PI && (e -= 2 * Math.PI);
                c.alpha = e * b;
                c.beta = d * b;
                c.gamma = f * b;
                c.rawAlpha = a.alpha;
                c.rawBeta = a.beta;
                c.rawGamma = a.gamma
            }, !0)
        }
        window.addEventListener("MozOrientation", a, !0);
        window.addEventListener("devicemotion",
        b, !0);
        window.addEventListener("deviceorientation", l, !0)
    }();
    return l
});