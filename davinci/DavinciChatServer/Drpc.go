package main

import (
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/rpc"
)

type Player struct {
	Conn       *Connection
	P_id       int
	Name       string
	Seat       int
	Key        string
	Grade      int
	GameStatus string
	HeadImage  string
}
type Friends struct {
	Name       string
	GameStatus string
	HeadImage  string
	P_id       int
	Grade      int
}

type RpcLogin int
type RpcPlayTogether int

func DrpcControl() {
	fmt.Println("rpc start")
	rpcLogin := new(RpcLogin)
	rpc.Register(rpcLogin)
	rpc.HandleHTTP()
	l, err := net.Listen("tcp", ":1338")
	checkErr(err)
	http.Serve(l, nil)
}

func (t *RpcLogin) PlayerLogin(pl *TempPlayer, reply *bool) error {
	fmt.Println(pl)
	if ConnSet.playerSets[pl.Key] == nil {
		ConnSet.playerSets[pl.Key] = &Player{
			P_id:       pl.P_id,
			Name:       pl.Name,
			Key:        pl.Key,
			Grade:      pl.Grade,
			GameStatus: pl.GameStatus,
			HeadImage:  pl.HeadImage,
		}
		*reply = true
	} else {
		*reply = false
		panic(errors.New("same Key"))
	}
	fmt.Println("rpc login ", ConnSet.playerSets[pl.Key])
	return nil
}

type TempPlayer struct {
	P_id       int
	Name       string
	Key        string
	Grade      int
	GameStatus string
	HeadImage  string
}
