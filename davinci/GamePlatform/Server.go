package main

import (
	"fmt"
	//	"strings"
	//	"golang.org/x/net/websocket"
)

type playerConnections struct {
	//最大玩家人数
	MaxPlayerNumber int

	//接受发来的信息
	broadcast chan *ConnMsg

	//玩家加入的连接信息
	playerJoin chan *Connection

	//玩家离开的连接信息
	playerLeave chan *Connection

	//游戏对局
	//	tables map[int]*table
}

var ConnSet = playerConnections{
	//	playerSets:      make(map[string]*Player),
	//	chatSets:        make(map[string]map[string]*Player),
	broadcast:       make(chan *ConnMsg),
	playerJoin:      make(chan *Connection),
	playerLeave:     make(chan *Connection),
	MaxPlayerNumber: 20,
	//	tables:          make(map[int]*table),
}

func (Con *playerConnections) run() {
	fmt.Println("PCRun!")
	for {
		//fmt.Println("PC", Con.playerConn, "len:", len(Con.playerConn))
		select {
		//有人加入
		case p := <-Con.playerJoin:
			fmt.Println("join", p)
			break
		//有人离开
		case p := <-Con.playerLeave:
			fmt.Println("leave", p)
			break
		//信息处理
		case m := <-Con.broadcast:
			fmt.Println(m.msg)
			msg := make(map[string]string)
			msg["123"] = "hahah"
			m.conn.send <- toJson(msg)
			break
		}
	}
}
