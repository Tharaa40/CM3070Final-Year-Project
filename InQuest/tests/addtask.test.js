import React from "react";
import { render, fireEvent, waitFor } from "../components/test-utils";
import TaskBottomSheet from '../screens/BottomSheet';
import { FIRESTORE_DB, FIREBASE_AUTH } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

// Mock the Firebase configuration
jest.mock('../firebaseConfig', () => ({
    FIRESTORE_DB: {},
    FIREBASE_AUTH: {},
}));

// Mock Firebase auth state changes
jest.mock('firebase/auth', () => ({
    onAuthStateChanged: jest.fn(),
}));
  
  describe('TaskBottomSheet', () => {
    let mockNavigate;
  
    beforeEach(() => {
      // Mock the navigation prop
      mockNavigate = jest.fn();
      jest.clearAllMocks();
  
      // Mock onAuthStateChanged to simulate a logged-in user
      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback({ uid: 'test-user-id' });
      });
    });
  
    it('renders the bottom sheet correctly', () => {
      const { getByText, getByPlaceholderText } = render(
        <TaskBottomSheet navigation={{ navigate: mockNavigate }} route={{ params: {} }} />
      );
  
      expect(getByText('Add Task')).toBeTruthy();
      expect(getByPlaceholderText('Enter task title')).toBeTruthy();
      expect(getByPlaceholderText('Enter task description')).toBeTruthy();
    });
  
    it('allows the user to add a task title and description', () => {
      const { getByPlaceholderText } = render(
        <TaskBottomSheet navigation={{ navigate: mockNavigate }} route={{ params: {} }} />
      );
  
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Test Task Title');
      fireEvent.changeText(getByPlaceholderText('Enter task description'), 'Test Task Description');
  
      expect(getByPlaceholderText('Enter task title').props.value).toBe('Test Task Title');
      expect(getByPlaceholderText('Enter task description').props.value).toBe('Test Task Description');
    });
  
    it('allows the user to add and remove subtasks', () => {
      const { getByText, getByPlaceholderText, getAllByPlaceholderText } = render(
        <TaskBottomSheet navigation={{ navigate: mockNavigate }} route={{ params: {} }} />
      );
  
      // Add a subtask
      fireEvent.press(getByText('+'));
  
      // Verify that a new subtask input field is rendered
      expect(getAllByPlaceholderText('Enter subtask').length).toBe(1);
  
      // Remove the subtask
      fireEvent.press(getByText('trash')); // This may need adjustment based on your icon component
  
      // Verify the subtask input is removed
      expect(getAllByPlaceholderText('Enter subtask').length).toBe(0);
    });
  
    it('navigates back when the task is saved', async () => {
      const { getByText } = render(
        <TaskBottomSheet navigation={{ navigate: mockNavigate }} route={{ params: {} }} />
      );
  
      fireEvent.press(getByText('Save')); // Make sure the Save button has this text
  
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('Details');
      });
    });
  
    it('navigates back when the cancel button is pressed', () => {
      const { getByText } = render(
        <TaskBottomSheet navigation={{ navigate: mockNavigate }} route={{ params: {} }} />
      );
  
      fireEvent.press(getByText('Cancel'));
  
      expect(mockNavigate).toHaveBeenCalledWith('HomeTab');
    });
  });