package main

import (
	"bytes"
	"math/rand"
	"time"
)

//生成随机字符串
func GetRandomString(len int64) string {
	str := "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	abyte := []byte(str)
	result := []byte{}
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	x := bytes.Count(abyte, nil)
	for i := int64(0); i < len; i++ {
		y := r.Intn(x - 1)
		result = append(result, abyte[y])
	}
	return string(result)
}
