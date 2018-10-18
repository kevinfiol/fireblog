import marked from 'marked';

const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyAico7GEIIIUML-XCjwlxZ3TSPfimZfN1E',
    authDomain: 'botnet-profiles.firebaseapp.com',
    databaseURL: 'https://botnet-profiles.firebaseio.com',
    projectId: 'botnet-profiles',
    storageBucket: 'botnet-profiles.appspot.com',
    messagingSenderId: '112180117024'
};

const RENDERER = (() => {
    const r = new marked.Renderer();

    r.image = (href, title, text) => {
        var out = '<p class="center"><img src="' + href + '" alt="' + text + '"';
        if (title) out += ' title="' + title + '"';

        out += '/></p>';
        return out;
    };

    return r;
})();

export { FIREBASE_CONFIG, RENDERER };