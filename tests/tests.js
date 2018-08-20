const o = require('mithril/ospec/ospec');
const browserMock = require('mithril/test-utils/browserMock')();
    global.window = browserMock;
    global.document = browserMock.document;
const firebaseMock = require('firebase-mock');
const m = require('mithril');
const stream = require('mithril/stream');
const merge = require('deepmerge');

/**
 * Firebase Mock
 * https://github.com/soumak77/firebase-mock/blob/master/tutorials/integration/setup.md
 */
const mockAuth = new firebaseMock.MockAuthentication();
const sdk = new firebaseMock.MockFirebaseSdk(null, () => mockAuth);

/** State */
const { initialState } = require('../src/state');
const update = stream();
const model = stream.scan(merge, initialState, update);

/** Mutators */
const Global = require('../src/mutators/Global')(update, sdk);

o.spec('Global Mutators: ', () => {
    // Reset Model before each test
    o.beforeEach(() => model(initialState));

    o('Global.assignUser', () => {
        Global.assignUser('kevin');
        o( model().global.user ).equals('kevin');
    });

    o('Global.toggleSignUpForm', () => {
        Global.toggleSignUpForm(true);
        o( model().global.showSignUp ).equals(true);
        Global.toggleSignUpForm(false);
        o( model().global.showSignUp ).equals(false);
    });

    o('Global.updateSignUpMsg', () => {
        Global.updateSignUpMsg('Bad email format!');
        o( model().global.signUpMsg ).equals('Bad email format!');
    });

    o('Global.toggleSignInForm', () => {
        Global.toggleSignInForm(true);
        o( model().global.showSignIn ).equals(true);
        Global.toggleSignInForm(false);
        o( model().global.showSignIn ).equals(false);
    });

    o('Global.updateSignInMsg', () => {
        Global.updateSignInMsg('Bad email format!');
        o( model().global.signInMsg ).equals('Bad email format!');
    });

    o('Global.createUser', () => {
        Global.createUser('keb@pm.me', 'testpassword');
        sdk.auth().flush();

        sdk.auth().getUserByEmail('keb@pm.me').then(user => {
            o(user.email).equals('keb@pm.me');
            o(user.password).equals('testpassword');

            // Check State
            o( model().global.signUpMsg ).equals(null);
            o( model().global.user ).equals(user.email);
            o( model().global.showSignUp ).equals(false);
        });
    });

    o('Global.signInUser', () => {
        Global.signInUser('keb@pm.me', 'testpassword').then(() => {
            o( model().global.user ).equals('keb@pm.me');
        });

        sdk.auth().flush();
        o(sdk.auth().currentUser.email).equals('keb@pm.me');
    });
});

o.run();