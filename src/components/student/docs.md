
# KCAdashboard Frontend – Student Components Documentation

## Overview

The `student` folder under `components` contains React components specifically designed for the student-facing features of the KCAdashboard application. These components are focused on presenting quizzes, assignments, and other interactive elements tailored for student users.

---

## File Structure

```
components/student/
  QuizCard.js   # Card component for displaying quiz information to students
```

---

## File Explanations

- **QuizCard.js**  
  A visually rich card component that displays key information about a quiz, such as title, description, difficulty, time limit, number of questions, highest score, and creator. It provides a clear call-to-action for students to start the quiz. The component uses icons for better visual cues and color-coding for difficulty levels.

---

## Features

- **Dynamic Difficulty Styling:** Uses color-coded badges to indicate quiz difficulty (beginner, intermediate, advanced).
- **Quiz Metadata Display:** Shows time limit, number of questions, highest score, and creator name with relevant icons.
- **Responsive Design:** Styled with Tailwind CSS for a modern, responsive look.
- **Navigation:** Integrates with React Router to navigate students to the quiz attempt page.
- **Accessibility:** Uses semantic HTML and clear button actions for better accessibility.

---

## How the Component Works

- Receives a `quiz` object as a prop, containing all necessary quiz details.
- Renders a card with all quiz information and a button to start the quiz.
- The button uses `useNavigate` from React Router to redirect the student to the quiz page.
- Difficulty is visually highlighted using background and text color classes based on the quiz's difficulty level.

---

## Example Usage

```
import QuizCard from './components/student/QuizCard';

<QuizCard quiz={quizData} />
```

Where `quizData` is an object with properties like `id`, `title`, `description`, `difficulty`, `time_limit`, `questions`, `highest_score`, and `creator_name`.

---

## Best Practices

- Keep the `QuizCard` component focused on presentation; handle data fetching and state management in parent components.
- Pass only the required quiz data as props to keep the component reusable.
- Use consistent styling and iconography for a cohesive user experience.

---

## Troubleshooting

- **Quiz not displaying correctly:** Ensure the `quiz` prop is passed and contains all expected fields.
- **Navigation not working:** Confirm that React Router is set up correctly and the quiz route exists.
- **Styling issues:** Make sure Tailwind CSS is properly configured in the project.

---

For more details on the overall frontend structure, see the main `docs.md` in the `src` folder.
