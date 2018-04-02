package main

import (
	"fmt"
	//	"strings"
	//	"golang.org/x/net/websocket"
)

type playerConnections struct {
	//所有玩家连接信息
	playerSets map[string]*Player

	//聊天玩家连接信息
	chatSets map[string]map[string]*Player

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
	playerSets:      make(map[string]*Player),
	chatSets:        make(map[string]map[string]*Player),
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
		//		case p := <-Con.playerJoin:
		//			break
		//有人离开
		case p := <-Con.playerLeave:
			for i := range Con.chatSets {
				for j := range Con.chatSets[i] {
					if Con.chatSets[i][j].Conn == p {
						delete(Con.chatSets[i], j)
						fmt.Println("delete ", j)
						if len(Con.chatSets[i]) == 0 {
							delete(Con.chatSets, i)
							fmt.Println("delete set ", j)
						}
					} else {
						msg := make(map[string]interface{})
						msg["Type"] = 10049
						msg["Name"] = p.name
						msg["Mseat"] = p.seat
						if Con.chatSets[i] != nil && Con.chatSets[i][j] != nil {
							Con.chatSets[i][j].Conn.send <- toJson(msg)
						}
					}
				}
			}
			for i := range Con.playerSets {
				if Con.playerSets[i].Conn == p {
					playerSetLock.Lock()
					delete(Con.playerSets, i)
					playerSetLock.Unlock()
					fmt.Println("delete ", i)
				}
			}
			break
		//信息处理
		case m := <-Con.broadcast:
			//			fmt.Println(byteString(m.msg))
			fmt.Println(string(m.msg))
			fmt.Println(m.msg)
			var context map[string]interface{}
			if m.msg != nil && len(m.msg) > 0 {
				context = JMessage(m.msg)
			} else {
				break
			}
			types, _ := context["Type"].(float64)
			if types == 10041 {
				id, _ := context["Id"].(string)
				name, _ := context["Name"].(string)

				playerSetLock.Lock()
				if Con.playerSets[id] == nil { //rpc要先传入聊天服务器，此处为未接到游戏服务器的rpc登录信息
					msg := make(map[string]interface{})
					msg["Type"] = 10050
					m.conn.send <- toJson(msg)
					break
				}
				Con.playerSets[id].Conn = m.conn
				Con.playerSets[id].Name = name
				msg := make(map[string]interface{})
				msg["Type"] = 10043
				m.conn.send <- toJson(msg)
				m.conn.player = ConnSet.playerSets[id]

				playerSetLock.Unlock()
			} else if types == 10040 { //加入聊天室
				id, _ := context["Id"].(string)
				key, _ := context["Key"].(string)
				name, _ := context["Name"].(string)
				seat := int(context["Mseat"].(float64))

				playerSetLock.Lock()

				if Con.playerSets[id] == nil || Con.playerSets[id].Conn != m.conn { //rpc要先传入聊天服务器，此处为未接到游戏服务器的rpc登录信息
					msg := make(map[string]interface{})
					msg["Type"] = 10050
					m.conn.send <- toJson(msg)
					break
				}

				if Con.chatSets[key] != nil {
					Con.chatSets[key][id] = Con.playerSets[id]
				} else {
					Con.chatSets[key] = make(map[string]*Player)
					Con.chatSets[key][id] = Con.playerSets[id]
				}

				Con.playerSets[id].Seat = seat
				m.conn.name = name
				m.conn.seat = seat
				fmt.Println("house ", key)
				msg := make(map[string]interface{})
				msg["Type"] = 10042
				msg["Name"] = name
				msg["Mseat"] = seat
				jmsg := toJson(msg)
				for i := range Con.chatSets[key] {
					if Con.chatSets[key][i].Conn != m.conn {
						Con.chatSets[key][i].Conn.send <- jmsg
					}
					rmsg := make(map[string]interface{})
					rmsg["Type"] = 10042
					rmsg["Name"] = Con.chatSets[key][i].Name
					rmsg["Mseat"] = Con.chatSets[key][i].Seat
					m.conn.send <- toJson(rmsg)
				}

				playerSetLock.Unlock()
			} else if types == 10045 { //聊天
				name, _ := context["Name"].(string)
				text, _ := context["Text"].(string)
				key, _ := context["Key"].(string)
				msg := make(map[string]interface{})
				msg["Type"] = 10046
				msg["Name"] = name
				msg["Text"] = text
				msg["Mseat"] = m.conn.seat
				jmsg := toJson(msg)
				for i := range Con.chatSets[key] {
					Con.chatSets[key][i].Conn.send <- jmsg
				}

			} else if types == 10053 { //获取好友信息
				f := getFriends(m.conn.player.P_id)
				tf := make([]Friends, 0, 30)
				for i := range f {
					tf = append(tf, *f[i])
				}
				msg := make(map[string]interface{})
				msg["Type"] = 10055
				msg["Fnum"] = len(tf)
				msg["Friends"] = tf
				m.conn.send <- toJson(msg)

			} else if types == 10057 { //查找好友
				word := context["Words"].(string)
				f := findFriends(word)
				msg := make(map[string]interface{})
				msg["Type"] = 10058
				msg["Fnum"] = len(f)
				msg["Friends"] = f
				m.conn.send <- toJson(msg)

			} else if types == 10061 { //添加好友
				name := context["Name"].(string)
				var FOnline bool = false
				msg := make(map[string]interface{})
				fmt.Println("addF", name)

				playerSetLock.RLock()

				for i := range ConnSet.playerSets {
					fmt.Println(ConnSet.playerSets[i], ConnSet.playerSets[i].Name)
					if ConnSet.playerSets[i].Name == name {
						msg["Type"] = 10068
						msg["Name"] = m.conn.player.Name
						msg["Grade"] = m.conn.player.Grade
						msg["HeadImage"] = m.conn.player.HeadImage
						if ConnSet.playerSets[i].Conn != nil {
							ConnSet.playerSets[i].Conn.send <- toJson(msg)
						}
						fmt.Println("sendAddF", msg)
						FOnline = true
						break
					}
				}
				if !FOnline {
					msg["Type"] = 10064
					msg["Name"] = name
					m.conn.send <- toJson(msg)
				} else {
					msg["Type"] = 10066
					msg["Name"] = name
					m.conn.send <- toJson(msg)
				}
				playerSetLock.RUnlock()

			} else if types == 10069 { //回复好友请求
				answer := context["Answer"].(bool)
				name := context["Name"].(string)
				msg := make(map[string]interface{})
				if m.conn.player.Name != name && answer {
					makeFriends(m.conn.player.Name, name)
					fmt.Println(m.conn.player.Name, name, "make Friedns")
					msg["Type"] = 10063
					msg["Name"] = m.conn.player.Name
				} else {
					msg["Type"] = 10065
					msg["Name"] = m.conn.player.Name
				}

				playerSetLock.RLock()

				for i := range ConnSet.playerSets {
					if ConnSet.playerSets[i].Name == name && ConnSet.playerSets[i].Conn != nil {
						ConnSet.playerSets[i].Conn.send <- toJson(msg)
					}
				}
				playerSetLock.RUnlock()
			} else if types == 10070 { //删除好友请求
				pid := int(context["P_id"].(float64))
				DeleteFriends(m.conn.player.P_id, pid)
				msg := make(map[string]interface{})
				msg["Type"] = 10071
				m.conn.send <- toJson(msg)
				for i := range ConnSet.playerSets {
					if ConnSet.playerSets[i].P_id == pid {
						msg["Type"] = 10072
						msg["P_id"] = m.conn.player.P_id
						if ConnSet.playerSets[i].Conn != nil {
							ConnSet.playerSets[i].Conn.send <- toJson(msg)
						}
					}
				}

			} else if types == 10075 { //请求好友聊天
				pid := int(context["P_id"].(float64))
				text := context["Text"].(string)
				if IsFriends(pid, m.conn.player.P_id) {
					var alsend bool = false
					msg := make(map[string]interface{})
					msg["Type"] = 10078
					msg["P_id"] = m.conn.player.P_id
					msg["Text"] = text

					playerSetLock.RLock()

					for i := range ConnSet.playerSets {
						if ConnSet.playerSets[i].P_id == pid {
							fmt.Println(ConnSet.playerSets[i])
							if ConnSet.playerSets[i].Conn != nil {
								ConnSet.playerSets[i].Conn.send <- toJson(msg)
							}
							alsend = true
						}
					}
					if alsend {
						msg["Type"] = 10076
						m.conn.send <- toJson(msg)
					}

				} else {
					fmt.Println("no friends")
				}
				playerSetLock.RUnlock()
			} else if types == 10080 { //获取邮件信息
				msg := make(map[string]interface{})
				mails := getMail(m.conn.player.P_id)
				msg["Type"] = 10081
				msg["Mailnum"] = len(mails)
				msg["PlayerMail"] = mails

				m.conn.send <- toJson(msg)
			} else if types == 10085 { //发送邮件
				mail := JMail(context["Mail"].(map[string]interface{}))

				mail.SenderID = m.conn.player.P_id
				createMail(&mail)
				msg := make(map[string]interface{})
				msg["Type"] = 10086
				m.conn.send <- toJson(msg)
			} else if types == 10087 { //删除邮件
				mid := int64(context["MailID"].(float64))
				deleteMail(mid)
				msg := make(map[string]interface{})
				msg["Type"] = 10088
				m.conn.send <- toJson(msg)
			}
			break
		}
	}
}
