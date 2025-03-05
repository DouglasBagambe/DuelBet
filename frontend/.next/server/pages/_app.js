/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./components/common/Layout.tsx":
/*!**************************************!*\
  !*** ./components/common/Layout.tsx ***!
  \**************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _solana_wallet_adapter_react_ui__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @solana/wallet-adapter-react-ui */ \"@solana/wallet-adapter-react-ui\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/router */ \"../node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_3__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_solana_wallet_adapter_react_ui__WEBPACK_IMPORTED_MODULE_2__]);\n_solana_wallet_adapter_react_ui__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n// frontend/components/common/Layout.tsx\n\n\n\n\nconst Layout = ({ children })=>{\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter)();\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"min-h-screen bg-gradient-to-br from-gray-900 to-blue-900\",\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"nav\", {\n                className: \"border-b border-blue-500/30 backdrop-blur-sm\",\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"container mx-auto px-4 py-4\",\n                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"flex justify-between items-center\",\n                        children: [\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                className: \"flex items-center space-x-8\",\n                                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h1\", {\n                                    onClick: ()=>router.push(\"/\"),\n                                    className: \"text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent cursor-pointer\",\n                                    children: \"DuelBet\"\n                                }, void 0, false, {\n                                    fileName: \"/home/db/Projects/DuelBet/frontend/components/common/Layout.tsx\",\n                                    lineNumber: 20,\n                                    columnNumber: 15\n                                }, undefined)\n                            }, void 0, false, {\n                                fileName: \"/home/db/Projects/DuelBet/frontend/components/common/Layout.tsx\",\n                                lineNumber: 19,\n                                columnNumber: 13\n                            }, undefined),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_solana_wallet_adapter_react_ui__WEBPACK_IMPORTED_MODULE_2__.WalletMultiButton, {}, void 0, false, {\n                                fileName: \"/home/db/Projects/DuelBet/frontend/components/common/Layout.tsx\",\n                                lineNumber: 27,\n                                columnNumber: 13\n                            }, undefined)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"/home/db/Projects/DuelBet/frontend/components/common/Layout.tsx\",\n                        lineNumber: 18,\n                        columnNumber: 11\n                    }, undefined)\n                }, void 0, false, {\n                    fileName: \"/home/db/Projects/DuelBet/frontend/components/common/Layout.tsx\",\n                    lineNumber: 17,\n                    columnNumber: 9\n                }, undefined)\n            }, void 0, false, {\n                fileName: \"/home/db/Projects/DuelBet/frontend/components/common/Layout.tsx\",\n                lineNumber: 16,\n                columnNumber: 7\n            }, undefined),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"main\", {\n                className: \"container mx-auto px-4 py-8\",\n                children: children\n            }, void 0, false, {\n                fileName: \"/home/db/Projects/DuelBet/frontend/components/common/Layout.tsx\",\n                lineNumber: 32,\n                columnNumber: 7\n            }, undefined),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"footer\", {\n                className: \"border-t border-blue-500/30 backdrop-blur-sm\",\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"container mx-auto px-4 py-6\",\n                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"text-center text-gray-400\",\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                            children: [\n                                \"\\xa9 \",\n                                new Date().getFullYear(),\n                                \" DuelBet. All rights reserved.\"\n                            ]\n                        }, void 0, true, {\n                            fileName: \"/home/db/Projects/DuelBet/frontend/components/common/Layout.tsx\",\n                            lineNumber: 37,\n                            columnNumber: 13\n                        }, undefined)\n                    }, void 0, false, {\n                        fileName: \"/home/db/Projects/DuelBet/frontend/components/common/Layout.tsx\",\n                        lineNumber: 36,\n                        columnNumber: 11\n                    }, undefined)\n                }, void 0, false, {\n                    fileName: \"/home/db/Projects/DuelBet/frontend/components/common/Layout.tsx\",\n                    lineNumber: 35,\n                    columnNumber: 9\n                }, undefined)\n            }, void 0, false, {\n                fileName: \"/home/db/Projects/DuelBet/frontend/components/common/Layout.tsx\",\n                lineNumber: 34,\n                columnNumber: 7\n            }, undefined)\n        ]\n    }, void 0, true, {\n        fileName: \"/home/db/Projects/DuelBet/frontend/components/common/Layout.tsx\",\n        lineNumber: 15,\n        columnNumber: 5\n    }, undefined);\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Layout);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9jb21wb25lbnRzL2NvbW1vbi9MYXlvdXQudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsd0NBQXdDOztBQUVkO0FBQzBDO0FBQzVCO0FBTXhDLE1BQU1HLFNBQWdDLENBQUMsRUFBRUMsUUFBUSxFQUFFO0lBQ2pELE1BQU1DLFNBQVNILHNEQUFTQTtJQUV4QixxQkFDRSw4REFBQ0k7UUFBSUMsV0FBVTs7MEJBQ2IsOERBQUNDO2dCQUFJRCxXQUFVOzBCQUNiLDRFQUFDRDtvQkFBSUMsV0FBVTs4QkFDYiw0RUFBQ0Q7d0JBQUlDLFdBQVU7OzBDQUNiLDhEQUFDRDtnQ0FBSUMsV0FBVTswQ0FDYiw0RUFBQ0U7b0NBQ0NDLFNBQVMsSUFBTUwsT0FBT00sSUFBSSxDQUFDO29DQUMzQkosV0FBVTs4Q0FDWDs7Ozs7Ozs7Ozs7MENBSUgsOERBQUNOLDhFQUFpQkE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzswQkFLeEIsOERBQUNXO2dCQUFLTCxXQUFVOzBCQUErQkg7Ozs7OzswQkFFL0MsOERBQUNTO2dCQUFPTixXQUFVOzBCQUNoQiw0RUFBQ0Q7b0JBQUlDLFdBQVU7OEJBQ2IsNEVBQUNEO3dCQUFJQyxXQUFVO2tDQUNiLDRFQUFDTzs7Z0NBQUU7Z0NBQ08sSUFBSUMsT0FBT0MsV0FBVztnQ0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU8vQztBQUVBLGlFQUFlYixNQUFNQSxFQUFDIiwic291cmNlcyI6WyIvaG9tZS9kYi9Qcm9qZWN0cy9EdWVsQmV0L2Zyb250ZW5kL2NvbXBvbmVudHMvY29tbW9uL0xheW91dC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLy8gZnJvbnRlbmQvY29tcG9uZW50cy9jb21tb24vTGF5b3V0LnRzeFxuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBXYWxsZXRNdWx0aUJ1dHRvbiB9IGZyb20gXCJAc29sYW5hL3dhbGxldC1hZGFwdGVyLXJlYWN0LXVpXCI7XG5pbXBvcnQgeyB1c2VSb3V0ZXIgfSBmcm9tIFwibmV4dC9yb3V0ZXJcIjtcblxuaW50ZXJmYWNlIExheW91dFByb3BzIHtcbiAgY2hpbGRyZW46IFJlYWN0LlJlYWN0Tm9kZTtcbn1cblxuY29uc3QgTGF5b3V0OiBSZWFjdC5GQzxMYXlvdXRQcm9wcz4gPSAoeyBjaGlsZHJlbiB9KSA9PiB7XG4gIGNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpO1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJtaW4taC1zY3JlZW4gYmctZ3JhZGllbnQtdG8tYnIgZnJvbS1ncmF5LTkwMCB0by1ibHVlLTkwMFwiPlxuICAgICAgPG5hdiBjbGFzc05hbWU9XCJib3JkZXItYiBib3JkZXItYmx1ZS01MDAvMzAgYmFja2Ryb3AtYmx1ci1zbVwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRhaW5lciBteC1hdXRvIHB4LTQgcHktNFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtY2VudGVyXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIHNwYWNlLXgtOFwiPlxuICAgICAgICAgICAgICA8aDFcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiByb3V0ZXIucHVzaChcIi9cIil9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidGV4dC0yeGwgZm9udC1ib2xkIGJnLWdyYWRpZW50LXRvLXIgZnJvbS1ibHVlLTQwMCB0by1wdXJwbGUtNTAwIGJnLWNsaXAtdGV4dCB0ZXh0LXRyYW5zcGFyZW50IGN1cnNvci1wb2ludGVyXCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIER1ZWxCZXRcbiAgICAgICAgICAgICAgPC9oMT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPFdhbGxldE11bHRpQnV0dG9uIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9uYXY+XG5cbiAgICAgIDxtYWluIGNsYXNzTmFtZT1cImNvbnRhaW5lciBteC1hdXRvIHB4LTQgcHktOFwiPntjaGlsZHJlbn08L21haW4+XG5cbiAgICAgIDxmb290ZXIgY2xhc3NOYW1lPVwiYm9yZGVyLXQgYm9yZGVyLWJsdWUtNTAwLzMwIGJhY2tkcm9wLWJsdXItc21cIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXIgbXgtYXV0byBweC00IHB5LTZcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtY2VudGVyIHRleHQtZ3JheS00MDBcIj5cbiAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAmY29weTsge25ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKX0gRHVlbEJldC4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Zvb3Rlcj5cbiAgICA8L2Rpdj5cbiAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IExheW91dDtcbiJdLCJuYW1lcyI6WyJSZWFjdCIsIldhbGxldE11bHRpQnV0dG9uIiwidXNlUm91dGVyIiwiTGF5b3V0IiwiY2hpbGRyZW4iLCJyb3V0ZXIiLCJkaXYiLCJjbGFzc05hbWUiLCJuYXYiLCJoMSIsIm9uQ2xpY2siLCJwdXNoIiwibWFpbiIsImZvb3RlciIsInAiLCJEYXRlIiwiZ2V0RnVsbFllYXIiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./components/common/Layout.tsx\n");

