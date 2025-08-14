# Polling App – Full Stack Overview

The Polling App is a real-time, interactive platform that enables teachers to create, manage, and track live polls while allowing students to participate seamlessly. Built with a React (Vite) + Tailwind CSS frontend and a Node.js + Express.js + MongoDB backend, it leverages Socket.IO for instant, bidirectional communication between the client and server, ensuring a smooth and responsive user experience.

For Teachers, the platform offers features to create polls with multiple options, set countdown timers, view live voting results as they come in, access past poll history, and remove participants from active sessions. For Students, it allows joining poll rooms via a shared code or link, submitting votes instantly, viewing results update in real time, and being redirected to a “removed” page if removed by the teacher.

The backend manages poll creation, voting, and result tracking, stores all data in MongoDB, and broadcasts events in real time using Socket.IO. The frontend delivers a responsive, accessible interface styled with Tailwind CSS and manages session data through Session Storage. Together, the system provides an engaging, fast, and reliable polling experience for both educators and learners.
