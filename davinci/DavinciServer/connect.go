//网络连接
package main

import (
	//	"fmt"
	"net/http"
)

//连接信息
type Connection struct {
	//xmlhttp连接
	wr http.ResponseWriter
	re *http.Request
	//缓存发送信息
	send chan []byte
}
type Message struct {
	//连接
	conn *Connection
	//ID信息
	id string
	//内容信息
	content map[string]interface{}
}

func (p *Connection) write() {
	//	for msg := range p.send {
	//		fmt.Println("Write!")
	//		_, err := p.wr.Write(msg)
	//		checkErr(err)
	//	}
	select {
	case str := <-p.send:
		//		fmt.Println("write!")
		//		fmt.Println(str)
		p.wr.Header().Add("Access-Control-Allow-Origin", "*")
		p.wr.Write([]byte(str))
	}
}

func (p *Connection) read() {
	//	fmt.Printf("Read! ")
	msg := p.re.PostFormValue("msg")
	jmsg := JMessage([]byte(msg))
	id, _ := jmsg["Id"].(string)
	content, _ := jmsg["Content"].(map[string]interface{})
	//	fmt.Println("Read!", id, content)
	var ms Message
	ms.conn = p
	ms.id = id
	ms.content = content
	playerSet.broadcast <- &ms
	//fmt.Println("read", ms)
}

func httpHandler(w http.ResponseWriter, r *http.Request) {
	//	fmt.Println(r.PostFormValue("msg"))
	p := &Connection{
		send: make(chan []byte, 512),
		wr:   w,
		re:   r,
	}
	p.read()
	p.write()
	//	fmt.Println("wsHandler!")
	//	ConnSet.playerJoin <- p
	//	defer func() { ConnSet.playerLeave <- p }()
	//	go p.writer()
	//	p.reader()
}

func byteString(p []byte) string { //byte转String
	for i := 0; i < len(p); i++ {
		if p[i] == 0 {
			return string(p[0:i])
		}
	}
	return string(p)
}
