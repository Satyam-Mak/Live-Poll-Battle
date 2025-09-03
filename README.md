# Live Poll Battle 🚀

This is a real-time poll application built with Next.js, Node.js, and WebSockets. It allows users to create a poll room, share the room code, and have other users join and vote live. The results are updated instantly for all participants.

---

## Features Implemented ✨

-   **Real-Time WebSocket Communication**: All updates are pushed from the server to the clients in real-time.
-   **Room Creation**: Users can enter their name and create a new, unique poll room.
-   **Room Joining**: Users can join an existing poll room using a 5-character room code.
-   **Live Voting**: Users can vote for one of two options.
-   **Instant Result Updates**: Vote counts are broadcast to all users in the room the moment a vote is cast.
-   **User Presence**: A live list of all users currently in the room.
-   **Re-Voting Prevention**: The UI disables voting buttons after a user has cast their vote. This is persisted across page refreshes.
-   **60-Second Countdown Timer**: Each poll room has a 60-second timer. When the timer ends, voting is permanently disabled for everyone in the room.
-   **Vote Persistence**: Uses `localStorage` to remember a user's vote, preventing re-voting even after a page refresh.

---

## Tech Stack 🛠️

-   **Frontend**: Next.js (React) with TypeScript & Tailwind CSS
-   **Backend**: Node.js with Express and the `ws` library for WebSockets
-   **State Management**: In-memory on the server; React hooks (`useState`, `useEffect`, `useContext`) on the client.

---

## Architectural Decisions 🏛️

For this project, the entire application state is managed in-memory on the Node.js server to fulfill the no-database requirement. I used a JavaScript `Map` to store the poll rooms, with the room code serving as the key for efficient O(1) lookups. Each room object contains the poll question, vote counts, a list of connected users, and the timer state.

Vote state sharing is handled through a centralized broadcasting model. When a user action (like joining a room or casting a vote) occurs, the server updates the state for the specific room and then broadcasts the *entire, updated room object* to every single client connected to that room. This ensures that all clients are perfectly in sync and have a consistent view of the poll's state at all times, simplifying the client-side logic to just rendering the data it receives.

---

## Local Setup and Installation ⚙️

1.  **Prerequisites**: Node.js (v18 or higher) and npm installed.
2.  **Clone the repository**: `git clone <your-repo-url>`
3.  **Install Backend Dependencies**:
    ```bash
    cd server
    npm install
    ```
4.  **Install Frontend Dependencies**:
    ```bash
    cd client
    npm install
    ```
5.  **Run the Backend Server**:
    ```bash
    # From the /server directory
    node src/index.js 
    # The server will be running on http://localhost:8080
    ```
6.  **Run the Frontend Application**:
    ```bash
    # From the /client directory
    npm run dev
    # The application will be running on http://localhost:3000
    ```