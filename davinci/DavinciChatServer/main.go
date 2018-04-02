// DavinciChatServer project main.go
package main

import (
	"fmt"
	"net/http"

	"golang.org/x/net/websocket"
)

func main() {
	go ConnSet.run()
	go DrpcControl()
	http.Handle("/ws", websocket.Handler(wsHandler))
	err := http.ListenAndServe(":1080", nil)
	checkErr(err)
	fmt.Println("Hello World!")
}

func checkErr(err error) {
	if err != nil {
		panic(err)
	}
}
