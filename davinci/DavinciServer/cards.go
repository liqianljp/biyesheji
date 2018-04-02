package main

//卡牌相关数据结构
import (
	"fmt"
	_ "fmt"
	//	"fmt"
	//	"math/rand"
	//	"strconv"
	//	"strings"
	"time"
)

//卡牌信息
////枚举颜色
//type Suit int

//const (
//	black = iota
//	white
//)

type Status int

const (
	Unknow = iota
	Seen
	blind
)

type card struct {
	//卡牌数值
	CardPoint int

	//卡牌颜色
	CardSuit string

	//卡牌位置
	Position int

	//卡牌状态，是否明牌
	CardStatus Status
}

type guessStatus struct { //记录猜牌状态json格式
	Type      float64
	Seat      int
	GuessSeat int
	Result    bool
	TimeOut   bool
	GuessCard card
	Card      card
	Tcard     card
	Loser     int
	Round     int
}
type winnerStatus struct { //记录胜利信息json格式
	Type    float64
	PWinner string
	SWinner int
	Hands   []card
	Seat    int
	Card    card
}

//type guessTurnChange struct{
//	change bool

//}

type startPlayerJson struct {
	Uid   string
	Grade int
	Card  []card
	Seat  int
}

type jokerCard struct {
	CardRef  card
	SimPoint int
	Player   *player
}

//洗牌
func shuffle() []card {
	//重新创建22张牌
	ca := make([]card, 24)
	for i, _ := range ca {
		ca[i].CardPoint = i%12 + 1
		if i/12 < 1 {
			ca[i].CardSuit = "black"
		} else {
			ca[i].CardSuit = "white"
		}
		ca[i].Position = 0
		ca[i].CardStatus = Unknow
	}
	//乱序
	for i, _ := range ca {
		ra := time.Now().UnixNano()
		//		fmt.Println(ra)
		x := ra % 24
		var temp card
		temp = ca[x]
		ca[x] = ca[i]
		ca[i] = temp
	}

	for i := 0; i < 12; i++ {
		if ca[i].CardPoint == 12 {
			ca = shuffle()
			break
		}
	}
	return ca
}

//排序
//对ca的n-m位的牌进行排序并赋予卡牌位置信息
func cardSort(ca []card, n int, m int) []card {
	newcard := make([]card, m-n)
	for i := n; i < m; i++ {
		newcard[i-n] = ca[i]
	}
	i, j := n, n
	for i = n; i < m; i++ {
		var temp card = newcard[i-n]
		for j = i - 1; j > n-1; j-- {
			if (temp.CardPoint < newcard[j-n].CardPoint) || (temp.CardPoint == newcard[j-n].CardPoint && temp.CardSuit < newcard[j-n].CardSuit) {
				newcard[j-n+1] = newcard[j-n]
			} else {
				break
			}
		}
		newcard[j-n+1] = temp
	}
	for i := n; i < m; i++ {
		newcard[i-n].Position = i - n + 1
	}

	return newcard
}

//摸牌
//
func (t *table) cardTouch(id *player) {
	if t.currentCard >= 24 {
		t.touchCard = nil
		return
	} else {
		t.currentCard++
	}
	//	ca := make([]card, 1)
	ca := t.pcards[t.currentCard-1]
	if ca.CardSuit == "white" {
		t.restcard["white"]--
	} else {
		t.restcard["black"]--
	}
	tempHands := cardSort(append(t.hands[id], ca), 0, len(t.hands[id])+1)
	if ca.CardPoint == 12 { //Joker牌处理
		t.JokerCard[ca.CardSuit] = jokerCard{
			CardRef:  ca,
			SimPoint: 12,
		}
	}
	t.setJokerCard(tempHands)
	t.hands[id] = tempHands

	for i := range t.hands[id] {
		if t.hands[id][i].CardPoint == ca.CardPoint && t.hands[id][i].CardSuit == ca.CardSuit {
			t.touchCard = &t.hands[id][i]
		}
	}
	//	fmt.Println("touch:", t.touchCard, ca[0], " hands:", t.hands)
	//	str := strings.Join(cardString(ca), ",")
	//	msg := []byte(str)
	//	//fmt.Println(msg)
	//	sendMsg(p, msg, "tcard", t)

	//	rest := string(strconv.Itoa(t.restcard[black]) + "," + strconv.Itoa(t.restcard[white])) //发送剩余卡牌数量
	//	for p := range t.playerConnection {
	//		sendMsg(t.playerConnection[p], []byte(rest), "restcard", t)
	//	}
}

func (t *table) putCard(players *player) { //发牌
	t.pcards = shuffle() //洗牌并初始化各个参数
	cardNum := 3
	i := 0
	ca := t.pcards
	t.currentCard = 0
	for n := range t.playerID {

		tempCard := make([]card, cardNum, 12)
		tempca := cardSort(ca, i, i+cardNum)
		for j := range tempca {
			tempCard[j] = tempca[j]
			if tempca[j].CardSuit == "white" {
				t.restcard["white"]--
			} else {
				t.restcard["black"]--
			}
		}
		t.hands[t.playerID[n]] = tempCard

		i += cardNum
		t.currentCard = i
	}
}

func (t *table) setJokerCard(hands []card) { //存放万能牌
	fmt.Println("setjc")
	for sub := range t.JokerCard {
		jcard := t.JokerCard[sub]
		for i := range hands {
			if jcard.CardRef.CardPoint == hands[i].CardPoint && jcard.CardRef.CardSuit == hands[i].CardSuit {
				if jcard.SimPoint == 12 {
					fmt.Println("no change hands:", hands, " jcard:", jcard)
					break
				} else {
					j := 0
					for ; hands[j].CardPoint < jcard.SimPoint; j++ {
					}
					temp := hands[i]
					for ; i > j; i-- {
						hands[i] = hands[i-1]
						hands[i].Position = i + 1
					}
					hands[j] = temp
					hands[j].Position = j + 1
					t.touchCard = &hands[j]
					jcard.CardRef = hands[j]
					fmt.Println("hands:", hands, " jcard:", jcard)
					break
				}
			}
		}
	}
}
