# Polling App – Frontend Overview

This project is a live interactive polling platform that enables teachers to create and manage polls in real time, while allowing students to actively participate. The frontend is developed using React with Vite as the build tool, and Socket.IO ensures instant communication between the server and connected clients.

Key Features

For Teachers:
Create polls with multiple options and set a countdown timer for voting.
Monitor live voting results as they come in.
Access past poll data and history.
Remove (kick) students from an active session.

For Students:
Enter a poll room using a code or link shared by the teacher.
Submit votes instantly and see results update in real time.
Get redirected to a “removed” page if kicked out by the teacher.

Technology Stack : 

1.React (with Vite for faster builds and development)

2.Socket.IO (for instant, bidirectional communication)

3.TailwindCSS (for responsive UI design)

4.Session Storage (for managing user sessions)

Clone the project repository:

git clone https://github.com/shrutiguptaa01/Intervue-Polling/tree/main/intervue-poll-frontend


Install all necessary packages:

1.npm install

2.Start the local development server:
npm run dev

3.Accessing the Application : Once the server is running, open your browser and navigate to:

http://localhost:5173/

# Polling App – Backend Overview

This backend powers a live polling platform where teachers can launch interactive polls, and students can join sessions to vote in real time. The server is built using Node.js with Express.js for handling HTTP routes and API logic, MongoDB for data persistence, and Socket.IO for seamless, real-time data updates between clients and the server.

Technology Stack

1.Node.js – JavaScript runtime for backend operations.

2.Express.js – Framework for building RESTful APIs and server routes.

3.MongoDB – NoSQL database to store polls, votes, and user details.

4.Socket.IO – Enables instant two-way communication for live voting updates.

5.Tailwind CSS (used in frontend) – Utility-first CSS framework for styling the UI.


Clone the project:

git clone https://github.com/shrutiguptaa01/Intervue-Polling/tree/main/backend


Install project dependencies:

1.npm install


2.Start MongoDB service : mongod


3.Run the backend server : npm start

4.Running the Application

The backend will be available at:

http://localhost:3000



The frontend connects to this backend through Socket.IO for real-time updates and via API endpoints for creating polls, casting votes, and retrieving results.

