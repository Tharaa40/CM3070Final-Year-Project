import { updateUserRewards } from '../rewardSystem/Points'; 
import { FIRESTORE_DB, FIREBASE_AUTH } from '../firebaseConfig';
import { getDoc, updateDoc, doc } from 'firebase/firestore';

// Mock Firebase Firestore and Authentication functionalities
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
}));

jest.mock('../firebaseConfig', () => ({
  FIRESTORE_DB: jest.fn(),
  FIREBASE_AUTH: {
    currentUser: { uid: 'testUserId' }, // Mock user
  },
}));

describe('updateUserRewards', () => {
  const mockUserRef = { id: 'testUserId' };

  beforeEach(() => {
    jest.clearAllMocks();
    doc.mockReturnValue(mockUserRef);
  });

  it('should not update rewards if no user is authenticated', async () => {
    FIREBASE_AUTH.currentUser = null; // No user logged in

    const result = await updateUserRewards({ selectedPriority: 'low' });
    expect(result).toBeUndefined();
    expect(getDoc).not.toHaveBeenCalled();
    expect(updateDoc).not.toHaveBeenCalled();
  });

  it('should not update rewards if user document does not exist', async () => {
    getDoc.mockResolvedValueOnce({ exists: () => false }); // User document does not exist

    const result = await updateUserRewards({ selectedPriority: 'low' });
    expect(result).toBeUndefined();
    expect(getDoc).toHaveBeenCalledWith(mockUserRef);
    expect(updateDoc).not.toHaveBeenCalled();
  });

  it('should update points and XP correctly for low priority task', async () => {
    const mockUserData = { points: 10, xp: 20 };
    getDoc.mockResolvedValueOnce({ exists: () => true, data: () => mockUserData });

    const result = await updateUserRewards({ selectedPriority: 'low' });
    expect(getDoc).toHaveBeenCalledWith(mockUserRef);
    expect(updateDoc).toHaveBeenCalledWith(mockUserRef, { points: 15, xp: 30 });
    expect(result).toEqual({ points: 15, xp: 30 });
  });

  it('should update points and XP correctly for medium priority task', async () => {
    const mockUserData = { points: 50, xp: 100 };
    getDoc.mockResolvedValueOnce({ exists: () => true, data: () => mockUserData });

    const result = await updateUserRewards({ selectedPriority: 'medium' });
    expect(getDoc).toHaveBeenCalledWith(mockUserRef);
    expect(updateDoc).toHaveBeenCalledWith(mockUserRef, { points: 65, xp: 130 });
    expect(result).toEqual({ points: 65, xp: 130 });
  });

  it('should update points and XP correctly for high priority task', async () => {
    const mockUserData = { points: 200, xp: 850 };
    getDoc.mockResolvedValueOnce({ exists: () => true, data: () => mockUserData });

    const result = await updateUserRewards({ selectedPriority: 'high' });
    expect(getDoc).toHaveBeenCalledWith(mockUserRef);
    expect(updateDoc).toHaveBeenCalledWith(mockUserRef, { points: 235, xp: 0 }); // XP reset after reaching 900
    expect(result).toEqual({ points: 235, xp: 0 });
  });

  it('should reset points if it reaches or exceeds 300', async () => {
    const mockUserData = { points: 290, xp: 800 };
    getDoc.mockResolvedValueOnce({ exists: () => true, data: () => mockUserData });

    const result = await updateUserRewards({ selectedPriority: 'medium' });
    expect(getDoc).toHaveBeenCalledWith(mockUserRef);
    expect(updateDoc).toHaveBeenCalledWith(mockUserRef, { points: 0, xp: 830 }); // Points reset after reaching 300
    expect(result).toEqual({ points: 0, xp: 830 });
  });
});
