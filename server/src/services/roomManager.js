// server/src/services/roomManager.js

const rooms = new Map();

/**
 * Creates a new poll room and stores it in memory.
 * @returns {object} The newly created room object.
 */
function createRoom() {
    const roomId = generateRoomId();
    const room = {
        id: roomId,
        users: new Map(),
        votes: {
            optionA: 0,
            optionB: 0
        },
        question: "Cats vs Dogs",
        timer: 60,
        status: 'voting',
    };
    rooms.set(roomId, room);
    return room;
}

/**
 * Retrieves a room by its ID.
 * @param {string} roomId The ID of the room.
 * @returns {object|undefined} The room object or undefined if not found.
 */
function getRoom(roomId) {
    return rooms.get(roomId);
}

/**
 * Adds a user to a specific room.
 * @param {string} roomId The ID of the room to join.
 * @param {string} userId A unique ID for the user's WebSocket connection.
 * @param {string} username The user's name.
 * @returns {object|null} The room object if joined successfully, otherwise null.
 */
function joinRoom(roomId, userId, username) {
    const room = getRoom(roomId);
    if (!room) {
        return null;
    }
    room.users.set(userId, { username, voted: false });
    return room;
}

/**
 * Handles a vote from a user for a specific option.
 * @param {string} roomId The ID of the room.
 * @param {string} userId The ID of the user voting.
 * @param {'optionA' | 'optionB'} option The option being voted for.
 */
function handleVote(roomId, userId, option) {
    const room = getRoom(roomId);
    if (!room) return;

    const user = room.users.get(userId);
    // Prevent user from voting twice
    if (user && !user.voted) {
        if (option === 'optionA' || option === 'optionB') {
            console.log(`SERVER: Vote received for ${option}. Old votes:`, room.votes);
            room.votes[option]++;
            user.voted = true;
            console.log(`SERVER: Vote recorded. New votes:`, room.votes);
        }
    }
}

/**
 * Generates a random 5-character ID for a room.
 * @returns {string} A 5-character room ID.
 */
function generateRoomId() {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
}

module.exports = {
    createRoom,
    getRoom,
    joinRoom,
    handleVote,
};