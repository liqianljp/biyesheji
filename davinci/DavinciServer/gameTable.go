//一局游戏的运行
package main

import (
	"fmt"
)

//游戏对局桌子
type table struct {
	//桌子上已有的玩家id
	playerID map[int]*player

	//接受发来的信息
	broadcast chan *Message

	//关闭房间
	closeTable chan string

	//当前玩家人数
	playerNumber int

	//当前操作玩家
	currentPlayer *player
	//
	lastPlayer *player

	//玩家手牌
	hands map[*player][]card

	//牌堆
	pcards []card

	//剩余牌
	restcard map[string]int

	//当前摸牌位置
	currentCard int

	//暂存连接
	tempPlayer *Connection

	//游戏状态
	gameStatus GameStatus

	//暂存摸牌信息
	touchCard *card

	//在线情况
	online  map[int]bool
	offline map[int]bool
	timeOut map[int]bool

	//上次猜牌情况
	gStatus []*guessStatus

	//输家
	loser map[int]bool

	//保证信息接受
	guarantee map[*player]bool

	//聊天服务器编号
	ChatKey string

	//是否继续猜牌（信号量）
	conti int

	//胜利信息
	winnerMsg *winnerStatus

	//回合数
	round int

	//Joker
	JokerCard map[string]jokerCard
}

func createTable() *table {
	//设置初始桌子
	t := &table{
		playerID:     make(map[int]*player),
		playerNumber: 0,
		broadcast:    make(chan *Message),
		closeTable:   make(chan string),
		hands:        make(map[*player][]card),
		pcards:       make([]card, 24),
		currentCard:  0,
		restcard:     make(map[string]int),
		gStatus:      make([]*guessStatus, 1, 40),
		lastPlayer:   nil,
		loser:        make(map[int]bool),
		guarantee:    make(map[*player]bool),
		conti:        0,
		round:        0,
		gameStatus:   waitForReady,
	}
	go t.run()
	return t
}

func (t *table) run() {
	fmt.Println("Run!")
	for {
		select {
		case m := <-t.broadcast:
			//	fmt.Println("save!", m)
			//			judgeCommand(m.conn, m.msg, t)
			//fmt.Println("judegCommand", m)
			t.Command(m)
		case n := <-t.closeTable:
			fmt.Println("table close")
			fmt.Println(n)
			return
		}
	}
}
