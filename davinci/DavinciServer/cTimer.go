package main

import (
	//	"fmt"
	"time"
)

func Timer(i time.Duration) {
	timer := time.NewTicker(i * time.Second)
	for {
		select {
		case <-timer.C:

		}
	}
}

func copyMap(maps map[int]string) map[int]string {
	re := make(map[int]string)
	for i := range maps {
		re[i] = maps[i]
	}
	return re
}
