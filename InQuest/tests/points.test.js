import { getDoc, updateDoc, doc } from "firebase/firestore";
import { FIRESTORE_DB, FIREBASE_AUTH } from "../firebaseConfig";
import { updateUserRewards } from "../rewardSystem/Points";

// Mock Firestore functions
jest.mock("firebase/firestore", () => ({
  doc: jest.fn().mockReturnValue({ id: "mockDocId" }), // Mock doc to return a mock object
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
}));

// Mock Firebase Auth
jest.mock("../firebaseConfig", () => ({
  FIRESTORE_DB: {},
  FIREBASE_AUTH: {
    currentUser: { uid: "testUserId" },
  },
}));

describe("updateUserRewards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not update if no user is authenticated", async () => {
    FIREBASE_AUTH.currentUser = null; // Simulate no authenticated user

    const result = await updateUserRewards({ selectedPriority: "low" });

    expect(getDoc).not.toHaveBeenCalled();
    expect(updateDoc).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it("should not update if the user document does not exist", async () => {
    FIREBASE_AUTH.currentUser = { uid: "testUserId" }; // Set authenticated user

    getDoc.mockResolvedValueOnce({ exists: () => false }); // Simulate document not existing

    const result = await updateUserRewards({ selectedPriority: "low" });

    expect(getDoc).toHaveBeenCalled();
    expect(updateDoc).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it("should update points and XP based on task priority", async () => {
    FIREBASE_AUTH.currentUser = { uid: "testUserId" }; // Set authenticated user

    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ points: 10, xp: 20 }), // Simulate existing user data
    });

    const task = { selectedPriority: "medium" };

    await updateUserRewards(task);

    expect(getDoc).toHaveBeenCalled();
    expect(updateDoc).toHaveBeenCalledWith(expect.any(Object), {
      points: 25, // 10 (initial) + 15 (medium priority)
      xp: 50,     // 20 (initial) + 30 (medium priority)
    });
  });

  it("should reset XP if XP reaches 900", async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ points: 100, xp: 880 }),
    });

    const task = { selectedPriority: "medium" };

    const result = await updateUserRewards(task);

    expect(updateDoc).toHaveBeenCalledWith(expect.any(Object), {
      points: 115,
      xp: 0, // XP should reset since 880 + 30 >= 900
    });

    expect(result).toEqual({ points: 115, xp: 0 });
  });

  it("should reset points if points reach 300", async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ points: 290, xp: 20 }),
    });

    const task = { selectedPriority: "high" };

    const result = await updateUserRewards(task);

    expect(updateDoc).toHaveBeenCalledWith(expect.any(Object), {
      points: 0, // Points should reset since 290 + 35 >= 300
      xp: 95,    // XP incremented normally
    });

    expect(result).toEqual({ points: 0, xp: 95 });
  });
});
