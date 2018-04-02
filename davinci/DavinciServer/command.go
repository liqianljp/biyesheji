//命令
package main

import (
	"fmt"
	"math/rand"
	"time"
)

func (t *table) Command(p *Message) {
	content := p.content
	types := content["Type"].(float64)
	players := playerSet.playerConn[p.id] //当前所处理的轮讯玩家
	switch types {
	case RequestStartInfo: //请求开始游戏
		{
			initTable.Lock()
			if t.playerNumber < 4 && t.gameStatus == waitForReady {
				msg := make(map[string]interface{})
				msg["Type"] = ContinueMatch
				sendMsg(p.conn, toJson(msg), nil)
				initTable.Unlock()
				return
			}

			if len(t.pcards) == 0 || len(t.hands) == 0 { //检测&发牌代码&初始化数据
				t.gameStatus = startGame
				t.JokerCard = make(map[string]jokerCard)
				t.online = make(map[int]bool)
				t.offline = make(map[int]bool)
				t.timeOut = make(map[int]bool)
				t.restcard["white"] = 12
				t.restcard["black"] = 12
				t.putCard(players)
				r := rand.New(rand.NewSource(time.Now().UnixNano()))
				x := r.Intn(t.playerNumber) + 1
				t.currentPlayer = t.playerID[x]
				t.cardTouch(t.currentPlayer)
				go t.setTimer(60)
				for i := range t.playerID {
					//					t.guarantee[t.playerID[i]] = false
					t.timeOut[i] = false
				}
				t.ChatKey = GetRandomString(9)
				go t.setGuessTimer(t.currentPlayer.seat, 60, t.round)
			}
			initTable.Unlock()

			msg := make(map[string]interface{}) //待发信息
			oppPlayer := make([]startPlayerJson, 0, 3)
			mcard := make([]card, 0, 4)
			//var n int = 0
			//fmt.Println("playerID", t.playerID)
			for i := range t.playerID {
				if t.currentPlayer == t.playerID[i] {
					msg["Touchp"] = i
				}
				if t.playerID[i] == players {
					msg["Mseat"] = i
					for j := range t.hands[players] {
						if t.hands[players][j] == *t.touchCard {
							continue
						}
						mcard = append(mcard, t.hands[players][j])
						continue
					}
				}
				//fmt.Printf(" a")
				tempCard := make([]card, 0, 24)
				for j := range t.hands[t.playerID[i]] {
					if t.hands[t.playerID[i]][j] == *t.touchCard {
						continue
					}
					tempCard = append(tempCard, t.hands[t.playerID[i]][j])
				}
				for j := range tempCard {
					tempCard[j].CardPoint = 0
				}
				//fmt.Printf(" b")
				oppPlayer = append(oppPlayer, startPlayerJson{
					Uid:   t.playerID[i].id,
					Grade: t.playerID[i].grade,
					Card:  tempCard,
					Seat:  i,
				})
				//fmt.Printf(" c")
				//fmt.Println(" d", oppPlayer)
				//n++
			}
			temp := *t.touchCard
			if players != t.currentPlayer {
				temp.CardPoint = 0
			}
			msg["Type"] = StartGame
			msg["OppPlayer"] = oppPlayer
			msg["Mcard"] = mcard
			msg["Tcard"] = temp
			msg["Key"] = t.ChatKey
			msg["RestCard"] = t.restcard
			//fmt.Println(msg, " xxxx ", t.playerID, " xxxxx ")
			sendMsg(p.conn, toJson(msg), nil)

			break
		}
	case RequestOnline: //轮讯在线请求
		{
			if t.offline[players.seat] {
				msg := make(map[string]interface{})
				msg["Type"] = Offline
				sendMsg(p.conn, toJson(msg), t)
			}
			onlinemapRWMutex.Lock()
			t.online[players.seat] = true
			onlinemapRWMutex.Unlock()
			msg := make(map[string]interface{})
			msg["Type"] = Online
			sendMsg(p.conn, toJson(msg), t)
			break
		}
	case RequestGuess: //猜牌请求
		{
			if players != t.currentPlayer {
				fmt.Println("other player guess")
				return
			}
			seat := int(content["Seat"].(float64))
			tempjson := content["Card"].(map[string]interface{})
			tempCard := JCard(tempjson)
			if tempCard.Position < 1 || tempCard.Position > len(t.hands[t.playerID[seat]]) { //检测错误位置信息
				fmt.Println("posi", tempCard.Position)
				return
			}

			guaranteeRWMutex.Lock()
			t.judgeGuess(seat, p, players, tempCard) //判断方法
			guaranteeRWMutex.Unlock()

			break
		}
	case RequestGuessStatus: //轮讯猜牌情况
		{
			Round := int(content["Round"].(float64))
			if Round == 0 {
				fmt.Println("round0")
				return
			}
			guaranteeRWMutex.Lock()
			timeOutRWMutex.Lock()
			//			fmt.Println("status: ", t.gStatus, " guar:", t.guarantee[players], " timeout:", t.timeOut[t.currentPlayer.seat], " P:", players.seat, " cp:", t.currentPlayer.seat)
			if len(t.gStatus) < Round+1 /*|| t.guarantee[players]*/ {
				if ((len(t.gStatus) < Round+1 && t.timeOut[t.currentPlayer.seat]) || (len(t.gStatus) >= Round+1 && t.gStatus[Round].TimeOut)) && !t.guarantee[players] {
					tempCard := card{
						CardPoint:  0,
						CardSuit:   "black",
						Position:   0,
						CardStatus: 0,
					}
					t.judgeGuess(t.currentPlayer.seat, p, t.currentPlayer, tempCard)
				} else {
					//					fmt.Println(players.seat, " no info")
					msg := make(map[string]interface{})
					msg["Type"] = NoGuessInfo
					msg["Round"] = t.round
					sendMsg(p.conn, toJson(msg), t)
				}
				guaranteeRWMutex.Unlock()
				timeOutRWMutex.Unlock()
				return
			}
			//			t.guarantee[players] = true
			guaranteeRWMutex.Unlock()
			timeOutRWMutex.Unlock()

			if t.getWinner(p, t.gStatus[Round].Seat, t.gStatus[Round].Card, players) { //判断胜利条件
				fmt.Println("winner")
				return
			}

			if t.gStatus[Round].Result {
				tempCard := *t.gStatus[Round]
				tempCard.Tcard.CardPoint = 0
				sendMsg(p.conn, toJson(tempCard), t)
			} else {
				tempCard := *t.gStatus[Round]
				tempCard.Card.CardPoint = 0
				sendMsg(p.conn, toJson(tempCard), t)
			}

			//			var num int = 0
			//			guaranteeRWMutex.Lock()
			//			for i := range t.guarantee {
			//				if t.guarantee[i] {
			//					num++
			//					if num >= len(t.guarantee) {
			//						fmt.Println("gStatus=0")
			//						t.gStatus[] = nil
			//					}
			//				}
			//			}
			//			fmt.Println("Num:", num)
			//			guaranteeRWMutex.Unlock()
			break
		}
	case RequestContinueGuess: //是否继续猜牌
		{
			if t.currentPlayer != players {
				fmt.Println("error man")
				return
			}

			c := content["ToContinue"].(bool)
			//			if c {
			//				t.conti++
			//			}
			fmt.Println("toContinue:", t.conti)
			if c {
				fmt.Println("Continue Guess")
				//继续猜牌
				if players == t.currentPlayer {
					go t.setGuessTimer(t.currentPlayer.seat, 50, t.round)
				}
				msg := make(map[string]interface{})
				msg["Type"] = ContinueGuess
				t.currentPlayer = players
				sendMsg(p.conn, toJson(msg), t)
			} else {
				fmt.Println("Give Up Guess")
				//放弃继续猜牌
				msg := make(map[string]interface{})
				if t.getWinner(p, t.currentPlayer.seat, t.gStatus[t.round].Card, players) { //判断胜利条件
					fmt.Println("winner")
					return
				}
				t.changeTurn()

				if t.touchCard != nil {
					msg["Tcard"] = *t.touchCard
				}
				msg["Type"] = NextTurn
				msg["Touchp"] = t.currentPlayer.seat
				msg["RestCard"] = t.restcard

				sendMsg(p.conn, toJson(msg), t)
			}
			t.lastPlayer = players
			break
		}
	case RequestTurnChange: //轮讯回合切换内容
		{
			msg := make(map[string]interface{})
			if t.lastPlayer == nil {
				fmt.Println("why now??")
				msg["Type"] = NoNextTurn
				sendMsg(p.conn, toJson(msg), t)
				return
			}

			if t.lastPlayer == t.currentPlayer {
				//继续猜牌
				msg["Type"] = ContinueGuess
				sendMsg(p.conn, toJson(msg), t)
				if t.gStatus[t.round] == nil {
					//					fmt.Println("gStatus[", t.round, "] = nil")
					//					guaranteeRWMutex.Lock()
					//					for i := range t.guarantee {
					//						t.guarantee[i] = false
					//					}
					//					guaranteeRWMutex.Unlock()
				}
				//				t.lastPlayer = nil
			} else {
				//下一回合
				if t.touchCard != nil {
					temp := *t.touchCard
					if players != t.currentPlayer {
						temp.CardPoint = 0
					}
					msg["Tcard"] = temp
				}

				msg["Type"] = NextTurn
				msg["Touchp"] = t.currentPlayer.seat
				msg["RestCard"] = t.restcard

				sendMsg(p.conn, toJson(msg), t)
				//				t.lastPlayer = nil
			}
			break
		}
	case RequestJokerCard:
		{
			simPoint := int(content["SimPoint"].(float64))
			suit := content["Suit"].(string)
			joker := t.JokerCard[suit]
			joker.SimPoint = simPoint
			joker.Player = players
			t.JokerCard[suit] = joker

			msg := make(map[string]interface{})
			msg["Type"] = JokerCardSucc
			sendMsg(p.conn, toJson(msg), t)
			//			fmt.Println("SimPoint:", simPoint, " Suit:", suit)
		}
	default:
	}

}

