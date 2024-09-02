import firebasemock from 'firebase-mock';

const mockdatabase = new firebasemock.MockFirebase();
const mockauth = new firebasemock.MockFirebase();
export const mocksdk = new firebasemock.MockFirebaseSdk(
    (path) => (path ? mockdatabase.child(path) : mockdatabase),
    () => mockauth
)