/***/ }),

/***/ "./pages/_app.tsx":
/*!************************!*\
  !*** ./pages/_app.tsx ***!
  \************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @solana/wallet-adapter-react */ \"@solana/wallet-adapter-react\");\n/* harmony import */ var _solana_wallet_adapter_react_ui__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @solana/wallet-adapter-react-ui */ \"@solana/wallet-adapter-react-ui\");\n/* harmony import */ var _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @solana/wallet-adapter-wallets */ \"@solana/wallet-adapter-wallets\");\n/* harmony import */ var _solana_web3_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @solana/web3.js */ \"@solana/web3.js\");\n/* harmony import */ var _solana_web3_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_solana_web3_js__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var react_hot_toast__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react-hot-toast */ \"react-hot-toast\");\n/* harmony import */ var _components_common_Layout__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/components/common/Layout */ \"./components/common/Layout.tsx\");\n/* harmony import */ var _styles_global_css__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @/styles/global.css */ \"./styles/global.css\");\n/* harmony import */ var _styles_global_css__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_styles_global_css__WEBPACK_IMPORTED_MODULE_8__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_2__, _solana_wallet_adapter_react_ui__WEBPACK_IMPORTED_MODULE_3__, _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_4__, react_hot_toast__WEBPACK_IMPORTED_MODULE_6__, _components_common_Layout__WEBPACK_IMPORTED_MODULE_7__]);\n([_solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_2__, _solana_wallet_adapter_react_ui__WEBPACK_IMPORTED_MODULE_3__, _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_4__, react_hot_toast__WEBPACK_IMPORTED_MODULE_6__, _components_common_Layout__WEBPACK_IMPORTED_MODULE_7__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n// frontend/pages/_app.tsx\n\n\n\n\n\n\n\n\n\n\n__webpack_require__(/*! @solana/wallet-adapter-react-ui/styles.css */ \"../node_modules/@solana/wallet-adapter-react-ui/styles.css\");\n// Default to 'devnet' for development, you can change this based on environment\nconst network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || \"devnet\";\nfunction MyApp({ Component, pageProps }) {\n    // Initialize wallets that you want to use\n    const wallets = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)({\n        \"MyApp.useMemo[wallets]\": ()=>[\n                new _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_4__.PhantomWalletAdapter(),\n                new _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_4__.SolflareWalletAdapter(),\n                new _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_4__.TorusWalletAdapter()\n            ]\n    }[\"MyApp.useMemo[wallets]\"], [\n        network\n    ]);\n    // Initialize connection endpoint\n    const endpoint = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)({\n        \"MyApp.useMemo[endpoint]\": ()=>(0,_solana_web3_js__WEBPACK_IMPORTED_MODULE_5__.clusterApiUrl)(network)\n    }[\"MyApp.useMemo[endpoint]\"], [\n        network\n    ]);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_2__.ConnectionProvider, {\n        endpoint: endpoint,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_2__.WalletProvider, {\n            wallets: wallets,\n            autoConnect: true,\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_solana_wallet_adapter_react_ui__WEBPACK_IMPORTED_MODULE_3__.WalletModalProvider, {\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_common_Layout__WEBPACK_IMPORTED_MODULE_7__[\"default\"], {\n                    children: [\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                            ...pageProps\n                        }, void 0, false, {\n                            fileName: \"/home/db/Projects/DuelBet/frontend/pages/_app.tsx\",\n                            lineNumber: 43,\n                            columnNumber: 13\n                        }, this),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_hot_toast__WEBPACK_IMPORTED_MODULE_6__.Toaster, {\n                            position: \"bottom-right\",\n                            toastOptions: {\n                                style: {\n                                    background: \"#333\",\n                                    color: \"#fff\"\n                                },\n                                success: {\n                                    duration: 3000\n                                },\n                                error: {\n                                    duration: 4000\n                                }\n                            }\n                        }, void 0, false, {\n                            fileName: \"/home/db/Projects/DuelBet/frontend/pages/_app.tsx\",\n                            lineNumber: 44,\n                            columnNumber: 13\n                        }, this)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/home/db/Projects/DuelBet/frontend/pages/_app.tsx\",\n                    lineNumber: 42,\n                    columnNumber: 11\n                }, this)\n            }, void 0, false, {\n                fileName: \"/home/db/Projects/DuelBet/frontend/pages/_app.tsx\",\n                lineNumber: 41,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"/home/db/Projects/DuelBet/frontend/pages/_app.tsx\",\n            lineNumber: 40,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/home/db/Projects/DuelBet/frontend/pages/_app.tsx\",\n        lineNumber: 39,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDBCQUEwQjs7QUFFTTtBQUM4QjtBQUNRO0FBSzlCO0FBQ1E7QUFDa0I7QUFDeEI7QUFDTTtBQUNuQjtBQUM3QlUsbUJBQU9BLENBQUMsOEdBQTRDO0FBRXBELGdGQUFnRjtBQUNoRixNQUFNQyxVQUFVQyxRQUFRQyxHQUFHLENBQUNDLDBCQUEwQixJQUFJO0FBRTFELFNBQVNDLE1BQU0sRUFBRUMsU0FBUyxFQUFFQyxTQUFTLEVBQVk7SUFDL0MsMENBQTBDO0lBQzFDLE1BQU1DLFVBQVVsQiw4Q0FBT0E7a0NBQ3JCLElBQU07Z0JBQ0osSUFBSUcsZ0ZBQW9CQTtnQkFDeEIsSUFBSUMsaUZBQXFCQTtnQkFDekIsSUFBSUMsOEVBQWtCQTthQUN2QjtpQ0FDRDtRQUFDTTtLQUFRO0lBR1gsaUNBQWlDO0lBQ2pDLE1BQU1RLFdBQVduQiw4Q0FBT0E7bUNBQ3RCLElBQU1NLDhEQUFhQSxDQUFDSztrQ0FDcEI7UUFBQ0E7S0FBUTtJQUdYLHFCQUNFLDhEQUFDSiw0RUFBa0JBO1FBQUNZLFVBQVVBO2tCQUM1Qiw0RUFBQ2xCLHdFQUFjQTtZQUFDaUIsU0FBU0E7WUFBU0UsV0FBVztzQkFDM0MsNEVBQUNsQixnRkFBbUJBOzBCQUNsQiw0RUFBQ08saUVBQU1BOztzQ0FDTCw4REFBQ087NEJBQVcsR0FBR0MsU0FBUzs7Ozs7O3NDQUN4Qiw4REFBQ1Qsb0RBQU9BOzRCQUNOYSxVQUFTOzRCQUNUQyxjQUFjO2dDQUNaQyxPQUFPO29DQUNMQyxZQUFZO29DQUNaQyxPQUFPO2dDQUNUO2dDQUNBQyxTQUFTO29DQUNQQyxVQUFVO2dDQUNaO2dDQUNBQyxPQUFPO29DQUNMRCxVQUFVO2dDQUNaOzRCQUNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFPZDtBQUVBLGlFQUFlWixLQUFLQSxFQUFDIiwic291cmNlcyI6WyIvaG9tZS9kYi9Qcm9qZWN0cy9EdWVsQmV0L2Zyb250ZW5kL3BhZ2VzL19hcHAudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8vIGZyb250ZW5kL3BhZ2VzL19hcHAudHN4XG5pbXBvcnQgeyBBcHBQcm9wcyB9IGZyb20gXCJuZXh0L2FwcFwiO1xuaW1wb3J0IHsgdXNlTWVtbyB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgV2FsbGV0UHJvdmlkZXIgfSBmcm9tIFwiQHNvbGFuYS93YWxsZXQtYWRhcHRlci1yZWFjdFwiO1xuaW1wb3J0IHsgV2FsbGV0TW9kYWxQcm92aWRlciB9IGZyb20gXCJAc29sYW5hL3dhbGxldC1hZGFwdGVyLXJlYWN0LXVpXCI7XG5pbXBvcnQge1xuICBQaGFudG9tV2FsbGV0QWRhcHRlcixcbiAgU29sZmxhcmVXYWxsZXRBZGFwdGVyLFxuICBUb3J1c1dhbGxldEFkYXB0ZXIsXG59IGZyb20gXCJAc29sYW5hL3dhbGxldC1hZGFwdGVyLXdhbGxldHNcIjtcbmltcG9ydCB7IGNsdXN0ZXJBcGlVcmwgfSBmcm9tIFwiQHNvbGFuYS93ZWIzLmpzXCI7XG5pbXBvcnQgeyBDb25uZWN0aW9uUHJvdmlkZXIgfSBmcm9tIFwiQHNvbGFuYS93YWxsZXQtYWRhcHRlci1yZWFjdFwiO1xuaW1wb3J0IHsgVG9hc3RlciB9IGZyb20gXCJyZWFjdC1ob3QtdG9hc3RcIjtcbmltcG9ydCBMYXlvdXQgZnJvbSBcIkAvY29tcG9uZW50cy9jb21tb24vTGF5b3V0XCI7XG5pbXBvcnQgXCJAL3N0eWxlcy9nbG9iYWwuY3NzXCI7XG5yZXF1aXJlKFwiQHNvbGFuYS93YWxsZXQtYWRhcHRlci1yZWFjdC11aS9zdHlsZXMuY3NzXCIpO1xuXG4vLyBEZWZhdWx0IHRvICdkZXZuZXQnIGZvciBkZXZlbG9wbWVudCwgeW91IGNhbiBjaGFuZ2UgdGhpcyBiYXNlZCBvbiBlbnZpcm9ubWVudFxuY29uc3QgbmV0d29yayA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NPTEFOQV9ORVRXT1JLIHx8IFwiZGV2bmV0XCI7XG5cbmZ1bmN0aW9uIE15QXBwKHsgQ29tcG9uZW50LCBwYWdlUHJvcHMgfTogQXBwUHJvcHMpIHtcbiAgLy8gSW5pdGlhbGl6ZSB3YWxsZXRzIHRoYXQgeW91IHdhbnQgdG8gdXNlXG4gIGNvbnN0IHdhbGxldHMgPSB1c2VNZW1vKFxuICAgICgpID0+IFtcbiAgICAgIG5ldyBQaGFudG9tV2FsbGV0QWRhcHRlcigpLFxuICAgICAgbmV3IFNvbGZsYXJlV2FsbGV0QWRhcHRlcigpLFxuICAgICAgbmV3IFRvcnVzV2FsbGV0QWRhcHRlcigpLFxuICAgIF0sXG4gICAgW25ldHdvcmtdXG4gICk7XG5cbiAgLy8gSW5pdGlhbGl6ZSBjb25uZWN0aW9uIGVuZHBvaW50XG4gIGNvbnN0IGVuZHBvaW50ID0gdXNlTWVtbyhcbiAgICAoKSA9PiBjbHVzdGVyQXBpVXJsKG5ldHdvcmsgYXMgXCJkZXZuZXRcIiB8IFwidGVzdG5ldFwiIHwgXCJtYWlubmV0LWJldGFcIiksXG4gICAgW25ldHdvcmtdXG4gICk7XG5cbiAgcmV0dXJuIChcbiAgICA8Q29ubmVjdGlvblByb3ZpZGVyIGVuZHBvaW50PXtlbmRwb2ludH0+XG4gICAgICA8V2FsbGV0UHJvdmlkZXIgd2FsbGV0cz17d2FsbGV0c30gYXV0b0Nvbm5lY3Q+XG4gICAgICAgIDxXYWxsZXRNb2RhbFByb3ZpZGVyPlxuICAgICAgICAgIDxMYXlvdXQ+XG4gICAgICAgICAgICA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XG4gICAgICAgICAgICA8VG9hc3RlclxuICAgICAgICAgICAgICBwb3NpdGlvbj1cImJvdHRvbS1yaWdodFwiXG4gICAgICAgICAgICAgIHRvYXN0T3B0aW9ucz17e1xuICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBcIiMzMzNcIixcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBcIiNmZmZcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHtcbiAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAzMDAwLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA0MDAwLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvTGF5b3V0PlxuICAgICAgICA8L1dhbGxldE1vZGFsUHJvdmlkZXI+XG4gICAgICA8L1dhbGxldFByb3ZpZGVyPlxuICAgIDwvQ29ubmVjdGlvblByb3ZpZGVyPlxuICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBNeUFwcDtcbiJdLCJuYW1lcyI6WyJ1c2VNZW1vIiwiV2FsbGV0UHJvdmlkZXIiLCJXYWxsZXRNb2RhbFByb3ZpZGVyIiwiUGhhbnRvbVdhbGxldEFkYXB0ZXIiLCJTb2xmbGFyZVdhbGxldEFkYXB0ZXIiLCJUb3J1c1dhbGxldEFkYXB0ZXIiLCJjbHVzdGVyQXBpVXJsIiwiQ29ubmVjdGlvblByb3ZpZGVyIiwiVG9hc3RlciIsIkxheW91dCIsInJlcXVpcmUiLCJuZXR3b3JrIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NPTEFOQV9ORVRXT1JLIiwiTXlBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiLCJ3YWxsZXRzIiwiZW5kcG9pbnQiLCJhdXRvQ29ubmVjdCIsInBvc2l0aW9uIiwidG9hc3RPcHRpb25zIiwic3R5bGUiLCJiYWNrZ3JvdW5kIiwiY29sb3IiLCJzdWNjZXNzIiwiZHVyYXRpb24iLCJlcnJvciJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./pages/_app.tsx\n");

/***/ }),

/***/ "./styles/global.css":
/*!***************************!*\
  !*** ./styles/global.css ***!
  \***************************/
/***/ (() => {



/***/ }),

/***/ "@solana/web3.js":
/*!**********************************!*\
  !*** external "@solana/web3.js" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("@solana/web3.js");

/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ }),

/***/ "@solana/wallet-adapter-react":
/*!***********************************************!*\
  !*** external "@solana/wallet-adapter-react" ***!
  \***********************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@solana/wallet-adapter-react");;

/***/ }),

/***/ "@solana/wallet-adapter-react-ui":
/*!**************************************************!*\
  !*** external "@solana/wallet-adapter-react-ui" ***!
  \**************************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@solana/wallet-adapter-react-ui");;

/***/ }),

/***/ "@solana/wallet-adapter-wallets":
/*!*************************************************!*\
  !*** external "@solana/wallet-adapter-wallets" ***!
  \*************************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@solana/wallet-adapter-wallets");;

/***/ }),

/***/ "react-hot-toast":
/*!**********************************!*\
  !*** external "react-hot-toast" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = import("react-hot-toast");;

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc","vendor-chunks/@solana"], () => (__webpack_exec__("./pages/_app.tsx")));
module.exports = __webpack_exports__;

})();