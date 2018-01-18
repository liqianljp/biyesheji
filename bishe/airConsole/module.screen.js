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

function App() {
    var a = this;
    a.role = "screen";
    ga("create", {
        trackingId: "UA-61986786-3",
        cookieDomain: "auto",
        userId: user_data.uid
    });
    ga("set", "dimension1", client.app);
    a.reported_exceptions = {};
    window.addEventListener("error", function (b) {
        a.reportException("com.airconsole.platform", b, static_path)
    });
    a.keep_alive = void 0 != a.getHashParameter("keepalive");
    a.kiosk = void 0 != a.getHashParameter("kiosk");
    a.landing = void 0 != a.getHashParameter("landing");
    a.played_games_minutes = {};
    var b = document.createElement("div");
    b.setAttribute("ontouchstart",
        "return;");
    "function" === typeof b.ontouchstart && 400 >= $(document).width() && !a.landing && "web" == client.app ? document.location.href = "/?role=controller" : "https:" != document.location.protocol || 0 != document.location.hash.indexOf("#http://") && 0 != document.location.hash.indexOf("#debug:http://") ? a.landing || this.start() : (b = document.location.search, 0 == b.indexOf("?") && (b = "&" + b.substr(1)), document.location.href = "http://" + document.location.hostname + document.location.pathname + ("?http=1" + b) + document.location.hash);
    a.landing_slider = new NanoSlider(document.getElementById("landing-description-slider"), {
        arrow_left_class: "slide-button slide-button-left",
        arrow_right_class: "slide-button slide-button-right",
        arrow_inactive_class: "slide-button-inactive",
        bullet_container_class: "slide-bullet-container"
    });
    (b = a.getExperimentVariation("region")) && ga("set", "dimension3", b);
    ga("set", "dimension4", user_data.pricing);
    "herosubscriptionmonthly5v1" == user_data.pricing ? $(".herosubscriptionmonthlyprice").html("$4.99") : $(".herosubscriptionmonthlyprice").html("$2.99")
}
App.prototype.getSearchParameter = function (a) {
    a = (new RegExp("[\\?&]" + a + "=?([^&#]*)")).exec(location.search);
    return null === a ? void 0 : decodeURIComponent(a[1].replace(/\+/g, " "))
};
App.prototype.getHashParameter = function (a) {
    var b = document.location.hash;
    if (0 == b.indexOf("#!")) return b = "?" + b.substr(2), a = (new RegExp("[\\?&]" + a + "=?([^&]*)")).exec(b), null === a ? void 0 : decodeURIComponent(a[1].replace(/\+/g, " "))
};
App.prototype.getPlayHashParameter = function () {
    var a = this.getHashParameter("play"),
        b = null,
        d = [];
    a && (d = a.split("#"), d.length && (b = d[0]));
    return b ? {
        id: b,
        fragment: d.slice(1).join("")
    } : null
};
App.prototype.trackSharePlayed = function (a, b) {
    ga("send", "event", "Share", a, b);
    DataCrunchIO.event("share", {
        name: b,
        network: a
    });
    event.stopPropagation()
};
App.prototype.exit = function (a) {
    a ? ($("#exit").attr("src", a).show(), ga("send", "pageview", a.split("#")[0])) : ($("#exit").hide(), $("#exit").attr("src", ""))
};
App.prototype.sharePlayed = function (a) {
    this.exit("/file/exit/share-played.html#" + JSON.stringify(games[a]))
};
App.prototype.exitStrategy = function () {
    var a = [];
    $.each(this.played_games_minutes, function (b, c) {
        "com.airconsole.developers" != b && "com.airconsole.store" != b && a.push({
            id: b,
            minutes: c
        })
    });
    if (a.length) {
        a.sort(function (b, a) {
            return a.minutes - b.minutes
        });
        for (var b = 0; b < a.length; ++b) if (games[a[b].id]) {
            this.sharePlayed(a[b].id);
            return
        }
    }
    this.first_device_connected || this.landing || this.exit("/file/exit/tutorial.html")
};
App.prototype.layout = function () {
    var a = this;
    window.setTimeout(function () {
        fullScreenApi.was_fullscreen && !fullScreenApi.isFullScreen() && a.exitStrategy()
    })
};
App.prototype.getExperimentVariation = function (a) {
    if (user_data.experiments) return user_data.experiments[a]
};
App.prototype.start = function () {
    var a = this;
    games["com.airconsole.ads.break"] ? (a.ad_config = {
        url: games["com.airconsole.ads.break"].live,
        breaks: [4],
        force_first_preroll: !0,
        config: {
            "break": 3E4,
            long_break: {
                every: 30,
                "break": 3E5
            },
            screen_content: ["woosh-video", "benefits"]
        }
    }, "yes" == a.getExperimentVariation("ad_break_single_campaign") && (a.ad_config.config.single_campaign = !0)) : a.ad_config = {
        breaks: [1440]
    };
    a.ad_config.last_ad_ts = (new Date).getTime();
    a.ad_config.first_preroll = !0;
    a.ad_config.premium_demo = 6E5;
    a.embed = a.getSearchParameter("embed");
    var b = "/";
    void 0 !== a.embed && (b += "?embed=" + a.embed);
    a.embed = void 0 !== a.embed;
    ga("send", "pageview", b);
    a.reportStart("com.airconsole.platform", static_path);
    a.debug = !1;
    a.game = $("#iframe");
    a.persistent_cache = {
        "com.airconsole.store": {
            cache: {
                "com.airconsole.store.games": games_with_categories
            }
        },
        "dev~com.airconsole.store": {
            cache: {
                "com.airconsole.store.games": games_with_categories
            }
        }
    };
    RTCPeerConnection && (a.rtc_data_channels = [], a.rtc_peer_connections = []);
    a.use_power_button = -1 == document.location.hash.indexOf("#http") && -1 == document.location.hash.indexOf("#debug:http") && !a.kiosk && !a.landing && !a.embed;
    "web" != client.app && (a.use_power_button = !1);
    a.use_power_button && void 0 != a.getHashParameter("restart") || a.pingServers();
    user_data.first_visit && (DataCrunchIO.tag("client", client.app), DataCrunchIO.tag("full", "true"));
    if (a.use_power_button) {
        var d = function () {
            $("#power-button-over").fadeIn(600).fadeOut(700, d)
        };
        ga("send", "pageview", "/#!view=power_button");
        d();
        $("#power-button-loading").remove();
        $("#landing-video-airconsole").attr("src",
            "https://www.youtube.com/embed/u-2bc82cEVI");
        $("#landing-video-games").attr("src", "https://www.youtube.com/embed/4CuN1XxLrrA");
        var c = a.loadLandingIFrames();
        c || $(window).scroll(function () {
            c || (c = a.loadLandingIFrames())
        })
    } else fullScreenApi.supportsFullScreen && "web" == client.app && $("#top-bar-fullscreen").css("display", "inline-block"), a.onLandingTeardown(), $("#content").show(), $("#connect-container").fadeIn(), ga("send", "pageview", "/#!view=connect"), DataCrunchIO.event("start.connect"), a.fadeConnectSymbol(), (new NoSleep(client)).enable();
    if ((b = this.getPlayHashParameter()) && b.id && games[b.id]) {
        b = games[b.id];
        $("#description-game").css("background-image", "url('" + b.cover + "')").show();
        var e = "";
        b.players_min && 1 < b.players_min && (e = " <span style='opacity:0.5'>(" + b.players_min + " players needed)</span>");
        $("#description-text-first").html("<span class=punch>Play</span> " + b.name + "!" + e)
    }
    $(window).resize(function () {
        a.layout()
    });
    soundManager.setup({
        debugMode: !1,
        onready: function () {
            soundManager.createSound({
                url: static_path +
                    "power-button-click.m4a",
                id: "power-button-click"
            });
            soundManager.createSound({
                url: static_path + "power-button-hover.m4a",
                id: "power-button-hover"
            });
            soundManager.createSound({
                url: static_path + "honk.m4a",
                id: "honk"
            })
        }
    });
    DataCrunchIO.event("start", {
        powerbutton: a.use_power_button,
        developer: 0 == document.location.hash.indexOf("#http") || 0 == document.location.hash.indexOf("#debug:http"),
        kiosk: a.kiosk,
        landing: a.landing,
        keep_alive: a.keep_alive,
        ad_config: a.ad_config,
        client: {
            app: client.app,
            version: client.version
        }
    })
};
App.prototype.fadeConnectSymbol = function () {
    var a = this;
    $("#connect-container").is(":visible") && "MSEdge" != client.ua.browser.name && ($("#connect-title").fadeTo(1500, .3).fadeTo(400, 1, function () {
        a.fadeConnectSymbol()
    }), $("#connect-code-icon").fadeTo(1500, .4).fadeTo(400, 1))
};
App.prototype.pingServers = function () {
    var a = this;
    a.pings = {};
    $.each(game_servers, function (b, d) {
        d.preferred && GameConsole.lowestPing(d.ip, function (d) {
            a.pings[b] = d
        }, 5, !0)
    });
    for (var b = function (b) {
        return function () {
            var d = null;
            3 >= b ? d = 50 : 6 >= b ? d = 100 : 9 >= b && (d = 500);
            a.connectToBestPing(d)
        }
    }, d = 1; 10 >= d; d++) window.setTimeout(b(d), 1E3 * d)
};
App.prototype.connectToBestPing = function (a) {
    var b = this;
    if (!b.gc) {
        var d = null,
            c = null;
        $.each(b.pings, function (b, a) {
            if (null == c || a < c) c = a, d = b
        });
        if (null !== d) {
            if (null == a || c <= a) ga("send", "event", "Code", "Valid"), ga("send", "timing", "Game Servers", "Latency", c), DataCrunchIO.event("start.connect.server", {
                latency: c,
                server: d
            }), this.connect(GameConsole.getCode(d))
        } else null == a && ga("send", "event", "Code", "No Server", {
            hitCallback: function () {
                DataCrunchIO.event("start.noserver", {
                    servers: game_servers
                }, function () {
                    (b.kiosk || confirm("Unable to connect to game server. Your internet connection seems to be too slow. Try again?")) && document.location.reload()
                })
            }
        })
    }
};
App.prototype.kioskAd = function () {
    return this.gc && this.gc.devices[GameConsole.SCREEN].ad && this.gc.devices[GameConsole.SCREEN].ad.url && -1 != ["com.airconsole.ads.login", "com.airconsole.ads.combined"].indexOf(GameConsole.gameName(this.gc.devices[GameConsole.SCREEN].ad.url))
};
App.prototype.connect = function (a) {
    var b = this;
    RTCPeerConnection && void 0 == b.getSearchParameter("server") && (user_data.rtc = 1);
    void 0 != b.getSearchParameter("http") && void 0 == b.getHashParameter("https-for-controllers") && (user_data.http = 1);
    user_data.client = {
        app: client.app
    };
    void 0 !== client.version && (user_data.client.version = client.version);
    if ("block-3p-yes" == b.getExperimentVariation("region") && !games["com.airconsole.ads.multiplayer"] || -1 != document.location.search.indexOf("simulator=true")) user_data.experiments.region =
        "block-3p-no";
    b.gc = new GameConsole(game_servers, a, GameConsole.SCREEN, user_data);
    b.gc.setProxy(this.game[0].contentWindow);
    b.gc.onconnect = function () {
        b.onconnect()
    };
    b.gc.onupdate = function (a, c) {
        b.gc.hasPremiumController() !== b.ga_dimension_2 && (b.ga_dimension_2 = b.gc.hasPremiumController(), ga("set", "dimension2", b.ga_dimension_2 ? "hero" : "normal"));
        c ? c._is_custom_update || c._is_ad_update || c._is_ad_custom_update || c._is_players_update || (b.firstDeviceConnect(), !c._home || void 0 != b.getHashParameter("play") && b.kiosk || (!0 === c._home ? b.loadGame() : b.loadGame(c._home)), b.renderGamePlayers(), b.tryActivateRTCForGame(), (b.keep_alive || b.kioskAd()) && b.showConnect(!1), c._is_player_limit_action_update ? "ad" == c._is_player_limit_action_update ? b.showPlayerLimitAd() : "honk" == c._is_player_limit_action_update && soundManager.play("honk") : b.handlePlayerLimit(), c._is_premium_update && 1 != c._is_premium_update && (ga("send", "event", "Premium", "Success", c._is_premium_update), DataCrunchIO.event("Premium.Success", {
            product: c._is_premium_update
        }),
        fbq("track", "Premium", {
            product: c._is_premium_update
        }))) : (window.setTimeout(function () {
            var a = !1;
            if (b.gc) for (var d = GameConsole.SCREEN + 1; d < b.gc.devices.length; ++d) if (b.gc.devices[d]) {
                a = !0;
                break
            }
            d = GameConsole.gameName(b.gc.data.url);
            games[d] && -1 != games[d].stores.indexOf("premium-only") && !b.gc.hasPremiumController() && b.loadGame();
            a || (b.keep_alive || b.kioskAd() ? b.showConnect(!0) : (1 >= document.location.hash.length && (document.location.hash = "#!restart"), window.setTimeout(function () {
                document.location.reload()
            })))
        },
        b.keep_alive ? 500 : 5E3), b.renderGamePlayers(), b.resetRTC(a))
    };
    b.gc.onclose = function (a) {
        (b.kiosk || confirm("Connection to game server lost (Error " + a + "). Reconnect?")) && document.location.reload()
    };
    b.gc.onproxyset = function (a, c) {
        if ("home" == a) if (!0 === c) b.loadGame();
        else if (!1 === c) {
            var d = b.gc.data.url;
            b.gc.data.url = void 0;
            b.loadGame(d)
        } else b.loadGame(c);
        else if ("custom" == a) b.gc.data.custom = c, b.gc.updatePresence(b.gc.data, "custom");
        else if ("default_ui" == a) c ? ($("#top-bar").show(), $("#iframe-container").css("top",
            "64px"), $("#ad").css("top", "64px")) : ($("#top-bar").hide(), $("#iframe-container").css("top", "0px"), $("#ad").css("top", "0px"));
        else if ("players" == a) b.gc.data.players = c, b.gc.updatePresence(b.gc.data, "players");
        else if ("ad" == a) b.showAd(c);
        else b.onProxySet(a, c)
    };
    b.gc.onproxyjserror = function (a) {
        b.reportException(GameConsole.gameName(a.url), a.exception, GameConsole.getGameUrl(a.url))
    };
    b.gc.onready = function () {
        $("#loading").fadeOut();
        if (window.parent && window.parent != window) try {
            window.parent.postMessage({
                action: "ready",
                version: b.gc.proxy_version
            }, document.location.href)
        } catch (d) {}
        b.tryActivateRTCForGame();
        b.last_game_start = (new Date).getTime()
    };
    b.gc.onrtccandidate = function (a, c) {
        b.onrtccandidate(a, c)
    };
    b.gc.onrtcoffer = function (a, c) {
        try {
            b.onrtcoffer(a, c)
        } catch (e) {}
    };
    b.gc.onadready = function () {
        b.gc.data.url == b.gc.data.ad.game && b.gc.callProxy({
            action: "ad"
        });
        $("#ad").show()
    };
    b.gc.shouldSendMessage = function (a, c, e) {
        return b.rtc_data_channels && b.rtc_data_channels[c] && a == GameConsole.COMMAND.MESSAGE && 2 == b.gc.data.rtc && b.gc.devices[c] && 2 == b.gc.devices[c].rtc && (a = GameConsole.createMessage(GameConsole.COMMAND.MESSAGE, b.gc.id, e), 8E3 > a.length) ? (b.rtc_data_channels[c].send(a), !1) : !0
    };
    b.gc.shouldSendIgnore = function () {
        for (var a = 1; a < b.gc.devices.length; ++a) if (b.gc.devices[a] && (!b.rtc_data_channels || !b.rtc_data_channels[a] || 2 != b.gc.data.rtc || 2 != b.gc.devices[a].rtc)) return !0;
        return !1
    };
    b.gc.onratelimit = function (a) {
        b.onRateLimit(a)
    }
};
App.prototype.handlePlayerLimit = function () {
    "block-3p-yes" == this.getExperimentVariation("region") && "com.airconsole.store" == GameConsole.gameName(this.gc.data.url) && 2 < this.gc.getNumberOfControllers() && !this.gc.hasPremiumController() && this.showPlayerLimitAd()
};
App.prototype.showPlayerLimitAd = function () {
    var a = games["com.airconsole.ads.multiplayer"];
    !a || !this.gc || this.gc.data.ad && this.gc.data.ad.url || this.showAd(a.live)
};
App.prototype.showAd = function (a) {
    var b = null,
        d = !1;
    if (a) {
        if (this.gc.data.ad && this.gc.data.ad.url) return;
        var c = null,
            e = GameConsole.gameName(this.gc.data.url),
            g = !1;
        var f = 0;
        for (var h = 1; h < this.gc.devices.length; ++h) this.gc.devices[h] && (f++, this.gc.devices[h].premium && (g = !0));
        if ("string" == typeof a) c = a;
        else if ("com.airconsole.developers" == e) g || (this.test_ad_count = (this.test_ad_count || 0) + 1, this.test_ad_count % 2 && (c = static_path + "ads/test/"));
        else if ("object" == typeof a && !0 === a.unlock || !0 === a && games[e] && -1 != games[e].stores.indexOf("premium-demo")) {
            if (!g && games["com.airconsole.ads.unlock"] && games["com.airconsole.ads.unlock"].live && ((new Date).getTime() - this.last_game_start > this.ad_config.premium_demo || !0 !== a)) {
                c = games["com.airconsole.ads.unlock"].live;
                f = a;
                !0 === a && (f = {
                    game_id: e,
                    "continue": !0
                });
                d = f.game_id;
                if (a = games[d]) f.game_cover = a.cover, f.game_name = a.name;
                c += "#" + encodeURIComponent(JSON.stringify(f))
            }
        } else if (this.ad_config.url && (f = a, !0 === a && (f = {
            game_id: e,
            screen: !0
        }), this.ad_config.last_ad_ts + 6E4 * this.ad_config.breaks[0] < (new Date).getTime() || f.preroll && this.ad_config.force_preroll || this.ad_config.first_preroll && this.ad_config.force_first_preroll) && (!f.preroll && 1 < this.ad_config.breaks.length && this.ad_config.breaks.shift(), this.ad_config.last_ad_ts = (new Date).getTime(), !g)) {
            c = this.ad_config.url;
            games[e] && (f.game_name = games[e].name);
            if (this.ad_config.config) for (var k in this.ad_config.config) f[k] = this.ad_config.config[k];
            this.ad_config.first_preroll && this.ad_config.force_first_preroll && (this.ad_config.first_preroll = !1, f.first_preroll = !0);
            c += "#" + encodeURIComponent(JSON.stringify(f))
        }
        this.gc.data.ad = {
            game: this.gc.data.url
        };
        c && games["com.airconsole.ads.multiplayer"] && 0 == c.indexOf(games["com.airconsole.ads.multiplayer"].live) && (this.gc.data.ad.game = "");
        d && (this.gc.data.ad.unlock = d);
        c ? (this.gc.data.ad.url = c, this.gc.updatePresence(this.gc.data, "ad"), d = $("#ad"), d.html(""), f = this.splitUrlForRole(c), a = f[0], f = f[1], "https:" == document.location.protocol && 0 == a.indexOf("http://") && (a = "https://" + a.substr(7)), e = $("<iframe></iframe>"), e.attr("frameborder", "0"), e.addClass("ad"), e.attr("src", a + "screen.html" + f),
        d.append(e), this.gc.setAdProxy(e[0].contentWindow), f = GameConsole.gameName(c), c = GameConsole.getGameUrl(c), this.reportStart(f, c), ga("send", "pageview", "/#!ad=" + f), DataCrunchIO.event("ad", {
            name: f,
            url: c,
            players: this.gc.getNumberOfControllers()
        })) : b = !1
    } else b = !0;
    null !== b && (this.gc.data.ad = this.gc.data.ad ? {
        complete: b,
        game: this.gc.data.ad.game
    } : {
        complete: b
    }, this.gc.data.url == this.gc.data.ad.game && this.gc.callProxy({
        action: "ad",
        complete: b
    }), this.gc.updatePresence(this.gc.data, "ad"), this.gc.setAdProxy(), $("#ad").hide().html(""))
};
App.prototype.splitUrlForRole = function (a) {
    a = a.split("#");
    var b = a.shift().split("?"),
        d = b.shift(),
        c = "";
    b.length && (c += "?" + b.join("?"));
    a.length && (c += "#" + a.join("#"));
    return [d, c]
};
App.prototype.tryActivateRTCForGame = function () {
    if (1 == this.gc.data.rtc) {
        for (var a = !0, b = GameConsole.getGameUrl(this.gc.data.location), d = GameConsole.SCREEN; d < this.gc.devices.length; ++d) if (this.gc.devices[d] && this.gc.devices[d].rtc && GameConsole.getGameUrl(this.gc.devices[d].location) != b) {
            a = !1;
            break
        }
        a && (this.gc.data.rtc = 2, this.gc.updatePresence(this.gc.data))
    }
};
App.prototype.resetRTC = function (a) {
    this.rtc_data_channels && (this.rtc_data_channels[a] && this.rtc_data_channels[a].close(), this.rtc_data_channels[a] = !1);
    this.rtc_peer_connections && (this.rtc_peer_connections[a] && this.rtc_peer_connections[a].close(), this.rtc_peer_connections[a] = !1)
};
App.prototype.onrtccandidate = function (a, b) {
    this.rtc_peer_connections[a] && this.rtc_peer_connections[a].addIceCandidate(new RTCIceCandidate(b))
};
App.prototype.dataChannelSetup = function (a, b) {
    var d = this;
    b.onmessage = function (a) {
        d.gc.onMessage(a.data)
    };
    b.onopen = function () {
        d.rtc_data_channels[a] || (window.console && console.log("WebRTC active for device_id " + a), d.rtc_data_channels[a] = b)
    };
    b.onclose = function () {
        d.resetRTC(a)
    };
    b.onerror = function () {
        try {
            peer_connection.close()
        } catch (c) {}
        d.resetRTC(a)
    }
};
App.prototype.onrtcoffer = function (a, b) {
    var d = this;
    if (!d.rtc_peer_connections[a]) {
        var c = new RTCPeerConnection({
            iceServers: [{
                url: "stun:stun.l.google.com:19302"
            }]
        });
        d.rtc_peer_connections[a] = c;
        c.ondatachannel = function (b) {
            d.dataChannelSetup(a, b.channel)
        };
        c.oniceconnectionstatechange = function () {
            "disconnected" == c.iceConnectionState && d.resetRTC(a)
        };
        c.onicecandidate = function (b) {
            (b = b.candidate) && d.gc.send(GameConsole.COMMAND.RTC_CANDIDATE, a, b)
        };
        c.setRemoteDescription(new RTCSessionDescription(b));
        c.createAnswer(function (b) {
            c.setLocalDescription(b);
            d.gc.send(GameConsole.COMMAND.RTC_ANSWER, a, b)
        }, function () {}, {})
    }
};
App.prototype.loadGame = function (a) {
    var b = this,
        d = a;
    void 0 == d && (d = store_url);
    if (b.gc.data.url != d) {
        b.gc.data.url && b.gc.data.url.split("#")[0] == d.split("#")[0] && b.game.attr("src", "");
        var c = GameConsole.gameName(d);
        if (b.first_device_connected) {
            var e = b.gc.getNumberOfControllers();
            ga("send", "pageview", "/#!play=" + c);
            DataCrunchIO.event("play", {
                name: c,
                url: d,
                players: e
            })
        }
        b.gc.data.url = d;
        a && (0 == d.indexOf("debug:") ? (d = d.substr(6), b.setDebug(!0)) : b.setDebug(!1));
        0 != d.indexOf(store_url) && $("#loading").fadeIn(400).delay(1E3);
        b.gc.data.rtc && (b.gc.data.rtc = 1);
        b.gc.updatePresence(b.gc.data);
        window.setTimeout(function () {
            var a = b.splitUrlForRole(d),
                c = a[0],
                a = a[1];
            "https:" == document.location.protocol && 0 == c.indexOf("http://") && (c = "https://" + c.substr(7));
            b.game.attr("src", c + "screen.html" + a)
        }, 400);
        b.playing_interval && window.clearInterval(b.playing_interval);
        b.playing_interval = window.setInterval(function () {
            var a = b.gc.getNumberOfControllers();
            a && (ga("send", "event", "Game", "Minutes", c, a), DataCrunchIO.event("play.minutes", {
                name: c,
                url: d,
                players: a
            }), b.played_games_minutes[c] || (b.played_games_minutes[c] = 0), b.played_games_minutes[c] += 1)
        }, 6E4);
        b.reportStart(c, GameConsole.getGameUrl(d))
    }
};
App.prototype.powerButton = function (a) {
    void 0 != this.getHashParameter("restart") && this.pingServers();
    a && 2 == a.which || fullScreenApi.requestFullScreen(document.documentElement);
    $("#connect-container").fadeIn();
    ga("send", "pageview", "/#!view=connect");
    DataCrunchIO.event("start.connect");
    this.onLandingTeardown();
    $("#content").show();
    $("#top-bar-fullscreen").css("display", "inline-block");
    this.fadeConnectSymbol();
    (new NoSleep(client)).enable();
    soundManager.play("power-button-click");
    this.power_button_pressed = !0;
    this.gc && $.post("/profile/screen", {
        code: this.gc.code,
        uid: user_data.uid
    })
};
App.prototype.onconnect = function () {
    $("#connect-code").text(this.gc.code);
    $("#top-bar-code").text(this.gc.code); - 1 != document.location.hash.indexOf("#http") || -1 != document.location.hash.indexOf("#debug:http") || this.getHashParameter("play") || this.loadGame();
    if (window.parent && window.parent != window) try {
        window.parent.postMessage({
            action: "code",
            code: this.gc.code
        }, document.location.href)
    } catch (a) {}
    this.use_power_button && !this.power_button_pressed || $.post("/profile/screen", {
        code: this.gc.code,
        uid: user_data.uid
    })
};
App.prototype.firstDeviceConnect = function () {
    if (this.first_device_connected) $("#top-bar-fullscreen").removeClass("with-text"), !this.second_device_connected && 1 < this.gc.getNumberOfControllers() && (this.second_device_connected = !0, $("#top-bar-connect-more").hide(), this.showConnect(!1), this.embed && $("#players").show());
    else {
        this.ad_config.last_ad_ts = (new Date).getTime();
        var a = $("#top-bar-code-container"),
            b = $("#connect-code-container");
        a.css("display", "inline-block");
        var d = b.offset(),
            c = a.offset();
        b.hide();
        a.css({
            top: d.top - c.top + "px",
            left: d.left - c.left + "px"
        });
        try {
            a.animate({
                top: "0px",
                left: "0px"
            }, 1E3)
        } catch (e) {
            a.css({
                top: "0px",
                left: "0px"
            })
        }
        ga("send", "pageview", "/#!view=game");
        DataCrunchIO.event("start.connect.firstdevice");
        fbq("track", "FirstDeviceConnected");
        this.showConnect(!1);
        document.location.hash ? 0 == document.location.hash.indexOf("#!") && (a = this.getPlayHashParameter(), b = this.getHashParameter("exclusive"), a && a.id ? (b = games[a.id]) && (-1 == b.stores.indexOf("premium-only") || this.gc.hasPremiumController()) ? this.loadGame(b.live + (a.fragment ? "#" + a.fragment : "")) : this.loadGame() : void 0 != b && this.loadGame(store_url + "#!exclusive=" + b)) : (a = GameConsole.gameName(store_url), ga("send", "pageview", "/#!play=" + a), b = this.gc.getNumberOfControllers(), DataCrunchIO.event("play", {
            name: a,
            url: store_url,
            players: b
        }));
        (document.location.hash && -1 != document.location.hash.indexOf("#http") || -1 != document.location.hash.indexOf("#debug:http")) && this.loadGame(document.location.hash.substr(1));
        this.first_device_connected = !0;
        this.getHashParameter("ad") && this.showAd(this.getHashParameter("ad"));
        $("#top-bar-connect-more").css("display", "inline-block");
        $("#top-bar-connect-more").addClass("top-bar-connect-more-animate");
        this.embed && $("#players").hide();
        window.setTimeout(function () {
            $("#top-bar-connect-more").removeClass("top-bar-connect-more-animate");
            $("#top-bar-connect-more").addClass("shade-border")
        }, 1E4)
    }
};
App.prototype.showConnect = function (a) {
    var b = $("#connect-container"),
        d = $("#connect"),
        c = $("#description"),
        e = $("#store-overlay");
    void 0 == a && (a = !d.is(":visible"));
    a ? ($("#connect-code-container").show(), b.show(), d.animate({
        bottom: 0
    }, 300), c.fadeIn(300), this.game.addClass("blur"), e.show()) : (d.animate({
        bottom: -404
    }, 300, function () {
        b.hide()
    }), this.game.removeClass("blur"), c.fadeOut(300), e.hide())
};
App.prototype.renderGamePlayers = function () {
    var a = $("#players"),
        b = this;
    if (b.gc && b.gc.devices) {
        var d = !1;
        $.each(b.gc.devices, function (c, e) {
            if (0 != c) {
                var g = $("#players-" + c);
                g.length || ($("<div id='players-container-" + c + "' class='player border-thick shade-border'><div id='players-" + c + "' class='player-avatar dark-bg'></div></div>").appendTo(a), g = $("#players-" + c), $("<span>&nbsp;</span>").appendTo(a));
                if (e) {
                    if (e.premium) {
                        var f = $("#players-container-" + c);
                        f.addClass("player-premium");
                        f.removeClass("shade-border");
                        d = !0
                    }
                    f = "<img src='" + static_path + "bad-signal.gif' class=player-bad-signal>";
                    var h = "/api/profile-picture?uid=" + e.uid + "&size=40";
                    e.picture && (h += "&v=" + e.picture);
                    g.css("background-image", "url(" + h + ")");
                    g.html(f);
                    b.keep_alive && $("#players-container-" + c).show();
                    if (e.slow_connection && (!RTCPeerConnection || !b.rtc_data_channels[c])) for (f = g.find(".player-bad-signal"), g = 0; 5 > g; g++) f.fadeIn(500).fadeOut(1E3)
                } else g.html("<div class='shade player-avatar-text'>X</div>"), g.css("background-image", "none"), b.keep_alive && $("#players-container-" + c).hide()
            }
        });
        d ? $("#top-bar").addClass("top-bar-premium") : $("#top-bar").removeClass("top-bar-premium")
    } else a.html("")
};
App.prototype.setDebug = function (a) {
    var b = this;
    if (b.debug != a) {
        if (a) {
            if ($("#top-bar-debug").show(), !b.stats_fps) {
                b.stats_fps = new Stats;
                b.stats_fps.domElement.style.position = "absolute";
                b.stats_fps.domElement.style.left = "282px";
                b.stats_fps.domElement.style.top = "-6px";
                document.getElementById("top-bar-debug").appendChild(b.stats_fps.domElement);
                b.stats_ms = new Stats;
                b.stats_ms.setMode(1);
                b.stats_ms.domElement.style.position = "absolute";
                b.stats_ms.domElement.style.left = "204px";
                b.stats_ms.domElement.style.top =
                    "-6px";
                document.getElementById("top-bar-debug").appendChild(b.stats_ms.domElement);
                b.stats_mb = new Stats;
                b.stats_mb.setMode(2);
                b.stats_mb.domElement.style.position = "absolute";
                b.stats_mb.domElement.style.left = "360px";
                b.stats_mb.domElement.style.top = "-6px";
                document.getElementById("top-bar-debug").appendChild(b.stats_mb.domElement);
                b.stats_ms.begin();
                var d = function () {
                    b.stats_ms.end();
                    b.stats_ms.begin();
                    b.stats_fps.begin();
                    b.stats_fps.end();
                    b.stats_mb.begin();
                    b.stats_mb.end();
                    requestAnimationFrame(d)
                };
                d()
            }
        } else $("#top-bar-debug").hide();
        b.debug = a
    }
};
App.prototype.showAndHideCursor = function () {
    var a = document.getElementById("iframe-no-cursor");
    this.debug ? a.style.display = "none" : (a.style.cursor = "auto", this.show_and_hide_cursor_timeout && window.clearTimeout(this.show_and_hide_cursor_timeout), this.show_and_hide_cursor_timeout = window.setTimeout(function () {
        a.style.cursor = "none"
    }, 500))
};
App.prototype.refresh = function () {
    var a = this.gc.data.url;
    this.gc.data.url = void 0;
    this.loadGame(a)
};
App.prototype.onLandingTeardown = function () {
    $("#landing").remove();
    this.landing_slider && ($(".slide-button").hide(), $(".slide-bullet-container").hide(), $("#landing-slide-bullet-container").remove(), this.landing_slider.navigateTo(0))
};
App.prototype.scrollToEle = function (a) {
    "string" === typeof a && (a = "#" + a);
    var b = $(a);
    $("html, body").animate({
        scrollTop: $(a).offset().top + b.height() / 2
    }, 600)
};
App.prototype.loadLandingIFrames = function (a) {
    var b = !1,
        d = $(window);
    if (d.scrollTop() > d.height() || a)(a = $("#landing-hero-info-container")) && "" === a.attr("src") && a.attr("src", "/file/premium/hero-info.html"), this.loadPlayVideo("https://www.youtube.com/embed/101AVlcPgk4"), d.off("scroll"), b = !0;
    return b
};
App.prototype.loadPlayVideo = function (a) {
    $("#landing-playing-video-frame").attr("src", a)
};
App.prototype.showTab = function (a, b, d) {
    a = $(a);
    a.parent().find(".tab-label").removeClass("active");
    a.addClass("active");
    a = $("#" + b).find(".tab");
    a.removeClass("tab-active");
    a.eq(d).addClass("tab-active")
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

// stats.js - http://github.com/mrdoob/stats.js
var Stats = function () {
    function f(a, e, b) {
        a = document.createElement(a);
        a.id = e;
        a.style.cssText = b;
        return a
    }
    function l(a, e, b) {
        var c = f("div", a, "padding:0 0 3px 3px;text-align:left;background:" + b),
            d = f("div", a + "Text", "font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px;color:" + e);
        d.innerHTML = a.toUpperCase();
        c.appendChild(d);
        a = f("div", a + "Graph", "width:74px;height:30px;background:" + e);
        c.appendChild(a);
        for (e = 0; 74 > e; e++) a.appendChild(f("span", "", "width:1px;height:30px;float:left;opacity:0.9;background:" + b));
        return c
    }
    function m(a) {
        for (var b = c.children, d = 0; d < b.length; d++) b[d].style.display = d === a ? "block" : "none";
        n = a
    }
    function p(a, b) {
        a.appendChild(a.firstChild).style.height = Math.min(30, 30 - 30 * b) + "px"
    }
    var q = self.performance && self.performance.now ? self.performance.now.bind(performance) : Date.now,
        k = q(),
        r = k,
        t = 0,
        n = 0,
        c = f("div", "stats", "width:80px;opacity:0.9;cursor:pointer");
    c.addEventListener("mousedown", function (a) {
        a.preventDefault();
        m(++n % c.children.length)
    }, !1);
    var d = 0,
        u = Infinity,
        v = 0,
        b = l("fps", "#0ff", "#002"),
        A = b.children[0],
        B = b.children[1];
    c.appendChild(b);
    var g = 0,
        w = Infinity,
        x = 0,
        b = l("ms", "#0f0", "#020"),
        C = b.children[0],
        D = b.children[1];
    c.appendChild(b);
    if (self.performance && self.performance.memory) {
        var h = 0,
            y = Infinity,
            z = 0,
            b = l("mb", "#f08", "#201"),
            E = b.children[0],
            F = b.children[1];
        c.appendChild(b)
    }
    m(n);
    return {
        REVISION: 14,
        domElement: c,
        setMode: m,
        begin: function () {
            k = q()
        },
        end: function () {
            var a = q();
            g = a - k;
            w = Math.min(w, g);
            x = Math.max(x, g);
            C.textContent = (g | 0) + " MS (" + (w | 0) + "-" + (x | 0) + ")";
            p(D, g / 200);
            t++;
            if (a > r + 1E3 && (d = Math.round(1E3 * t / (a - r)), u = Math.min(u, d), v = Math.max(v, d), A.textContent = d + " FPS (" + u + "-" + v + ")", p(B, d / 100), r = a, t = 0, void 0 !== h)) {
                var b = performance.memory.usedJSHeapSize,
                    c = performance.memory.jsHeapSizeLimit;
                h = Math.round(9.54E-7 * b);
                y = Math.min(y, h);
                z = Math.max(z, h);
                E.textContent = h + " MB (" + y + "-" + z + ")";
                p(F, b / c)
            }
            return a
        },
        update: function () {
            k = this.end()
        }
    }
};
"object" === typeof module && (module.exports = Stats);

(function (h, g) {
    function K(sb, K) {
        function ha(b) {
            return c.preferFlash && H && !c.ignoreFlash && c.flash[b] !== g && c.flash[b]
        }
        function r(b) {
            return function (d) {
                var e = this._s;
                e && e._a ? d = b.call(this, d) : (e && e.id ? c._wD(e.id + ": Ignoring " + d.type) : c._wD("HTML5::Ignoring " + d.type), d = null);
                return d
            }
        }
        this.setupOptions = {
            url: sb || null,
            flashVersion: 8,
            debugMode: !0,
            debugFlash: !1,
            useConsole: !0,
            consoleOnly: !0,
            waitForWindowLoad: !1,
            bgColor: "#ffffff",
            useHighPerformance: !1,
            flashPollingInterval: null,
            html5PollingInterval: null,
            flashLoadTimeout: 1E3,
            wmode: null,
            allowScriptAccess: "always",
            useFlashBlock: !1,
            useHTML5Audio: !0,
            forceUseGlobalHTML5Audio: !1,
            ignoreMobileRestrictions: !1,
            html5Test: /^(probably|maybe)$/i,
            preferFlash: !1,
            noSWFCache: !1,
            idPrefix: "sound"
        };
        this.defaultOptions = {
            autoLoad: !1,
            autoPlay: !1,
            from: null,
            loops: 1,
            onid3: null,
            onload: null,
            whileloading: null,
            onplay: null,
            onpause: null,
            onresume: null,
            whileplaying: null,
            onposition: null,
            onstop: null,
            onfailure: null,
            onfinish: null,
            multiShot: !0,
            multiShotEvents: !1,
            position: null,
            pan: 0,
            stream: !0,
            to: null,
            type: null,
            usePolicyFile: !1,
            volume: 100
        };
        this.flash9Options = {
            isMovieStar: null,
            usePeakData: !1,
            useWaveformData: !1,
            useEQData: !1,
            onbufferchange: null,
            ondataerror: null
        };
        this.movieStarOptions = {
            bufferTime: 3,
            serverURL: null,
            onconnect: null,
            duration: null
        };
        this.audioFormats = {
            mp3: {
                type: ['audio/mpeg; codecs="mp3"', "audio/mpeg", "audio/mp3", "audio/MPA", "audio/mpa-robust"],
                required: !0
            },
            mp4: {
                related: ["aac", "m4a", "m4b"],
                type: ['audio/mp4; codecs="mp4a.40.2"', "audio/aac", "audio/x-m4a", "audio/MP4A-LATM", "audio/mpeg4-generic"],
                required: !1
            },
            ogg: {
                type: ["audio/ogg; codecs=vorbis"],
                required: !1
            },
            opus: {
                type: ["audio/ogg; codecs=opus", "audio/opus"],
                required: !1
            },
            wav: {
                type: ['audio/wav; codecs="1"', "audio/wav", "audio/wave", "audio/x-wav"],
                required: !1
            }
        };
        this.movieID = "sm2-container";
        this.id = K || "sm2movie";
        this.debugID = "soundmanager-debug";
        this.debugURLParam = /([#?&])debug=1/i;
        this.versionNumber = "V2.97a.20150601";
        this.altURL = this.movieURL = this.version = null;
        this.enabled = this.swfLoaded = !1;
        this.oMC = null;
        this.sounds = {};
        this.soundIDs = [];
        this.didFlashBlock = this.muted = !1;
        this.filePattern = null;
        this.filePatterns = {
            flash8: /\.mp3(\?.*)?$/i,
            flash9: /\.mp3(\?.*)?$/i
        };
        this.features = {
            buffering: !1,
            peakData: !1,
            waveformData: !1,
            eqData: !1,
            movieStar: !1
        };
        this.sandbox = {
            type: null,
            types: {
                remote: "remote (domain-based) rules",
                localWithFile: "local with file access (no internet access)",
                localWithNetwork: "local with network (internet access only, no local access)",
                localTrusted: "local, trusted (local+internet access)"
            },
            description: null,
            noRemote: null,
            noLocal: null
        };
        this.html5 = {
            usingFlash: null
        };
        this.flash = {};
        this.ignoreFlash = this.html5Only = !1;
        var W, c = this,
            Ya = null,
            l = null,
            F, v = navigator.userAgent,
            ia = h.location.href.toString(),
            m = document,
            ya, Za, za, n, I = [],
            Aa = !0,
            D, X = !1,
            Y = !1,
            q = !1,
            y = !1,
            ja = !1,
            p, tb = 0,
            Z, A, Ba, R, Ca, P, S, T, $a, Da, Ea, ka, z, la, Q, Fa, aa, ma, na, U, ab, Ga, bb = ["log", "info", "warn", "error"],
            cb, Ha, db, ba = null,
            Ia = null,
            t, Ja, V, eb, oa, pa, L, w, ca = !1,
            Ka = !1,
            fb, gb, hb, qa = 0,
            da = null,
            ra, M = [],
            ea, u = null,
            ib, sa, fa, N, ta, La, jb, x, kb = Array.prototype.slice,
            C = !1,
            Ma, H, Na, lb, J, mb, Oa, ua, nb = 0,
            Pa, Qa = v.match(/(ipad|iphone|ipod)/i),
            Ra = v.match(/android/i),
            O = v.match(/msie/i),
            ub = v.match(/webkit/i),
            va = v.match(/safari/i) && !v.match(/chrome/i),
            Sa = v.match(/opera/i),
            wa = v.match(/(mobile|pre\/|xoom)/i) || Qa || Ra,
            Ta = !ia.match(/usehtml5audio/i) && !ia.match(/sm2\-ignorebadua/i) && va && !v.match(/silk/i) && v.match(/OS X 10_6_([3-7])/i),
            Ua = h.console !== g && console.log !== g,
            Va = m.hasFocus !== g ? m.hasFocus() : null,
            xa = va && (m.hasFocus === g || !m.hasFocus()),
            ob = !xa,
            pb = /(mp3|mp4|mpa|m4a|m4b)/i,
            ga = m.location ? m.location.protocol.match(/http/i) : null,
            vb = ga ? "" : "http://",
            qb = /^\s*audio\/(?:x-)?(?:mpeg4|aac|flv|mov|mp4||m4v|m4a|m4b|mp4v|3gp|3g2)\s*(?:$|;)/i,
            rb = "mpeg4 aac flv mov mp4 m4v f4v m4a m4b mp4v 3gp 3g2".split(" "),
            wb = new RegExp("\\.(" + rb.join("|") + ")(\\?.*)?$", "i");
        this.mimePattern = /^\s*audio\/(?:x-)?(?:mp(?:eg|3))\s*(?:$|;)/i;
        this.useAltURL = !ga;
        var Wa;
        try {
            Wa = Audio !== g && (Sa && opera !== g && 10 > opera.version() ? new Audio(null) : new Audio).canPlayType !== g
        } catch (xb) {
            Wa = !1
        }
        this.hasHTML5 = Wa;
        this.setup = function (b) {
            var d = !c.url;
            b !== g && q && u && c.ok() && (b.flashVersion !== g || b.url !== g || b.html5Test !== g) && L(t("setupLate"));
            Ba(b);
            if (!C) if (wa) {
                if (!c.setupOptions.ignoreMobileRestrictions || c.setupOptions.forceUseGlobalHTML5Audio) M.push(z.globalHTML5), C = !0
            } else c.setupOptions.forceUseGlobalHTML5Audio && (M.push(z.globalHTML5), C = !0);
            if (!Pa && wa) if (c.setupOptions.ignoreMobileRestrictions) M.push(z.ignoreMobile);
            else if (c.setupOptions.useHTML5Audio && !c.setupOptions.preferFlash || c._wD(z.mobileUA), c.setupOptions.useHTML5Audio = !0, c.setupOptions.preferFlash = !1, Qa) c.ignoreFlash = !0;
            else if (Ra && !v.match(/android\s2\.3/i) || !Ra) c._wD(z.globalHTML5), C = !0;
            b && (d && aa && b.url !== g && c.beginDelayedInit(), aa || b.url === g || "complete" !== m.readyState || setTimeout(Q, 1));
            Pa = !0;
            return c
        };
        this.supported = this.ok = function () {
            return u ? q && !y : c.useHTML5Audio && c.hasHTML5
        };
        this.getMovie = function (c) {
            return F(c) || m[c] || h[c]
        };
        this.createSound = function (b, d) {
            function e() {
                f = oa(f);
                c.sounds[f.id] = new W(f);
                c.soundIDs.push(f.id);
                return c.sounds[f.id]
            }
            var a, f;
            a = null;
            a = "soundManager.createSound(): " + t(q ? "notOK" : "notReady");
            if (!q || !c.ok()) return L(a), !1;
            d !== g && (b = {
                id: b,
                url: d
            });
            f = A(b);
            f.url = ra(f.url);
            f.id === g && (f.id = c.setupOptions.idPrefix + nb++);
            f.id.toString().charAt(0).match(/^[0-9]$/) && c._wD("soundManager.createSound(): " + t("badID", f.id), 2);
            c._wD("soundManager.createSound(): " + f.id + (f.url ? " (" + f.url + ")" : ""), 1);
            if (w(f.id, !0)) return c._wD("soundManager.createSound(): " + f.id + " exists", 1), c.sounds[f.id];
            if (sa(f)) a = e(), c.html5Only || c._wD(f.id + ": Using HTML5"), a._setup_html5(f);
            else {
                if (c.html5Only) return c._wD(f.id + ": No HTML5 support for this sound, and no Flash. Exiting."),
                e();
                if (c.html5.usingFlash && f.url && f.url.match(/data\:/i)) return c._wD(f.id + ": data: URIs not supported via Flash. Exiting."), e();
                8 < n && (null === f.isMovieStar && (f.isMovieStar = !! (f.serverURL || f.type && f.type.match(qb) || f.url && f.url.match(wb))), f.isMovieStar && (c._wD("soundManager.createSound(): using MovieStar handling"), 1 < f.loops && p("noNSLoop")));
                f = pa(f, "soundManager.createSound(): ");
                a = e();
                8 === n ? l._createSound(f.id, f.loops || 1, f.usePolicyFile) : (l._createSound(f.id, f.url, f.usePeakData, f.useWaveformData,
                f.useEQData, f.isMovieStar, f.isMovieStar ? f.bufferTime : !1, f.loops || 1, f.serverURL, f.duration || null, f.autoPlay, !0, f.autoLoad, f.usePolicyFile), f.serverURL || (a.connected = !0, f.onconnect && f.onconnect.apply(a)));
                f.serverURL || !f.autoLoad && !f.autoPlay || a.load(f)
            }!f.serverURL && f.autoPlay && a.play();
            return a
        };
        this.destroySound = function (b, d) {
            if (!w(b)) return !1;
            var e = c.sounds[b],
                a;
            e.stop();
            e._iO = {};
            e.unload();
            for (a = 0; a < c.soundIDs.length; a++) if (c.soundIDs[a] === b) {
                c.soundIDs.splice(a, 1);
                break
            }
            d || e.destruct(!0);
            delete c.sounds[b];
            return !0
        };
        this.load = function (b, d) {
            return w(b) ? c.sounds[b].load(d) : !1
        };
        this.unload = function (b) {
            return w(b) ? c.sounds[b].unload() : !1
        };
        this.onposition = this.onPosition = function (b, d, e, a) {
            return w(b) ? c.sounds[b].onposition(d, e, a) : !1
        };
        this.clearOnPosition = function (b, d, e) {
            return w(b) ? c.sounds[b].clearOnPosition(d, e) : !1
        };
        this.start = this.play = function (b, d) {
            var e = null,
                a = d && !(d instanceof Object);
            if (!q || !c.ok()) return L("soundManager.play(): " + t(q ? "notOK" : "notReady")), !1;
            if (w(b, a)) a && (d = {
                url: d
            });
            else {
                if (!a) return !1;
                a && (d = {
                    url: d
                });
                d && d.url && (c._wD('soundManager.play(): Attempting to create "' + b + '"', 1), d.id = b, e = c.createSound(d).play())
            }
            null === e && (e = c.sounds[b].play(d));
            return e
        };
        this.setPosition = function (b, d) {
            return w(b) ? c.sounds[b].setPosition(d) : !1
        };
        this.stop = function (b) {
            if (!w(b)) return !1;
            c._wD("soundManager.stop(" + b + ")", 1);
            return c.sounds[b].stop()
        };
        this.stopAll = function () {
            var b;
            c._wD("soundManager.stopAll()", 1);
            for (b in c.sounds) c.sounds.hasOwnProperty(b) && c.sounds[b].stop()
        };
        this.pause = function (b) {
            return w(b) ? c.sounds[b].pause() : !1
        };
        this.pauseAll = function () {
            var b;
            for (b = c.soundIDs.length - 1; 0 <= b; b--) c.sounds[c.soundIDs[b]].pause()
        };
        this.resume = function (b) {
            return w(b) ? c.sounds[b].resume() : !1
        };
        this.resumeAll = function () {
            var b;
            for (b = c.soundIDs.length - 1; 0 <= b; b--) c.sounds[c.soundIDs[b]].resume()
        };
        this.togglePause = function (b) {
            return w(b) ? c.sounds[b].togglePause() : !1
        };
        this.setPan = function (b, d) {
            return w(b) ? c.sounds[b].setPan(d) : !1
        };
        this.setVolume = function (b, d) {
            var e, a;
            if (b === g || isNaN(b) || d !== g) return w(b) ? c.sounds[b].setVolume(d) : !1;
            e = 0;
            for (a = c.soundIDs.length; e < a; e++) c.sounds[c.soundIDs[e]].setVolume(b)
        };
        this.mute = function (b) {
            var d = 0;
            b instanceof String && (b = null);
            if (b) {
                if (!w(b)) return !1;
                c._wD('soundManager.mute(): Muting "' + b + '"');
                return c.sounds[b].mute()
            }
            c._wD("soundManager.mute(): Muting all sounds");
            for (d = c.soundIDs.length - 1; 0 <= d; d--) c.sounds[c.soundIDs[d]].mute();
            return c.muted = !0
        };
        this.muteAll = function () {
            c.mute()
        };
        this.unmute = function (b) {
            b instanceof String && (b = null);
            if (b) {
                if (!w(b)) return !1;
                c._wD('soundManager.unmute(): Unmuting "' + b + '"');
                return c.sounds[b].unmute()
            }
            c._wD("soundManager.unmute(): Unmuting all sounds");
            for (b = c.soundIDs.length - 1; 0 <= b; b--) c.sounds[c.soundIDs[b]].unmute();
            c.muted = !1;
            return !0
        };
        this.unmuteAll = function () {
            c.unmute()
        };
        this.toggleMute = function (b) {
            return w(b) ? c.sounds[b].toggleMute() : !1
        };
        this.getMemoryUse = function () {
            var c = 0;
            l && 8 !== n && (c = parseInt(l._getMemoryUse(), 10));
            return c
        };
        this.disable = function (b) {
            var d;
            b === g && (b = !1);
            if (y) return !1;
            y = !0;
            p("shutdown", 1);
            for (d = c.soundIDs.length - 1; 0 <= d; d--) cb(c.sounds[c.soundIDs[d]]);
            Z(b);
            x.remove(h, "load", S);
            return !0
        };
        this.canPlayMIME = function (b) {
            var d;
            c.hasHTML5 && (d = fa({
                type: b
            }));
            !d && u && (d = b && c.ok() ? !! (8 < n && b.match(qb) || b.match(c.mimePattern)) : null);
            return d
        };
        this.canPlayURL = function (b) {
            var d;
            c.hasHTML5 && (d = fa({
                url: b
            }));
            !d && u && (d = b && c.ok() ? !! b.match(c.filePattern) : null);
            return d
        };
        this.canPlayLink = function (b) {
            return b.type !== g && b.type && c.canPlayMIME(b.type) ? !0 : c.canPlayURL(b.href)
        };
        this.getSoundById = function (b, d) {
            if (!b) return null;
            var e = c.sounds[b];
            e || d || c._wD('soundManager.getSoundById(): Sound "' + b + '" not found.', 2);
            return e
        };
        this.onready = function (b, d) {
            if ("function" === typeof b) q && c._wD(t("queue", "onready")), d || (d = h), Ca("onready", b, d), P();
            else throw t("needFunction", "onready");
            return !0
        };
        this.ontimeout = function (b, d) {
            if ("function" === typeof b) q && c._wD(t("queue", "ontimeout")), d || (d = h), Ca("ontimeout", b, d), P({
                type: "ontimeout"
            });
            else throw t("needFunction", "ontimeout");
            return !0
        };
        this._writeDebug = function (b, d) {
            var e, a;
            if (!c.setupOptions.debugMode) return !1;
            if (Ua && c.useConsole) {
                if (d && "object" === typeof d) console.log(b,
                d);
                else if (bb[d] !== g) console[bb[d]](b);
                else console.log(b);
                if (c.consoleOnly) return !0
            }
            e = F("soundmanager-debug");
            if (!e) return !1;
            a = m.createElement("div");
            0 === ++tb % 2 && (a.className = "sm2-alt");
            d = d === g ? 0 : parseInt(d, 10);
            a.appendChild(m.createTextNode(b));
            d && (2 <= d && (a.style.fontWeight = "bold"), 3 === d && (a.style.color = "#ff3333"));
            e.insertBefore(a, e.firstChild);
            return !0
        }; - 1 !== ia.indexOf("sm2-debug=alert") && (this._writeDebug = function (c) {
            h.alert(c)
        });
        this._wD = this._writeDebug;
        this._debug = function () {
            var b, d;
            p("currentObj",
            1);
            b = 0;
            for (d = c.soundIDs.length; b < d; b++) c.sounds[c.soundIDs[b]]._debug()
        };
        this.reboot = function (b, d) {
            c.soundIDs.length && c._wD("Destroying " + c.soundIDs.length + " SMSound object" + (1 !== c.soundIDs.length ? "s" : "") + "...");
            var e, a, f;
            for (e = c.soundIDs.length - 1; 0 <= e; e--) c.sounds[c.soundIDs[e]].destruct();
            if (l) try {
                O && (Ia = l.innerHTML), ba = l.parentNode.removeChild(l)
            } catch (g) {
                p("badRemove", 2)
            }
            Ia = ba = u = l = null;
            c.enabled = aa = q = ca = Ka = X = Y = y = C = c.swfLoaded = !1;
            c.soundIDs = [];
            c.sounds = {};
            nb = 0;
            Pa = !1;
            if (b) I = [];
            else for (e in I) if (I.hasOwnProperty(e)) for (a = 0, f = I[e].length; a < f; a++) I[e][a].fired = !1;
            d || c._wD("soundManager: Rebooting...");
            c.html5 = {
                usingFlash: null
            };
            c.flash = {};
            c.html5Only = !1;
            c.ignoreFlash = !1;
            h.setTimeout(function () {
                d || c.beginDelayedInit()
            }, 20);
            return c
        };
        this.reset = function () {
            p("reset");
            return c.reboot(!0, !0)
        };
        this.getMoviePercent = function () {
            return l && "PercentLoaded" in l ? l.PercentLoaded() : null
        };
        this.beginDelayedInit = function () {
            ja = !0;
            Q();
            setTimeout(function () {
                if (Ka) return !1;
                na();
                la();
                return Ka = !0
            }, 20);
            T()
        };
        this.destruct = function () {
            c._wD("soundManager.destruct()");
            c.disable(!0)
        };
        W = function (b) {
            var d, e, a = this,
                f, h, k, G, m, q, r = !1,
                E = [],
                v = 0,
                Xa, y, u = null,
                z;
            e = d = null;
            this.sID = this.id = b.id;
            this.url = b.url;
            this._iO = this.instanceOptions = this.options = A(b);
            this.pan = this.options.pan;
            this.volume = this.options.volume;
            this.isHTML5 = !1;
            this._a = null;
            z = this.url ? !1 : !0;
            this.id3 = {};
            this._debug = function () {
                c._wD(a.id + ": Merged options:", a.options)
            };
            this.load = function (b) {
                var d = null,
                    e;
                b !== g ? a._iO = A(b, a.options) : (b = a.options, a._iO = b, u && u !== a.url && (p("manURL"), a._iO.url = a.url, a.url = null));
                a._iO.url || (a._iO.url = a.url);
                a._iO.url = ra(a._iO.url);
                e = a.instanceOptions = a._iO;
                c._wD(a.id + ": load (" + e.url + ")");
                if (!e.url && !a.url) return c._wD(a.id + ": load(): url is unassigned. Exiting.", 2), a;
                a.isHTML5 || 8 !== n || a.url || e.autoPlay || c._wD(a.id + ": Flash 8 load() limitation: Wait for onload() before calling play().", 1);
                if (e.url === a.url && 0 !== a.readyState && 2 !== a.readyState) return p("onURL", 1), 3 === a.readyState && e.onload && ua(a, function () {
                    e.onload.apply(a, [ !! a.duration])
                }), a;
                a.loaded = !1;
                a.readyState = 1;
                a.playState = 0;
                a.id3 = {};
                if (sa(e)) d = a._setup_html5(e), d._called_load ? c._wD(a.id + ": Ignoring request to load again") : (a._html5_canplay = !1, a.url !== e.url && (c._wD(p("manURL") + ": " + e.url), a._a.src = e.url, a.setPosition(0)), a._a.autobuffer = "auto", a._a.preload = "auto", a._a._called_load = !0);
                else {
                    if (c.html5Only) return c._wD(a.id + ": No flash support. Exiting."), a;
                    if (a._iO.url && a._iO.url.match(/data\:/i)) return c._wD(a.id + ": data: URIs not supported via Flash. Exiting."), a;
                    try {
                        a.isHTML5 = !1, a._iO = pa(oa(e)), a._iO.autoPlay && (a._iO.position || a._iO.from) && (c._wD(a.id + ": Disabling autoPlay because of non-zero offset case"), a._iO.autoPlay = !1), e = a._iO, 8 === n ? l._load(a.id, e.url, e.stream, e.autoPlay, e.usePolicyFile) : l._load(a.id, e.url, !! e.stream, !! e.autoPlay, e.loops || 1, !! e.autoLoad, e.usePolicyFile)
                    } catch (f) {
                        p("smError", 2), D("onload", !1), U({
                            type: "SMSOUND_LOAD_JS_EXCEPTION",
                            fatal: !0
                        })
                    }
                }
                a.url = e.url;
                return a
            };
            this.unload = function () {
                0 !== a.readyState && (c._wD(a.id + ": unload()"), a.isHTML5 ? (G(), a._a && (a._a.pause(), u = ta(a._a))) : 8 === n ? l._unload(a.id, "about:blank") : l._unload(a.id), f());
                return a
            };
            this.destruct = function (b) {
                c._wD(a.id + ": Destruct");
                a.isHTML5 ? (G(), a._a && (a._a.pause(), ta(a._a), C || k(), a._a._s = null, a._a = null)) : (a._iO.onfailure = null, l._destroySound(a.id));
                b || c.destroySound(a.id, !0)
            };
            this.start = this.play = function (b, d) {
                var e, f, k, G, h, B = !0,
                    B = null;
                e = a.id + ": play(): ";
                d = d === g ? !0 : d;
                b || (b = {});
                a.url && (a._iO.url = a.url);
                a._iO = A(a._iO, a.options);
                a._iO = A(b, a._iO);
                a._iO.url = ra(a._iO.url);
                a.instanceOptions = a._iO;
                if (!a.isHTML5 && a._iO.serverURL && !a.connected) return a.getAutoPlay() || (c._wD(e + " Netstream not connected yet - setting autoPlay"), a.setAutoPlay(!0)), a;
                sa(a._iO) && (a._setup_html5(a._iO), m());
                1 !== a.playState || a.paused || ((f = a._iO.multiShot) ? c._wD(e + "Already playing (multi-shot)", 1) : (c._wD(e + "Already playing (one-shot)", 1), a.isHTML5 && a.setPosition(a._iO.position), B = a));
                if (null !== B) return B;
                b.url && b.url !== a.url && (a.readyState || a.isHTML5 || 8 !== n || !z ? a.load(a._iO) : z = !1);
                a.loaded ? c._wD(e.substr(0, e.lastIndexOf(":"))) : 0 === a.readyState ? (c._wD(e + "Attempting to load"), a.isHTML5 || c.html5Only ? a.isHTML5 ? a.load(a._iO) : (c._wD(e + "Unsupported type. Exiting."), B = a) : (a._iO.autoPlay = !0, a.load(a._iO)), a.instanceOptions = a._iO) : 2 === a.readyState ? (c._wD(e + "Could not load - exiting", 2), B = a) : c._wD(e + "Loading - attempting to play...");
                if (null !== B) return B;
                !a.isHTML5 && 9 === n && 0 < a.position && a.position === a.duration && (c._wD(e + "Sound at end, resetting to position: 0"), b.position = 0);
                if (a.paused && 0 <= a.position && (!a._iO.serverURL || 0 < a.position)) c._wD(e + "Resuming from paused state", 1), a.resume();
                else {
                    a._iO = A(b, a._iO);
                    if ((!a.isHTML5 && null !== a._iO.position && 0 < a._iO.position || null !== a._iO.from && 0 < a._iO.from || null !== a._iO.to) && 0 === a.instanceCount && 0 === a.playState && !a._iO.serverURL) {
                        f = function () {
                            a._iO = A(b, a._iO);
                            a.play(a._iO)
                        };
                        a.isHTML5 && !a._html5_canplay ? (c._wD(e + "Beginning load for non-zero offset case"), a.load({
                            _oncanplay: f
                        }), B = !1) : a.isHTML5 || a.loaded || a.readyState && 2 === a.readyState || (c._wD(e + "Preloading for non-zero offset case"), a.load({
                            onload: f
                        }), B = !1);
                        if (null !== B) return B;
                        a._iO = y()
                    }(!a.instanceCount || a._iO.multiShotEvents || a.isHTML5 && a._iO.multiShot && !C || !a.isHTML5 && 8 < n && !a.getAutoPlay()) && a.instanceCount++;
                    a._iO.onposition && 0 === a.playState && q(a);
                    a.playState = 1;
                    a.paused = !1;
                    a.position = a._iO.position === g || isNaN(a._iO.position) ? 0 : a._iO.position;
                    a.isHTML5 || (a._iO = pa(oa(a._iO)));
                    a._iO.onplay && d && (a._iO.onplay.apply(a), r = !0);
                    a.setVolume(a._iO.volume, !0);
                    a.setPan(a._iO.pan, !0);
                    a.isHTML5 ? 2 > a.instanceCount ? (m(), e = a._setup_html5(), a.setPosition(a._iO.position), e.play()) : (c._wD(a.id + ": Cloning Audio() for instance #" + a.instanceCount + "..."), k = new Audio(a._iO.url), G = function () {
                        x.remove(k, "ended", G);
                        a._onfinish(a);
                        ta(k);
                        k = null
                    }, h = function () {
                        x.remove(k, "canplay", h);
                        try {
                            k.currentTime = a._iO.position / 1E3
                        } catch (c) {
                            L(a.id + ": multiShot play() failed to apply position of " + a._iO.position / 1E3)
                        }
                        k.play()
                    }, x.add(k, "ended", G), a._iO.volume !== g && (k.volume = Math.max(0, Math.min(1, a._iO.volume / 100))), a.muted && (k.muted = !0), a._iO.position ? x.add(k, "canplay", h) : k.play()) : (B = l._start(a.id, a._iO.loops || 1, 9 === n ? a.position : a.position / 1E3,
                    a._iO.multiShot || !1), 9 !== n || B || (c._wD(e + "No sound hardware, or 32-sound ceiling hit", 2), a._iO.onplayerror && a._iO.onplayerror.apply(a)))
                }
                return a
            };
            this.stop = function (b) {
                var d = a._iO;
                1 === a.playState && (c._wD(a.id + ": stop()"), a._onbufferchange(0), a._resetOnPosition(0), a.paused = !1, a.isHTML5 || (a.playState = 0), Xa(), d.to && a.clearOnPosition(d.to), a.isHTML5 ? a._a && (b = a.position, a.setPosition(0), a.position = b, a._a.pause(), a.playState = 0, a._onTimer(), G()) : (l._stop(a.id, b), d.serverURL && a.unload()), a.instanceCount = 0, a._iO = {}, d.onstop && d.onstop.apply(a));
                return a
            };
            this.setAutoPlay = function (b) {
                c._wD(a.id + ": Autoplay turned " + (b ? "on" : "off"));
                a._iO.autoPlay = b;
                a.isHTML5 || (l._setAutoPlay(a.id, b), b && !a.instanceCount && 1 === a.readyState && (a.instanceCount++, c._wD(a.id + ": Incremented instance count to " + a.instanceCount)))
            };
            this.getAutoPlay = function () {
                return a._iO.autoPlay
            };
            this.setPosition = function (b) {
                b === g && (b = 0);
                var d = a.isHTML5 ? Math.max(b, 0) : Math.min(a.duration || a._iO.duration, Math.max(b, 0));
                a.position = d;
                b = a.position / 1E3;
                a._resetOnPosition(a.position);
                a._iO.position = d;
                if (!a.isHTML5) b = 9 === n ? a.position : b, a.readyState && 2 !== a.readyState && l._setPosition(a.id, b, a.paused || !a.playState, a._iO.multiShot);
                else if (a._a) {
                    if (a._html5_canplay) {
                        if (a._a.currentTime !== b) {
                            c._wD(a.id + ": setPosition(" + b + ")");
                            try {
                                a._a.currentTime = b, (0 === a.playState || a.paused) && a._a.pause()
                            } catch (e) {
                                c._wD(a.id + ": setPosition(" + b + ") failed: " + e.message, 2)
                            }
                        }
                    } else if (b) return c._wD(a.id + ": setPosition(" + b + "): Cannot seek yet, sound not ready", 2), a;
                    a.paused && a._onTimer(!0)
                }
                return a
            };
            this.pause = function (b) {
                if (a.paused || 0 === a.playState && 1 !== a.readyState) return a;
                c._wD(a.id + ": pause()");
                a.paused = !0;
                a.isHTML5 ? (a._setup_html5().pause(), G()) : (b || b === g) && l._pause(a.id, a._iO.multiShot);
                a._iO.onpause && a._iO.onpause.apply(a);
                return a
            };
            this.resume = function () {
                var b = a._iO;
                if (!a.paused) return a;
                c._wD(a.id + ": resume()");
                a.paused = !1;
                a.playState = 1;
                a.isHTML5 ? (a._setup_html5().play(), m()) : (b.isMovieStar && !b.serverURL && a.setPosition(a.position), l._pause(a.id, b.multiShot));
                !r && b.onplay ? (b.onplay.apply(a), r = !0) : b.onresume && b.onresume.apply(a);
                return a
            };
            this.togglePause = function () {
                c._wD(a.id + ": togglePause()");
                if (0 === a.playState) return a.play({
                    position: 9 !== n || a.isHTML5 ? a.position / 1E3 : a.position
                }), a;
                a.paused ? a.resume() : a.pause();
                return a
            };
            this.setPan = function (c, b) {
                c === g && (c = 0);
                b === g && (b = !1);
                a.isHTML5 || l._setPan(a.id, c);
                a._iO.pan = c;
                b || (a.pan = c, a.options.pan = c);
                return a
            };
            this.setVolume = function (b, d) {
                b === g && (b = 100);
                d === g && (d = !1);
                a.isHTML5 ? a._a && (c.muted && !a.muted && (a.muted = !0, a._a.muted = !0), a._a.volume = Math.max(0, Math.min(1, b / 100))) : l._setVolume(a.id, c.muted && !a.muted || a.muted ? 0 : b);
                a._iO.volume = b;
                d || (a.volume = b, a.options.volume = b);
                return a
            };
            this.mute = function () {
                a.muted = !0;
                a.isHTML5 ? a._a && (a._a.muted = !0) : l._setVolume(a.id, 0);
                return a
            };
            this.unmute = function () {
                a.muted = !1;
                var b = a._iO.volume !== g;
                a.isHTML5 ? a._a && (a._a.muted = !1) : l._setVolume(a.id, b ? a._iO.volume : a.options.volume);
                return a
            };
            this.toggleMute = function () {
                return a.muted ? a.unmute() : a.mute()
            };
            this.onposition = this.onPosition = function (b, c, d) {
                E.push({
                    position: parseInt(b, 10),
                    method: c,
                    scope: d !== g ? d : a,
                    fired: !1
                });
                return a
            };
            this.clearOnPosition = function (a, b) {
                var c;
                a = parseInt(a, 10);
                if (isNaN(a)) return !1;
                for (c = 0; c < E.length; c++) a !== E[c].position || b && b !== E[c].method || (E[c].fired && v--, E.splice(c, 1))
            };
            this._processOnPosition = function () {
                var b, c;
                b = E.length;
                if (!b || !a.playState || v >= b) return !1;
                for (--b; 0 <= b; b--) c = E[b], !c.fired && a.position >= c.position && (c.fired = !0, v++, c.method.apply(c.scope, [c.position]));
                return !0
            };
            this._resetOnPosition = function (a) {
                var b, c;
                b = E.length;
                if (!b) return !1;
                for (--b; 0 <= b; b--) c = E[b], c.fired && a <= c.position && (c.fired = !1, v--);
                return !0
            };
            y = function () {
                var b = a._iO,
                    d = b.from,
                    e = b.to,
                    f, g;
                g = function () {
                    c._wD(a.id + ': "To" time of ' + e + " reached.");
                    a.clearOnPosition(e, g);
                    a.stop()
                };
                f = function () {
                    c._wD(a.id + ': Playing "from" ' + d);
                    if (null !== e && !isNaN(e)) a.onPosition(e, g)
                };
                null === d || isNaN(d) || (b.position = d, b.multiShot = !1, f());
                return b
            };
            q = function () {
                var b, c = a._iO.onposition;
                if (c) for (b in c) if (c.hasOwnProperty(b)) a.onPosition(parseInt(b,
                10), c[b])
            };
            Xa = function () {
                var b, c = a._iO.onposition;
                if (c) for (b in c) c.hasOwnProperty(b) && a.clearOnPosition(parseInt(b, 10))
            };
            m = function () {
                a.isHTML5 && fb(a)
            };
            G = function () {
                a.isHTML5 && gb(a)
            };
            f = function (b) {
                b || (E = [], v = 0);
                r = !1;
                a._hasTimer = null;
                a._a = null;
                a._html5_canplay = !1;
                a.bytesLoaded = null;
                a.bytesTotal = null;
                a.duration = a._iO && a._iO.duration ? a._iO.duration : null;
                a.durationEstimate = null;
                a.buffered = [];
                a.eqData = [];
                a.eqData.left = [];
                a.eqData.right = [];
                a.failures = 0;
                a.isBuffering = !1;
                a.instanceOptions = {};
                a.instanceCount = 0;
                a.loaded = !1;
                a.metadata = {};
                a.readyState = 0;
                a.muted = !1;
                a.paused = !1;
                a.peakData = {
                    left: 0,
                    right: 0
                };
                a.waveformData = {
                    left: [],
                    right: []
                };
                a.playState = 0;
                a.position = null;
                a.id3 = {}
            };
            f();
            this._onTimer = function (b) {
                var c, f = !1,
                    g = {};
                if (a._hasTimer || b) return a._a && (b || (0 < a.playState || 1 === a.readyState) && !a.paused) && (c = a._get_html5_duration(), c !== d && (d = c, a.duration = c, f = !0), a.durationEstimate = a.duration, c = 1E3 * a._a.currentTime || 0, c !== e && (e = c, f = !0), (f || b) && a._whileplaying(c, g, g, g, g)), f
            };
            this._get_html5_duration = function () {
                var b = a._iO;
                return (b = a._a && a._a.duration ? 1E3 * a._a.duration : b && b.duration ? b.duration : null) && !isNaN(b) && Infinity !== b ? b : null
            };
            this._apply_loop = function (a, b) {
                !a.loop && 1 < b && c._wD("Note: Native HTML5 looping is infinite.", 1);
                a.loop = 1 < b ? "loop" : ""
            };
            this._setup_html5 = function (b) {
                b = A(a._iO, b);
                var c = C ? Ya : a._a,
                    d = decodeURI(b.url),
                    e;
                C ? d === decodeURI(Ma) && (e = !0) : d === decodeURI(u) && (e = !0);
                if (c) {
                    if (c._s) if (C) c._s && c._s.playState && !e && c._s.stop();
                    else if (!C && d === decodeURI(u)) return a._apply_loop(c, b.loops), c;
                    e || (u && f(!1),
                    c.src = b.url, Ma = u = a.url = b.url, c._called_load = !1)
                } else b.autoLoad || b.autoPlay ? (a._a = new Audio(b.url), a._a.load()) : a._a = Sa && 10 > opera.version() ? new Audio(null) : new Audio, c = a._a, c._called_load = !1, C && (Ya = c);
                a.isHTML5 = !0;
                a._a = c;
                c._s = a;
                h();
                a._apply_loop(c, b.loops);
                b.autoLoad || b.autoPlay ? a.load() : (c.autobuffer = !1, c.preload = "auto");
                return c
            };
            h = function () {
                if (a._a._added_events) return !1;
                var b;
                a._a._added_events = !0;
                for (b in J) J.hasOwnProperty(b) && a._a && a._a.addEventListener(b, J[b], !1);
                return !0
            };
            k = function () {
                var b;
                c._wD(a.id + ": Removing event listeners");
                a._a._added_events = !1;
                for (b in J) J.hasOwnProperty(b) && a._a && a._a.removeEventListener(b, J[b], !1)
            };
            this._onload = function (b) {
                var d = !! b || !a.isHTML5 && 8 === n && a.duration;
                b = a.id + ": ";
                c._wD(b + (d ? "onload()" : "Failed to load / invalid sound?" + (a.duration ? " -" : " Zero-length duration reported.") + " (" + a.url + ")"), d ? 1 : 2);
                d || a.isHTML5 || (!0 === c.sandbox.noRemote && c._wD(b + t("noNet"), 1), !0 === c.sandbox.noLocal && c._wD(b + t("noLocal"), 1));
                a.loaded = d;
                a.readyState = d ? 3 : 2;
                a._onbufferchange(0);
                a._iO.onload && ua(a, function () {
                    a._iO.onload.apply(a, [d])
                });
                return !0
            };
            this._onbufferchange = function (b) {
                if (0 === a.playState || b && a.isBuffering || !b && !a.isBuffering) return !1;
                a.isBuffering = 1 === b;
                a._iO.onbufferchange && (c._wD(a.id + ": Buffer state change: " + b), a._iO.onbufferchange.apply(a, [b]));
                return !0
            };
            this._onsuspend = function () {
                a._iO.onsuspend && (c._wD(a.id + ": Playback suspended"), a._iO.onsuspend.apply(a));
                return !0
            };
            this._onfailure = function (b, d, e) {
                a.failures++;
                c._wD(a.id + ": Failure (" + a.failures + "): " + b);
                if (a._iO.onfailure && 1 === a.failures) a._iO.onfailure(b, d, e);
                else c._wD(a.id + ": Ignoring failure")
            };
            this._onwarning = function (b, c, d) {
                if (a._iO.onwarning) a._iO.onwarning(b, c, d)
            };
            this._onfinish = function () {
                var b = a._iO.onfinish;
                a._onbufferchange(0);
                a._resetOnPosition(0);
                a.instanceCount && (a.instanceCount--, a.instanceCount || (Xa(), a.playState = 0, a.paused = !1, a.instanceCount = 0, a.instanceOptions = {}, a._iO = {}, G(), a.isHTML5 && (a.position = 0)), a.instanceCount && !a._iO.multiShotEvents || !b || (c._wD(a.id + ": onfinish()"), ua(a,

                function () {
                    b.apply(a)
                })))
            };
            this._whileloading = function (b, c, d, e) {
                var f = a._iO;
                a.bytesLoaded = b;
                a.bytesTotal = c;
                a.duration = Math.floor(d);
                a.bufferLength = e;
                a.durationEstimate = a.isHTML5 || f.isMovieStar ? a.duration : f.duration ? a.duration > f.duration ? a.duration : f.duration : parseInt(a.bytesTotal / a.bytesLoaded * a.duration, 10);
                a.isHTML5 || (a.buffered = [{
                    start: 0,
                    end: a.duration
                }]);
                (3 !== a.readyState || a.isHTML5) && f.whileloading && f.whileloading.apply(a)
            };
            this._whileplaying = function (b, c, d, e, f) {
                var k = a._iO;
                if (isNaN(b) || null === b) return !1;
                a.position = Math.max(0, b);
                a._processOnPosition();
                !a.isHTML5 && 8 < n && (k.usePeakData && c !== g && c && (a.peakData = {
                    left: c.leftPeak,
                    right: c.rightPeak
                }), k.useWaveformData && d !== g && d && (a.waveformData = {
                    left: d.split(","),
                    right: e.split(",")
                }), k.useEQData && f !== g && f && f.leftEQ && (b = f.leftEQ.split(","), a.eqData = b, a.eqData.left = b, f.rightEQ !== g && f.rightEQ && (a.eqData.right = f.rightEQ.split(","))));
                1 === a.playState && (a.isHTML5 || 8 !== n || a.position || !a.isBuffering || a._onbufferchange(0), k.whileplaying && k.whileplaying.apply(a));
                return !0
            };
            this._oncaptiondata = function (b) {
                c._wD(a.id + ": Caption data received.");
                a.captiondata = b;
                a._iO.oncaptiondata && a._iO.oncaptiondata.apply(a, [b])
            };
            this._onmetadata = function (b, d) {
                c._wD(a.id + ": Metadata received.");
                var e = {}, f, g;
                f = 0;
                for (g = b.length; f < g; f++) e[b[f]] = d[f];
                a.metadata = e;
                a._iO.onmetadata && a._iO.onmetadata.call(a, a.metadata)
            };
            this._onid3 = function (b, d) {
                c._wD(a.id + ": ID3 data received.");
                var e = [],
                    f, g;
                f = 0;
                for (g = b.length; f < g; f++) e[b[f]] = d[f];
                a.id3 = A(a.id3, e);
                a._iO.onid3 && a._iO.onid3.apply(a)
            };
            this._onconnect = function (b) {
                b = 1 === b;
                c._wD(a.id + ": " + (b ? "Connected." : "Failed to connect? - " + a.url), b ? 1 : 2);
                if (a.connected = b) a.failures = 0, w(a.id) && (a.getAutoPlay() ? a.play(g, a.getAutoPlay()) : a._iO.autoLoad && a.load()), a._iO.onconnect && a._iO.onconnect.apply(a, [b])
            };
            this._ondataerror = function (b) {
                0 < a.playState && (c._wD(a.id + ": Data error: " + b), a._iO.ondataerror && a._iO.ondataerror.apply(a))
            };
            this._debug()
        };
        ma = function () {
            return m.body || m.getElementsByTagName("div")[0]
        };
        F = function (b) {
            return m.getElementById(b)
        };
        A = function (b, d) {
            var e = b || {}, a, f;
            a = d === g ? c.defaultOptions : d;
            for (f in a) a.hasOwnProperty(f) && e[f] === g && (e[f] = "object" !== typeof a[f] || null === a[f] ? a[f] : A(e[f], a[f]));
            return e
        };
        ua = function (b, c) {
            b.isHTML5 || 8 !== n ? c() : h.setTimeout(c, 0)
        };
        R = {
            onready: 1,
            ontimeout: 1,
            defaultOptions: 1,
            flash9Options: 1,
            movieStarOptions: 1
        };
        Ba = function (b, d) {
            var e, a = !0,
                f = d !== g,
                h = c.setupOptions;
            if (b === g) {
                a = [];
                for (e in h) h.hasOwnProperty(e) && a.push(e);
                for (e in R) R.hasOwnProperty(e) && ("object" === typeof c[e] ? a.push(e + ": {...}") : c[e] instanceof
                Function ? a.push(e + ": function() {...}") : a.push(e));
                c._wD(t("setup", a.join(", ")));
                return !1
            }
            for (e in b) if (b.hasOwnProperty(e)) if ("object" !== typeof b[e] || null === b[e] || b[e] instanceof Array || b[e] instanceof RegExp) f && R[d] !== g ? c[d][e] = b[e] : h[e] !== g ? (c.setupOptions[e] = b[e], c[e] = b[e]) : R[e] === g ? (L(t(c[e] === g ? "setupUndef" : "setupError", e), 2), a = !1) : c[e] instanceof Function ? c[e].apply(c, b[e] instanceof Array ? b[e] : [b[e]]) : c[e] = b[e];
            else if (R[e] === g) L(t(c[e] === g ? "setupUndef" : "setupError", e), 2), a = !1;
            else return Ba(b[e],
            e);
            return a
        };
        x = function () {
            function b(a) {
                a = kb.call(a);
                var b = a.length;
                e ? (a[1] = "on" + a[1], 3 < b && a.pop()) : 3 === b && a.push(!1);
                return a
            }
            function c(b, d) {
                var g = b.shift(),
                    h = [a[d]];
                if (e) g[h](b[0], b[1]);
                else g[h].apply(g, b)
            }
            var e = h.attachEvent,
                a = {
                    add: e ? "attachEvent" : "addEventListener",
                    remove: e ? "detachEvent" : "removeEventListener"
                };
            return {
                add: function () {
                    c(b(arguments), "add")
                },
                remove: function () {
                    c(b(arguments), "remove")
                }
            }
        }();
        J = {
            abort: r(function () {
                c._wD(this._s.id + ": abort")
            }),
            canplay: r(function () {
                var b = this._s,
                    d;
                if (b._html5_canplay) return !0;
                b._html5_canplay = !0;
                c._wD(b.id + ": canplay");
                b._onbufferchange(0);
                d = b._iO.position === g || isNaN(b._iO.position) ? null : b._iO.position / 1E3;
                if (this.currentTime !== d) {
                    c._wD(b.id + ": canplay: Setting position to " + d);
                    try {
                        this.currentTime = d
                    } catch (e) {
                        c._wD(b.id + ": canplay: Setting position of " + d + " failed: " + e.message, 2)
                    }
                }
                b._iO._oncanplay && b._iO._oncanplay()
            }),
            canplaythrough: r(function () {
                var b = this._s;
                b.loaded || (b._onbufferchange(0), b._whileloading(b.bytesLoaded, b.bytesTotal, b._get_html5_duration()), b._onload(!0))
            }),
            durationchange: r(function () {
                var b = this._s,
                    d;
                d = b._get_html5_duration();
                isNaN(d) || d === b.duration || (c._wD(this._s.id + ": durationchange (" + d + ")" + (b.duration ? ", previously " + b.duration : "")), b.durationEstimate = b.duration = d)
            }),
            ended: r(function () {
                var b = this._s;
                c._wD(b.id + ": ended");
                b._onfinish()
            }),
            error: r(function () {
                c._wD(this._s.id + ": HTML5 error, code " + this.error.code);
                this._s._onload(!1)
            }),
            loadeddata: r(function () {
                var b = this._s;
                c._wD(b.id + ": loadeddata");
                b._loaded || va || (b.duration = b._get_html5_duration())
            }),
            loadedmetadata: r(function () {
                c._wD(this._s.id + ": loadedmetadata")
            }),
            loadstart: r(function () {
                c._wD(this._s.id + ": loadstart");
                this._s._onbufferchange(1)
            }),
            play: r(function () {
                this._s._onbufferchange(0)
            }),
            playing: r(function () {
                c._wD(this._s.id + ": playing " + String.fromCharCode(9835));
                this._s._onbufferchange(0)
            }),
            progress: r(function (b) {
                var d = this._s,
                    e, a, f;
                e = 0;
                var g = "progress" === b.type,
                    k = b.target.buffered,
                    h = b.loaded || 0,
                    m = b.total || 1;
                d.buffered = [];
                if (k && k.length) {
                    e = 0;
                    for (a = k.length; e < a; e++) d.buffered.push({
                        start: 1E3 * k.start(e),
                        end: 1E3 * k.end(e)
                    });
                    e = 1E3 * (k.end(0) - k.start(0));
                    h = Math.min(1, e / (1E3 * b.target.duration));
                    if (g && 1 < k.length) {
                        f = [];
                        a = k.length;
                        for (e = 0; e < a; e++) f.push(1E3 * b.target.buffered.start(e) + "-" + 1E3 * b.target.buffered.end(e));
                        c._wD(this._s.id + ": progress, timeRanges: " + f.join(", "))
                    }
                    g && !isNaN(h) && c._wD(this._s.id + ": progress, " + Math.floor(100 * h) + "% loaded")
                }
                isNaN(h) || (d._whileloading(h, m, d._get_html5_duration()), h && m && h === m && J.canplaythrough.call(this, b))
            }),
            ratechange: r(function () {
                c._wD(this._s.id + ": ratechange")
            }),
            suspend: r(function (b) {
                var d = this._s;
                c._wD(this._s.id + ": suspend");
                J.progress.call(this, b);
                d._onsuspend()
            }),
            stalled: r(function () {
                c._wD(this._s.id + ": stalled")
            }),
            timeupdate: r(function () {
                this._s._onTimer()
            }),
            waiting: r(function () {
                var b = this._s;
                c._wD(this._s.id + ": waiting");
                b._onbufferchange(1)
            })
        };
        sa = function (b) {
            return b && (b.type || b.url || b.serverURL) ? b.serverURL || b.type && ha(b.type) ? !1 : b.type ? fa({
                type: b.type
            }) : fa({
                url: b.url
            }) || c.html5Only || b.url.match(/data\:/i) : !1
        };
        ta = function (b) {
            var d;
            b && (d = va ? "about:blank" : c.html5.canPlayType("audio/wav") ? "data:audio/wave;base64,/UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAD//w==" : "about:blank", b.src = d, b._called_unload !== g && (b._called_load = !1));
            C && (Ma = null);
            return d
        };
        fa = function (b) {
            if (!c.useHTML5Audio || !c.hasHTML5) return !1;
            var d = b.url || null;
            b = b.type || null;
            var e = c.audioFormats,
                a;
            if (b && c.html5[b] !== g) return c.html5[b] && !ha(b);
            if (!N) {
                N = [];
                for (a in e) e.hasOwnProperty(a) && (N.push(a), e[a].related && (N = N.concat(e[a].related)));
                N = new RegExp("\\.(" + N.join("|") +
                    ")(\\?.*)?$", "i")
            }(a = d ? d.toLowerCase().match(N) : null) && a.length ? a = a[1] : b && (d = b.indexOf(";"), a = (-1 !== d ? b.substr(0, d) : b).substr(6));
            a && c.html5[a] !== g ? d = c.html5[a] && !ha(a) : (b = "audio/" + a, d = c.html5.canPlayType({
                type: b
            }), d = (c.html5[a] = d) && c.html5[b] && !ha(b));
            return d
        };
        jb = function () {
            function b(a) {
                var b, e = b = !1;
                if (!d || "function" !== typeof d.canPlayType) return b;
                if (a instanceof Array) {
                    k = 0;
                    for (b = a.length; k < b; k++) if (c.html5[a[k]] || d.canPlayType(a[k]).match(c.html5Test)) e = !0, c.html5[a[k]] = !0, c.flash[a[k]] = !! a[k].match(pb);
                    b = e
                } else a = d && "function" === typeof d.canPlayType ? d.canPlayType(a) : !1, b = !(!a || !a.match(c.html5Test));
                return b
            }
            if (!c.useHTML5Audio || !c.hasHTML5) return u = c.html5.usingFlash = !0, !1;
            var d = Audio !== g ? Sa && 10 > opera.version() ? new Audio(null) : new Audio : null,
                e, a, f = {}, h, k;
            h = c.audioFormats;
            for (e in h) if (h.hasOwnProperty(e) && (a = "audio/" + e, f[e] = b(h[e].type), f[a] = f[e], e.match(pb) ? (c.flash[e] = !0, c.flash[a] = !0) : (c.flash[e] = !1, c.flash[a] = !1), h[e] && h[e].related)) for (k = h[e].related.length - 1; 0 <= k; k--) f["audio/" + h[e].related[k]] = f[e], c.html5[h[e].related[k]] = f[e], c.flash[h[e].related[k]] = f[e];
            f.canPlayType = d ? b : null;
            c.html5 = A(c.html5, f);
            c.html5.usingFlash = ib();
            u = c.html5.usingFlash;
            return !0
        };
        z = {
            notReady: "Unavailable - wait until onready() has fired.",
            notOK: "Audio support is not available.",
            domError: "soundManagerexception caught while appending SWF to DOM.",
            spcWmode: "Removing wmode, preventing known SWF loading issue(s)",
            swf404: "soundManager: Verify that %s is a valid path.",
            tryDebug: "Try soundManager.debugFlash = true for more security details (output goes to SWF.)",
            checkSWF: "See SWF output for more debug info.",
            localFail: "soundManager: Non-HTTP page (" + m.location.protocol + " URL?) Review Flash player security settings for this special case:\nhttp://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html\nMay need to add/allow path, eg. c:/sm2/ or /users/me/sm2/",
            waitFocus: "soundManager: Special case: Waiting for SWF to load with window focus...",
            waitForever: "soundManager: Waiting indefinitely for Flash (will recover if unblocked)...",
            waitSWF: "soundManager: Waiting for 100% SWF load...",
            needFunction: "soundManager: Function object expected for %s",
            badID: 'Sound ID "%s" should be a string, starting with a non-numeric character',
            currentObj: "soundManager: _debug(): Current sound objects",
            waitOnload: "soundManager: Waiting for window.onload()",
            docLoaded: "soundManager: Document already loaded",
            onload: "soundManager: initComplete(): calling soundManager.onload()",
            onloadOK: "soundManager.onload() complete",
            didInit: "soundManager: init(): Already called?",
            secNote: "Flash security note: Network/internet URLs will not load due to security restrictions. Access can be configured via Flash Player Global Security Settings Page: http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html",
            badRemove: "soundManager: Failed to remove Flash node.",
            shutdown: "soundManager.disable(): Shutting down",
            queue: "soundManager: Queueing %s handler",
            smError: "SMSound.load(): Exception: JS-Flash communication failed, or JS error.",
            fbTimeout: "No flash response, applying .swf_timedout CSS...",
            fbLoaded: "Flash loaded",
            fbHandler: "soundManager: flashBlockHandler()",
            manURL: "SMSound.load(): Using manually-assigned URL",
            onURL: "soundManager.load(): current URL already assigned.",
            badFV: 'soundManager.flashVersion must be 8 or 9. "%s" is invalid. Reverting to %s.',
            as2loop: "Note: Setting stream:false so looping can work (flash 8 limitation)",
            noNSLoop: "Note: Looping not implemented for MovieStar formats",
            needfl9: "Note: Switching to flash 9, required for MP4 formats.",
            mfTimeout: "Setting flashLoadTimeout = 0 (infinite) for off-screen, mobile flash case",
            needFlash: "soundManager: Fatal error: Flash is needed to play some required formats, but is not available.",
            gotFocus: "soundManager: Got window focus.",
            policy: "Enabling usePolicyFile for data access",
            setup: "soundManager.setup(): allowed parameters: %s",
            setupError: 'soundManager.setup(): "%s" cannot be assigned with this method.',
            setupUndef: 'soundManager.setup(): Could not find option "%s"',
            setupLate: "soundManager.setup(): url, flashVersion and html5Test property changes will not take effect until reboot().",
            noURL: "soundManager: Flash URL required. Call soundManager.setup({url:...}) to get started.",
            sm2Loaded: "SoundManager 2: Ready. " + String.fromCharCode(10003),
            reset: "soundManager.reset(): Removing event callbacks",
            mobileUA: "Mobile UA detected, preferring HTML5 by default.",
            globalHTML5: "Using singleton HTML5 Audio() pattern for this device.",
            ignoreMobile: "Ignoring mobile restrictions for this device."
        };
        t = function () {
            var b, c, e, a;
            b = kb.call(arguments);
            c = b.shift();
            if ((a = z && z[c] ? z[c] : "") && b && b.length) for (c = 0, e = b.length; c < e; c++) a = a.replace("%s", b[c]);
            return a
        };
        oa = function (b) {
            8 === n && 1 < b.loops && b.stream && (p("as2loop"), b.stream = !1);
            return b
        };
        pa = function (b, d) {
            b && !b.usePolicyFile && (b.onid3 || b.usePeakData || b.useWaveformData || b.useEQData) && (c._wD((d || "") + t("policy")), b.usePolicyFile = !0);
            return b
        };
        L = function (b) {
            Ua && console.warn !== g ? console.warn(b) : c._wD(b)
        };
        ya = function () {
            return !1
        };
        cb = function (b) {
            for (var c in b) b.hasOwnProperty(c) && "function" === typeof b[c] && (b[c] = ya)
        };
        Ha = function (b) {
            b === g && (b = !1);
            (y || b) && c.disable(b)
        };
        db = function (b) {
            var d = null;
            if (b) if (b.match(/\.swf(\?.*)?$/i)) {
                if (d = b.substr(b.toLowerCase().lastIndexOf(".swf?") + 4)) return b
            } else b.lastIndexOf("/") !== b.length - 1 && (b += "/");
            b = (b && -1 !== b.lastIndexOf("/") ? b.substr(0, b.lastIndexOf("/") + 1) : "./") + c.movieURL;
            c.noSWFCache && (b += "?ts=" + (new Date).getTime());
            return b
        };
        Ea = function () {
            n = parseInt(c.flashVersion, 10);
            8 !== n && 9 !== n && (c._wD(t("badFV", n, 8)), c.flashVersion = n = 8);
            var b = c.debugMode || c.debugFlash ? "_debug.swf" : ".swf";
            c.useHTML5Audio && !c.html5Only && c.audioFormats.mp4.required && 9 > n && (c._wD(t("needfl9")), c.flashVersion = n = 9);
            c.version = c.versionNumber + (c.html5Only ? " (HTML5-only mode)" : 9 === n ? " (AS3/Flash 9)" : " (AS2/Flash 8)");
            8 < n ? (c.defaultOptions = A(c.defaultOptions, c.flash9Options), c.features.buffering = !0, c.defaultOptions = A(c.defaultOptions, c.movieStarOptions), c.filePatterns.flash9 = new RegExp("\\.(mp3|" + rb.join("|") + ")(\\?.*)?$", "i"), c.features.movieStar = !0) : c.features.movieStar = !1;
            c.filePattern = c.filePatterns[8 !== n ? "flash9" : "flash8"];
            c.movieURL = (8 === n ? "soundmanager2.swf" :
                "soundmanager2_flash9.swf").replace(".swf", b);
            c.features.peakData = c.features.waveformData = c.features.eqData = 8 < n
        };
        ab = function (b, c) {
            if (!l) return !1;
            l._setPolling(b, c)
        };
        Ga = function () {
            c.debugURLParam.test(ia) && (c.setupOptions.debugMode = c.debugMode = !0);
            if (F(c.debugID)) return !1;
            var b, d, e, a;
            if (!(!c.debugMode || F(c.debugID) || Ua && c.useConsole && c.consoleOnly)) {
                b = m.createElement("div");
                b.id = c.debugID + "-toggle";
                d = {
                    position: "fixed",
                    bottom: "0px",
                    right: "0px",
                    width: "1.2em",
                    height: "1.2em",
                    lineHeight: "1.2em",
                    margin: "2px",
                    textAlign: "center",
                    border: "1px solid #999",
                    cursor: "pointer",
                    background: "#fff",
                    color: "#333",
                    zIndex: 10001
                };
                b.appendChild(m.createTextNode("-"));
                b.onclick = eb;
                b.title = "Toggle SM2 debug console";
                v.match(/msie 6/i) && (b.style.position = "absolute", b.style.cursor = "hand");
                for (a in d) d.hasOwnProperty(a) && (b.style[a] = d[a]);
                d = m.createElement("div");
                d.id = c.debugID;
                d.style.display = c.debugMode ? "block" : "none";
                if (c.debugMode && !F(b.id)) {
                    try {
                        e = ma(), e.appendChild(b)
                    } catch (f) {
                        throw Error(t("domError") + " \n" + f.toString());
                    }
                    e.appendChild(d)
                }
            }
        };
        w = this.getSoundById;
        p = function (b, d) {
            return b ? c._wD(t(b), d) : ""
        };
        eb = function () {
            var b = F(c.debugID),
                d = F(c.debugID + "-toggle");
            if (!b) return !1;
            Aa ? (d.innerHTML = "+", b.style.display = "none") : (d.innerHTML = "-", b.style.display = "block");
            Aa = !Aa
        };
        D = function (b, c, e) {
            if (h.sm2Debugger !== g) try {
                sm2Debugger.handleEvent(b, c, e)
            } catch (a) {
                return !1
            }
            return !0
        };
        V = function () {
            var b = [];
            c.debugMode && b.push("sm2_debug");
            c.debugFlash && b.push("flash_debug");
            c.useHighPerformance && b.push("high_performance");
            return b.join(" ")
        };
        Ja = function () {
            var b = t("fbHandler"),
                d = c.getMoviePercent(),
                e = {
                    type: "FLASHBLOCK"
                };
            if (c.html5Only) return !1;
            c.ok() ? (c.didFlashBlock && c._wD(b + ": Unblocked"), c.oMC && (c.oMC.className = [V(), "movieContainer", "swf_loaded" + (c.didFlashBlock ? " swf_unblocked" : "")].join(" "))) : (u && (c.oMC.className = V() + " movieContainer " + (null === d ? "swf_timedout" : "swf_error"), c._wD(b + ": " + t("fbTimeout") + (d ? " (" + t("fbLoaded") + ")" : ""))), c.didFlashBlock = !0, P({
                type: "ontimeout",
                ignoreInit: !0,
                error: e
            }), U(e))
        };
        Ca = function (b, c, e) {
            I[b] === g && (I[b] = []);
            I[b].push({
                method: c,
                scope: e || null,
                fired: !1
            })
        };
        P = function (b) {
            b || (b = {
                type: c.ok() ? "onready" : "ontimeout"
            });
            if (!q && b && !b.ignoreInit || "ontimeout" === b.type && (c.ok() || y && !b.ignoreInit)) return !1;
            var d = {
                success: b && b.ignoreInit ? c.ok() : !y
            }, e = b && b.type ? I[b.type] || [] : [],
                a = [],
                f, d = [d],
                g = u && !c.ok();
            b.error && (d[0].error = b.error);
            b = 0;
            for (f = e.length; b < f; b++)!0 !== e[b].fired && a.push(e[b]);
            if (a.length) for (b = 0, f = a.length; b < f; b++) a[b].scope ? a[b].method.apply(a[b].scope, d) : a[b].method.apply(this, d), g || (a[b].fired = !0);
            return !0
        };
        S = function () {
            h.setTimeout(function () {
                c.useFlashBlock && Ja();
                P();
                "function" === typeof c.onload && (p("onload", 1), c.onload.apply(h), p("onloadOK", 1));
                c.waitForWindowLoad && x.add(h, "load", S)
            }, 1)
        };
        Na = function () {
            if (H !== g) return H;
            var b = !1,
                c = navigator,
                e = c.plugins,
                a, f = h.ActiveXObject;
            if (e && e.length)(c = c.mimeTypes) && c["application/x-shockwave-flash"] && c["application/x-shockwave-flash"].enabledPlugin && c["application/x-shockwave-flash"].enabledPlugin.description && (b = !0);
            else if (f !== g && !v.match(/MSAppHost/i)) {
                try {
                    a = new f("ShockwaveFlash.ShockwaveFlash")
                } catch (m) {
                    a = null
                }
                b = !! a
            }
            return H = b
        };
        ib = function () {
            var b, d, e = c.audioFormats;
            Qa && v.match(/os (1|2|3_0|3_1)\s/i) ? (c.hasHTML5 = !1, c.html5Only = !0, c.oMC && (c.oMC.style.display = "none")) : c.useHTML5Audio && (c.html5 && c.html5.canPlayType || (c._wD("SoundManager: No HTML5 Audio() support detected."), c.hasHTML5 = !1), Ta && c._wD("soundManager: Note: Buggy HTML5 Audio in Safari on this OS X release, see https://bugs.webkit.org/show_bug.cgi?id=32159 - " + (H ? "will use flash fallback for MP3/MP4, if available" :
                " would use flash fallback for MP3/MP4, but none detected."), 1));
            if (c.useHTML5Audio && c.hasHTML5) for (d in ea = !0, e) e.hasOwnProperty(d) && e[d].required && (c.html5.canPlayType(e[d].type) ? c.preferFlash && (c.flash[d] || c.flash[e[d].type]) && (b = !0) : (ea = !1, b = !0));
            c.ignoreFlash && (b = !1, ea = !0);
            c.html5Only = c.hasHTML5 && c.useHTML5Audio && !b;
            return !c.html5Only
        };
        ra = function (b) {
            var d, e, a = 0;
            if (b instanceof Array) {
                d = 0;
                for (e = b.length; d < e; d++) if (b[d] instanceof Object) {
                    if (c.canPlayMIME(b[d].type)) {
                        a = d;
                        break
                    }
                } else if (c.canPlayURL(b[d])) {
                    a = d;
                    break
                }
                b[a].url && (b[a] = b[a].url);
                b = b[a]
            }
            return b
        };
        fb = function (b) {
            b._hasTimer || (b._hasTimer = !0, !wa && c.html5PollingInterval && (null === da && 0 === qa && (da = setInterval(hb, c.html5PollingInterval)), qa++))
        };
        gb = function (b) {
            b._hasTimer && (b._hasTimer = !1, !wa && c.html5PollingInterval && qa--)
        };
        hb = function () {
            var b;
            if (null !== da && !qa) return clearInterval(da), da = null, !1;
            for (b = c.soundIDs.length - 1; 0 <= b; b--) c.sounds[c.soundIDs[b]].isHTML5 && c.sounds[c.soundIDs[b]]._hasTimer && c.sounds[c.soundIDs[b]]._onTimer()
        };
        U = function (b) {
            b = b !== g ? b : {};
            "function" === typeof c.onerror && c.onerror.apply(h, [{
                type: b.type !== g ? b.type : null
            }]);
            b.fatal !== g && b.fatal && c.disable()
        };
        lb = function () {
            if (!Ta || !Na()) return !1;
            var b = c.audioFormats,
                d, e;
            for (e in b) if (b.hasOwnProperty(e) && ("mp3" === e || "mp4" === e) && (c._wD("soundManager: Using flash fallback for " + e + " format"), c.html5[e] = !1, b[e] && b[e].related)) for (d = b[e].related.length - 1; 0 <= d; d--) c.html5[b[e].related[d]] = !1
        };
        this._setSandboxType = function (b) {
            var d = c.sandbox;
            d.type = b;
            d.description = d.types[d.types[b] !== g ? b : "unknown"];
            "localWithFile" === d.type ? (d.noRemote = !0, d.noLocal = !1, p("secNote", 2)) : "localWithNetwork" === d.type ? (d.noRemote = !1, d.noLocal = !0) : "localTrusted" === d.type && (d.noRemote = !1, d.noLocal = !1)
        };
        this._externalInterfaceOK = function (b) {
            if (c.swfLoaded) return !1;
            var d;
            D("swf", !0);
            D("flashtojs", !0);
            c.swfLoaded = !0;
            xa = !1;
            Ta && lb();
            if (!b || b.replace(/\+dev/i, "") !== c.versionNumber.replace(/\+dev/i, "")) return d = 'soundManager: Fatal: JavaScript file build "' + c.versionNumber + '" does not match Flash SWF build "' + b + '" at ' + c.url + ". Ensure both are up-to-date.", setTimeout(function () {
                throw Error(d);
            }, 0), !1;
            setTimeout(za, O ? 100 : 1)
        };
        na = function (b, d) {
            function e() {
                var a = [],
                    b, d = [];
                b = "SoundManager " + c.version + (!c.html5Only && c.useHTML5Audio ? c.hasHTML5 ? " + HTML5 audio" : ", no HTML5 audio support" : "");
                c.html5Only ? c.html5PollingInterval && a.push("html5PollingInterval (" + c.html5PollingInterval + "ms)") : (c.preferFlash && a.push("preferFlash"), c.useHighPerformance && a.push("useHighPerformance"), c.flashPollingInterval && a.push("flashPollingInterval (" + c.flashPollingInterval + "ms)"), c.html5PollingInterval && a.push("html5PollingInterval (" + c.html5PollingInterval + "ms)"), c.wmode && a.push("wmode (" + c.wmode + ")"), c.debugFlash && a.push("debugFlash"), c.useFlashBlock && a.push("flashBlock"));
                a.length && (d = d.concat([a.join(" + ")]));
                c._wD(b + (d.length ? " + " + d.join(", ") : ""), 1);
                mb()
            }
            function a(a, b) {
                return '<param name="' + a + '" value="' + b + '" />'
            }
            if (X && Y) return !1;
            if (c.html5Only) return Ea(), e(), c.oMC = F(c.movieID), za(), Y = X = !0, !1;
            var f = d || c.url,
                h = c.altURL || f,
                k = ma(),
                l = V(),
                n = null,
                n = m.getElementsByTagName("html")[0],
                p, r, q, n = n && n.dir && n.dir.match(/rtl/i);
            b = b === g ? c.id : b;
            Ea();
            c.url = db(ga ? f : h);
            d = c.url;
            c.wmode = !c.wmode && c.useHighPerformance ? "transparent" : c.wmode;
            null !== c.wmode && (v.match(/msie 8/i) || !O && !c.useHighPerformance) && navigator.platform.match(/win32|win64/i) && (M.push(z.spcWmode), c.wmode = null);
            k = {
                name: b,
                id: b,
                src: d,
                quality: "high",
                allowScriptAccess: c.allowScriptAccess,
                bgcolor: c.bgColor,
                pluginspage: vb + "www.macromedia.com/go/getflashplayer",
                title: "JS/Flash audio component (SoundManager 2)",
                type: "application/x-shockwave-flash",
                wmode: c.wmode,
                hasPriority: "true"
            };
            c.debugFlash && (k.FlashVars = "debug=1");
            c.wmode || delete k.wmode;
            if (O) f = m.createElement("div"), r = ['<object id="' + b + '" data="' + d + '" type="' + k.type + '" title="' + k.title + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">', a("movie", d), a("AllowScriptAccess", c.allowScriptAccess), a("quality", k.quality), c.wmode ? a("wmode", c.wmode) : "", a("bgcolor",
            c.bgColor), a("hasPriority", "true"), c.debugFlash ? a("FlashVars", k.FlashVars) : "", "</object>"].join("");
            else for (p in f = m.createElement("embed"), k) k.hasOwnProperty(p) && f.setAttribute(p, k[p]);
            Ga();
            l = V();
            if (k = ma()) if (c.oMC = F(c.movieID) || m.createElement("div"), c.oMC.id) q = c.oMC.className, c.oMC.className = (q ? q + " " : "movieContainer") + (l ? " " + l : ""), c.oMC.appendChild(f), O && (p = c.oMC.appendChild(m.createElement("div")), p.className = "sm2-object-box", p.innerHTML = r), Y = !0;
            else {
                c.oMC.id = c.movieID;
                c.oMC.className = "movieContainer " + l;
                p = l = null;
                c.useFlashBlock || (c.useHighPerformance ? l = {
                    position: "fixed",
                    width: "8px",
                    height: "8px",
                    bottom: "0px",
                    left: "0px",
                    overflow: "hidden"
                } : (l = {
                    position: "absolute",
                    width: "6px",
                    height: "6px",
                    top: "-9999px",
                    left: "-9999px"
                }, n && (l.left = Math.abs(parseInt(l.left, 10)) + "px")));
                ub && (c.oMC.style.zIndex = 1E4);
                if (!c.debugFlash) for (q in l) l.hasOwnProperty(q) && (c.oMC.style[q] = l[q]);
                try {
                    O || c.oMC.appendChild(f), k.appendChild(c.oMC), O && (p = c.oMC.appendChild(m.createElement("div")), p.className = "sm2-object-box", p.innerHTML = r), Y = !0
                } catch (u) {
                    throw Error(t("domError") + " \n" + u.toString());
                }
            }
            X = !0;
            e();
            return !0
        };
        la = function () {
            if (c.html5Only) return na(), !1;
            if (l) return !1;
            if (!c.url) return p("noURL"), !1;
            l = c.getMovie(c.id);
            l || (ba ? (O ? c.oMC.innerHTML = Ia : c.oMC.appendChild(ba), ba = null, X = !0) : na(c.id, c.url), l = c.getMovie(c.id));
            "function" === typeof c.oninitmovie && setTimeout(c.oninitmovie, 1);
            Oa();
            return !0
        };
        T = function () {
            setTimeout($a, 1E3)
        };
        Da = function () {
            h.setTimeout(function () {
                L("soundManager: useFlashBlock is false, 100% HTML5 mode is possible. Rebooting with preferFlash: false...");
                c.setup({
                    preferFlash: !1
                }).reboot();
                c.didFlashBlock = !0;
                c.beginDelayedInit()
            }, 1)
        };
        $a = function () {
            var b, d = !1;
            if (!c.url || ca) return !1;
            ca = !0;
            x.remove(h, "load", T);
            if (H && xa && !Va) return p("waitFocus"), !1;
            q || (b = c.getMoviePercent(), 0 < b && 100 > b && (d = !0));
            setTimeout(function () {
                b = c.getMoviePercent();
                if (d) return ca = !1, c._wD(t("waitSWF")), h.setTimeout(T, 1), !1;
                q || (c._wD("soundManager: No Flash response within expected time. Likely causes: " + (0 === b ? "SWF load failed, " : "") + "Flash blocked or JS-Flash security error." + (c.debugFlash ?
                    " " + t("checkSWF") : ""), 2), !ga && b && (p("localFail", 2), c.debugFlash || p("tryDebug", 2)), 0 === b && c._wD(t("swf404", c.url), 1), D("flashtojs", !1, ": Timed out" + (ga ? " (Check flash security or flash blockers)" : " (No plugin/missing SWF?)")));
                !q && ob && (null === b ? c.useFlashBlock || 0 === c.flashLoadTimeout ? (c.useFlashBlock && Ja(), p("waitForever")) : !c.useFlashBlock && ea ? Da() : (p("waitForever"), P({
                    type: "ontimeout",
                    ignoreInit: !0,
                    error: {
                        type: "INIT_FLASHBLOCK"
                    }
                })) : 0 === c.flashLoadTimeout ? p("waitForever") : !c.useFlashBlock && ea ? Da() : Ha(!0))
            }, c.flashLoadTimeout)
        };
        ka = function () {
            if (Va || !xa) return x.remove(h, "focus", ka), !0;
            Va = ob = !0;
            p("gotFocus");
            ca = !1;
            T();
            x.remove(h, "focus", ka);
            return !0
        };
        Oa = function () {
            M.length && (c._wD("SoundManager 2: " + M.join(" "), 1), M = [])
        };
        mb = function () {
            Oa();
            var b, d = [];
            if (c.useHTML5Audio && c.hasHTML5) {
                for (b in c.audioFormats) c.audioFormats.hasOwnProperty(b) && d.push(b + " = " + c.html5[b] + (!c.html5[b] && u && c.flash[b] ? " (using flash)" : c.preferFlash && c.flash[b] && u ? " (preferring flash)" : c.html5[b] ? "" : " (" + (c.audioFormats[b].required ?
                    "required, " : "") + "and no flash support)"));
                c._wD("SoundManager 2 HTML5 support: " + d.join(", "), 1)
            }
        };
        Z = function (b) {
            if (q) return !1;
            if (c.html5Only) return p("sm2Loaded", 1), q = !0, S(), D("onload", !0), !0;
            var d = !0,
                e;
            c.useFlashBlock && c.flashLoadTimeout && !c.getMoviePercent() || (q = !0);
            e = {
                type: !H && u ? "NO_FLASH" : "INIT_TIMEOUT"
            };
            c._wD("SoundManager 2 " + (y ? "failed to load" : "loaded") + " (" + (y ? "Flash security/load error" : "OK") + ") " + String.fromCharCode(y ? 10006 : 10003), y ? 2 : 1);
            y || b ? (c.useFlashBlock && c.oMC && (c.oMC.className = V() + " " + (null === c.getMoviePercent() ? "swf_timedout" : "swf_error")), P({
                type: "ontimeout",
                error: e,
                ignoreInit: !0
            }), D("onload", !1), U(e), d = !1) : D("onload", !0);
            y || (c.waitForWindowLoad && !ja ? (p("waitOnload"), x.add(h, "load", S)) : (c.waitForWindowLoad && ja && p("docLoaded"), S()));
            return d
        };
        Za = function () {
            var b, d = c.setupOptions;
            for (b in d) d.hasOwnProperty(b) && (c[b] === g ? c[b] = d[b] : c[b] !== d[b] && (c.setupOptions[b] = c[b]))
        };
        za = function () {
            if (q) return p("didInit"), !1;
            if (c.html5Only) return q || (x.remove(h, "load", c.beginDelayedInit),
            c.enabled = !0, Z()), !0;
            la();
            try {
                l._externalInterfaceTest(!1), ab(!0, c.flashPollingInterval || (c.useHighPerformance ? 10 : 50)), c.debugMode || l._disableDebug(), c.enabled = !0, D("jstoflash", !0), c.html5Only || x.add(h, "unload", ya)
            } catch (b) {
                return c._wD("js/flash exception: " + b.toString()), D("jstoflash", !1), U({
                    type: "JS_TO_FLASH_EXCEPTION",
                    fatal: !0
                }), Ha(!0), Z(), !1
            }
            Z();
            x.remove(h, "load", c.beginDelayedInit);
            return !0
        };
        Q = function () {
            if (aa) return !1;
            aa = !0;
            Za();
            Ga();
            !H && c.hasHTML5 && (c._wD("SoundManager 2: No Flash detected" + (c.useHTML5Audio ? ". Trying HTML5-only mode." : ", enabling HTML5."), 1), c.setup({
                useHTML5Audio: !0,
                preferFlash: !1
            }));
            jb();
            !H && u && (M.push(z.needFlash), c.setup({
                flashLoadTimeout: 1
            }));
            m.removeEventListener && m.removeEventListener("DOMContentLoaded", Q, !1);
            la();
            return !0
        };
        La = function () {
            "complete" === m.readyState && (Q(), m.detachEvent("onreadystatechange", La));
            return !0
        };
        Fa = function () {
            ja = !0;
            Q();
            x.remove(h, "load", Fa)
        };
        Na();
        x.add(h, "focus", ka);
        x.add(h, "load", T);
        x.add(h, "load", Fa);
        m.addEventListener ? m.addEventListener("DOMContentLoaded",
        Q, !1) : m.attachEvent ? m.attachEvent("onreadystatechange", La) : (D("onload", !1), U({
            type: "NO_DOM2_EVENTS",
            fatal: !0
        }))
    }
    if (!h || !h.document) throw Error("SoundManager requires a browser with window and document objects.");
    var W = null;
    h.SM2_DEFER !== g && SM2_DEFER || (W = new K);
    "object" === typeof module && module && "object" === typeof module.exports ? (module.exports.SoundManager = K, module.exports.soundManager = W) : "function" === typeof define && define.amd && define(function () {
        return {
            constructor: K,
            getInstance: function (g) {
                !h.soundManager && g instanceof Function && (g = g(K), g instanceof K && (h.soundManager = g));
                return h.soundManager
            }
        }
    });
    h.SoundManager = K;
    h.soundManager = W
})(window);