func (t *table) judgeGuess(seat int, p *Message, players *player, tempCard card) { //判断猜牌结果
	t.lastPlayer = nil
	t.round++
	//	fmt.Println("round:", t.round, " gStatus:", t.gStatus)
	fmt.Println("judge Guess")

	if t.touchCard != nil && t.touchCard.CardPoint == 12 {
		t.setJokerCard(t.hands[players])
	}
	//	for i := range t.guarantee { //锁在外部
	//		t.guarantee[i] = false
	//	}
	var guessc card = card{
		CardPoint:  0,
		CardSuit:   "",
		CardStatus: 0,
	}
	if tempCard.Position != 0 {
		guessc = t.hands[t.playerID[seat]][tempCard.Position-1]
		t.gStatus = append(t.gStatus, &guessStatus{
			Type:      GuessInfo,
			Seat:      seat,
			GuessSeat: players.seat,
			Result:    true,
			GuessCard: tempCard,
			Card:      guessc,
			Loser:     0,
			TimeOut:   t.timeOut[players.seat],
			Round:     t.round,
		})
		if t.touchCard != nil {
			t.gStatus[t.round].Tcard = *t.touchCard
		}
	}
	if guessc.CardPoint != 0 && guessc.CardPoint == tempCard.CardPoint && guessc.CardStatus != Seen {
		//正确
		t.hands[t.playerID[seat]][tempCard.Position-1].CardStatus = Seen
		fmt.Println("RIGHT!", *t.gStatus[t.round])
		if t.judgeLoser(seat) { //判断为负
			t.gStatus[t.round].Loser = seat
		}
		if t.getWinner(p, t.gStatus[t.round].Seat, t.gStatus[t.round].Card, players) { //判断胜利条件
			fmt.Println("winner")
			return
		}

		sendMsg(p.conn, toJson(*t.gStatus[t.round]), t)
	} else {
		//错误
		t.lastPlayer = players
		if t.touchCard != nil {
			t.touchCard.CardStatus = Seen
		}
		var temp guessStatus
		if len(t.gStatus) > t.round {
			t.gStatus[t.round].Result = false
			temp = *t.gStatus[t.round]
			temp.Card.CardPoint = 0
		} else {
			t.gStatus = append(t.gStatus, &guessStatus{
				Type:      GuessInfo,
				Seat:      seat,
				GuessSeat: players.seat,
				Result:    false,
				GuessCard: tempCard,
				Card:      guessc,
				Loser:     0,
				TimeOut:   t.timeOut[players.seat],
				Round:     t.round,
			})
			//			fmt.Println("t.gStatus:", t.gStatus, " len:", len(t.gStatus))
			if t.touchCard != nil {
				//				fmt.Println("round:", t.round, " tcard:", *t.touchCard)
				t.gStatus[t.round].Tcard = *t.touchCard
			}
			temp = *t.gStatus[t.round]
		}
		if t.getWinner(p, t.gStatus[t.round].Seat, t.gStatus[t.round].Card, players) { //判断胜利条件
			fmt.Println("winner")
			return
		}

		sendMsg(p.conn, toJson(temp), t)
		//		fmt.Println("players:", players.seat, " msg:", temp)
		t.changeTurn()
	}
	//	t.guarantee[players] = true
}

