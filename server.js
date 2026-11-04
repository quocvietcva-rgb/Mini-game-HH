const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const gameState = {
    status: 'lobby',
    currentQuestionIndex: 0,
    questionStartTime: 0,
    survivalQuotas: [50, 40, 30, 20, 10, 6, 3, 1],
    players: {},
    questions: [
        { id: 1, text: "Thuật ngữ AI là viết tắt của từ tiếng Anh nào?", options: ["A. Artificial Intelligence", "B. Automated Info", "C. Advanced Interface"], correct: "0" },
        { id: 2, text: "Phép thử nào được dùng để kiểm tra xem máy tính có khả năng tư duy như con người không?", options: ["A. Phép thử Turing", "B. Phép thử Newton", "C. Phép thử Pascal"], correct: "0" },
        { id: 3, text: "Machine Learning (Học máy) là một tập con của lĩnh vực nào?", options: ["A. Data Science", "B. Artificial Intelligence", "C. Cloud Computing"], correct: "1" },
        { id: 4, text: "Mô hình ngôn ngữ lớn (LLM) đằng sau ChatGPT được huấn luyện chủ yếu dựa trên kiến trúc mạng neural nào?", options: ["A. CNN", "B. RNN", "C. Transformer"], correct: "2" },
        { id: 5, text: "Thuật ngữ 'Deep Learning' (Học sâu) đề cập đến độ sâu của cái gì?", options: ["A. Dữ liệu", "B. Các lớp (layers) trong mạng neural", "C. Bộ nhớ RAM"], correct: "1" },
        { id: 6, text: "Hiện tượng AI tự bịa ra thông tin sai lệch nhưng trình bày rất thuyết phục được gọi là gì?", options: ["A. Hallucination (Ảo giác)", "B. Illusion (Ảo ảnh)", "C. Delusion (Hoang tưởng)"], correct: "0" },
        { id: 7, text: "Trong AI, 'Computer Vision' (Thị giác máy tính) chủ yếu xử lý loại dữ liệu nào?", options: ["A. Âm thanh", "B. Văn bản", "C. Hình ảnh và Video"], correct: "2" },
        { id: 8, text: "Hệ thống AI đầu tiên đánh bại nhà vô địch thế giới môn cờ vây là gì?", options: ["A. Deep Blue", "B. AlphaGo", "C. Watson"], correct: "1" }
    ]
};

io.on('connection', (socket) => {
    socket.emit('gameState', gameState);

    socket.on('joinGame', (name) => {
        gameState.players[socket.id] = { name: name, active: true, currentAnswer: null, timeTaken: 999999 };
        io.emit('updatePlayers', gameState.players);
        socket.emit('joined', true);
    });

    socket.on('submitAnswer', (answerIndex) => {
        const player = gameState.players[socket.id];
        if (!player || !player.active || gameState.status !== 'playing' || player.currentAnswer !== null) return;
        player.currentAnswer = answerIndex;
        player.timeTaken = Date.now() - gameState.questionStartTime;
        socket.emit('answerAcknowledged', true);
        io.emit('updatePlayers', gameState.players);
    });

    socket.on('nextQuestion', () => {
        if (gameState.currentQuestionIndex >= gameState.questions.length) {
            gameState.status = 'ended';
            io.emit('gameState', gameState);
            return;
        }
        gameState.status = 'playing';
        gameState.questionStartTime = Date.now();
        for(let id in gameState.players) { gameState.players[id].currentAnswer = null; }
        io.emit('gameState', gameState);
    });

    socket.on('processResults', () => {
        gameState.status = 'calculating';
        const currentQIndex = gameState.currentQuestionIndex;
        const currentQ = gameState.questions[currentQIndex];
        const maxSurvivors = gameState.survivalQuotas[currentQIndex];

        let correctPlayers = [];
        for (const socketId in gameState.players) {
            const player = gameState.players[socketId];
            if (!player.active) continue;
            if (String(player.currentAnswer) === String(currentQ.correct)) {
                correctPlayers.push({ socketId, timeTaken: player.timeTaken });
            } else {
                player.active = false;
            }
        }
        correctPlayers.sort((a, b) => a.timeTaken - b.timeTaken);
        
        const eliminatedByPace = correctPlayers.slice(maxSurvivors);
        eliminatedByPace.forEach(p => { gameState.players[p.socketId].active = false; });

        for (const socketId in gameState.players) {
            const player = gameState.players[socketId];
            if (player.active) { io.to(socketId).emit('roundResult', { status: 'survived' }); }
            else { io.to(socketId).emit('roundResult', { status: 'eliminated' }); }
            player.currentAnswer = null;
            player.timeTaken = 999999;
        }
        gameState.currentQuestionIndex++;
        io.emit('updatePlayers', gameState.players);
        io.emit('gameState', gameState);
    });

    socket.on('resetGame', () => {
        gameState.status = 'lobby';
        gameState.currentQuestionIndex = 0;
        gameState.players = {};
        io.emit('gameState', gameState);
        io.emit('updatePlayers', gameState.players);
    });

    socket.on('disconnect', () => {
        if (gameState.players[socket.id]) {
            delete gameState.players[socket.id];
            io.emit('updatePlayers', gameState.players);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server đang chạy tại port ${PORT}`);
});
