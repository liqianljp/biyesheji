package main

import (
	"fmt"
	"net/http"

	"golang.org/x/net/websocket"
)

func main() {
	go ConnSet.run()
	http.Handle("/ws", websocket.Handler(wsHandler))
	err := http.ListenAndServe(":8080", nil)
	checkErr(err)
	fmt.Println("Hello World!")
}

func checkErr(err error) {
	if err != nil {
		panic(err)
	}
}