func (t *table) setTimer(i time.Duration) { //离线计时器
	timer := time.NewTicker(i * time.Second) //轮讯时间
	onlinemapRWMutex.Lock()
	for o := range t.online {
		t.online[o] = true
		t.offline[o] = true
	}
	onlinemapRWMutex.Unlock()
	for {
		select {
		case <-timer.C:
			for o := range t.online {
				onlinemapRWMutex.Lock()
				if !t.online[o] { //判定离线
					t.offline[o] = false
					//					t.loser[o] = true
					//					fmt.Print(t.playerID[o], "offline")
				} else { //仍然在线
					t.online[o] = false
				}
				onlinemapRWMutex.Unlock()
			}
		}
	}
}

func (t *table) setGuessTimer(seat int, i time.Duration, turn int) { //猜牌计时器
	timer := time.NewTicker(i * time.Second)
	timeOutRWMutex.Lock()
	t.timeOut[seat] = false
	timeOutRWMutex.Unlock()
	fmt.Println("set timer~!")
	select {
	case <-timer.C:
		if /*t.currentPlayer.seat == seat && (t.lastPlayer != t.currentPlayer || t.conti > 0) && */ turn == t.round {
			//			if t.conti > 0 {
			//				t.conti--
			//				fmt.Println("toContinue:", t.conti)
			//			}
			timeOutRWMutex.Lock()
			t.timeOut[seat] = true
			timeOutRWMutex.Unlock()
			fmt.Println(seat, " Time out")
			//			guaranteeRWMutex.Lock()
			//			for i := range t.guarantee {
			//				t.guarantee[i] = false
			//			}
			//			guaranteeRWMutex.Unlock()
		}
		break
	}
	//	fmt.Println("??????????")
}

