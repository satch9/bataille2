import React from 'react';
import { Menu } from 'antd';
import { HomeOutlined, PlusCircleOutlined, OrderedListOutlined } from '@ant-design/icons';
import { Link, useLocation  } from 'react-router-dom';



const MenuItems = ({roomsFront, handleAvailableGamesClick,showModalParams}) => {
    const location =useLocation();
    console.log("location",location);
    console.log("roomsFront", roomsFront);

    const items = [
        { key: "home", label: "Home", icon: <HomeOutlined />, link: "/" },
        { key: "available-games", label: "Jeux Disponibles", icon: <OrderedListOutlined />, onClick: roomsFront.length > 0 ? showModal : handleAvailableGamesClick },
        { key: "create-game", label: "Créer", icon: <PlusCircleOutlined />, onClick: showModalParams },
    ];
    
    const itemsGame = [
        { key: "home", label: "Home", icon: <HomeOutlined />, link: "/" },
    ];

    return (
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} overflowedIndicator={<OrderedListOutlined />}>
            {items.map((item) => (

                <Menu.Item key={item.key} icon={item.icon} ellipsis="false" >
                    {item.link ? (
                        <Link to={item.link}>{item.label}</Link>
                    ) : (
                        <span onClick={item.onClick}>{item.label}</span>
                    )}
                </Menu.Item>
            ))}
        </Menu>
    );

};


export default MenuItems;