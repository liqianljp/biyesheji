//并发控制锁相关
package main

import (
	"sync"
)

var TableMutex sync.Mutex         //控制加入房间锁
var CreateMutex sync.Mutex        //控制创建房间锁
var initTable sync.Mutex          //控制房间初始化锁
var guaranteeRWMutex sync.RWMutex //控制guarantee映射表并发读写
var onlinemapRWMutex sync.RWMutex //控制online映射表并发读写
var timeOutRWMutex sync.RWMutex   //控制计时器映射表并发读写

func (set *playerConnections) lockAndAddTablePlayer(n int64) bool {
	TableMutex.Lock()

	if set.tables[n].playerNumber < 4 {
		set.tables[n].playerNumber++
		return true
	}
	TableMutex.Unlock()
	return false
}

func (set *playerConnections) lockAndCreateTable(n int64) int64 {
	CreateMutex.Lock()

	for ; set.tables[n] != nil; (n)++ {
	}
	set.tables[n] = createTable()
	set.tables[n].playerNumber = 1

	return n
}
