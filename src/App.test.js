import { render, screen } from '@testing-library/react';
import App from './App';

// Mock useAuth to simulate a logged-in student
jest.mock('./hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test Student', role: 'student' },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }) => <>{children}</>,
}));

test('renders student dashboard for authenticated student', () => {
  render(<App />);
  // Replace with a string unique to your student dashboard
  const dashboardHeading = screen.getByText(/student dashboard/i);
  expect(dashboardHeading).toBeInTheDocument();
});