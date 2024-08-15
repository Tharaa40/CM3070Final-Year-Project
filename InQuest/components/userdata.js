const fetchUserData = async () => {
    const user = FIREBASE_AUTH.currentUser;
    if(user){
        const userDoc = await getDoc(doc(FIRESTORE_DB, "users", user.uid));
        if(userDoc.exists()){
            const userData = userDoc.data();
            setUsername(userData.username);
        }
    }
};