/* eslint-disable no-unused-vars */
import { useState, useEffect, useContext } from "react";
import { Button, Card, Col, Row, Typography } from "antd";
import { SmileOutlined } from "@ant-design/icons";
import { useCookies } from "react-cookie";
import { SocketContext } from '../context/SocketContext';

const { Title } = Typography;

const Game = () => {
    const socket = useContext(SocketContext);
    const [cookie, setCookie] = useCookies(["username", "room"]);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState("");
    const [playerHand, setPlayerHand] = useState([]);
    const [opponentHand, setOpponentHand] = useState([]);
    const [playerDeck, setPlayerDeck] = useState([]);
    const [opponentDeck, setOpponentDeck] = useState([]);
    const [playerPile, setPlayerPile] = useState([]);
    const [opponentPile, setOpponentPile] = useState([]);
    const [playerList, setPlayersList] = useState([]);

    console.log("cookie", cookie.username)

    useEffect(() => {
        if (!cookie.username) {
            const newUsername = prompt("Entrez votre nom d'utilisateur :");
            setCookie("username", newUsername);
        }

        socket.on("gameStarted", ({ playerHand, opponentHand, playerDeck, opponentDeck }) => {
            setPlayerHand(playerHand);
            setOpponentHand(opponentHand);
            setPlayerDeck(playerDeck);
            setOpponentDeck(opponentDeck);
            setGameStarted(true);
        });

        socket.on("playCard", ({ player, card }) => {
            if (player === cookie.username) {
                const newHand = [...playerHand];
                newHand.splice(newHand.findIndex((c) => c.value === card.value && c.suit === card.suit), 1);
                setPlayerHand(newHand);
                setPlayerPile([...playerPile, card]);
            } else {
                const newHand = [...opponentHand];
                newHand.splice(newHand.findIndex((c) => c.value === card.value && c.suit === card.suit), 1);
                setOpponentHand(newHand);
                setOpponentPile([...opponentPile, card]);
            }
        })

        socket.on("win", (winner) => {
            setGameOver(true);
            setWinner(winner);
        });

        socket.on("roomsAvailable", (rooms) => {
            console.log("data game.jsx", rooms);
            rooms.forEach(room => {
                if (room.name === cookie.room) {
                    setPlayersList(room.players);
                }
            });

        });

        return () => {
            socket.disconnect();
        };
    }, [opponentHand, opponentPile, playerHand, playerPile, setCookie, socket, cookie.username, cookie.room]);

    const handlePlayCard = (card) => {
        socket.emit("playCard", { room: cookie.room, username: cookie.username, card });
    };

    const handleStartGame = () => {
        socket.emit("startGame", { room: cookie.room });
    };

    console.log("gameStarted", gameStarted)

    if (!gameStarted) {
        return (
            <div className="game-container">
                {playerList.length !== 2 ? (
                    <Button type="primary" onClick={handleStartGame}>
                        Commencer le jeu
                    </Button>
                ) : (
                    <p className="game-container-attente">En attente du deuxième joueur...</p>
                )}
            </div>
        );
    }

    return (
        <div className="game-container">
            <Row gutter={16}>
                <Col span={12}>
                    <Card title={cookie.username}>
                        {playerHand.map((card, index) => (
                            <Button key={index} type="primary" onClick={() => handlePlayCard(card)}>
                                {card.value} de {card.suit}
                            </Button>
                        ))}
                    </Card>
                    <Card title="Pile de cartes">
                        {playerPile.length > 0 ? (
                            playerPile.map((card, index) => (
                                <div key={index} className="pile-card">
                                    {card.value} de {card.suit}
                                </div>
                            ))
                        ) : (
                            <div className="empty-pile">
                                <SmileOutlined />
                                <div>La pile est vide</div>
                            </div>
                        )}
                    </Card>
                    <Card title="Deck">
                        {playerDeck.length > 0 ? (
                            <div>
                                <div>Nombre de cartes : {playerDeck.length}</div>
                                <Button onClick={() => alert("Fonctionnalité à implémenter")}>Piocher une carte</Button>
                            </div>
                        ) : (
                            <div>Vous n avez plus de cartes</div>
                        )}
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Adversaire">
                        {opponentHand.map((card, index) => (
                            <div key={index} className="opponent-card"></div>
                        ))}
                    </Card>
                    <Card title="Pile de cartes">
                        {opponentPile.length > 0 ? (
                            opponentPile.map((card, index) => (
                                <div key={index} className="pile-card">
                                    {card.value} de {card.suit}
                                </div>
                            ))
                        ) : (
                            <div className="empty-pile">
                                <SmileOutlined />
                                <div>La pile est vide</div>
                            </div>
                        )}
                    </Card>
                    <Card title="Deck">
                        {opponentDeck.length > 0 ? (
                            <div>
                                <div>Nombre de cartes : {opponentDeck.length}</div>
                                <div>Piocher une carte</div>
                            </div>
                        ) : (
                            <div>L adversaire n a plus de cartes</div>
                        )}
                    </Card>
                </Col>
            </Row>
            {gameOver && <Title level={2}>{winner === cookie.username ? "Vous avez gagné !" : "Vous avez perdu..."}</Title>}
        </div>
    );
};

export default Game;