import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FIRESTORE_DB, FIREBASE_AUTH } from "../firebaseConfig";

export const updateUserRewards = async (task) => {
  const user = FIREBASE_AUTH.currentUser;

  if (!user) return;

  const userRef = doc(FIRESTORE_DB, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) return;

  const userData = userDoc.data();

  let points = userData.points || 0;
  let xp = userData.xp || 0;

  switch (task.selectedPriority) {
      case 'low':
          points += 5;
          xp += 10;
          break;
      case 'medium':
          points += 15;
          xp += 30;
          break;
      case 'high':
          points += 35;
          xp += 75;
          break;
      default:
          break;
  }
  console.log("Before Reset - Points:", points, "XP:", xp); // Debugging line

//   if(xp >= 45 || points >= 70){
//     points = 0; //reset points 
//     xp = 0; //reset xp
//   }
    if (xp >= 800) {
        xp >= 0; // reset xp
    }

    if (points >= 300) {
        points = 0; // reset points
    }
    console.log("After Reset - Points:", points, "XP:", xp); // Debugging line


  await updateDoc(userRef, {
      points,
      xp
  });

  return { points, xp };
};