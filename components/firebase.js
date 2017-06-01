import * as firebase from 'firebase';

const config = {
	apiKey: "AIzaSyACcAm9NqAyANyIWXtl7xBU5Z3AapmQxv4",
	authDomain: "faharu-130f5.firebaseapp.com",
	databaseURL: "https://faharu-130f5.firebaseio.com",
	projectId: "faharu-130f5",
	storageBucket: "faharu-130f5.appspot.com",
	messagingSenderId: "395435051818"
};
firebase.initializeApp(config);

export default firebase;