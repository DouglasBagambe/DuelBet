"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("pages/index",{

/***/ "./types/idl/gaming_challenge.json":
/*!*****************************************!*\
  !*** ./types/idl/gaming_challenge.json ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = /*#__PURE__*/JSON.parse('{"version":"0.1.0","name":"gaming_challenge","instructions":[{"name":"createChallenge","accounts":[{"name":"challenge","isMut":true,"isSigner":true},{"name":"creator","isMut":true,"isSigner":true},{"name":"systemProgram","isMut":false,"isSigner":false}],"args":[{"name":"wagerAmount","type":"u64"},{"name":"statsHash","type":{"array":["u8",32]}},{"name":"metadata","type":"string"}]},{"name":"acceptChallenge","accounts":[{"name":"challenge","isMut":true,"isSigner":false},{"name":"challenger","isMut":true,"isSigner":true},{"name":"systemProgram","isMut":false,"isSigner":false}],"args":[]},{"name":"completeChallenge","accounts":[{"name":"challenge","isMut":true,"isSigner":false},{"name":"creator","isMut":true,"isSigner":true},{"name":"challenger","isMut":true,"isSigner":true}],"args":[{"name":"winner","type":"publicKey"},{"name":"zkProof","type":"bytes"}]}],"accounts":[{"name":"Challenge","type":{"kind":"struct","fields":[{"name":"creator","type":"publicKey"},{"name":"wagerAmount","type":"u64"},{"name":"statsHash","type":{"array":["u8",32]}},{"name":"isActive","type":"bool"},{"name":"challenger","type":"publicKey"},{"name":"isComplete","type":"bool"},{"name":"createdAt","type":"i64"},{"name":"metadata","type":"string"}]}}],"errors":[{"code":6000,"name":"ChallengeNotActive","msg":"Challenge is not active"},{"code":6001,"name":"ChallengeAlreadyAccepted","msg":"Challenge already accepted"},{"code":6002,"name":"ChallengeAlreadyComplete","msg":"Challenge already complete"},{"code":6003,"name":"InvalidWinner","msg":"Invalid winner"},{"code":6004,"name":"InvalidWager","msg":"Invalid wager amount"},{"code":6005,"name":"InsufficientFunds","msg":"Insufficient funds in the challenge account"},{"code":6006,"name":"ChallengeNotAccepted","msg":"Challenge has not been accepted yet"}]}');

/***/ })

});