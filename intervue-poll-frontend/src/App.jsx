import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./Pages/loginPage/LoginPage";
import TeacherLandingPage from "./Pages/teacher-landing/TeacherLandingPage";
import StudentLandingPage from "./Pages/student-landing/StudentLandingPage";
import StudentPollPage from "./Pages/student-poll/StudentPollPage";
import TeacherPollPage from "./Pages/teacher-poll/TeacherPollPage";
import PollHistoryPage from "./Pages/poll-history/PollHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/teacher-home-page" element={<TeacherLandingPage />} />
        <Route path="/student-home-page" element={<StudentLandingPage />} />
        <Route path="/poll-question" element={<StudentPollPage />} />
        <Route path="/teacher-poll" element={<TeacherPollPage />} />
        <Route path="/teacher-poll-history" element={<PollHistoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
