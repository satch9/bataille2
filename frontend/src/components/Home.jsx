import { Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

const Home = () => {
    return (
        <div className="home-container">
            <Card className="home-card">
                <Typography>
                    <Title>Bienvenue sur le jeu de cartes la Bataille !</Title>
                    <Paragraph>
                        Le jeu de cartes la Bataille est un jeu simple où deux joueurs s affrontent. Chaque joueur reçoit la moitié du
                        paquet de cartes. Les cartes sont retournées une par une, et le joueur qui a la carte la plus forte gagne la
                        manche. Si les cartes sont de valeurs égales, cela signifie qu il y a bataille, et les joueurs doivent alors
                        poser trois cartes face cachée et en retourner une quatrième. Celui qui a la carte la plus forte gagne la
                        manche. Le gagnant est celui qui remporte toutes les cartes de son adversaire.
                    </Paragraph>
                </Typography>
            </Card>
        </div>
    );
};

export default Home;