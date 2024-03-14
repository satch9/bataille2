// components/MyMenu.js
import { useState, useContext, useEffect, useCallback } from 'react';
import { Menu, Modal, Form, Input, Select, message } from 'antd';
import { HomeOutlined, PlusCircleOutlined, OrderedListOutlined, EllipsisOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import useUsernameCookie from '../hooks/useUsernameCookie';
import { SocketContext } from '../context/SocketContext';
import MenuItems from './MenuItems';

const MyMenu = () => {
  const { setUsername, setCookie } = useUsernameCookie();
  const socket = useContext(SocketContext);

  const [open, setOpen] = useState(false);
  const [openParams, setOpenParams] = useState(false);
  const [roomsFront, setRoomsFront] = useState([]);
  const [form] = Form.useForm();
  const [formParams] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const navigate = useNavigate();
  

  const info = useCallback((text) => {
    messageApi.info(text);
  }, [messageApi]);

  /* const handleLogout = () => {
    removeCookie("username");
    removeCookie("room");
    setUsername("");
  }; */

  const showModal = useCallback(() => { setOpen(true); }, []);

  const showModalParams = useCallback(() => { setOpenParams(true); }, []);


  useEffect(() => {
    const handleJoinedRoom = ({ roomName, username }) => {
      console.log(`User ${username} joined room ${roomName}`);
      const updatedRooms = roomsFront.map((room) => {
        if (room.name === roomName) {
          return { ...room, players: [...room.players, { name: username, joined: true }] };
        } else {
          return room;
        }
      });

      setRoomsFront(updatedRooms);
      setOpen(false);
      navigate("/game", { replace: false });
    }

    const handlePlayerJoined = ({ roomName, username, players }) => {
      info(`${username} joined the game in the room ${roomName}!`);
      const updatedRooms = roomsFront.map((room) => {
        if (room.name === roomName) {
          return { ...room, players };
        } else {
          return room;
        }
      });

      setRoomsFront(updatedRooms);
    }

    const handleRoomsAvailable = (data) => {
      setRoomsFront(data);
    }

    socket.on("joinedRoom", handleJoinedRoom);
    socket.on("playerJoined", handlePlayerJoined);
    socket.on("roomsAvailable", handleRoomsAvailable);

    return () => {
      socket.off("playerJoined", handlePlayerJoined);
      socket.off("joinedRoom", handleJoinedRoom);
      socket.off("roomsAvailable", handleRoomsAvailable);
    }
  }, [info, navigate, socket])

  const onJoinedGame = useCallback((values) => {
    console.log('Received values of form: ', values);
    setCookie("username", values.username);
    setUsername(values.username);
    setCookie("room", values.roomName);
    setOpen(false);
    socket.emit("joinRoom", { roomName: values.roomName, username: values.username }, (response) => {
      console.log("response", response);
      if (response !== null) {
        messageApi.error(response.error);
      } else {
        navigate("/game", { replace: false });
      }
    });
  }, [messageApi, navigate, setOpen, socket]);

  const onCreateParams = useCallback((values) => {
    console.log(values);
    console.log("socket", socket);
    socket.emit("createRoom", { roomName: values.roomName, creator: values.creator, numCards: parseInt(values.numCards) });
    socket.on("roomCreated", ({ created }) => {
      if (created === "ok") {
        formParams.resetFields();
        setOpenParams(false);
      }
    });
  }, [formParams, setOpenParams, socket]);

  //console.log("socket", socket);

  const handleAvailableGamesClick = useCallback(() => {
    if (roomsFront.length > 0) {
      showModal();
    } else {
      info("Il n'y a pas de jeux en cours pour le moment.");
    }
  }, [info, roomsFront, showModal]);



  const items = [
    { key: "home", label: "Home", icon: <HomeOutlined />, link: "/" },
    { key: "available-games", label: "Jeux Disponibles", icon: <OrderedListOutlined />, onClick: roomsFront.length > 0 ? showModal : handleAvailableGamesClick },
    { key: "create-game", label: "Créer", icon: <PlusCircleOutlined />, onClick: showModalParams },
  ];

  // Ajouter l'élément "Déconnexion" uniquement s'il y a un nom d'utilisateur
  /* if (username) {
    items.push({ key: "logout", label: "Déconnexion", icon: <LogoutOutlined />, onClick: handleLogout });
    items.push({ key: "game", label: "Mon Jeu", icon: <CarOutlined />, link: "/game" })
  }
 */

  return (
    <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} overflowedIndicator={<EllipsisOutlined />}>
      {contextHolder}
      {/* {items.map((item) => (

        <Menu.Item key={item.key} icon={item.icon} ellipsis="false" >
          {item.link ? (
            <Link to={item.link}>{item.label}</Link>
          ) : (
            <span onClick={item.onClick}>{item.label}</span>
          )}
        </Menu.Item>
      ))} */}
      <MenuItems 
        roomsFront={roomsFront} 
        handleAvailableGamesClick={handleAvailableGamesClick}
        showModalParams={showModalParams}
      />
      <Modal
        open={open && roomsFront.length > 0}
        title="♥ ♦ ♣ ♠"
        okText=". . . Rejoindre"
        cancelText="Annuler"
        onCancel={() => setOpen(false)}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              onJoinedGame(values);
              form.resetFields();
            })
            .catch((error) => {
              console.log('Validate Failed:', error);
            });
        }}
      >
        <Form form={form} layout="vertical" name="form_in_modal">
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Veuillez saisir votre nom d'utilisateur!" }]}
          >
            <Input placeholder="Nom d'utilisateur" />
          </Form.Item>
          <Form.Item
            name="roomName"
            rules={[{ required: true, message: "Veuillez choisir une salle de jeu!" }]}
          >
            <Select placeholder="Choisir une salle de jeu">
              {roomsFront.map((room) => (
                <Select.Option key={room.name} value={room.name}>
                  {room.name} - {room.players.length !== 0 ? room.players.filter((player) => player.joined).map((player) => player.name).join(', ') : `${room.players.length} joueurs`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={openParams}
        title="Paramètres"
        okText="Créer"
        cancelText="Annuler"
        onCancel={() => setOpenParams(false)}
        onOk={() => {
          formParams
            .validateFields()
            .then((values) => {
              onCreateParams(values);
              formParams.resetFields();
            })
            .catch((error) => {
              console.log('Validate Failed:', error);
            });
        }}
      >
        <Form form={formParams} layout="vertical" name="form_in_modal">
          <Form.Item
            name="roomName"
            rules={[{ required: true, message: "Veuillez saisir le nom de la salle!" }]}
          >
            <Input placeholder="Nom de la salle" />
          </Form.Item>
          <Form.Item
            name="creator"
            rules={[{ required: true, message: "Veuillez saisir votre nom d'utilisateur!" }]}
          >
            <Input placeholder="Nom d'utilisateur" />
          </Form.Item>
          <Form.Item
            name="numCards"
            rules={[
              { required: true, message: "Veuillez saisir le nombre de carte dans votre paquet!" },
            ]}
          >
            <Select placeholder="Choisir combien de cartes dans le paquet">
              <Select.Option value="32">32</Select.Option>
              <Select.Option value="52">52</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Menu>
  );
};



export default MyMenu;
