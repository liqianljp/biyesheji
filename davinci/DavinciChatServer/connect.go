// Sever project connection.go
package main

//连接结构
import (
	"fmt"
	//	"log"
	//"log"

	"golang.org/x/net/websocket"
)

//连接信息
type Connection struct {
	//websocket连接
	ws *websocket.Conn
	//缓存发送信息
	send chan []byte

	name string

	seat int

	player *Player
}

//
type ConnMsg struct {
	//
	conn *Connection
	//
	msg []byte
}

//读
func (p *Connection) reader() {
	for {
		msg := make([]byte, 1024)
		_, err := p.ws.Read(msg)
		fmt.Println("Read!")
		if err != nil {
			//			panic(err)
			break
		}
		tempMsg := byteString(msg) //去掉[]byte后的空值
		var ms ConnMsg
		ms.conn = p
		ms.msg = []byte(tempMsg)
		//		ms.msg = byteString(msg)
		if ms.msg == nil || len(ms.msg) <= 0 {
			break
		}
		ConnSet.broadcast <- &ms
	}
	p.ws.Close()
}

//写
func (p *Connection) writer() {
	for msg := range p.send {
		fmt.Println("Write!")
		_, err := p.ws.Write(msg)
		if err != nil {
			//			log.Fatal(err)
			break
		}
	}
	p.ws.Close()
}

func wsHandler(w *websocket.Conn) {
	err := &websocket.ErrBadUpgrade
	if err != nil {
		//		panic(err)
		//		return
	}
	p := &Connection{
		send: make(chan []byte, 1024),
		ws:   w,
	}
	fmt.Println("wsHandler!")
	//	ConnSet.playerJoin <- p
	defer func() { ConnSet.playerLeave <- p }()
	go p.writer()
	p.reader()

}

func byteString(p []byte) string { //byte转String
	for i := 0; i < len(p); i++ {
		if p[i] == 0 {
			return string(p[0:i])
		}
	}
	return string(p)
}
