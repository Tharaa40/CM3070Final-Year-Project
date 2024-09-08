import React from "react";
// import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomePage from "../screens/HomePage";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import { collection, getDocs, getDoc, updateDoc, query, where } from "firebase/firestore";
import { render, waitFor, fireEvent } from "../components/test-utils";


// Mock the necessary modules and functions
jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
    useIsFocused: jest.fn().mockReturnValue(true),
}));
  
jest.mock('../firebaseConfig', () => ({
    FIREBASE_AUTH: {
        currentUser: { uid: 'mockUserId' },
    },
    FIRESTORE_DB: jest.fn(),
}));
  
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    getDocs: jest.fn(),
    updateDoc: jest.fn(),
    getDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
}));
  
jest.mock('moment', () => {
    const moment = jest.requireActual('moment');
    return moment;
});
  
describe('HomePage Screen', () => {
    const mockNavigate = jest.fn();
    useNavigation.mockReturnValue({ navigate: mockNavigate });

    // const renderWithSafeArea = (component) => {
    //     return render(<SafeAreaProvider>{component}</SafeAreaProvider>);
    // };
  
    const mockTasks = [
      {
        id: '1',
        title: 'Test Task 1',
        description: 'Task description',
        deadline: moment().format('MM/DD/YYYY h:mm A'),
        completed: false,
        selectedPriority: 'High',
        category: 'Work',
        subtasks: [{ text: 'Subtask 1', checked: false }],
      },
      {
        id: '2',
        title: 'Test Task 2',
        description: 'Another description',
        deadline: moment().add(2, 'days').format('MM/DD/YYYY h:mm A'),
        completed: false,
        selectedPriority: 'Low',
        category: 'Personal',
        subtasks: [{ text: 'Subtask 1', checked: true }],
      },
    ];
  
    beforeEach(() => {
      getDocs.mockResolvedValue({
        forEach: (callback) => {
          mockTasks.forEach((task) => callback({ data: () => task, id: task.id }));
        },
      });
  
      getDoc.mockResolvedValue({
        exists: jest.fn().mockReturnValue(true),
        data: jest.fn().mockReturnValue({ username: 'mockUser', points: 10, xp: 20 }),
      });
  
      updateDoc.mockResolvedValue();
    });
  
    it('renders the screen correctly', async () => {
      const { getByText } = render(<HomePage />);
      await waitFor(() => {
        expect(getByText('Today')).toBeTruthy();
        expect(getByText('Upcoming')).toBeTruthy();
        expect(getByText('Personal Stats')).toBeTruthy();
      });
    });
  
    it('fetches and displays tasks', async () => {
      const { getByText } = render(<HomePage />);
      await waitFor(() => {
        expect(getByText('Test Task 1')).toBeTruthy();
        expect(getByText('Test Task 2')).toBeTruthy();
      });
    });
  
    it('opens task details modal on task press', async () => {
      const { getByText, getByRole } = render(<HomePage />);
      await waitFor(() => {
        fireEvent.press(getByText('Test Task 1'));
        expect(getByRole('dialog')).toBeTruthy();
        expect(getByText('Task description')).toBeTruthy();
      });
    });
  
    it('closes task details modal', async () => {
      const { getByText, queryByRole } = render(<HomePage />);
      await waitFor(() => {
        fireEvent.press(getByText('Test Task 1'));
        expect(queryByRole('dialog')).toBeTruthy();
        fireEvent.press(getByText('Close'));
        expect(queryByRole('dialog')).toBeNull();
      });
    });
  
    it('navigates to edit task screen', async () => {
      const { getByText } = render(<HomePage />);
      await waitFor(() => {
        fireEvent.press(getByText('Test Task 1'));
        fireEvent.press(getByText('Edit'));
        expect(mockNavigate).toHaveBeenCalledWith('CreateTaskStack', {
          screen: 'Addtask',
          params: { task: mockTasks[0] },
        });
      });
    });
  
    it('updates task completion status', async () => {
      const { getByText } = render(<HomePage />);
      await waitFor(() => {
        fireEvent.press(getByText('Complete'));
        expect(updateDoc).toHaveBeenCalled();
      });
    });
  
    it('fetches and displays user points and xp', async () => {
      const { getByText } = render(<HomePage />);
      await waitFor(() => {
        expect(getByText('mockUser')).toBeTruthy();
        expect(getByText('10')).toBeTruthy();
        expect(getByText('20')).toBeTruthy();
      });
    });
});