func (t *table) changeTurn() { //切换回合
	for i := 1; i <= t.playerNumber; i++ {
		if t.playerID[i] == t.currentPlayer {
			if i == t.playerNumber {
				t.currentPlayer = t.playerID[1]
			} else {
				t.currentPlayer = t.playerID[i+1]
			}

			if t.loser[t.currentPlayer.seat] {
				t.changeTurn()
				return
			} else {
				t.cardTouch(t.currentPlayer)
			}
			break
		}
	}
	go t.setGuessTimer(t.currentPlayer.seat, 50, t.round)
	fmt.Println("HANDS!!!:", t.hands)
}
func (t *table) judgeLoser(se int) bool { //失败判断
	var players *player = t.playerID[se]
	for i := range t.hands[players] {
		if t.hands[players][i].CardStatus != Seen {
			return false
		}
	}
	t.loser[se] = true
	return true
}
func (t *table) getWinner(p *Message, gseat int, c card, players *player) bool { //胜利条件判定
	if t.winnerMsg == nil {
		if len(t.loser) < t.playerNumber-1 {
			return false
		} else if len(t.loser) == t.playerNumber-1 {
			var winner *player
			for i := range t.playerID {
				if !t.loser[i] {
					winner = t.playerID[i]
					break
				}
			}
			t.winnerMsg = &winnerStatus{
				Type:    GameOver,
				PWinner: winner.name,
				SWinner: winner.seat,
				Hands:   t.hands[winner],
				Seat:    gseat,
				Card:    c,
			}
			fmt.Println(increaseGrade(winner.name, 30))
			for i := range t.playerID {
				if i != winner.seat {
					fmt.Println(increaseGrade(t.playerID[i].name, -10))
				}
			}
			fmt.Println(winner.name, " win!")
		} else {

		}
	}

	//	msg := make(map[string]interface{})
	//	msg["Type"] = GameOver
	//	msg["PWinner"] = winner.name
	//	msg["SWinner"] = winner.seat
	//	msg["Hands"] = t.hands[winner]
	//	msg["Seat"] = gseat
	//	msg["Card"] = c
	sendMsg(p.conn, toJson(*t.winnerMsg), t)

	delete(t.hands, players)
	delete(t.guarantee, players)
	delete(t.online, players.seat)
	delete(t.offline, players.seat)
	delete(t.timeOut, players.seat)
	delete(t.loser, players.seat)
	delete(t.playerID, players.seat)
	if len(t.playerID) < 1 {
		fmt.Println("table close")
		t.closeTable <- string("close")
		delete(playerSet.tables, players.inTable)
	}
	players.inTable = -1
	players.seat = 0
	return true

}
