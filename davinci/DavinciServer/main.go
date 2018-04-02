// DavinciServer project main.go
package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/test", httpHandler)

	go playerSet.run()
	err := http.ListenAndServe(":8080", nil)
	checkErr(err)

	fmt.Println("Hello World!")
}

func checkErr(err error) {
	if err != nil {
		panic(err)
	}
}
