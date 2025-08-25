import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
	apiKey: 'AIzaSyAvjd0jezAAg0SvyiwZDRudu_zxtUXsKyg',
	authDomain: 'tabungin-yuk.firebaseapp.com',
	projectId: 'tabungin-yuk',
	storageBucket: 'tabungin-yuk.firebasestorage.app',
	messagingSenderId: '833757226984',
	appId: '1:833757226984:web:9c58715e11fbdf5fbc665d',
	measurementId: 'G-TQDSSSR9FX',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

enableIndexedDbPersistence(db).catch(err => {
	if (err.code === 'failed-precondition')
		console.warn('Multiple tabs, persistence single-tab only.');
	else if (err.code === 'unimplemented') console.warn('Browser does not support persistence.');
});

export { auth, db };
