//
package main

import (
	"fmt"
	//	"log"
	"net/rpc"
	//	"reflect"
	//	"sync"
)

//游戏状态
type GameStatus int

const (
	waitForReady = iota
	startGame
	guessCard
	touchCard
	gameOver
)

//玩家状态
type playerStatus struct {
	ready  int
	winner bool
}

//玩家对象
type player struct {
	name      string
	status    playerStatus
	id        string
	grade     int
	inTable   int64
	touchCard *card
	seat      int
}

//玩家链接集合
type playerConnections struct {
	//所有玩家连接信息
	playerConn map[string]*player

	//最大玩家人数
	//MaxPlayerNumber int

	//接受发来的信息
	broadcast chan *Message

	//	//玩家加入的连接信息
	//	playerJoin chan *player

	//	//玩家离开的连接信息
	//	playerLeave chan *player

	//游戏对局
	tables map[int64]*table
}

var playerSet = playerConnections{
	playerConn: make(map[string]*player),
	broadcast:  make(chan *Message),
	//	playerJoin:  make(chan *player),
	//	playerLeave: make(chan *player),
	tables: make(map[int64]*table),
}

func (set *playerConnections) run() {
	fmt.Println("SetRun!")
	var tableNum int64 = 0 //对局数，同时作为对局索引key
	for {
		select {
		case p := <-set.broadcast:
			tempPlayer := set.playerConn[p.id]
			types, _ := p.content["Type"].(float64)

			if tempPlayer != nil && p.id != "" { //对局信息

				if types == RequestCancelMatching { //取消匹配
					if tempPlayer.inTable < 0 {
						continue
					} else {
						msg := make(map[string]interface{})
						if set.cancelMatching(p) {
							msg["Type"] = CancelMatchSuccess
						} else {
							msg["Type"] = CancelMatchFail
						}
						sendMsg(p.conn, toJson(msg), nil)
					}
				}

				if tempPlayer.inTable != -1 {
					set.tables[tempPlayer.inTable].broadcast <- p
					continue
				}

				if types == RequestStart { //匹配&进入房间
					if set.matchingPlayer(p, &tableNum) {
						msg := make(map[string]interface{})
						msg["Type"] = StartMatching
						sendMsg(p.conn, toJson(msg), nil)
					}
				}
			} else { //登录or注册
				//				fmt.Println("c:", p.content)
				user, _ := p.content["Uid"].(string)
				Psd, _ := p.content["Psd"].(string)
				if types == RequestLogin { //登录
					if checkAccount(user, Psd) {
						set.loginSuccess(p, user)
					} else {
						msg := make(map[string]interface{})
						msg["Type"] = LoginFailed
						sendMsg(p.conn, toJson(msg), nil)
					}
				}
			}

		}
	}
}

func createNewPlayer() {

}

type Player struct { //rpc通信
	P_id       int
	Name       string
	Key        string
	Grade      int
	GameStatus string
	HeadImage  string
}

func rpcLogin(args *Player) bool {
	clien, e := rpc.DialHTTP("tcp", "127.0.0.1:1338")
	if e != nil {
		panic(e)
	}

	var replay bool
	err := clien.Call("RpcLogin.PlayerLogin", args, &replay)
	if err != nil {
		panic(err)
	}
	fmt.Println("RpcLogin.PlayerLogin:", replay)
	return replay
}

func (set *playerConnections) loginSuccess(p *Message, Uid string) { //登录成功
	fmt.Println("loginSuccess!")
	tid := GetRandomString(15)
	pl := &player{
		status:    playerStatus{ready: 0, winner: false},
		id:        Uid,
		grade:     requireGrade(Uid),
		inTable:   -1,
		touchCard: nil,
		name:      Uid,
	}

	r := &Player{
		P_id:       getPid(Uid),
		Name:       Uid,
		Key:        tid,
		Grade:      pl.grade,
		GameStatus: "free",
		HeadImage:  "head1",
	}

	rpcLogin(r)

	fmt.Println("ok", pl)
	set.playerConn[tid] = pl

	msg := make(map[string]interface{})
	msg["Type"] = LoginSuccess
	msg["ID"] = tid
	msg["Grade"] = pl.grade
	msg["Token"] = ""
	sendMsg(p.conn, toJson(msg), nil)
}

func sendMsg(p *Connection, m []byte, t *table) { //发送信息
	select {
	case p.send <- m:
		//fmt.Println("borad", m, p)
	default:
		//		if t == nil {
		//			return
		//		}
		//		for n := range t.playerConnection {
		//			if t.playerConnection[n] == p {
		//				delete(t.playerConnection, n)
		//			}
		//		}
		close(p.send)
	}

}

func (set *playerConnections) matchingPlayer(p *Message, tableNum *int64) bool { //匹配
	for i := range set.tables {
		if set.lockAndAddTablePlayer(i) { //找到空房间
			temptable := set.tables[i]
			temptable.playerID[temptable.playerNumber] = set.playerConn[p.id]
			set.playerConn[p.id].seat = temptable.playerNumber
			set.playerConn[p.id].inTable = i
			fmt.Println("join table", i)
			TableMutex.Unlock()
			return true
		}
	}
	if set.playerConn[p.id].inTable == -1 { //创建空房间
		*tableNum = set.lockAndCreateTable(*tableNum)
		set.tables[*tableNum].playerID[1] = set.playerConn[p.id]
		set.playerConn[p.id].seat = 1
		set.playerConn[p.id].inTable = *tableNum
		fmt.Println("creat table", *tableNum)
		go set.tables[*tableNum].run()
		CreateMutex.Unlock()
	}
	return true
}

func (set *playerConnections) cancelMatching(p *Message) bool { //取消匹配
	initTable.Lock()
	defer initTable.Unlock()

	fmt.Println("cancelMatch")
	var players *player = set.playerConn[p.id]
	var tempTable *table = set.tables[players.inTable]
	if tempTable.gameStatus == waitForReady {
		fmt.Println(players.name, " leave")
		delete(tempTable.playerID, players.seat)
		tempTable.playerNumber--
		players.inTable = -1
		return true
	} else {
		return false
	}
}
